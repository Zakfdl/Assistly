(function () {
  'use strict';
  if (window.legacyMigration) return;
  const M = window.LessonModel;
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const native = window.AndroidApp;

  const translations = {
    'en': {
      error_pick_media_native: 'File selection and recording are available within the Android app',
      error_record_native: 'Recording is available within the Android app',
      error_open_attachment_native: 'Opening attachments is available within the Android app',
      error_save: 'Could not save',
      toast_draft_saved: 'Draft saved to device',
      error_save_changes: 'Changes not saved: ',
      toast_save_failed: 'Could not save. Keep the lesson open and try again',
      status_saving_draft: 'Saving draft...',
      toast_finish_recording: 'Finish recording or attaching file first',
      alt_lesson_photo: 'Lesson illustration',
      tagline: 'Small lessons, big help',
      app_title: 'Assistly',
      app_subtitle: 'Explain your way, and gather everything they need in one lesson.',
      role_child: 'I am the Child',
      role_parent: 'I am the Parent',
      tab_mine: 'My Lessons',
      tab_groups: 'Groups',
      tab_continue_draft: 'Continue Draft',
      tab_new_lesson: '+ New Lesson',
      tab_family: 'Family',
      empty_lessons: 'No lessons yet.<br>Start a new lesson and gather explanations and attachments in one place.',
      badge_video: ' Video',
      badge_photo: ' Photo',
      badge_audio: ' Audio',
      badge_steps: 'Steps',
      badge_attachment: ' Attachment',
      categories: 'Categories',
      favorites: 'Favorites',
      all_lessons: 'All Lessons',
      add_category: '+ Add Category',
      category_name: 'Category Name',
      favorite: 'Favorite',
      unfavorite: 'Unfavorite',
      share: 'Share',
      leave_tutorial: 'Leave Tutorial',
      leave_confirm: 'Are you sure you want to remove yourself from this tutorial?',
      available_to: 'Available to: ',
      private: 'Private',
      added_to_lesson: 'Added to lesson',
      optional: 'Optional',
      record_video: '📹 Record Video',
      pick_video: 'Pick Video',
      video_note: 'Up to 250 MB. You can add multiple videos and other explanation methods.',
      capture_photo: '📷 Capture Photo',
      pick_photo: 'Pick Photo',
      photo_note: 'Up to 20 MB. After adding, tap the photo to place points and explain each part.',
      stop_recording: '⏹ Stop Recording',
      record_audio: '🎤 Record Explanation',
      pick_audio: 'Pick Audio File',
      recording_status: 'Recording ',
      audio_note: 'Recording up to 10 minutes, or audio file up to 50 MB.',
      add_files: '📎 Add Attachments',
      files_note: 'PDF, Word, Excel, etc. You can pick multiple files: up to 20 files, 50 MB each.',
      lesson_setup: 'Lesson Setup',
      intro_text: 'All explanation methods are available together. Add what you need and leave the rest empty.',
      lesson_title: 'Lesson Title',
      title_placeholder: 'e.g., How to run the washing machine?',
      section_video: '1. Video Explanation',
      section_photo: '2. Photo Explanation',
      section_audio: '3. Audio Explanation',
      section_steps: '4. Written Steps',
      section_files: '5. Attachments',
      steps_label: 'Write the steps in order',
      steps_placeholder: '1. Plug it in.\n2. Press the power button.',
      who_is_this_for: 'Who is this lesson for?',
      leave_empty_private: 'Leave empty to keep the lesson private.',
      local_storage_notice: 'Lessons are saved on this device. Making them available to family here does not send them to other phones.',
      preparing_attachment: 'Preparing attachment...',
      save_lesson: 'Save Lesson',
      discard_draft: 'Discard Draft',
      tap_to_add_point: 'Tap the photo to add a point',
      point_explanation: 'Point ',
      point_placeholder: 'e.g., Power button',
      record_point: '🎤 Record Point Explanation',
      remove_point_audio: 'Remove Point Audio Only',
      remove_point: 'Remove This Point',
      tap_to_place_point: 'Tap a spot on the photo to add an explanation point.',
      remove_video: 'Remove Video',
      remove_photo: 'Remove Photo & Points',
      remove_audio: 'Remove Audio',
      open: 'Open',
      remove_file: 'Remove This File',
      tap_numbers_to_view: 'Tap the numbers to view the explanation for each part.',
      lesson_not_found: 'Lesson not found',
      back: '‹ Back',
      delete_lesson: 'Delete Lesson Completely',
      add_who_you_help: 'Add who you help, then select them when saving a lesson.',
      lessons_available: ' lessons available on this device',
      family_member_name: 'Family Member Name',
      family_member_placeholder: 'Dad, Mom...',
      add: 'Add',
      sharing_notice: 'Communication and invites between different devices require a separate sharing service.',
      who_are_you: 'Who are you?',
      search_lesson: 'Search for a lesson',
      search_placeholder: 'e.g., Vacuum cleaner',
      voice_search: '🎤 Voice Search',
      no_matching_lessons: 'No matching lessons.',
      max_files_limit: 'Maximum 20 attachments per lesson',
      type_name_first: 'Type the name first',
      voice_search_unavailable: 'Voice search is not available in this browser',
      files_added_up_to_limit: 'Available files added up to the 20 file limit',
      added_rest_saved: 'Added; the rest of the lesson content is saved',
      error_open_lessons: 'Could not open lessons',
      data_not_replaced: 'Saved data was not replaced. Close the app and try again.',
      confirm_discard: 'Discard the draft and all its contents?',
      confirm_delete: 'Permanently delete the lesson and all its media and files from this device?',
      error_empty_title: 'Enter a lesson title',
      error_no_content: 'Add a video, photo, audio, steps, or attachment',
      error_no_draft: 'No draft exists',
      set_cover: 'Set Cover Image',
      remove_cover: 'Remove Cover',
      section_cover: 'Cover Image',
      cover_note: 'Optional. If left empty, a photo or video thumbnail will be used.',
      reminders: 'Reminders',
      add_reminder: '+ Add Reminder',
      reminder_name: 'Medication / Task',
      reminder_instructions: 'Instructions / Dose',
      share_manual: 'Share Lesson manually',
      share_manual_note: 'Sharing creates a link that must be sent manually. This does not enable live monitoring or family alerts.',
      lang_system: 'System Default',
      lang_en: 'English',
      lang_ar: 'العربية',
      language: 'Language',
      settings: 'Settings',
      group_name: 'Group Name',
      group_description: 'Description',
      create_group: '+ Create Group',
      empty_groups: 'No groups yet. Create one to organize lessons.',
      group_not_found: 'Group not found',
      members: 'Members',
      group_cover: 'Group Cover',
      publish_to_group: 'Publish to Group:',
      none: 'None',
      save_group: 'Save Group',
      profile: 'Profile / Account',
      cloud_sync_not_configured: 'Cloud sync is not configured. Setup instructions: Add google-services.json, enable Firebase Auth and Firestore.',
      login_with_google: 'Login with Google',
      login_with_email: 'Login / Register',
      logout: 'Logout',
      cloud_required_for_groups: 'Cloud configuration is required to invite members or share this group.',
      logged_in_as: 'Logged in as:',
      home: 'Home',
      lessons: 'Lessons',
      recent_lessons: 'Recent Lessons'
    },
    'ar': {
      error_pick_media_native: 'اختيار الملفات والتسجيل متاحان داخل تطبيق Android',
      error_record_native: 'التسجيل متاح داخل تطبيق Android',
      error_open_attachment_native: 'فتح المرفقات متاح داخل تطبيق Android',
      error_save: 'تعذّر الحفظ',
      toast_draft_saved: 'تم حفظ المسودة على الجهاز',
      error_save_changes: 'لم تُحفظ التغييرات: ',
      toast_save_failed: 'تعذّر الحفظ. احتفظ بالدرس مفتوحاً وأعد المحاولة',
      status_saving_draft: 'جارٍ حفظ المسودة…',
      toast_finish_recording: 'أنهِ التسجيل أو إرفاق الملف أولاً',
      alt_lesson_photo: 'صورة توضيحية للدرس',
      tagline: 'دروس صغيرة، مساعدة كبيرة',
      app_title: 'Assistly',
      app_subtitle: 'اشرح بطريقتك، واجمع كل ما يحتاجونه في درس واحد.',
      role_child: 'أنا الابن / الابنة',
      role_parent: 'أنا الأب / الأم',
      tab_mine: 'دروسي',
      tab_groups: 'المجموعات',
      tab_continue_draft: 'متابعة المسودة',
      tab_new_lesson: '+ درس جديد',
      tab_family: 'العائلة',
      empty_lessons: 'لا توجد دروس بعد.<br>ابدأ درساً جديداً واجمع الشرح والمرفقات في مكان واحد.',
      badge_video: ' فيديو',
      badge_photo: ' صور',
      badge_audio: ' أصوات',
      badge_steps: 'خطوات',
      badge_attachment: ' مرفقات',
      categories: 'التصنيفات',
      favorites: 'المفضلة',
      all_lessons: 'كل الدروس',
      add_category: '+ إضافة تصنيف',
      category_name: 'اسم التصنيف',
      favorite: 'إضافة للمفضلة',
      unfavorite: 'إزالة من المفضلة',
      share: 'مشاركة',
      leave_tutorial: 'مغادرة الدرس',
      leave_confirm: 'هل أنت متأكد أنك تريد إزالة نفسك من هذا الدرس؟',
      available_to: 'متاح لـ: ',
      private: 'خاص بي',
      added_to_lesson: 'مضاف إلى الدرس',
      optional: 'اختياري',
      record_video: '📹 تسجيل فيديو',
      pick_video: 'اختيار فيديو',
      video_note: 'حتى 250 MB. يمكنك إضافة عدة فيديوهات وبقية طرق الشرح.',
      capture_photo: '📷 التقاط صورة',
      pick_photo: 'اختيار صورة',
      photo_note: 'حتى 20 MB. بعد الإضافة، المس الصورة لوضع نقاط وشرح كل جزء.',
      stop_recording: '⏹ إيقاف التسجيل',
      record_audio: '🎤 تسجيل الشرح',
      pick_audio: 'اختيار ملف صوتي',
      recording_status: 'جارٍ التسجيل ',
      audio_note: 'التسجيل حتى 10 دقائق، أو ملف صوتي حتى 50 MB.',
      add_files: '📎 إضافة ملفات مساندة',
      files_note: 'PDF وWord وExcel وغيرها. يمكنك اختيار عدة ملفات معاً: حتى 20 ملفاً، و50 MB لكل ملف.',
      lesson_setup: 'إعداد الدرس',
      intro_text: 'كل طرق الشرح متاحة معاً. أضف ما تحتاجه واترك البقية فارغة.',
      lesson_title: 'عنوان الدرس',
      title_placeholder: 'مثال: كيف أشغّل الغسالة؟',
      section_video: '1. الشرح بالفيديو',
      section_photo: '2. الشرح على صورة',
      section_audio: '3. الشرح بالصوت',
      section_steps: '4. الخطوات المكتوبة',
      section_files: '5. الملفات المساندة',
      steps_label: 'اكتب الخطوات بالترتيب',
      steps_placeholder: '1. وصّل القابس.\n2. اضغط زر التشغيل.',
      who_is_this_for: 'لمن هذا الدرس؟',
      leave_empty_private: 'اتركها فارغة ليبقى الدرس خاصاً بك.',
      local_storage_notice: 'الدروس محفوظة على هذا الجهاز. إتاحتها للعائلة هنا لا ترسلها إلى هواتف أخرى.',
      preparing_attachment: 'جارٍ تجهيز المرفق…',
      save_lesson: 'حفظ الدرس بكل محتوياته',
      discard_draft: 'إلغاء المسودة',
      tap_to_add_point: 'المس الصورة لإضافة نقطة',
      point_explanation: 'شرح النقطة ',
      point_placeholder: 'مثال: زر التشغيل',
      record_point: '🎤 تسجيل شرح النقطة',
      remove_point_audio: 'حذف صوت النقطة فقط',
      remove_point: 'حذف هذه النقطة',
      tap_to_place_point: 'المس موضعاً في الصورة لإضافة نقطة شرح.',
      remove_video: 'حذف الفيديو',
      remove_photo: 'حذف الصورة ونقاطها',
      remove_audio: 'حذف الصوت',
      open: 'فتح',
      remove_file: 'حذف هذا الملف',
      tap_numbers_to_view: 'المس الأرقام لعرض شرح كل جزء.',
      lesson_not_found: 'الدرس غير موجود',
      back: '‹ رجوع',
      delete_lesson: 'حذف الدرس بكل محتوياته',
      add_who_you_help: 'أضف من تساعده، ثم اختره عند حفظ الدرس.',
      lessons_available: ' دروس متاحة على هذا الجهاز',
      family_member_name: 'اسم فرد العائلة',
      family_member_placeholder: 'أبي، أمي…',
      add: 'إضافة',
      sharing_notice: 'التواصل والدعوات بين أجهزة مختلفة يحتاجان خدمة مشاركة منفصلة.',
      who_are_you: 'من أنت؟',
      search_lesson: 'ابحث عن درس',
      search_placeholder: 'مثال: المكنسة',
      voice_search: '🎤 البحث بالصوت',
      no_matching_lessons: 'لا توجد دروس مطابقة.',
      max_files_limit: 'الحد الأقصى 20 ملفاً مسانداً في الدرس',
      type_name_first: 'اكتب الاسم أولاً',
      voice_search_unavailable: 'البحث الصوتي غير متاح في هذا المتصفح',
      files_added_up_to_limit: 'تمت إضافة الملفات المتاحة حتى حد 20 ملفاً',
      added_rest_saved: 'تمت الإضافة؛ بقية محتويات الدرس محفوظة',
      error_open_lessons: 'تعذّر فتح الدروس',
      data_not_replaced: 'لم تُستبدل البيانات المحفوظة. أغلق التطبيق وأعد المحاولة.',
      confirm_discard: 'حذف المسودة بكل محتوياتها؟',
      confirm_delete: 'حذف الدرس وكل وسائطه وملفاته نهائياً من هذا الجهاز؟',
      error_empty_title: 'اكتب عنواناً للدرس',
      error_no_content: 'أضف فيديو أو صورة أو صوتاً أو خطوات أو ملفاً مسانداً',
      error_no_draft: 'لا توجد مسودة',
      set_cover: 'تعيين صورة للغلاف',
      remove_cover: 'حذف الغلاف',
      section_cover: 'صورة الغلاف',
      cover_note: 'اختياري. إن لم تختر غلافاً، ستُستخدم صورة أو فيديو من الدرس.',
      reminders: 'التذكيرات',
      add_reminder: '+ إضافة تذكير',
      reminder_name: 'الدواء / المهمة',
      reminder_instructions: 'التعليمات / الجرعة',
      share_manual: 'مشاركة الدرس يدوياً',
      share_manual_note: 'المشاركة تنشئ رابطاً يجب إرساله يدوياً. هذا لا يفعل المراقبة الحية أو تنبيهات العائلة.',
      lang_system: 'System Default',
      lang_en: 'English',
      lang_ar: 'العربية',
      language: 'Language / اللغة',
      settings: 'Settings / الإعدادات',
      group_name: 'اسم المجموعة',
      group_description: 'الوصف',
      create_group: '+ إنشاء مجموعة',
      empty_groups: 'لا توجد مجموعات بعد. أنشئ مجموعة لتنظيم الدروس.',
      group_not_found: 'المجموعة غير موجودة',
      members: 'الأعضاء',
      group_cover: 'غلاف المجموعة',
      publish_to_group: 'نشر في مجموعة:',
      none: 'بلا',
      save_group: 'حفظ المجموعة',
      profile: 'الحساب الشخصي',
      cloud_sync_not_configured: 'المزامنة السحابية غير معدة. أضف google-services.json وفعّل Firebase Auth و Firestore.',
      login_with_google: 'تسجيل الدخول بـ Google',
      login_with_email: 'تسجيل الدخول / إنشاء حساب',
      logout: 'تسجيل الخروج',
      cloud_required_for_groups: 'المزامنة السحابية مطلوبة لدعوة أعضاء أو مشاركة المجموعة.',
      logged_in_as: 'تم تسجيل الدخول كـ:',
      home: 'الرئيسية',
      lessons: 'الدروس',
      recent_lessons: 'الدروس الأخيرة'
    }
  };

  let currentLang = 'en';
  function initLanguage() {
    const saved = localStorage.getItem('assistly_lang') || 'system';
    setLanguage(saved);
  }

  function setLanguage(langSetting) {
    localStorage.setItem('assistly_lang', langSetting);
    if (langSetting === 'system') {
      currentLang = navigator.language.startsWith('ar') ? 'ar' : 'en';
    } else {
      currentLang = langSetting;
    }
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    try { if (native && native.setNativeLocale) native.setNativeLocale(langSetting); } catch (e) {}
  }

  function t(key) {
    return translations[currentLang][key] || key;
  }

  const browserHost = {
    loadState: () => localStorage.getItem('helloDadV2Preview') || localStorage.getItem('helloParentV1') || '{}',
    saveState: json => { localStorage.setItem('helloDadV2Preview', json); return '{"ok":true}'; },
    releaseMedia: () => {}, pageReady: () => {},
    pickMedia: () => { throw new Error(t('error_pick_media_native')); },
    startAudio: () => { throw new Error(t('error_record_native')); },
    openAttachment: () => { throw new Error(t('error_open_attachment_native')); },
    isCloudConfigured: () => false,
    getCurrentUser: () => null,
    loginWithGoogle: () => alert("Google Login not available in browser"),
    logout: () => {}
  };
  const host = native || browserHost;
  let S, tab = 'home', view = null, viewGroup = null, groupDraft = null, parentId, query = '', selectedPin = null, viewedPin = null;
  let categoryFilter = null;
  let showFavorites = false;
  let busy = false, recording = null, waitingForRecord = false, saveTimer = null, toastTimer = null;
  let cleanup = new Set(), saveMessage = '', saveError = false, recordSeconds = 0, recordTimer = null;
  const MAX_ATTACHMENTS = 20;

  function toast(message) {
    const box = $('#toast');
    box.textContent = t(message) || message;
    box.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { box.style.display = 'none'; }, 4200);
  }
  function status(message, error = false) {
    saveMessage = message;
    saveError = error;
    const box = $('#save-status');
    if (box) { box.textContent = message; box.classList.toggle('error', error); }
  }
  function release(ids) {
    if (!ids.length) return;
    try { host.releaseMedia(JSON.stringify(ids)); } catch (_) { /* Keep files when cleanup is unavailable. */ }
  }
  function persist(next = S) {
    clearTimeout(saveTimer);
    try {
      const result = JSON.parse(host.saveState(JSON.stringify(next)));
      if (!result.ok) throw new Error(result.error || t('error_save'));
      status(t('toast_draft_saved'));
      release([...cleanup]);
      cleanup.clear();
      return true;
    } catch (error) {
      status(t('error_save_changes') + error.message, true);
      toast(t('toast_save_failed'));
      return false;
    }
  }
  function scheduleSave() {
    status(t('status_saving_draft'));
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => persist(), 300);
  }
  function locked() { return busy || recording !== null || waitingForRecord; }
  function canNavigate() {
    if (locked()) { toast(t('toast_finish_recording')); return false; }
    return persist();
  }
  function url(media) {
    if (!media) return '';
    if (typeof media === 'string') return /^data:(image|audio)\/[a-z0-9.+-]+;base64,/i.test(media) ? media : '';
    if (media.url) return media.url;
    return /^[a-zA-Z0-9-]+$/.test(media.id || '') ? 'https://appassets.androidplatform.net/media/' + media.id : '';
  }
  function size(bytes) {
    if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    return Math.max(1, Math.ceil((bytes || 0) / 1024)) + ' KB';
  }
  function mediaNameItem(media) { return media && typeof media === 'object' ? `<div class="media-name">${esc(media.name)} · <bdi>${size(media.size)}</bdi></div>` : ''; }
  function playerMedia(media, type) {
    const src = url(media);
    if (!src) return '';
    if (type === 'photo') return `<img class="pic" src="${esc(src)}" alt="${esc(t('alt_lesson_photo'))}">`;
    return `<${type} controls preload="metadata" ${type === 'video' ? 'playsinline' : ''} src="${esc(src)}"></${type}>`;
  }
  function dashboardUI() {
    const personalLessons = S.tuts.filter(lesson => !lesson.groupId);
    const groupsCount = S.groups ? S.groups.length : 0;
    const peopleCount = S.contacts ? S.contacts.length : 0;
    const remindersCount = S.reminders ? S.reminders.length : 0;

    const recentLessons = personalLessons.slice(0, 3);

    return `
      <div class="dash-header">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <img class="logo" src="logo.png" alt="" aria-hidden="true" style="width:2rem;height:2rem;padding:0;">
          <h1 style="font-size:1.25rem; margin:0;">${esc(t('app_title'))}</h1>
        </div>
      </div>

      <div class="dash-card" style="margin-bottom:2rem; background: var(--welcome-bg); color:white; border:none; display:flex; flex-direction:row; gap:1rem; align-items:center;">
        <img src="logo.png" style="width:2.5rem; height:2.5rem; object-fit:contain;" alt="">
        <div>
          <h2 style="margin:0; font-size:1.25rem;">Hello, Friend</h2>
          <p style="margin:0; font-size:0.875rem; opacity:0.9;">Explain once, replay whenever needed</p>
        </div>
      </div>

      <h3 style="margin-bottom:1rem; font-size:1.125rem;">Quick Actions</h3>
      <div class="grid-2">
        <div class="dash-card" data-action="new" style="cursor:pointer; background: var(--action-1); color:white; border:none; display:flex; flex-direction:column; justify-content:space-between; min-height:100px;">
          <div style="font-size:1.5rem; font-weight:bold;">+</div>
          <div style="font-weight:bold;">${esc(S.draft ? t('tab_continue_draft') : t('tab_new_lesson'))}</div>
        </div>
        <div class="dash-card" data-action="tab" data-tab="reminders" style="cursor:pointer; background: var(--action-2); color:white; border:none; display:flex; flex-direction:column; justify-content:space-between; min-height:100px;">
          <div style="font-size:1.5rem;">⏰</div>
          <div style="font-weight:bold;">${esc(t('reminders'))}</div>
        </div>
      </div>

      <div style="margin-top:2rem;">
        <h3 style="margin-bottom:1rem; font-size:1.125rem;">Recent Tutorials</h3>
        ${recentLessons.length ? recentLessons.map(lesson => card(lesson, true)).join('') : `<div class="dash-card" style="padding:2rem 1.5rem; text-align:center; align-items:center; border:none;">
          <img src="logo.png" style="width:3rem; height:3rem; opacity:0.2; margin-bottom:1rem;" alt="">
          <p style="margin-bottom:1.5rem;">No recent tutorials yet. Create your first guide or accept a shared invite.</p>
          <button class="btn" style="background:var(--action-1); color:white; width:auto; border-radius:12px; margin:0;" data-action="new">New Tutorial</button>
        </div>`}
      </div>
    `;
  }

  function myLessonsUI() {
    let html = `<h2>${esc(t('tab_mine'))}</h2>`;

    // Category tabs
    html += `<nav class="tabs" style="overflow-x:auto;"><button data-action="set-category" data-cat="all" class="${!categoryFilter && !showFavorites ? 'on' : ''}">${esc(t('all_lessons'))}</button>`;
    html += `<button data-action="set-category" data-cat="fav" class="${showFavorites ? 'on' : ''}">⭐ ${esc(t('favorites'))}</button>`;
    (S.categories || []).forEach(cat => {
      html += `<button data-action="set-category" data-cat="${esc(cat.id)}" class="${categoryFilter === cat.id ? 'on' : ''}">${esc(cat.name)}</button>`;
    });
    html += `</nav>`;

    // Category management
    html += `<div style="display:flex; gap:8px; margin-bottom:12px;">
      <input id="new-cat-name" type="text" placeholder="${esc(t('category_name'))}" style="margin:0; flex:1;">
      <button class="btn alt small" data-action="add-category" style="margin:0; padding: 0 16px;">${esc(t('add'))}</button>
    </div>`;

    if (categoryFilter) {
       html += `<div style="margin-bottom:12px;text-align:end;"><button class="remove" data-action="delete-category" data-id="${esc(categoryFilter)}">Delete Category</button></div>`;
    }

    html += `<label for="search">${esc(t('search_lesson'))}</label><input id="search" type="text" value="${esc(query)}" placeholder="${esc(t('search_placeholder'))}">${tool(t('voice_search'), 'voice', '', 'alt')}<div id="lesson-results">`;
    html += searchResults();
    html += `</div>`;
    return html;
  }

  function bottomNav() {
    const homeIcon = `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path><path d="M9 22V12h6v10"></path></svg>`;
    const lessonsIcon = `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"></path><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"></path></svg>`;
    const groupsIcon = `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path></svg>`;
    const moreIcon = `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path></svg>`;

    return `
      <nav class="bottom-nav">
        <div class="nav-item ${tab === 'home' ? 'active' : ''}" data-action="tab" data-tab="home">
          ${homeIcon}
          <span>${esc(t('home'))}</span>
        </div>
        <div class="nav-item ${tab === 'mine' ? 'active' : ''}" data-action="tab" data-tab="mine">
          ${lessonsIcon}
          <span>${esc(t('lessons'))}</span>
        </div>
        <div class="nav-item ${tab === 'groups' ? 'active' : ''}" data-action="tab" data-tab="groups">
          ${groupsIcon}
          <span>${esc(t('tab_groups'))}</span>
        </div>
        <div class="nav-item ${tab === 'settings' ? 'active' : ''}" data-action="tab" data-tab="settings">
          ${moreIcon}
          <span>${esc(t('settings'))}</span>
        </div>
      </nav>
    `;
  }

  function render() {
    $('#app').setAttribute('aria-busy', busy ? 'true' : 'false');

    let content = '';
    if (view) content = player(view, true);
    else if (tab === 'new') content = form();
    else if (tab === 'groups') content = groupsUI();
    else if (tab === 'people') content = people();
    else if (tab === 'reminders') content = remindersUI();
    else if (tab === 'settings') content = settingsUI();
    else if (tab === 'mine') content = myLessonsUI();
    else content = dashboardUI();

    const showNav = !view && !viewGroup && !groupDraft && tab !== 'new';

    $('#app').innerHTML = content + (showNav ? bottomNav() : '');

    if (recording !== null) updateRecordingClock();
    document.querySelectorAll('audio,video').forEach(media => {
      media.addEventListener('play', () => document.querySelectorAll('audio,video').forEach(other => { if (other !== media) other.pause(); }));
      media.addEventListener('error', () => toast('تعذّر تشغيل الوسيط. تحقق من أن صيغة الملف مدعومة على جهازك'));
    });
  }
  function groupsUI() {
    if (viewGroup) return groupView(viewGroup);
    if (groupDraft) return groupForm();

    let html = `<h2>${esc(t('tab_groups'))}</h2>`;
    if (S.groups && S.groups.length > 0) {
      html += S.groups.map(group => groupCard(group)).join('');
    } else {
      html += `<div class="empty">${esc(t('empty_groups'))}</div>`;
    }
    html += `<br><button data-action="new-group" class="btn alt">${esc(t('create_group'))}</button>`;
    return html;
  }
  function groupCard(group) {
    const thumbHtml = group.cover ? `<img src="${esc(url(group.cover))}" alt="">` : '👥';
    return `<article class="card"><button class="item" data-action="open-group" data-id="${esc(group.id)}"><span class="thumb">${thumbHtml}</span><span><b>${esc(group.name)}</b></span></button></article>`;
  }
  function groupView(id) {
    const group = S.groups.find(g => g.id === id);
    if (!group) return `<p class="empty">${esc(t('group_not_found'))}</p>`;

    const groupLessons = S.tuts.filter(lesson => lesson.groupId === id);
    const currentUserId = parentId || (S.contacts.length ? S.contacts[0].id : null);
    const roleInGroup = (group.roles && currentUserId) ? group.roles[currentUserId] : 'owner';
    const canEdit = roleInGroup === 'owner' || roleInGroup === 'contributor';

    let isCloud = false;
    try { isCloud = host.isCloudConfigured(); } catch(e) {}

    let html = `<button class="back" data-action="back-group">${esc(t('back'))}</button>
      <h2>${esc(group.name)}</h2>
      ${group.description ? `<p class="note">${esc(group.description)}</p>` : ''}`;

    if (!isCloud) {
      html += `<p class="note">🔒 ${esc(t('cloud_required_for_groups'))}</p>`;
    }

    html += `
      <div class="row">
        <button class="btn ghost" data-action="group-members" data-id="${esc(group.id)}">${esc(t('members'))}</button>
        ${canEdit ? `<button class="btn ghost" data-action="new-lesson-in-group" data-id="${esc(group.id)}">${esc(t('tab_new_lesson'))}</button>` : ''}
      </div>
      <br>`;

    if (groupLessons.length > 0) {
      html += groupLessons.map(lesson => card(lesson, true)).join('');
    } else {
      html += `<div class="empty">${t('empty_lessons')}</div>`;
    }
    return html;
  }
  function groupForm() {
    const cover = groupDraft.cover ? `<div class="media-item"><img class="pic" src="${esc(url(groupDraft.cover))}" alt=""><div class="row"><button class="remove" data-action="remove-group-cover" ${locked() ? 'disabled' : ''}>${esc(t('remove_cover'))}</button></div></div>`
      : `<div class="row">${tool(t('set_cover'), 'media-group-cover', 'data-kind="cover" data-source="pick"')}</div><p class="note">${esc(t('cover_note'))}</p>`;

    return `<h2>${esc(t('create_group'))}</h2>
      <label for="group-name">${esc(t('group_name'))}</label><input id="group-name" type="text" maxlength="80" data-field="group-name" value="${esc(groupDraft.name)}">
      <label for="group-desc">${esc(t('group_description'))}</label><input id="group-desc" type="text" maxlength="160" data-field="group-desc" value="${esc(groupDraft.description)}">
      ${section(t('group_cover'), cover, !!groupDraft.cover, 'group-cover-section')}
      <br>
      ${tool(t('save_group'), 'save-group', '', 'alt')}
      ${tool(t('discard_draft'), 'discard-group')}`;
  }
  function settingsUI() {
    const lang = localStorage.getItem('assistly_lang') || 'system';

    let isCloud = false;
    let userJson = null;
    try {
      isCloud = host.isCloudConfigured();
      userJson = host.getCurrentUser();
    } catch(e) {}

    let profileHtml = `<h3>${esc(t('profile'))}</h3>`;
    if (!isCloud) {
      profileHtml += `<p class="note">${esc(t('cloud_sync_not_configured'))}</p>`;
    } else {
      if (userJson) {
        let user = JSON.parse(userJson);
        profileHtml += `<p>${esc(t('logged_in_as'))} <b>${esc(user.displayName || user.email)}</b></p>`;
        profileHtml += `<button class="btn ghost" data-action="logout">${esc(t('logout'))}</button>`;
      } else {
        profileHtml += `<div class="card">
          <input type="text" id="login-email" placeholder="Email">
          <input type="text" id="login-pass" placeholder="Password">
          <button class="btn alt" data-action="login-email">${esc(t('login_with_email'))}</button>
          <p class="note" style="text-align:center;">Or</p>
          <button class="btn ghost" data-action="login-google">${esc(t('login_with_google'))}</button>
        </div>`;
      }
    }

    return `<h2>${esc(t('settings'))}</h2>
      ${profileHtml}
      <br>
      <label for="lang-select">${esc(t('language'))}</label>
      <select id="lang-select" data-action="change-lang">
        <option value="system" ${lang === 'system' ? 'selected' : ''}>${esc(t('lang_system'))}</option>
        <option value="en" ${lang === 'en' ? 'selected' : ''}>${esc(t('lang_en'))}</option>
        <option value="ar" ${lang === 'ar' ? 'selected' : ''}>${esc(t('lang_ar'))}</option>
      </select>`;
  }
  function badges(lesson) {
    const parts = [];
    if (lesson.videos && lesson.videos.length) parts.push(lesson.videos.length + t('badge_video'));
    if (lesson.photos && lesson.photos.length) parts.push(lesson.photos.length + t('badge_photo'));
    if (lesson.audios && lesson.audios.length) parts.push(lesson.audios.length + t('badge_audio'));
    if (lesson.steps.trim()) parts.push(t('badge_steps'));
    if (lesson.attachments.length) parts.push(lesson.attachments.length + t('badge_attachment'));
    return '<div class="badges">' + parts.map(part => `<span class="badge">${esc(part)}</span>`).join('') + '</div>';
  }
  function card(lesson, own) {
    const names = lesson.to.map(id => S.contacts.find(person => person.id === id)?.name).filter(Boolean).join(', ');
    const hasVideo = lesson.videos && lesson.videos.length;
    const hasAudio = lesson.audios && lesson.audios.length;

    let thumbHtml = '📖';
    if (lesson.cover) thumbHtml = `<img src="${esc(url(lesson.cover))}" alt="">`;
    else if (lesson.photos && lesson.photos[0]) thumbHtml = `<img src="${esc(url(lesson.photos[0]))}" alt="">`;
    else if (hasVideo && lesson.videos[0].thumb) thumbHtml = `<img src="${esc(lesson.videos[0].thumb)}" alt="">`;
    else if (hasVideo) thumbHtml = '▶';
    else if (hasAudio) thumbHtml = '🎤';

    return `<article class="card"><button class="item" data-action="open" data-id="${esc(lesson.id)}"><span class="thumb">${thumbHtml}</span><span><b>${esc(lesson.title)}</b>${own ? `<span class="note">${names ? t('available_to') + esc(names) : t('private')}</span>` : ''}${badges(lesson)}</span></button></article>`;
  }
  function section(title, content, included = false, id = '') {
    return `<section class="section" ${id ? `id="${id}"` : ''}><div class="section-head"><h3>${title}</h3><span class="${included ? 'included' : 'optional'}">${included ? t('added_to_lesson') : t('optional')}</span></div>${content}</section>`;
  }
  function tool(label, action, data = '', css = 'ghost', active = false) {
    return `<button type="button" class="btn ${css}" data-action="${action}" ${data} ${locked() && !active ? 'disabled' : ''}>${label}</button>`;
  }
  function form() {
    const draft = S.draft;
    if (!draft) return '';
    const video = (draft.videos || []).map((v, i) => `<div class="media-item">${playerMedia(v, 'video')}${mediaNameItem(v)}<div class="row">${i > 0 ? `<button class="btn ghost" data-action="move-up" data-kind="video" data-id="${esc(v.id)}" ${locked() ? 'disabled' : ''}>⬆️</button>` : ''}${i < draft.videos.length - 1 ? `<button class="btn ghost" data-action="move-down" data-kind="video" data-id="${esc(v.id)}" ${locked() ? 'disabled' : ''}>⬇️</button>` : ''}<button class="remove" data-action="remove-media" data-kind="video" data-id="${esc(v.id)}" ${locked() ? 'disabled' : ''}>${esc(t('remove_video'))}</button></div></div>`).join('')
      + `<div class="row">${tool(t('record_video'), 'media', 'data-kind="video" data-source="capture"')}${tool(t('pick_video'), 'media', 'data-kind="video" data-source="pick"')}</div>`
      + `<p class="note">${esc(t('video_note'))}</p>`;

    const photo = (draft.photos || []).map((p, i) => `<div class="media-item">${pinsUI(p)}<div class="row">${i > 0 ? `<button class="btn ghost" data-action="move-up" data-kind="photo" data-id="${esc(p.id)}" ${locked() ? 'disabled' : ''}>⬆️</button>` : ''}${i < draft.photos.length - 1 ? `<button class="btn ghost" data-action="move-down" data-kind="photo" data-id="${esc(p.id)}" ${locked() ? 'disabled' : ''}>⬇️</button>` : ''}<button class="remove" data-action="remove-media" data-kind="photo" data-id="${esc(p.id)}" ${locked() ? 'disabled' : ''}>${esc(t('remove_photo'))}</button></div></div>`).join('')
      + `<div class="row">${tool(t('capture_photo'), 'media', 'data-kind="photo" data-source="capture"')}${tool(t('pick_photo'), 'media', 'data-kind="photo" data-source="pick"')}</div>`
      + `<p class="note">${esc(t('photo_note'))}</p>`;

    const isMainRecording = recording === '';
    const audio = (draft.audios || []).map((a, i) => `<div class="media-item">${playerMedia(a, 'audio')}${mediaNameItem(a)}<div class="row">${i > 0 ? `<button class="btn ghost" data-action="move-up" data-kind="audio" data-id="${esc(a.id)}" ${locked() ? 'disabled' : ''}>⬆️</button>` : ''}${i < draft.audios.length - 1 ? `<button class="btn ghost" data-action="move-down" data-kind="audio" data-id="${esc(a.id)}" ${locked() ? 'disabled' : ''}>⬇️</button>` : ''}<button class="remove" data-action="remove-media" data-kind="audio" data-id="${esc(a.id)}" ${locked() ? 'disabled' : ''}>${esc(t('remove_audio'))}</button></div></div>`).join('')
      + `<div class="row">${tool(isMainRecording ? t('stop_recording') : t('record_audio'), 'record', 'data-target=""', 'rec', isMainRecording)}${tool(t('pick_audio'), 'media', 'data-kind="audio" data-source="pick"')}</div>`
      + (isMainRecording ? `<p class="recording" role="status">${esc(t('recording_status'))}<bdi id="record-clock">00:00</bdi></p>` : '')
      + `<p class="note">${esc(t('audio_note'))}</p>`;

    const files = fileList(draft.attachments, true)
      + tool(t('add_files'), 'media', 'data-kind="file" data-source="pick"')
      + `<p class="note">${esc(t('files_note'))}</p>`;

    const cover = draft.cover ? `<div class="media-item"><img class="pic" src="${esc(url(draft.cover))}" alt=""><div class="row"><button class="remove" data-action="remove-cover" ${locked() ? 'disabled' : ''}>${esc(t('remove_cover'))}</button></div></div>`
      : `<div class="row">${tool(t('set_cover'), 'media', 'data-kind="cover" data-source="pick"')}</div><p class="note">${esc(t('cover_note'))}</p>`;

    return `<h2>${esc(t('lesson_setup'))}</h2><div class="intro"><p>${esc(t('intro_text'))}</p></div>
      <label for="title">${esc(t('lesson_title'))}</label><input id="title" type="text" maxlength="160" placeholder="${esc(t('title_placeholder'))}" data-field="title" value="${esc(draft.title)}">
      ${section(t('section_cover'), cover, !!draft.cover, 'cover-section')}
      ${section(t('section_video'), video, draft.videos && draft.videos.length, 'video-section')}
      ${section(t('section_photo'), photo, draft.photos && draft.photos.length, 'photo-section')}
      ${section(t('section_audio'), audio, draft.audios && draft.audios.length, 'audio-section')}
      ${section(t('section_steps'), `<label for="steps" class="note">${esc(t('steps_label'))}</label><textarea id="steps" data-field="steps" placeholder="${esc(t('steps_placeholder'))}">${esc(draft.steps)}</textarea>`, !!draft.steps.trim(), 'steps-section')}
      ${section(t('section_files'), files, !!draft.attachments.length, 'files-section')}
      <section class="section">
        <h3>${esc(t('publish_to_group'))}</h3>
        <select id="group-select" data-field="groupId">
          <option value="">${esc(t('none'))}</option>
          ${S.groups ? S.groups.map(g => `<option value="${esc(g.id)}" ${draft.groupId === g.id ? 'selected' : ''}>${esc(g.name)}</option>`).join('') : ''}
        </select>
      </section>
      <section class="section"><h3>${esc(t('who_is_this_for'))}</h3>${S.contacts.map(person => `<label class="chk"><input type="checkbox" data-person="${esc(person.id)}" ${draft.to.includes(person.id) ? 'checked' : ''}>${esc(person.name)}</label>`).join('')}<p class="note">${esc(t('leave_empty_private'))}</p></section>
      <div class="notice">${esc(t('local_storage_notice'))}</div>
      <p id="save-status" class="status ${saveError ? 'error' : ''}" role="status">${esc(busy ? t('preparing_attachment') : saveMessage)}</p>
      ${tool(busy ? t('preparing_attachment') : t('save_lesson'), 'save', '', 'alt')}
      ${tool(t('discard_draft'), 'discard')}`;
  }
  function pinsUI(photo) {
    if (!photo) return '';
    const pin = photo.pins.find(point => point.id === selectedPin);
    let html = `<div class="pw" data-action="add-pin" data-photo-id="${esc(photo.id)}"><img class="pic" src="${esc(url(photo))}" alt="${esc(t('tap_to_add_point'))}">${photo.pins.map((point, index) => `<button class="pin ${point.id === selectedPin ? 'sel' : ''}" style="left:${Number(point.x) || 0}%;top:${Number(point.y) || 0}%" data-action="select-pin" data-id="${esc(point.id)}" aria-label="${esc(t('point_explanation'))}${index + 1}">${index + 1}</button>`).join('')}</div>`;
    html += `<p class="note">${esc(t('tap_to_place_point'))}</p>`;
    if (pin) {
      const index = photo.pins.indexOf(pin) + 1;
      const isRecording = recording === pin.id;
      html += `<div class="card"><label for="pin-text-${esc(pin.id)}">${esc(t('point_explanation'))}${index}</label><input id="pin-text-${esc(pin.id)}" type="text" data-field="pin-text" data-photo-id="${esc(photo.id)}" data-pin-id="${esc(pin.id)}" value="${esc(pin.text)}" placeholder="${esc(t('point_placeholder'))}">${playerMedia(pin.audio, 'audio')}
        ${tool(isRecording ? t('stop_recording') : t('record_point'), 'record', `data-target="${esc(pin.id)}"`, 'rec', isRecording)}
        ${isRecording ? `<p class="recording">${esc(t('recording_status'))}<bdi id="record-clock">00:00</bdi></p>` : ''}
        ${pin.audio ? `<button class="remove" data-action="remove-pin-audio" data-id="${esc(pin.id)}" data-photo-id="${esc(photo.id)}" ${locked() ? 'disabled' : ''}>${esc(t('remove_point_audio'))}</button>` : ''}
        <button class="remove" data-action="remove-pin" data-id="${esc(pin.id)}" data-photo-id="${esc(photo.id)}" ${locked() ? 'disabled' : ''}>${esc(t('remove_point'))}</button></div>`;
    }
    return html;
  }
  function fileList(files, editable) {
    return files.map(file => `<div class="file"><span aria-hidden="true">📎</span><div class="file-info"><div class="file-name">${esc(file.name)}</div><span class="note"><bdi>${size(file.size)}</bdi></span>${editable ? `<button class="remove" data-action="remove-file" data-id="${esc(file.id)}" ${locked() ? 'disabled' : ''}>${esc(t('remove_file'))}</button>` : ''}</div><button class="open" data-action="open-file" data-id="${esc(file.id)}">${esc(t('open'))}</button></div>`).join('');
  }
  function pinView(photo) {
    if (!photo) return '';
    const points = photo.pins || [];
    const selected = points.find(pin => pin.id === viewedPin);
    return `<div class="pw">${playerMedia(photo, 'photo')}${points.map((pin, index) => `<button class="pin ${pin.id === viewedPin ? 'sel' : ''}" style="left:${Number(pin.x) || 0}%;top:${Number(pin.y) || 0}%" data-action="view-pin" data-id="${esc(pin.id)}" aria-label="${esc(t('point_explanation'))}${index + 1}">${index + 1}</button>`).join('')}</div>`
      + (selected ? `<div class="card"><div class="ptxt">${esc(selected.text)}</div>${playerMedia(selected.audio, 'audio')}</div>` : points.length ? `<p class="note">${esc(t('tap_numbers_to_view'))}</p>` : '');
  }
  function player(id, own) {
    const lesson = S.tuts.find(item => item.id === id);
    if (!lesson) return `<p class="empty">${esc(t('lesson_not_found'))}</p>`;

    let html = `<div style="display:flex; justify-content:space-between; align-items:center;">
      <button class="back" data-action="back" style="margin:0;">${esc(t('back'))}</button>
      <button class="btn ghost small" data-action="toggle-favorite" data-id="${esc(id)}" style="margin:0;">
        ${lesson.isFavorite ? '⭐ ' + esc(t('unfavorite')) : '☆ ' + esc(t('favorite'))}
      </button>
    </div>`;

    html += `<h2>${esc(lesson.title)}</h2>${badges(lesson)}`;

    if (own) {
      html += `<div style="margin-top:12px;"><label>${esc(t('categories'))}</label>
        <select data-action="assign-category" data-id="${esc(id)}">
          <option value="">--</option>
          ${(S.categories || []).map(c => `<option value="${esc(c.id)}" ${lesson.categoryId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
        </select></div><br>`;
    } else {
      html += `<br>`;
    }

    html += `
      ${lesson.videos && lesson.videos.length ? section(t('section_video'), lesson.videos.map(v => playerMedia(v, 'video') + mediaNameItem(v)).join('<br>'), true) : ''}
      ${lesson.photos && lesson.photos.length ? section(t('section_photo'), lesson.photos.map(p => pinView(p)).join('<br>'), true) : ''}
      ${lesson.audios && lesson.audios.length ? section(t('section_audio'), lesson.audios.map(a => playerMedia(a, 'audio') + mediaNameItem(a)).join('<br>'), true) : ''}
      ${lesson.steps.trim() ? section(t('section_steps'), `<div class="steps">${esc(lesson.steps)}</div>`, true) : ''}
      ${lesson.attachments.length ? section(t('section_files'), fileList(lesson.attachments, false), true) : ''}`;

    if (own) {
      html += `<button class="btn alt" data-action="share-manual">${esc(t('share'))}</button>`;
      html += `<button class="remove" data-action="delete-lesson" data-id="${esc(id)}">${esc(t('delete_lesson'))}</button>`;
    } else {
      html += `<br><button class="remove" data-action="leave-tutorial" data-id="${esc(id)}">${esc(t('leave_tutorial'))}</button>`;
    }
    return html;
  }
  function people() {
    return `<h2>${esc(t('tab_family'))}</h2><p class="note">${esc(t('add_who_you_help'))}</p>${S.contacts.map(person => `<div class="card"><b>${esc(person.name)}</b><div class="note">${S.tuts.filter(lesson => lesson.to.includes(person.id)).length}${esc(t('lessons_available'))}</div></div>`).join('')}
      <label for="new-person">${esc(t('family_member_name'))}</label><input id="new-person" type="text" maxlength="80" placeholder="${esc(t('family_member_placeholder'))}">${tool(t('add'), 'add-person', '', 'alt')}
      <br><br>
      <div class="card">
        <h3>${esc(t('share_manual'))}</h3>
        <p class="note">${esc(t('share_manual_note'))}</p>
        ${tool(t('share_manual'), 'share-manual', '', 'alt')}
      </div>
      <p class="notice">${esc(t('sharing_notice'))}</p>`;
  }

  function remindersUI() {
    return `<h2>${esc(t('reminders'))}</h2>
      ${S.reminders.map(rem => `<div class="card">
        <b>${esc(rem.name)}</b><br>
        <span class="note">${esc(rem.instructions)}</span><br>
        <span class="note">${esc(rem.time)}</span>
        <button class="remove" data-action="remove-reminder" data-id="${esc(rem.id)}">${esc(t('remove_file'))}</button>
      </div>`).join('')}
      <div class="card">
        <h3>${esc(t('add_reminder'))}</h3>
        <label>${esc(t('reminder_name'))}</label><input id="new-rem-name" type="text" placeholder="...">
        <label>${esc(t('reminder_instructions'))}</label><input id="new-rem-inst" type="text" placeholder="...">
        <label>Time</label><input id="new-rem-time" type="time">
        <label>Start Date</label><input id="new-rem-start" type="date">
        <label>End Date</label><input id="new-rem-end" type="date">
        <label>Snooze Config (mins)</label><input id="new-rem-snooze" type="number" value="15">
        ${tool(t('add'), 'add-reminder', '', 'alt')}
      </div>`;
  }
  function searchResults() {
    let list = S.tuts.filter(lesson => !lesson.groupId);
    if (showFavorites) {
      list = list.filter(l => l.isFavorite);
    } else if (categoryFilter) {
      list = list.filter(l => l.categoryId === categoryFilter);
    }
    if (query) {
      list = list.filter(l => l.title.includes(query) || l.steps.includes(query));
    }
    return list.length ? list.map(lesson => card(lesson, true)).join('') : `<div class="empty">${esc(t('no_matching_lessons'))}</div>`;
  }
  function openDraft() {
    if (!canNavigate()) return;
    if (!S.draft) { S.draft = M.emptyDraft(); persist(); }
    tab = 'new'; view = null; selectedPin = null; render();
  }
  function mediaRequest(kind, source, target = '') {
    if (locked() || !S.draft) return;
    if (kind === 'file' && S.draft.attachments.length >= MAX_ATTACHMENTS) { toast('max_files_limit'); return; }
    if (!persist()) return;
    busy = true; render();
    try { host.pickMedia(kind, source, target); }
    catch (error) { busy = false; render(); toast(error.message); }
  }
  function record(target) {
    if (recording !== null) {
      if (recording === target) {
        busy = true;
        try { host.stopAudio(); } catch (error) { busy = false; toast(error.message); }
      }
      return;
    }
    if (busy || waitingForRecord || !persist()) return;
    waitingForRecord = true; render();
    try { host.startAudio(target); }
    catch (error) { waitingForRecord = false; render(); toast(error.message); }
  }
  function updateRecordingClock() {
    const clock = $('#record-clock');
    if (clock) clock.textContent = String(Math.floor(recordSeconds / 60)).padStart(2, '0') + ':' + String(recordSeconds % 60).padStart(2, '0');
  }
  function removeAndSave(value) { M.mediaIds(value).forEach(id => cleanup.add(id)); persist(); render(); }

  $('#app').addEventListener('input', event => {
    const element = event.target;
    if (element.id === 'search') { query = element.value; $('#lesson-results').innerHTML = searchResults(); return; }
    const field = element.dataset.field;
    if (field === 'group-name' && groupDraft) { groupDraft.name = element.value; scheduleSave(); return; }
    if (field === 'group-desc' && groupDraft) { groupDraft.description = element.value; scheduleSave(); return; }
    if (!S.draft) return;
    if (field === 'title' || field === 'steps') S.draft[field] = element.value;
    else if (field === 'pin-text') {
      const photoId = element.dataset.photoId;
      const photo = S.draft.photos.find(p => p.id === photoId);
      if (photo) {
        const pin = photo.pins.find(point => point.id === element.dataset.pinId);
        if (pin) pin.text = element.value;
      }
    } else return;
    scheduleSave();
  });
  $('#app').addEventListener('change', event => {
    const element = event.target;
    if (element.id === 'who') { parentId = element.value; view = null; render(); }
    else if (element.dataset.action === 'change-lang') {
      setLanguage(element.value);
      render();
    }
    else if (element.dataset.person && S.draft) {
      S.draft.to = S.draft.to.filter(id => id !== element.dataset.person);
      if (element.checked) S.draft.to.push(element.dataset.person);
      persist();
    }
    else if (element.id === 'group-select' && S.draft) {
      S.draft.groupId = element.value || null;
      persist();
    }
    else if (element.dataset.action === 'assign-category') {
      const tut = S.tuts.find(t => t.id === element.dataset.id);
      if (tut) {
        const next = M.clone(S);
        next.tuts.find(t => t.id === element.dataset.id).categoryId = element.value || null;
        if (persist(next)) { S = next; render(); }
      }
    }
  });
  $('#app').addEventListener('click', event => {
    const element = event.target.closest('[data-action]');
    if (!element || element.disabled) return;
    const action = element.dataset.action, id = element.dataset.id, kind = element.dataset.kind;
    if (action === 'record') return record(element.dataset.target || '');
    if (action === 'open-file') {
      try { host.openAttachment(id); } catch (error) { toast(error.message); }
      return;
    }
    if (locked()) { toast('toast_finish_recording'); return; }
    switch (action) {
      case 'new-group':
        groupDraft = M.normalizeGroup({name: '', description: '', roles: {[parentId || S.contacts[0].id]: 'owner'}});
        render();
        break;
      case 'open-group':
        viewGroup = id;
        render();
        break;
      case 'back-group':
        viewGroup = null;
        render();
        break;
      case 'new-lesson-in-group':
        openDraft();
        if (S.draft) S.draft.groupId = id;
        break;
      case 'media-group-cover':
        if (locked() || !groupDraft) return;
        if (!persist()) return;
        busy = true; render();
        try { host.pickMedia('cover', element.dataset.source, 'groupCover'); }
        catch (error) { busy = false; render(); toast(error.message); }
        break;
      case 'remove-group-cover':
        if (groupDraft) { const old = groupDraft.cover; groupDraft.cover = null; removeAndSave(old); }
        break;
      case 'save-group':
        if (!groupDraft.name.trim()) { toast('error_empty_title'); break; }
        const nextState = M.clone(S);
        const savedGroup = M.clone(groupDraft);
        savedGroup.name = savedGroup.name.trim();
        const existingIdx = nextState.groups.findIndex(g => g.id === savedGroup.id);
        if (existingIdx >= 0) nextState.groups[existingIdx] = savedGroup;
        else nextState.groups.unshift(savedGroup);
        if (persist(nextState)) { S = nextState; groupDraft = null; viewGroup = savedGroup.id; render(); }
        break;
      case 'discard-group':
        if (!confirm(t('confirm_discard'))) break;
        if (groupDraft && groupDraft.cover) release(M.mediaIds(groupDraft.cover));
        groupDraft = null;
        render();
        break;
      case 'tab': if (canNavigate()) { tab = element.dataset.tab; view = null; viewGroup = null; query = ''; render(); } break;
      case 'set-category': {
        const cat = element.dataset.cat;
        if (cat === 'all') { categoryFilter = null; showFavorites = false; }
        else if (cat === 'fav') { categoryFilter = null; showFavorites = true; }
        else { categoryFilter = cat; showFavorites = false; }
        render();
        break;
      }
      case 'add-category': {
        const name = $('#new-cat-name').value.trim();
        if (!name) break;
        const next = M.clone(S);
        next.categories = next.categories || [];
        next.categories.push({id: M.uid(), name});
        if (persist(next)) { S = next; render(); }
        break;
      }
      case 'delete-category': {
        const catId = element.dataset.id;
        const next = M.clone(S);
        next.categories = (next.categories || []).filter(c => c.id !== catId);
        next.tuts.forEach(t => { if (t.categoryId === catId) t.categoryId = null; });
        if (persist(next)) { S = next; categoryFilter = null; render(); }
        break;
      }
      case 'toggle-favorite': {
        const tut = S.tuts.find(t => t.id === element.dataset.id);
        if (tut) {
          const next = M.clone(S);
          const ntut = next.tuts.find(t => t.id === element.dataset.id);
          ntut.isFavorite = !ntut.isFavorite;
          if (persist(next)) { S = next; render(); }
        }
        break;
      }
      case 'leave-tutorial': {
        if (!confirm(t('leave_confirm'))) break;
        if (native && native.leaveTutorial) {
          native.leaveTutorial(element.dataset.id);
        }

        // Remove locally from UI for immediate feedback
        const next = M.clone(S);
        next.tuts = next.tuts.filter(t => t.id !== element.dataset.id);
        if (persist(next)) { S = next; view = null; render(); }
        break;
      }
      case 'new': openDraft(); break;
      case 'media': mediaRequest(kind, element.dataset.source); break;
      case 'save': {
        const error = M.validate(S.draft);
        if (error) { toast(t(error)); break; }
        const next = M.commit(S);
        if (persist(next)) { S = next; tab = 'mine'; view = S.tuts[0].id; render(); window.scrollTo(0, 0); toast('toast_draft_saved'); }
        break;
      }
      case 'discard': {
        if (!confirm(t('confirm_discard'))) break;
        const old = S.draft, next = M.clone(S); next.draft = null;
        if (persist(next)) { S = next; release(M.mediaIds(old)); tab = 'mine'; render(); }
        break;
      }
      case 'remove-cover': {
        const old = S.draft.cover;
        S.draft.cover = null;
        removeAndSave(old);
        break;
      }
      case 'remove-media': {
        const idToRemove = element.dataset.id;
        const item = S.draft[kind + 's'].find(x => x.id === idToRemove);
        const old = {media:item, pins:kind === 'photo' && item ? item.pins : []};
        S.draft[kind + 's'] = S.draft[kind + 's'].filter(x => x.id !== idToRemove);
        if (kind === 'photo') { selectedPin = null; }
        removeAndSave(old); break;
      }
      case 'move-up': {
        const kindArr = S.draft[kind + 's'];
        const idx = kindArr.findIndex(x => x.id === id);
        if (idx > 0) {
          const temp = kindArr[idx - 1];
          kindArr[idx - 1] = kindArr[idx];
          kindArr[idx] = temp;
          persist(); render();
        }
        break;
      }
      case 'move-down': {
        const kindArr = S.draft[kind + 's'];
        const idx = kindArr.findIndex(x => x.id === id);
        if (idx >= 0 && idx < kindArr.length - 1) {
          const temp = kindArr[idx + 1];
          kindArr[idx + 1] = kindArr[idx];
          kindArr[idx] = temp;
          persist(); render();
        }
        break;
      }
      case 'remove-file': {
        const file = S.draft.attachments.find(item => item.id === id);
        S.draft.attachments = S.draft.attachments.filter(item => item.id !== id);
        removeAndSave(file); break;
      }
      case 'add-pin': {
        const photoId = element.dataset.photoId;
        const photo = S.draft.photos.find(p => p.id === photoId);
        if (!photo) break;
        const image = element.querySelector('img'), rect = image.getBoundingClientRect();
        if (!rect.width || !rect.height) break;
        // Adjust for RTL mirroring
        let xPos = (event.clientX - rect.left) / rect.width * 100;
        if (currentLang === 'ar') {
           // Do not mirror photos/videos or annotations in RTL
           // Wait, if the page is RTL, the image itself might be flipped? No, direction rtl doesn't flip images.
           // However, if the page is RTL, clientX might need calculation if image is inside RTL container.
           // Actually, rect.left and event.clientX are always absolute to viewport.
           // So (clientX - left) / width is always correct regardless of LTR/RTL,
           // UNLESS the image CSS is scaledX(-1). We are told not to mirror photos/videos or annotations.
        }
        const pin = {id:M.uid(), x:Math.max(0, Math.min(100, xPos)), y:Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100)), text:'', audio:null};
        photo.pins.push(pin); selectedPin = pin.id; persist(); render(); break;
      }
      case 'select-pin': selectedPin = id; render(); break;
      case 'remove-pin': {
        const photoId = element.dataset.photoId;
        const photo = S.draft.photos.find(p => p.id === photoId);
        if (photo) {
          const pin = photo.pins.find(point => point.id === id);
          photo.pins = photo.pins.filter(point => point.id !== id); selectedPin = null; removeAndSave(pin);
        }
        break;
      }
      case 'remove-pin-audio': {
        const photoId = element.dataset.photoId;
        const photo = S.draft.photos.find(p => p.id === photoId);
        if (photo) {
          const pin = photo.pins.find(point => point.id === id);
          if (pin) { const audio = pin.audio; pin.audio = null; removeAndSave(audio); }
        }
        break;
      }
      case 'view-pin': viewedPin = id; render(); break;
      case 'open': if (canNavigate()) { view = id; viewedPin = null; render(); window.scrollTo(0, 0); } break;
      case 'back': window.HelloDad.back(); break;
      case 'delete-lesson': {
        if (!confirm(t('confirm_delete'))) break;
        const old = S.tuts.find(item => item.id === id), next = M.clone(S);
        next.tuts = next.tuts.filter(item => item.id !== id);
        if (persist(next)) { S = next; release(M.mediaIds(old)); view = null; render(); }
        break;
      }
      case 'add-person': {
        const name = $('#new-person').value.trim();
        if (!name) { toast('type_name_first'); break; }
        const next = M.clone(S); next.contacts.push({id:M.uid(), name});
        if (persist(next)) { S = next; render(); }
        break;
      }
      case 'login-email': {
        const email = $('#login-email').value.trim();
        const pass = $('#login-pass').value.trim();
        if (email && pass) {
          try { host.loginWithEmail(email, pass); } catch(e) { toast('Error calling login'); }
        }
        break;
      }
      case 'login-google': {
        try { host.loginWithGoogle(); } catch(e) {}
        break;
      }
      case 'logout': {
        try { host.logout(); render(); } catch(e) {}
        break;
      }
      case 'share-manual': {
        const tutId = view || (S.tuts[0] && S.tuts[0].id) || "";
        if (native && native.shareManual) native.shareManual(tutId);
        break;
      }
      case 'add-reminder': {
        const name = $('#new-rem-name').value.trim();
        const inst = $('#new-rem-inst').value.trim();
        const time = $('#new-rem-time').value.trim();
        const start = $('#new-rem-start').value.trim();
        const end = $('#new-rem-end').value.trim();
        const snooze = $('#new-rem-snooze').value.trim();
        if (!name || !time) break;
        const next = M.clone(S);
        const rem = {id:M.uid(), name, instructions: inst, time, start, end, snooze};
        next.reminders.push(rem);
        if (persist(next)) {
          S = next;
          if (native && native.scheduleReminder) native.scheduleReminder(JSON.stringify(rem));
          render();
        }
        break;
      }
      case 'remove-reminder': {
        const next = M.clone(S);
        next.reminders = next.reminders.filter(r => r.id !== id);
        if (persist(next)) {
          S = next;
          if (native && native.cancelReminder) native.cancelReminder(id);
          render();
        }
        break;
      }
      case 'voice': {
        try {
          if (native) native.startNativeVoiceSearch(currentLang === 'ar' ? 'ar-SA' : 'en-US');
          else {
            const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!Recognition) throw new Error(t('voice_search_unavailable'));
            const request = new Recognition(); request.lang = currentLang === 'ar' ? 'ar-SA' : 'en-US'; request.onresult = result => window.HelloDad.onVoice({text:result.results[0][0].transcript}); request.start();
          }
        } catch (error) { toast(error.message); }
        break;
      }
    }
  });

  window.HelloDad = {
    flush: () => S ? persist() : false,
    back() {
      if (locked()) { toast('toast_finish_recording'); return true; }
      if (!persist()) return true;
      if (view) { view = null; render(); return true; }
      if (groupDraft) { groupDraft = null; render(); return true; }
      if (viewGroup) { viewGroup = null; render(); return true; }
      if (tab !== 'home') { tab = 'home'; render(); return true; }
      return false;
    },
    onMedia(result) {
      busy = false; waitingForRecord = false;
      let files = Array.isArray(result.files) ? result.files : [];
      if (result.target === 'groupCover') {
        if (groupDraft && files.length > 0) {
          const before = M.mediaIds(groupDraft.cover);
          groupDraft.cover = files[0];
          before.forEach(id => cleanup.add(id));
          persist();
          render();
          if (result.errors?.length) toast(result.errors.join(' — '));
          else toast('added_rest_saved');
        }
        return;
      }
      if (!S.draft) S.draft = M.emptyDraft();
      if (result.kind === 'file') {
        const allowed = Math.max(0, MAX_ATTACHMENTS - S.draft.attachments.length);
        if (files.length > allowed) {
          release(files.slice(allowed).map(file => file.id));
          files = files.slice(0, allowed);
          toast('files_added_up_to_limit');
        }
      }
      const before = M.mediaIds(S.draft);
      M.addMedia(S.draft, result.kind, files, result.target);
      const after = new Set(M.mediaIds(S.draft));
      before.filter(id => !after.has(id)).forEach(id => cleanup.add(id));
      files.filter(file => !after.has(file.id)).forEach(file => cleanup.add(file.id));
      if (result.kind === 'photo' && files.length) selectedPin = null;
      const saved = persist();
      render();
      if (result.errors?.length) toast(result.errors.join(' — '));
      else if (files.length && saved) toast('added_rest_saved');
    },
    onRecordState(result) {
      clearInterval(recordTimer);
      waitingForRecord = false;
      recording = result.recording ? result.target || '' : null;
      busy = !!result.processing;
      if (result.recording) {
        document.querySelectorAll('audio,video').forEach(media => media.pause());
        recordSeconds = 0;
        recordTimer = setInterval(() => { recordSeconds++; updateRecordingClock(); }, 1000);
      }
      render();
      if (result.error) toast(result.error);
    },
    onVoice(result) { query = result.text || ''; render(); },
    onInviteLink(result) {
      if (!result.url) return;
      const url = result.url;
      const tokenMatch = url.match(/\/invite\/(.*)/);
      if (tokenMatch && tokenMatch[1]) {
         const token = tokenMatch[1];
         if (confirm(t('Accept invitation link?'))) {
           if (native && native.acceptInvite) native.acceptInvite(token);
         }
      }
    },
    onAuthStateChanged(result) {
       render(); // re-render to update the settings UI
    },
    onStateSynced(result) {
       try {
           const raw = JSON.parse(host.loadState());
           if (raw && !raw.loadError) {
               S = M.normalizeState(raw);
               render();
           }
       } catch (e) {}
    }
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden && S) persist(); });
  window.addEventListener('pagehide', () => { if (S) persist(); });

  initLanguage();

  try {
    const raw = JSON.parse(host.loadState());
    if (raw.loadError) throw new Error(raw.loadError);
    S = M.normalizeState(raw);
    parentId = S.contacts[0].id;
    if (S.draft) tab = 'new';
    persist(); render(); host.pageReady();
  } catch (error) {
    S = null;
    $('#app').setAttribute('aria-busy', 'false');
    $('#app').innerHTML = `<h1>${esc(t('error_open_lessons'))}</h1><p>${esc(error.message)}</p><p class="note">${esc(t('data_not_replaced'))}</p>`;
  }
})();