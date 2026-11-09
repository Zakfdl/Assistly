package com.example.hellodad

import android.content.Context
import android.util.Log
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.functions.FirebaseFunctions
import com.google.firebase.storage.FirebaseStorage

/**
 * Firebase implementation of the SharingService.
 * Fails gracefully if google-services.json is missing or Firebase is unconfigured.
 */
class FirebaseSharingService(private val context: Context) : SharingService {
    
    private val isConfigured: Boolean
        get() = FirebaseApp.getApps(context).isNotEmpty()

    override fun escalateMissedReminder(reminderId: String, occurrenceId: String) {
        if (!isConfigured) {
            Log.w("FirebaseSharing", "Firebase not configured. Setup google-services.json to escalate reminders.")
            return
        }
        val user = FirebaseAuth.getInstance().currentUser ?: return
        
        // Push an escalation event to Firestore. Cloud Functions or another backend
        // mechanism should ideally listen to this and dispatch an FCM message,
        // or we dispatch directly to a topic if using client-side topic messaging.
        val db = FirebaseFirestore.getInstance()
        val data = hashMapOf(
            "reminderId" to reminderId,
            "occurrenceId" to occurrenceId,
            "escalatedAt" to System.currentTimeMillis(),
            "parentId" to user.uid
        )
        db.collection("escalations").add(data)
            .addOnFailureListener { e -> Log.e("FirebaseSharing", "Failed to escalate", e) }
    }

    override fun resolveMissedReminder(reminderId: String, occurrenceId: String) {
        if (!isConfigured) return
        val user = FirebaseAuth.getInstance().currentUser ?: return
        
        val db = FirebaseFirestore.getInstance()
        db.collection("escalations")
            .whereEqualTo("reminderId", reminderId)
            .whereEqualTo("occurrenceId", occurrenceId)
            .whereEqualTo("parentId", user.uid)
            .get()
            .addOnSuccessListener { snapshot ->
                for (doc in snapshot.documents) {
                    doc.reference.update("resolvedAt", System.currentTimeMillis())
                }
            }
    }

    override fun syncLessons(localStateJson: String, onComplete: (String) -> Unit) {
        if (!isConfigured) {
            Log.w("FirebaseSharing", "Firebase not configured. Sync skipped.")
            onComplete(localStateJson)
            return
        }
        val user = FirebaseAuth.getInstance().currentUser
        if (user == null) {
            Log.w("FirebaseSharing", "User not logged in. Sync skipped.")
            onComplete(localStateJson)
            return
        }

        val db = FirebaseFirestore.getInstance()
        val localState = org.json.JSONObject(localStateJson)
        val localTuts = localState.optJSONArray("tuts") ?: org.json.JSONArray()
        
        // 1. Fetch remote tutorials (owned or shared to us)
        val ownedTask = db.collection("tutorials").whereEqualTo("owner", user.uid).get()
        val sharedTask = db.collection("tutorials").whereArrayContains("recipients", user.uid).get()
        
        com.google.android.gms.tasks.Tasks.whenAllSuccess<com.google.firebase.firestore.QuerySnapshot>(ownedTask, sharedTask)
            .addOnSuccessListener { results ->
                try {
                    val remoteOwned = results[0]
                    val remoteShared = results[1]
                    
                    val remoteTutsMap = HashMap<String, org.json.JSONObject>()
                    
                    val processRemote = { snap: com.google.firebase.firestore.QuerySnapshot ->
                        for (doc in snap.documents) {
                            val data = doc.data ?: continue
                            val tutObj = org.json.JSONObject()
                            for ((k, v) in data) {
                                if (v is List<*>) {
                                    tutObj.put(k, org.json.JSONArray(v))
                                } else {
                                    tutObj.put(k, v)
                                }
                            }
                            tutObj.put("id", doc.id)
                            remoteTutsMap[doc.id] = tutObj
                        }
                    }
                    processRemote(remoteOwned)
                    processRemote(remoteShared)

                    // 2. Merge logic (Server wins for simplicity)
                    val mergedTuts = org.json.JSONArray()
                    val batch = db.batch()
                    var batchCount = 0

                    for (i in 0 until localTuts.length()) {
                        val localTut = localTuts.getJSONObject(i)
                        val id = localTut.getString("id")
                        val owner = localTut.optString("owner", "")
                        
                        if (owner == "" || owner == user.uid) {
                            // We own it or it's a new local tutorial
                            localTut.put("owner", user.uid)
                            
                            val remoteTut = remoteTutsMap[id]
                            if (remoteTut != null) {
                                val localDate = localTut.optLong("date", 0)
                                val remoteDate = remoteTut.optLong("date", 0)
                                if (localDate > remoteDate) {
                                    val map = localTut.toMap()
                                    batch.set(db.collection("tutorials").document(id), map)
                                    batchCount++
                                    mergedTuts.put(localTut)
                                } else {
                                    mergedTuts.put(remoteTut)
                                }
                            } else {
                                val map = localTut.toMap()
                                batch.set(db.collection("tutorials").document(id), map)
                                batchCount++
                                mergedTuts.put(localTut)
                            }
                        } else {
                            // We don't own it. If we have it locally, take the remote version.
                            if (remoteTutsMap.containsKey(id)) {
                                mergedTuts.put(remoteTutsMap[id])
                            }
                        }
                        remoteTutsMap.remove(id)
                    }

                    for ((_, tut) in remoteTutsMap) {
                        mergedTuts.put(tut)
                    }

                    if (batchCount > 0) {
                        batch.commit().addOnCompleteListener {
                            localState.put("tuts", mergedTuts)
                            onComplete(localState.toString())
                        }
                    } else {
                        localState.put("tuts", mergedTuts)
                        onComplete(localState.toString())
                    }
                } catch (e: Exception) {
                    Log.e("FirebaseSharing", "Sync failed during processing", e)
                    onComplete(localStateJson)
                }
            }.addOnFailureListener {
                Log.e("FirebaseSharing", "Failed to fetch remote tutorials for sync", it)
                onComplete(localStateJson)
            }
    }

