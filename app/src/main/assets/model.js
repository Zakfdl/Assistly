/* Pure lesson rules shared by the Android UI and the regression tests. */
(function (root) {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  function emptyDraft() {
    return {id:uid(), title:'', steps:'', photos:[], audios:[], videos:[], attachments:[], to:[], cover: null, groupId: null, categoryId: null, isFavorite: false};
  }
  function normalizeGroup(item) {
    return {
      id: String(item.id || uid()),
      name: String(item.name || ''),
      description: String(item.description || ''),
      cover: item.cover || null,
      roles: item.roles && typeof item.roles === 'object' ? clone(item.roles) : {}
    };
  }
  function normalizeLesson(item) {
    const lesson = {...emptyDraft(), ...item};
    lesson.title = String(item.title || '');
    if (item.groupId !== undefined) lesson.groupId = item.groupId;
    lesson.steps = String(item.steps || '');
    lesson.to = Array.isArray(item.to) ? item.to : [];
    if (item.cover) lesson.cover = item.cover;
    lesson.categoryId = item.categoryId || null;
    lesson.isFavorite = Boolean(item.isFavorite);

    // Migrate legacy data
    if (item.video && lesson.videos.length === 0) {
      lesson.videos = typeof item.video === 'string' ? [{id: uid(), url: item.video}] : [item.video];
    }
    if (item.audio && lesson.audios.length === 0) {
      lesson.audios = typeof item.audio === 'string' ? [{id: uid(), url: item.audio}] : [item.audio];
    }

    if (!lesson.videos) lesson.videos = [];
    if (!lesson.audios) lesson.audios = [];
    if (!lesson.photos) lesson.photos = [];

    const legacyPins = (Array.isArray(item.pins) ? item.pins : []).map(pin => ({...pin, id:pin.id || uid(), text:String(pin.text || '')}));

    if (item.photo && lesson.photos.length === 0) {
      if (typeof item.photo === 'string') {
        lesson.photos = [{id: uid(), url: item.photo, pins: legacyPins}];
      } else {
        lesson.photos = [{...item.photo, pins: legacyPins}];
      }
    }
    delete lesson.photo;
    delete lesson.audio;
    delete lesson.video;
    delete lesson.pins;

    lesson.photos = (Array.isArray(lesson.photos) ? lesson.photos : []).map(p => ({...p, pins: (Array.isArray(p.pins) ? p.pins : []).map(pin => ({...pin, id:pin.id || uid(), text:String(pin.text || '')}))}));
    lesson.videos = Array.isArray(lesson.videos) ? lesson.videos : [];
    lesson.audios = Array.isArray(lesson.audios) ? lesson.audios : [];

    lesson.attachments = Array.isArray(item.attachments) ? item.attachments : [];
    return lesson;
  }
  function normalizeState(raw) {
    return {
      version:5,
      contacts:Array.isArray(raw.contacts) && raw.contacts.length ? raw.contacts : [{id:'c1',name:'Dad'},{id:'c2',name:'Mom'}],
      tuts:(Array.isArray(raw.tuts) ? raw.tuts : []).map(normalizeLesson),
      reminders:Array.isArray(raw.reminders) ? raw.reminders : [],
      groups:Array.isArray(raw.groups) ? raw.groups.map(normalizeGroup) : [],
      categories:Array.isArray(raw.categories) ? raw.categories : [],
      draft:raw.draft ? normalizeLesson(raw.draft) : null
    };
  }
  function hasContent(lesson) {
    return Boolean(lesson.videos.length || lesson.photos.length || lesson.audios.length || lesson.steps.trim() || lesson.attachments.length);
  }
  function validate(lesson) {
    if (!lesson.title.trim()) return 'error_empty_title';
    if (!hasContent(lesson)) return 'error_no_content';
    return '';
  }
  function commit(state) {
    const draft = state.draft;
    if (!draft) throw new Error('error_no_draft');
    const error = validate(draft);
    if (error) throw new Error(error);
    const next = clone(state);
    const lesson = clone(draft);
    lesson.title = lesson.title.trim();
    lesson.date = Date.now();
    next.tuts.unshift(lesson);
    next.draft = null;
    return next;
  }
  function mediaIds(value) {
    const ids = new Set();
    function visit(node) {
      if (!node || typeof node !== 'object') return;
      if (typeof node.id === 'string' && typeof node.mime === 'string') ids.add(node.id);
      Object.values(node).forEach(visit);
    }
    visit(value);
    return [...ids];
  }
  function addMedia(draft, kind, files, target) {
    if (kind === 'file') {
      draft.attachments.push(...files);
    } else if (kind === 'audio' && target) {
      let found = false;
      for (const photo of draft.photos) {
        const pin = photo.pins.find(pin => pin.id === target);
        if (pin && files[0]) {
          pin.audio = files[0];
          found = true;
          break;
        }
      }
      if (!found) {
        draft.audios.push(...files);
      }
    } else if (kind === 'photo') {
      draft.photos.push(...files.map(f => ({...f, pins: []})));
    } else if (kind === 'audio') {
      draft.audios.push(...files);
    } else if (kind === 'video') {
      draft.videos.push(...files);
    } else if (kind === 'cover' && files.length > 0) {
      draft.cover = files[0];
    }
    return draft;
  }
  const api = {clone,uid,emptyDraft,normalizeGroup,normalizeLesson,normalizeState,hasContent,validate,commit,mediaIds,addMedia};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LessonModel = api;
})(typeof window !== 'undefined' ? window : globalThis);
