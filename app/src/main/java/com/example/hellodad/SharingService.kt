package com.example.hellodad

/**
 * Interface boundary to separate local functionality from future cloud-based sharing.
 * This prepares the app for real-time family alerts and cross-device lesson sync.
 *
 * Requirements for the Backend Configuration (to be implemented):
 * 1. Authentication mechanism (e.g., Firebase Auth or OAuth) for verified identities.
 * 2. Push Notification Service (e.g., FCM) to handle delivery of family alerts to offline devices.
 * 3. Cloud Database to persist Shared Members, Accepted Invitations, and Remote Media References.
 */
interface SharingService {
    
    /**
     * Data Contract for a family member connection.
     */
    data class FamilyMember(
        val memberId: String,
        val displayName: String,
        val status: InvitationStatus
    )

    enum class InvitationStatus { PENDING, ACCEPTED, REVOKED }

    /**
     * Sent when a reminder goes unconfirmed past the grace period.
     * Overdue evaluation should happen on a trusted backend, not the parent's local phone,
     * to ensure reliability if the device is offline or turned off.
     */
    fun escalateMissedReminder(reminderId: String, occurrenceId: String)

    /**
     * Resolves the alert if the parent confirms the reminder late.
     */
    fun resolveMissedReminder(reminderId: String, occurrenceId: String)

    /**
     * Synchronize local lesson state with the cloud, keeping future ownership metadata intact.
     */
    fun syncLessons(localStateJson: String, onComplete: (String) -> Unit)
}
