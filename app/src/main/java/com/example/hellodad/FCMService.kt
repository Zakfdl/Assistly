package com.example.hellodad

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class FCMService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        val user = FirebaseAuth.getInstance().currentUser
        if (user != null) {
            val db = FirebaseFirestore.getInstance()
            db.collection("users").document(user.uid)
                .update("fcmTokens", FieldValue.arrayUnion(token))
                .addOnFailureListener {
                    val data = hashMapOf("fcmTokens" to listOf(token))
                    db.collection("users").document(user.uid).set(data)
                }
        }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val user = FirebaseAuth.getInstance().currentUser ?: return

        val tutorialId = remoteMessage.data["tutorialId"] ?: return
        val title = remoteMessage.notification?.title ?: "Assistly"
        val body = remoteMessage.notification?.body ?: "You have a new tutorial."

        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("tutorialId", tutorialId)
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            tutorialId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val builder = NotificationCompat.Builder(this, "medication_reminders") // Reuse the same channel for simplicity in this example
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)

        notificationManager.notify(tutorialId.hashCode(), builder.build())
    }
}
