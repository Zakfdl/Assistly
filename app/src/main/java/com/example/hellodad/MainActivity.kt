package com.example.hellodad

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.ClipData
import android.content.Intent
import android.content.pm.PackageManager
import android.media.MediaRecorder
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.speech.RecognizerIntent
import android.webkit.JavascriptInterface
import android.webkit.JsResult
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.webkit.WebViewAssetLoader
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.concurrent.Executors

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private lateinit var storage: LessonStorage
    private lateinit var sharingService: FirebaseSharingService
    private val io = Executors.newSingleThreadExecutor()
    private var ready = false
    private var legacyMigrationError: String? = null
    private val events = mutableListOf<String>()
    private var pendingKind = ""
    private var pendingTarget = ""
    private var capturePath: String? = null
    private var recorder: MediaRecorder? = null
    private var recordingFile: File? = null
    private var recordingTarget = ""

    private val permissionLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) startAudioInternal(recordingTarget)
        else emit("onRecordState", JSONObject().put("recording", false).put("error", "اسمح باستخدام الميكروفون لتسجيل الشرح"))
    }

    private val pickerLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        val kind = pendingKind
        val target = pendingTarget
        val capture = capturePath?.let(::File)
        pendingKind = ""
        pendingTarget = ""
        capturePath = null
        if (kind.isEmpty()) return@registerForActivityResult
        if (result.resultCode != Activity.RESULT_OK) {
            capture?.delete()
            emitMedia(kind, target, JSONArray(), JSONArray(), cancelled = true)
            return@registerForActivityResult
        }
        val uris = mutableListOf<Uri>()
        if (capture != null && capture.length() > 0) {
            uris.add(FileProvider.getUriForFile(this, "$packageName.fileprovider", capture))
        } else {
            result.data?.clipData?.let { clip ->
                for (i in 0 until minOf(clip.itemCount, 20)) uris.add(clip.getItemAt(i).uri)
            }
            if (uris.isEmpty()) result.data?.data?.let { uris.add(it) }
        }
        io.execute {
            val imported = JSONArray()
            val errors = JSONArray()
            uris.distinct().forEach { uri ->
                try { imported.put(storage.importUri(uri, kind)) }
                catch (error: Exception) { errors.put(error.message ?: getString(R.string.error_attach_file)) }
            }
            if (uris.isEmpty()) errors.put(getString(R.string.error_invalid_file))
            capture?.delete()
            runOnUiThread { emitMedia(kind, target, imported, errors) }
        }
    }

    private val voiceLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val text = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull().orEmpty()
            if (text.isNotBlank()) emit("onVoice", JSONObject().put("text", text))
        }
    }

    private val notificationLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    private lateinit var googleSignInClient: com.google.android.gms.auth.api.signin.GoogleSignInClient

    private val googleSignInLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val task = com.google.android.gms.auth.api.signin.GoogleSignIn.getSignedInAccountFromIntent(result.data)
            try {
                val account = task.getResult(com.google.android.gms.common.api.ApiException::class.java)
                firebaseAuthWithGoogle(account.idToken!!)
            } catch (e: Exception) {
                Toast.makeText(this, "Google Sign-In failed", Toast.LENGTH_SHORT).show()
            }
        } else {
            Toast.makeText(this, "Google Sign-In cancelled", Toast.LENGTH_SHORT).show()
        }
    }

    private fun firebaseAuthWithGoogle(idToken: String) {
        val credential = com.google.firebase.auth.GoogleAuthProvider.getCredential(idToken, null)
        com.google.firebase.auth.FirebaseAuth.getInstance().signInWithCredential(credential)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    emit("onAuthStateChanged", JSONObject().put("loggedIn", true))
                } else {
                    Toast.makeText(this, "Firebase Auth failed", Toast.LENGTH_SHORT).show()
                }
            }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // Initialize Google Sign-In Client
        val gso = com.google.android.gms.auth.api.signin.GoogleSignInOptions.Builder(com.google.android.gms.auth.api.signin.GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(R.string.default_web_client_id))
            .requestEmail()
            .build()
        googleSignInClient = com.google.android.gms.auth.api.signin.GoogleSignIn.getClient(this, gso)

        if (com.google.firebase.FirebaseApp.getApps(this).isNotEmpty()) {
            try {
                // In local dev mode, connect to emulators. Use 10.0.2.2 for Android emulator.
                com.google.firebase.auth.FirebaseAuth.getInstance().useEmulator("10.0.2.2", 9099)
                com.google.firebase.firestore.FirebaseFirestore.getInstance().useEmulator("10.0.2.2", 8080)
                com.google.firebase.storage.FirebaseStorage.getInstance().useEmulator("10.0.2.2", 9199)
                com.google.firebase.functions.FirebaseFunctions.getInstance().useEmulator("10.0.2.2", 5001)
            } catch (e: Exception) {
                // Ignore if already configured
            }
            
            // FCM Token Registration
            try {
                com.google.firebase.messaging.FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        val token = task.result
                        val user = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser
                        if (user != null) {
                            val db = com.google.firebase.firestore.FirebaseFirestore.getInstance()
                            db.collection("users").document(user.uid)
                                .update("fcmTokens", com.google.firebase.firestore.FieldValue.arrayUnion(token))
                                .addOnFailureListener {
                                    // If document doesn't exist, create it
                                    val data = hashMapOf("fcmTokens" to listOf(token))
                                    db.collection("users").document(user.uid).set(data)
                                }
                        }
                    }
                }
            } catch (e: Exception) {
                // Ignore if messaging is unconfigured or fails with dummy json
            }
        }
        
        ReminderRepository.createChannel(this)
        storage = LessonStorage(this)
        sharingService = FirebaseSharingService(this)
        pendingKind = savedInstanceState?.getString("pendingKind").orEmpty()
        pendingTarget = savedInstanceState?.getString("pendingTarget").orEmpty()
        capturePath = savedInstanceState?.getString("capturePath")
        recordingTarget = savedInstanceState?.getString("recordingTarget").orEmpty()
        webView = findViewById(R.id.webView)
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowContentAccess = false
            allowFileAccess = !storage.exists()
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            mediaPlaybackRequiresUserGesture = true
        }
        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this)).build()
        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest): WebResourceResponse? {
                val uri = request.url
                // file:// is used once to read the legacy localStorage before upgrading.
                if (uri.toString().startsWith("file:///android_asset/") && !storage.exists()) return null
                if (uri.scheme != "https" || uri.host != "appassets.androidplatform.net") {
                    return LessonStorage.errorResponse(403, "Forbidden")
                }
                val path = uri.path.orEmpty()
                if (path.startsWith("/media/")) return storage.response(path.removePrefix("/media/"),
                    request.requestHeaders.entries.firstOrNull { it.key.equals("Range", true) }?.value)
                return loader.shouldInterceptRequest(uri) ?: LessonStorage.errorResponse(404, "Not Found")
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest): Boolean =
                request.url.toString() != APP_URL
        }
        webView.webChromeClient = object : WebChromeClient() {
            override fun onJsConfirm(view: WebView?, url: String?, message: String?, result: JsResult?): Boolean {
                AlertDialog.Builder(this@MainActivity).setTitle("تأكيد").setMessage(message)
                    .setPositiveButton("نعم") { _, _ -> result?.confirm() }
                    .setNegativeButton("إلغاء") { _, _ -> result?.cancel() }
                    .setOnCancelListener { result?.cancel() }.show()
                return true
            }
        }
        webView.addJavascriptInterface(AndroidBridge(), "AndroidApp")
        webView.loadUrl(if (storage.exists()) APP_URL else "file:///android_asset/index.html")
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                webView.evaluateJavascript("window.HelloDad ? HelloDad.back() : false") { answer ->
                    if (answer != "true") {
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                    }
                }
            }
        })
        handleIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        if (intent?.action == Intent.ACTION_VIEW) {
            val url = intent.dataString
            if (url != null && url.contains("/invite/")) {
                emit("onInviteLink", JSONObject().put("url", url))
            }
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        outState.putString("pendingKind", pendingKind)
        outState.putString("pendingTarget", pendingTarget)
        outState.putString("capturePath", capturePath)
        outState.putString("recordingTarget", recordingTarget)
        super.onSaveInstanceState(outState)
    }

    private fun emit(name: String, payload: JSONObject) {
        if (isDestroyed || isFinishing) return
        val script = "window.HelloDad && HelloDad.$name($payload);"
        if (ready) webView.evaluateJavascript(script, null) else events.add(script)
    }

    private fun emitMedia(kind: String, target: String, files: JSONArray, errors: JSONArray, cancelled: Boolean = false) {
        emit("onMedia", JSONObject().put("kind", kind).put("target", target)
            .put("files", files).put("errors", errors).put("cancelled", cancelled))
    }

    private fun launchPicker(kind: String, source: String, target: String) {
        if (pendingKind.isNotEmpty() || recorder != null) {
            emitMedia(kind, target, JSONArray(), JSONArray().put(getString(R.string.error_finish_current)))
            return
        }
        pendingKind = kind
        pendingTarget = target
        try {
            val intent = if (source == "capture" && kind in setOf("video", "photo")) {
                val directory = File(cacheDir, "captures").apply { mkdirs() }
                val file = File.createTempFile("lesson_", if (kind == "video") ".mp4" else ".jpg", directory)
                capturePath = file.absolutePath
                val uri = FileProvider.getUriForFile(this, "$packageName.fileprovider", file)
                Intent(if (kind == "video") MediaStore.ACTION_VIDEO_CAPTURE else MediaStore.ACTION_IMAGE_CAPTURE).apply {
                    putExtra(MediaStore.EXTRA_OUTPUT, uri)
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
                    clipData = ClipData.newRawUri("lesson capture", uri)
                    if (kind == "video") {
                        putExtra(MediaStore.EXTRA_SIZE_LIMIT, 250L * 1024 * 1024)
                        putExtra(MediaStore.EXTRA_VIDEO_QUALITY, 1)
                    }
                }
            } else {
                Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = when (kind) { "video" -> "video/*"; "photo", "cover" -> "image/*"; "audio" -> "audio/*"; else -> "*/*" }
                    putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }
            }
            pickerLauncher.launch(intent)
        } catch (_: Exception) {
            capturePath?.let { File(it).delete() }
            capturePath = null
            pendingKind = ""
            pendingTarget = ""
            emitMedia(kind, target, JSONArray(), JSONArray().put("تعذّر فتح الكاميرا أو الملفات. جرّب الاختيار من الجهاز"))
        }
    }

    @Suppress("DEPRECATION")
    private fun startAudioInternal(target: String) {
        if (recorder != null || pendingKind.isNotEmpty()) {
            emit("onRecordState", JSONObject().put("recording", false).put("error", getString(R.string.error_finish_current)))
            return
        }
        var file: File? = null
        var fresh: MediaRecorder? = null
        try {
            val directory = File(cacheDir, "captures").apply { mkdirs() }
            val output = File.createTempFile("audio_", ".m4a", directory)
            file = output
            fresh = MediaRecorder()
            fresh.setAudioSource(MediaRecorder.AudioSource.MIC)
            fresh.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            fresh.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            fresh.setAudioEncodingBitRate(96000)
            fresh.setAudioSamplingRate(44100)
            fresh.setMaxDuration(10 * 60 * 1000)
            fresh.setOutputFile(output.absolutePath)
            fresh.setOnInfoListener { _, what, _ -> if (what == MediaRecorder.MEDIA_RECORDER_INFO_MAX_DURATION_REACHED) stopAudioInternal() }
            fresh.prepare()
            fresh.start()
            recorder = fresh
            recordingFile = output
            recordingTarget = target
            emit("onRecordState", JSONObject().put("recording", true).put("target", target))
        } catch (_: Exception) {
            fresh?.release()
            file?.delete()
            emit("onRecordState", JSONObject().put("recording", false).put("error", getString(R.string.error_start_recording)))
        }
    }

    private fun stopAudioInternal() {
        val active = recorder ?: return
        val file = recordingFile
        val target = recordingTarget
        recorder = null
        recordingFile = null
        var success = false
        try { active.stop(); success = true } catch (_: RuntimeException) { } finally { active.release() }
        emit("onRecordState", JSONObject().put("recording", false).put("processing", success).put("target", target))
        if (!success || file == null) {
            file?.delete()
            emitMedia("audio", target, JSONArray(), JSONArray().put(getString(R.string.error_recording_short)))
            return
        }
        io.execute {
            val files = JSONArray()
            val errors = JSONArray()
            try { files.put(storage.importFile(file, getString(R.string.audio_explanation_filename), "audio/mp4", "audio")) }
            catch (error: Exception) { errors.put(error.message ?: getString(R.string.error_save_recording)) }
            file.delete()
            runOnUiThread { emitMedia("audio", target, files, errors) }
        }
    }

    override fun onStop() {
        if (ready) webView.evaluateJavascript("window.HelloDad && HelloDad.flush()", null)
        if (recorder != null) stopAudioInternal()
        super.onStop()
    }

    override fun onDestroy() {
        recorder?.release()
        recordingFile?.delete()
        recorder = null
        webView.removeJavascriptInterface("AndroidApp")
        webView.destroy()
        io.shutdown()
        super.onDestroy()
    }

    inner class AndroidBridge {
        @JavascriptInterface fun loadState(): String = try {
            val migrationError = legacyMigrationError
            if (migrationError != null) JSONObject().put("loadError", migrationError).toString() else storage.load()
        }
            catch (_: Exception) { JSONObject().put("loadError", getString(R.string.error_read_lessons)).toString() }

        @JavascriptInterface fun saveState(json: String): String = try {
            storage.save(json)
            // Trigger background sync
            sharingService.syncLessons(json) { syncedJson ->
                if (syncedJson != json) {
                    storage.save(syncedJson)
                    runOnUiThread {
                        emit("onStateSynced", JSONObject().put("synced", true))
                    }
                }
            }
            JSONObject().put("ok", true).toString()
        } catch (error: Exception) { JSONObject().put("ok", false).put("error", error.message ?: getString(R.string.error_save_lesson)).toString() }

        @JavascriptInterface fun importLegacyState(raw: String) {
            try {
                if (!storage.exists()) storage.save(if (raw.isBlank()) "{\"tuts\":[],\"contacts\":[]}" else raw)
            } catch (_: Exception) {
                legacyMigrationError = getString(R.string.error_migrate_legacy)
                runOnUiThread { Toast.makeText(this@MainActivity, R.string.error_migrate_legacy_toast, Toast.LENGTH_LONG).show() }
            }
            runOnUiThread {
                webView.settings.allowFileAccess = false
                webView.loadUrl(APP_URL)
            }
        }

        @JavascriptInterface fun pageReady() { runOnUiThread {
            ready = true
            events.toList().forEach { webView.evaluateJavascript(it, null) }
            events.clear()
        } }

        @JavascriptInterface fun pickMedia(kind: String, source: String, target: String) { runOnUiThread {
            if (kind in setOf("photo", "video", "audio", "file", "cover")) launchPicker(kind, source, target)
        } }

        @JavascriptInterface fun startAudio(target: String) { runOnUiThread {
            recordingTarget = target
            if (ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) startAudioInternal(target)
            else permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
        } }

        @JavascriptInterface fun stopAudio() { runOnUiThread { stopAudioInternal() } }

        @JavascriptInterface fun releaseMedia(ids: String) { io.execute {
            try {
                val values = JSONArray(ids)
                for (i in 0 until values.length()) storage.removeIfUnused(values.getString(i))
            } catch (_: Exception) { /* Keep media if cleanup cannot prove it is unused. */ }
        } }

        @JavascriptInterface fun openAttachment(id: String) { runOnUiThread {
            try {
                val meta = storage.metadata(id)
                val uri = FileProvider.getUriForFile(this@MainActivity, "$packageName.fileprovider", storage.content(id), meta.getString("name"))
                val intent = Intent(Intent.ACTION_VIEW).setDataAndType(uri, meta.getString("mime"))
                    .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                intent.clipData = ClipData.newRawUri(meta.getString("name"), uri)
                startActivity(Intent.createChooser(intent, getString(R.string.open_attachment_with)))
            } catch (_: Exception) {
                Toast.makeText(this@MainActivity, R.string.error_open_attachment, Toast.LENGTH_LONG).show()
            }
        } }

        @JavascriptInterface fun shareManual(tutorialId: String) { runOnUiThread {
            if (isCloudConfigured()) {
                sharingService.generateInvite(tutorialId) { link ->
                    runOnUiThread {
                        val intent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_TEXT, link ?: "Check out my lesson on Assistly/HelloDad! (Link failed to generate)")
                        }
                        startActivity(Intent.createChooser(intent, "Share Lesson"))
                    }
                }
            } else {
                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_TEXT, "Check out my lesson on Assistly/HelloDad! (Note: This is a manual share, no live monitoring enabled).")
                }
                startActivity(Intent.createChooser(intent, "Share Lesson"))
            }
        } }

        @JavascriptInterface fun acceptInvite(token: String) {
            sharingService.acceptInvite(token) { success ->
                runOnUiThread {
                    if (success) Toast.makeText(this@MainActivity, "Invite accepted successfully.", Toast.LENGTH_SHORT).show()
                    else Toast.makeText(this@MainActivity, "Failed to accept invite.", Toast.LENGTH_SHORT).show()
                }
            }
        }
        
        @JavascriptInterface fun leaveTutorial(tutorialId: String) {
            sharingService.leaveTutorial(tutorialId) { success ->
                runOnUiThread {
                    if (success) Toast.makeText(this@MainActivity, "Left tutorial successfully.", Toast.LENGTH_SHORT).show()
                    else Toast.makeText(this@MainActivity, "Failed to leave tutorial.", Toast.LENGTH_SHORT).show()
                }
            }
        }

        @JavascriptInterface fun scheduleReminder(jsonString: String) { runOnUiThread {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                if (ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    notificationLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                }
            }
            val json = JSONObject(jsonString)
            ReminderRepository.schedule(this@MainActivity, json.getString("id"), json.getString("name"), json.getString("instructions"), json.getString("time"))
        } }

        @JavascriptInterface fun cancelReminder(id: String) {
            ReminderRepository.cancel(this@MainActivity, id)
        }

        @JavascriptInterface fun isCloudConfigured(): Boolean {
            return com.google.firebase.FirebaseApp.getApps(this@MainActivity).isNotEmpty()
        }

        @JavascriptInterface fun getCurrentUser(): String? {
            val user = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser ?: return null
            val json = JSONObject()
            json.put("uid", user.uid)
            json.put("email", user.email ?: "")
            json.put("displayName", user.displayName ?: "")
            return json.toString()
        }

        @JavascriptInterface fun loginWithGoogle() {
            runOnUiThread {
                googleSignInLauncher.launch(googleSignInClient.signInIntent)
            }
        }
        
        @JavascriptInterface fun loginWithEmail(email: String, pass: String) {
            val auth = com.google.firebase.auth.FirebaseAuth.getInstance()
            auth.signInWithEmailAndPassword(email, pass).addOnCompleteListener { task ->
                runOnUiThread {
                    if (task.isSuccessful) {
                        Toast.makeText(this@MainActivity, "Logged in as $email", Toast.LENGTH_SHORT).show()
                        emit("onAuthStateChanged", JSONObject().put("loggedIn", true))
                    } else {
                        // Attempt to create if it fails
                        auth.createUserWithEmailAndPassword(email, pass).addOnCompleteListener { createReq ->
                            if (createReq.isSuccessful) {
                                Toast.makeText(this@MainActivity, "Created account $email", Toast.LENGTH_SHORT).show()
                                emit("onAuthStateChanged", JSONObject().put("loggedIn", true))
                            } else {
                                Toast.makeText(this@MainActivity, "Login Failed", Toast.LENGTH_SHORT).show()
                                emit("onAuthStateChanged", JSONObject().put("loggedIn", false))
                            }
                        }
                    }
                }
            }
        }

        @JavascriptInterface fun logout() {
            // Remove FCM token
            val user = com.google.firebase.auth.FirebaseAuth.getInstance().currentUser
            if (user != null) {
                com.google.firebase.messaging.FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        val token = task.result
                        com.google.firebase.firestore.FirebaseFirestore.getInstance()
                            .collection("users").document(user.uid)
                            .update("fcmTokens", com.google.firebase.firestore.FieldValue.arrayRemove(token))
                            .addOnCompleteListener {
                                com.google.firebase.auth.FirebaseAuth.getInstance().signOut()
                                runOnUiThread {
                                    emit("onAuthStateChanged", JSONObject().put("loggedIn", false))
                                }
                            }
                    } else {
                        com.google.firebase.auth.FirebaseAuth.getInstance().signOut()
                        runOnUiThread { emit("onAuthStateChanged", JSONObject().put("loggedIn", false)) }
                    }
                }
            } else {
                com.google.firebase.auth.FirebaseAuth.getInstance().signOut()
                runOnUiThread { emit("onAuthStateChanged", JSONObject().put("loggedIn", false)) }
            }
        }

        @JavascriptInterface fun startNativeVoiceSearch(lang: String) { runOnUiThread {
            try {
                voiceLauncher.launch(Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang)
                    putExtra(RecognizerIntent.EXTRA_PROMPT, getString(R.string.prompt_voice_search))
                })
            } catch (_: Exception) { Toast.makeText(this@MainActivity, R.string.error_voice_search_unavailable, Toast.LENGTH_SHORT).show() }
        } }

        @JavascriptInterface fun setNativeLocale(lang: String) { runOnUiThread {
            val locale = if (lang == "ar") "ar" else if (lang == "en") "en" else ""
            val appLocale = androidx.core.os.LocaleListCompat.forLanguageTags(locale)
            androidx.appcompat.app.AppCompatDelegate.setApplicationLocales(appLocale)
        } }
    }

    companion object { private const val APP_URL = "https://appassets.androidplatform.net/assets/index.html" }
}
