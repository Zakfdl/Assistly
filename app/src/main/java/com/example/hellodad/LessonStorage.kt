package com.example.hellodad

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.provider.OpenableColumns
import android.util.AtomicFile
import android.webkit.MimeTypeMap
import android.webkit.WebResourceResponse
import org.json.JSONObject
import java.io.ByteArrayInputStream
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.RandomAccessFile
import java.util.UUID

/** Small lesson metadata is atomic; large media is streamed to private app files. */
class LessonStorage(private val context: Context) {
    private val state = AtomicFile(File(context.filesDir, "lessons-v2.json"))
    private val mediaRoot = File(context.filesDir, "lesson_media").apply { mkdirs() }
    private val idPattern = Regex("[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")

    @Synchronized fun exists(): Boolean = state.baseFile.exists() || File(state.baseFile.path + ".bak").exists()

    @Synchronized fun load(): String {
        if (!exists()) return "{}"
        val text = state.openRead().bufferedReader(Charsets.UTF_8).use { it.readText() }
        validateState(text)
        return text
    }

    @Synchronized fun save(text: String) {
        validateState(text)
        val stream = state.startWrite()
        try {
            stream.write(text.toByteArray(Charsets.UTF_8))
            state.finishWrite(stream)
        } catch (error: Exception) {
            state.failWrite(stream)
            throw error
        }
    }

    private fun validateState(text: String) {
        require(text.toByteArray(Charsets.UTF_8).size <= 12 * 1024 * 1024) { "بيانات الدروس أكبر من المساحة المخصصة لها" }
        val json = JSONObject(text)
        require(json.optJSONArray("tuts") != null && json.optJSONArray("contacts") != null) { "تعذّر قراءة بيانات الدروس" }
    }