    private fun org.json.JSONObject.toMap(): Map<String, Any> {
        val map = HashMap<String, Any>()
        val keys = this.keys()
        while (keys.hasNext()) {
            val key = keys.next()
            val value = this.get(key)
            if (value is org.json.JSONArray) {
                val list = ArrayList<Any>()
                for (i in 0 until value.length()) {
                    val item = value.get(i)
                    if (item is org.json.JSONObject) {
                        list.add(item.toMap())
                    } else {
                        list.add(item)
                    }
                }
                map[key] = list
            } else if (value is org.json.JSONObject) {
                map[key] = value.toMap()
            } else {
                map[key] = value
            }
        }
        return map
    }

    /**
     * Attempts to upload a local media file to Firebase Storage.
     * Keeps local media references separate from remote storage references.
     */
    fun uploadMedia(tutorialId: String, localUri: android.net.Uri, mimeType: String, onProgress: (Int) -> Unit, onComplete: (String?) -> Unit) {
        if (!isConfigured) {
            onComplete(null)
            return
        }
        val user = FirebaseAuth.getInstance().currentUser
        if (user == null) {
            onComplete(null)
            return
        }

        val storageRef = FirebaseStorage.getInstance().reference
            .child("tutorials/${tutorialId}/${localUri.lastPathSegment}")
        
        val uploadTask = storageRef.putFile(localUri)
        uploadTask.addOnProgressListener { taskSnapshot ->
            val progress = (100.0 * taskSnapshot.bytesTransferred / taskSnapshot.totalByteCount).toInt()
            onProgress(progress)
        }.addOnSuccessListener {
            storageRef.downloadUrl.addOnSuccessListener { uri ->
                onComplete(uri.toString())
            }.addOnFailureListener {
                onComplete(null)
            }
        }.addOnFailureListener {
            onComplete(null)
        }
    }

    /**
     * Firebase Cloud Functions operations for sharing tutorials
     */
    fun generateInvite(tutorialId: String, onComplete: (String?) -> Unit) {
        if (!isConfigured) {
            onComplete(null)
            return
        }
        val functions = FirebaseFunctions.getInstance()
        functions.getHttpsCallable("generateInvite")
            .call(hashMapOf("tutorialId" to tutorialId))
            .addOnSuccessListener { result ->
                val link = result.data as? String
                onComplete(link)
            }
            .addOnFailureListener { e ->
                Log.e("FirebaseSharing", "generateInvite failed", e)
                onComplete(null)
            }
    }

    fun acceptInvite(token: String, onComplete: (Boolean) -> Unit) {
        if (!isConfigured) {
            onComplete(false)
            return
        }
        // Use IntegrityService to fetch token
        IntegrityService(context).fetchIntegrityToken(token) { integrityToken ->
            val functions = FirebaseFunctions.getInstance()
            val data = hashMapOf(
                "token" to token,
                "integrityToken" to (integrityToken ?: "")
            )
            functions.getHttpsCallable("acceptInvite")
                .call(data)
                .addOnSuccessListener {
                    Log.i("FirebaseSharing", "Accepted invite with token $token")
                    onComplete(true)
                }
                .addOnFailureListener { e ->
                    Log.e("FirebaseSharing", "acceptInvite failed", e)
                    onComplete(false)
                }
        }
    }

    fun leaveTutorial(tutorialId: String, onComplete: (Boolean) -> Unit) {
        if (!isConfigured) {
            onComplete(false)
            return
        }
        val functions = FirebaseFunctions.getInstance()
        functions.getHttpsCallable("leaveTutorial")
            .call(hashMapOf("tutorialId" to tutorialId))
            .addOnSuccessListener {
                Log.i("FirebaseSharing", "Left tutorial $tutorialId")
                onComplete(true)
            }
            .addOnFailureListener { e ->
                Log.e("FirebaseSharing", "leaveTutorial failed", e)
                onComplete(false)
            }
    }
}
