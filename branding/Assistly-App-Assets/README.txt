ASSISTLY - ANDROID APP ASSET KIT

Preserves the shapes, letterforms and colours of your two supplied images.
Blue #4B88FD, green #22D214. The editable SVG lettering is outlined artwork, not a font.

ANDROID INSTALL
1. Extract this ZIP.
2. Copy android/app/src/main/res/* into your project app/src/main/res/.
   These files use standard launcher names. Back up existing resources before replacing them.
3. In the existing <application> tag of AndroidManifest.xml, set:
   android:icon="@mipmap/ic_launcher"
   android:roundIcon="@mipmap/ic_launcher_round"
   Do not replace your manifest or paste an extra <application> tag.
4. Sync/build, reinstall to refresh the launcher's cached icon if necessary.
   No dependency or theme change is required for launcher icons.

Legacy: mdpi 48, hdpi 72, xhdpi 96, xxhdpi 144, xxxhdpi 192 pixels.
Adaptive icon: vector foreground and white background in 108dp viewport,
with the mark inside the guaranteed 66dp circular safe region.
API 33+: separate monochrome layer for themed launcher icons.
Notification: @drawable/ic_stat_assistly is a white silhouette on transparent background.
In-app mark: @drawable/assistly_mark.

SPLASH
splash/*.png are visual previews, not full-screen images to add as launcher backgrounds.
The optional @drawable/ic_splash_assistly is a padded 288dp vector intended for an
Android 12+ splash without an icon background. Add to your existing splash theme:
<item name="android:windowSplashScreenAnimatedIcon">@drawable/ic_splash_assistly</item>
Place framework splash attributes in values-v31 or use your existing AndroidX splash setup.
Use your existing theme as the parent; no application theme is replaced by this kit.

GOOGLE PLAY
Upload google-play/assistly-store-icon-512.png as the app icon (512x512 RGBA).
Upload google-play/assistly-feature-graphic-1024x500.png as the feature graphic
(1024x500 RGB, no alpha). The banner's step cards are promotional illustrations,
not screenshots of the running app. Actual app screenshots are still needed for the listing.

BRAND + CANVA
brand/: transparent mark/lockup, white and dark monochrome variants, light/dark placements.
vector/: recolourable two-colour SVG master files and individual blue/green symbol parts.
Upload SVG to Canva to change fill colours. Letters are vector outlines, not live text.
Preview.jpg is a review contact sheet, not a store upload.

VALIDATION
Pixel dimensions, transparent/opaque formats, PNG integrity, XML parsing, resource
references and adaptive icon safe region were checked. Android app compilation was
not run because no Android project or SDK build was supplied for this task.

OFFICIAL REFERENCES (checked 2026-10-23)
https://developer.android.com/develop/ui/compose/system/icon_design_adaptive
https://developer.android.com/distribute/google-play/resources/icon-design-specifications
https://support.google.com/googleplay/android-developer/answer/9866151?hl=en