    fun importUri(uri: Uri, kind: String): JSONObject {
        val resolver = context.contentResolver
        var name = "مرفق"
        resolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) name = cursor.getString(0) ?: name
        }
        val extension = name.substringAfterLast('.', "").lowercase()
        val reportedMime = resolver.getType(uri)
        val extensionMime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension)
        val mime = if (reportedMime == null || reportedMime == "application/octet-stream")
            extensionMime ?: reportedMime ?: "application/octet-stream" else reportedMime
        return resolver.openInputStream(uri)?.use { importStream(it, name, mime, kind) }
            ?: throw IOException("تعذّر فتح الملف المختار")
    }

    fun importFile(file: File, name: String, mime: String, kind: String): JSONObject =
        file.inputStream().use { importStream(it, name, mime, kind) }

    private fun importStream(input: InputStream, displayName: String, mime: String, kind: String): JSONObject {
        val prefix = when (kind) { "photo", "cover" -> "image/"; "video" -> "video/"; "audio" -> "audio/"; else -> null }
        require(prefix == null || mime.startsWith(prefix)) { "نوع الملف لا يناسب هذا القسم" }
        val limit = when (kind) { "video" -> 250L; "photo", "cover" -> 20L; else -> 50L } * 1024 * 1024
        val id = UUID.randomUUID().toString()
        val directory = File(mediaRoot, id).apply { mkdirs() }
        val payload = File(directory, "content")
        try {
            var total = 0L
            
            if (kind == "cover") {
                // Crop and resize to thumbnail
                val bitmap = BitmapFactory.decodeStream(input) ?: throw IOException("تعذّر قراءة الصورة")
                val size = minOf(bitmap.width, bitmap.height)
                val x = (bitmap.width - size) / 2
                val y = (bitmap.height - size) / 2
                val cropped = Bitmap.createBitmap(bitmap, x, y, size, size)
                val resized = Bitmap.createScaledBitmap(cropped, 512, 512, true)
                payload.outputStream().use { output ->
                    resized.compress(Bitmap.CompressFormat.JPEG, 85, output)
                }
                total = payload.length()
            } else {
                payload.outputStream().use { output ->
                    val buffer = ByteArray(64 * 1024)
                    while (true) {
                        val count = input.read(buffer)
                        if (count < 0) break
                        total += count
                        require(total <= limit) { "حجم الملف يتجاوز الحد المسموح (${limit / 1024 / 1024} MB)" }
                        if (directory.usableSpace < 8L * 1024 * 1024) throw IOException("المساحة المتاحة على الجهاز غير كافية")
                        output.write(buffer, 0, count)
                    }
                }
            }
            require(total > 0) { "الملف فارغ أو لم يكتمل تسجيله" }
            val finalMime = if (kind == "cover") "image/jpeg" else mime
            val metadata = JSONObject().put("id", id).put("name", displayName.take(240))
                .put("mime", finalMime).put("size", total)
                .put("url", "https://appassets.androidplatform.net/media/$id")
            
            if (kind == "video") {
                try {
                    val retriever = MediaMetadataRetriever()
                    retriever.setDataSource(payload.absolutePath)
                    val frame = retriever.getFrameAtTime(0, MediaMetadataRetriever.OPTION_CLOSEST_SYNC)
                    if (frame != null) {
                        val thumbFile = File(directory, "thumb.jpg")
                        thumbFile.outputStream().use { out ->
                            frame.compress(Bitmap.CompressFormat.JPEG, 80, out)
                        }
                        metadata.put("thumb", "https://appassets.androidplatform.net/media/$id/thumb")
                    }
                    retriever.close()
                } catch (e: Exception) {
                    // Ignore thumbnail generation errors
                }
            }

            File(directory, "meta.json").writeText(metadata.toString(), Charsets.UTF_8)
            return metadata
        } catch (error: Exception) {
            directory.deleteRecursively()
            throw error
        }
    }

    private fun directory(id: String): File {
        require(idPattern.matches(id)) { "مرفق غير صالح" }
        return File(mediaRoot, id)
    }

    fun metadata(id: String): JSONObject = JSONObject(File(directory(id), "meta.json").readText(Charsets.UTF_8))
    fun content(id: String): File = File(directory(id), "content").also { require(it.isFile) { "الملف غير موجود" } }

    @Synchronized fun removeIfUnused(id: String) {
        if (load().contains(JSONObject.quote(id))) return
        directory(id).deleteRecursively()
    }

    fun response(id: String, rangeHeader: String?): WebResourceResponse {
        return try {
            val isThumb = id.endsWith("/thumb")
            val baseId = if (isThumb) id.removeSuffix("/thumb") else id
            
            val file = if (isThumb) File(directory(baseId), "thumb.jpg").also { require(it.isFile) { "الملف غير موجود" } } else content(baseId)
            val mime = if (isThumb) "image/jpeg" else metadata(baseId).getString("mime")
            // Supporting documents only open in another app, never as privileged WebView pages.
            if (!listOf("image/", "audio/", "video/").any { mime.startsWith(it) }) return errorResponse(403, "Forbidden")
            val total = file.length()
            val range = ByteRange.parse(rangeHeader, total)
            if (range == null) return WebResourceResponse("text/plain", "UTF-8", 416, "Range Not Satisfiable",
                mapOf("Content-Range" to "bytes */$total"), ByteArrayInputStream(ByteArray(0)))
            val headers = mutableMapOf("Accept-Ranges" to "bytes", "Content-Length" to range.length.toString(),
                "Cache-Control" to "no-store", "X-Content-Type-Options" to "nosniff")
            val partial = rangeHeader != null
            if (partial) headers["Content-Range"] = "bytes ${range.start}-${range.end}/$total"
            WebResourceResponse(mime, null, if (partial) 206 else 200, if (partial) "Partial Content" else "OK",
                headers, FileRangeStream(file, range.start, range.length))
        } catch (_: Exception) { errorResponse(404, "Not Found") }
    }

    companion object {
        fun errorResponse(status: Int, reason: String) = WebResourceResponse("text/plain", "UTF-8", status, reason,
            mapOf("Cache-Control" to "no-store"), ByteArrayInputStream(ByteArray(0)))
    }
}

/** Includes suffix ranges so seeking does not load the whole video or audio into memory. */
data class ByteRange(val start: Long, val end: Long) {
    val length: Long get() = end - start + 1
    companion object {
        fun parse(header: String?, size: Long): ByteRange? {
            if (size <= 0) return null
            if (header == null) return ByteRange(0, size - 1)
            val match = Regex("bytes=(\\d*)-(\\d*)").matchEntire(header.trim()) ?: return null
            val (first, last) = match.destructured
            if (first.isEmpty()) {
                val suffix = last.toLongOrNull()?.takeIf { it > 0 } ?: return null
                return ByteRange((size - suffix).coerceAtLeast(0), size - 1)
            }
            val start = first.toLongOrNull()?.takeIf { it in 0 until size } ?: return null
            val end = if (last.isEmpty()) size - 1 else last.toLongOrNull()?.coerceAtMost(size - 1) ?: return null
            return if (end >= start) ByteRange(start, end) else null
        }
    }
}

private class FileRangeStream(file: File, start: Long, private var remaining: Long) : InputStream() {
    private val input = RandomAccessFile(file, "r").apply { seek(start) }
    override fun read(): Int {
        if (remaining <= 0) return -1
        val value = input.read()
        if (value >= 0) remaining--
        return value
    }
    override fun read(buffer: ByteArray, offset: Int, length: Int): Int {
        if (length == 0) return 0
        if (remaining <= 0) return -1
        val count = input.read(buffer, offset, minOf(length.toLong(), remaining).toInt())
        if (count > 0) remaining -= count
        return count
    }
    override fun close() = input.close()
}
