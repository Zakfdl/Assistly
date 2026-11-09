const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
const { google } = require('googleapis');

admin.initializeApp();
const db = admin.firestore();

// 1. Generate Invite
exports.generateInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in to generate an invite.');
  }

  const tutorialId = data.tutorialId;
  if (!tutorialId) {
    throw new functions.https.HttpsError('invalid-argument', 'tutorialId is required.');
  }

  // Check if user owns the tutorial
  const tutRef = db.collection('tutorials').doc(tutorialId);
  const tutDoc = await tutRef.get();

  // If the tutorial doesn't exist in the cloud yet, we can't share it.
  // In a fully synced environment, it would exist.
  if (!tutDoc.exists || tutDoc.data().owner !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'You do not own this tutorial or it is not synced.');
  }

  // Generate cryptographically secure token
  const rawToken = crypto.randomBytes(16).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Set expiry to 7 days
  const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  await db.collection('invitations').doc(tokenHash).set({
    tutorialId: tutorialId,
    ownerId: context.auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: expiresAt,
    revoked: false,
    useCount: 0
  });

  return `https://assistly.androidplatform.net/invite/${rawToken}`;
});

// 2. Accept Invite
exports.acceptInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in to accept an invite.');
  }

  const { token, integrityToken } = data;
  if (!token) {
    throw new functions.https.HttpsError('invalid-argument', 'Token is required.');
  }

  // Note: In production, verify the integrityToken via Google Play Integrity API.
  // We skip strict enforcement locally if the token is the mock string, but
  // the infrastructure for doing so is noted here:
  if (integrityToken !== "mock-integrity-token") {
      // Setup googleapis to verify token.
      // Requires setup of GOOGLE_APPLICATION_CREDENTIALS for the backend.
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const inviteRef = db.collection('invitations').doc(tokenHash);

  const result = await db.runTransaction(async (transaction) => {
    const inviteDoc = await transaction.get(inviteRef);
    if (!inviteDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Invalid or expired invitation.');
    }

    const inviteData = inviteDoc.data();
    if (inviteData.revoked) {
      throw new functions.https.HttpsError('permission-denied', 'This invitation has been revoked.');
    }
    if (inviteData.expiresAt.toDate() < new Date()) {
      throw new functions.https.HttpsError('permission-denied', 'This invitation has expired.');
    }

    // Add user to tutorial recipients
    const tutRef = db.collection('tutorials').doc(inviteData.tutorialId);
    const tutDoc = await transaction.get(tutRef);
    if (!tutDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Tutorial no longer exists.');
    }

    const currentRecipients = tutDoc.data().recipients || [];
    if (currentRecipients.includes(context.auth.uid)) {
       return { status: 'already-member', tutorialId: inviteData.tutorialId };
    }
    if (tutDoc.data().owner === context.auth.uid) {
       return { status: 'is-owner', tutorialId: inviteData.tutorialId };
    }

    transaction.update(tutRef, {
      recipients: admin.firestore.FieldValue.arrayUnion(context.auth.uid)
    });

    transaction.update(inviteRef, {
      useCount: admin.firestore.FieldValue.increment(1)
    });

    // Create notification for the recipient
    const notifRef = db.collection('users').doc(context.auth.uid).collection('notifications').doc();
    transaction.set(notifRef, {
      type: 'TUTORIAL_SHARED',
      tutorialId: inviteData.tutorialId,
      senderId: inviteData.ownerId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });

    return { status: 'success', tutorialId: inviteData.tutorialId };
  });

  return result;
});

// 3. Leave Tutorial
exports.leaveTutorial = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in.');
  }

  const { tutorialId } = data;
  if (!tutorialId) {
    throw new functions.https.HttpsError('invalid-argument', 'tutorialId is required.');
  }

  const tutRef = db.collection('tutorials').doc(tutorialId);
  const tutDoc = await tutRef.get();

  if (!tutDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Tutorial not found.');
  }

  if (tutDoc.data().owner === context.auth.uid) {
    throw new functions.https.HttpsError('invalid-argument', 'Owner cannot leave their own tutorial. Delete it instead.');
  }

  // Idempotent operation
  await tutRef.update({
    recipients: admin.firestore.FieldValue.arrayRemove(context.auth.uid)
  });

  return { success: true };
});

// 4. On Notification Created -> Send FCM Push
exports.onTutorialShared = functions.firestore
  .document('users/{userId}/notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const newValue = snap.data();
    const userId = context.params.userId;

    if (newValue.type === 'TUTORIAL_SHARED') {
      const senderDoc = await db.collection('users').doc(newValue.senderId).get();
      const senderName = senderDoc.exists ? (senderDoc.data().displayName || 'A friend') : 'A friend';

      const payload = {
        notification: {
          title: 'New Tutorial Shared!',
          body: `${senderName} shared a tutorial with you.`
        },
        data: {
          tutorialId: String(newValue.tutorialId)
        }
      };

      // Fetch user's FCM tokens. Assuming we store them in users/{userId}/fcmTokens array
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists && userDoc.data().fcmTokens) {
        const tokens = userDoc.data().fcmTokens;
        if (tokens.length > 0) {
          const response = await admin.messaging().sendEachForMulticast({
            tokens: tokens,
            ...payload
          });

          // Cleanup invalid tokens
          const tokensToRemove = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success && (resp.error.code === 'messaging/invalid-registration-token' || resp.error.code === 'messaging/registration-token-not-registered')) {
              tokensToRemove.push(tokens[idx]);
            }
          });

          if (tokensToRemove.length > 0) {
            await db.collection('users').doc(userId).update({
              fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove)
            });
          }
        }
      }
    }
  });
