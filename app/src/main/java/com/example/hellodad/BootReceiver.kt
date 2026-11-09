package com.example.hellodad

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import org.json.JSONObject

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == Intent.ACTION_TIME_CHANGED) {
            // Need to reload state and schedule all reminders
            val storage = LessonStorage(context)
            try {
                if (storage.exists()) {
                    val text = storage.load()
                    val json = JSONObject(text)
                    val reminders = json.optJSONArray("reminders")
                    if (reminders != null) {
                        for (i in 0 until reminders.length()) {
                            val r = reminders.getJSONObject(i)
                            ReminderRepository.schedule(
                                context,
                                r.getString("id"),
                                r.getString("name"),
                                r.getString("instructions"),
                                r.getString("time")
                            )
                        }
                    }
                }
            } catch (e: Exception) {
                // Ignore errors on boot
            }
        }
    }
}
