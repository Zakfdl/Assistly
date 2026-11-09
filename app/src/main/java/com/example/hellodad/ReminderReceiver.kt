package com.example.hellodad

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        val id = intent.getStringExtra("id") ?: return
        
        val prefs = context.getSharedPreferences("reminders_log", Context.MODE_PRIVATE)
        val timestamp = System.currentTimeMillis()

        when (action) {
            "ACTION_TAKEN" -> {
                prefs.edit().putString("${id}_${timestamp}", "TAKEN").apply()
                clearNotification(context, id.hashCode())
            }
            "ACTION_SNOOZE" -> {
                prefs.edit().putString("${id}_${timestamp}", "SNOOZE").apply()
                clearNotification(context, id.hashCode())
                // Schedule a new alarm 15 mins later
                val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as android.app.AlarmManager
                val snoozeIntent = Intent(context, ReminderReceiver::class.java).apply {
                    putExtra("id", id)
                    putExtra("name", intent.getStringExtra("name"))
                    putExtra("instructions", intent.getStringExtra("instructions"))
                }
                val snoozePendingIntent = PendingIntent.getBroadcast(
                    context,
                    id.hashCode() + 10,
                    snoozeIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        if (alarmManager.canScheduleExactAlarms()) {
                            alarmManager.setExactAndAllowWhileIdle(
                                android.app.AlarmManager.RTC_WAKEUP,
                                timestamp + 15 * 60 * 1000,
                                snoozePendingIntent
                            )
                        }
                    } else {
                        alarmManager.setExactAndAllowWhileIdle(
                            android.app.AlarmManager.RTC_WAKEUP,
                            timestamp + 15 * 60 * 1000,
                            snoozePendingIntent
                        )
                    }
                } catch (e: Exception) {
                    // Ignore
                }
            }
            "ACTION_SKIP" -> {
                prefs.edit().putString("${id}_${timestamp}", "SKIP").apply()
                clearNotification(context, id.hashCode())
            }
            else -> {
                prefs.edit().putString("${id}_${timestamp}", "NOT_CONFIRMED").apply()
                val name = intent.getStringExtra("name") ?: ""
                val instructions = intent.getStringExtra("instructions") ?: ""
                showNotification(context, id, name, instructions)
            }
        }
    }

    private fun showNotification(context: Context, id: String, name: String, instructions: String) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        val takenIntent = Intent(context, ReminderReceiver::class.java).apply {
            action = "ACTION_TAKEN"
            putExtra("id", id)
        }
        val takenPendingIntent = PendingIntent.getBroadcast(
            context, id.hashCode() + 1, takenIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val snoozeIntent = Intent(context, ReminderReceiver::class.java).apply {
            action = "ACTION_SNOOZE"
            putExtra("id", id)
        }
        val snoozePendingIntent = PendingIntent.getBroadcast(
            context, id.hashCode() + 2, snoozeIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val skipIntent = Intent(context, ReminderReceiver::class.java).apply {
            action = "ACTION_SKIP"
            putExtra("id", id)
        }
        val skipPendingIntent = PendingIntent.getBroadcast(
            context, id.hashCode() + 3, skipIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, "medication_reminders")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(name)
            .setContentText(instructions)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .addAction(0, "Taken", takenPendingIntent)
            .addAction(0, "Snooze", snoozePendingIntent)
            .addAction(0, "Skip", skipPendingIntent)

        notificationManager.notify(id.hashCode(), builder.build())
    }
    
    private fun clearNotification(context: Context, notificationId: Int) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(notificationId)
    }
}
