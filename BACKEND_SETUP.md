# Assistly Backend Setup

Assistly relies on Firebase for connected accounts, sharing, and real-time push notifications.
To enable cross-device sharing, you must configure the following on a trusted backend:

## 1. Firebase Authentication
Enable **Email/Password** and **Google Sign-In** in the Firebase Console.
These verify user identity securely and prevent anonymous access to shared tutorials.

## 2. Firestore Security Rules
Protect private tutorials, metadata, and memberships by deploying these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tutorials/{tutorialId} {
      // Creator can read/write. Authorized recipients can read.
      allow read: if request.auth != null && (request.auth.uid == resource.data.owner || request.auth.uid in resource.data.recipients);
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.owner;
      // Only the owner can create
      allow create: if request.auth != null && request.auth.uid == request.resource.data.owner;
    }
    match /users/{userId}/categories/{catId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 3. Firebase Cloud Storage
Storage rules must reflect Firestore membership to keep media strictly private:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /tutorials/{tutorialId}/{fileName} {
      // Validate that the requestor is the owner or recipient in Firestore
      allow read: if request.auth != null && 
        (request.auth.uid == firestore.get(/databases/(default)/documents/tutorials/$(tutorialId)).data.owner ||
         request.auth.uid in firestore.get(/databases/(default)/documents/tutorials/$(tutorialId)).data.recipients);
      allow write: if request.auth != null &&
        request.auth.uid == firestore.get(/databases/(default)/documents/tutorials/$(tutorialId)).data.owner;
    }
  }
}
```

## 4. App Links (assetlinks.json)
Host `assetlinks.json` at `https://assistly.androidplatform.net/.well-known/assetlinks.json`:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.example.hellodad",
    "sha256_cert_fingerprints": ["<YOUR_PROD_SHA256>"]
  }
}]
```
This guarantees only the authentic Assistly app can intercept `/invite/` links.

## 5. Play Integrity
Integrate Google Play Integrity by passing the token (`com.google.android.play:integrity`) from the Android client to a Firebase Cloud Function. Validate the token on the server before granting an invitation request.

## 6. Cloud Functions
Deploy Node.js Firebase Functions for:
- `generateInvite(tutorialId)`: Returns an unguessable HTTPS link.
- `acceptInvite(token)`: Validates the token and adds the `request.auth.uid` to the tutorial's `recipients`.
- `onTutorialShared`: Triggers an FCM Push Notification to the newly added member.

*Note: Live testing requires this backend to be deployed and the Google-Services.json configured.*
