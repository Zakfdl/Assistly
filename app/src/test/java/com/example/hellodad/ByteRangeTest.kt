package com.example.hellodad

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class ByteRangeTest {
    @Test fun fullFileAndOpenEndedRanges() {
        assertEquals(ByteRange(0, 999), ByteRange.parse(null, 1000))
        assertEquals(ByteRange(500, 999), ByteRange.parse("bytes=500-", 1000))
        assertEquals(500L, ByteRange.parse("bytes=500-", 1000)!!.length)
    }
    @Test fun boundedAndSuffixRanges() {
        assertEquals(ByteRange(100, 199), ByteRange.parse("bytes=100-199", 1000))
        assertEquals(ByteRange(900, 999), ByteRange.parse("bytes=-100", 1000))
        assertEquals(ByteRange(0, 999), ByteRange.parse("bytes=-9999", 1000))
        assertEquals(ByteRange(900, 999), ByteRange.parse("bytes=900-9999", 1000))
    }
    @Test fun invalidRangesFailWithoutReadingOutsideTheFile() {
        for (header in listOf("bytes=1000-", "bytes=200-100", "bytes=-0", "bytes=-", "bytes=0-1,3-4", "other=0-1", "bytes=999999999999999999999-")) {
            assertNull(header, ByteRange.parse(header, 1000))
        }
        assertNull(ByteRange.parse(null, 0))
    }
}
