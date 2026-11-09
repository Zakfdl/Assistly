const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../app/src/main/assets/model.js');
const asset = (id, mime, name) => ({id, mime, name, size:1024});
const allChannels = () => ({...M.emptyDraft(), title:'تشغيل الغسالة', steps:'1. اضغط الزر\n2. اختر البرنامج',
  videos:[asset('video-id','video/mp4','شرح.mp4')], photos:[{...asset('photo-id','image/jpeg','صورة.jpg'), pins:[{id:'point-1',x:42,y:30,text:'زر التشغيل',audio:asset('point-audio','audio/mp4','شرح النقطة.m4a')}]}],
  audios:[asset('audio-id','audio/mp4','صوت.m4a')],
  attachments:[asset('pdf-id','application/pdf','دليل.pdf'),asset('xls-id','application/vnd.ms-excel','جدول.xls')],to:['c1']});

test('one saved lesson retains all five channels and annotated audio after reload', () => {
  const state = M.normalizeState({draft:allChannels()});
  const before = M.clone(state);
  const saved = M.commit(state);
  const reloaded = M.normalizeState(JSON.parse(JSON.stringify(saved)));
  const lesson = reloaded.tuts[0];
  assert.equal(lesson.videos[0].id,'video-id');
  assert.equal(lesson.photos[0].id,'photo-id');
  assert.equal(lesson.audios[0].id,'audio-id');
  assert.equal(lesson.steps,before.draft.steps);
  assert.equal(lesson.photos[0].pins[0].audio.id,'point-audio');
  assert.deepEqual(lesson.attachments,before.draft.attachments);
  assert.deepEqual(lesson.to,['c1']);
  assert.equal(reloaded.draft,null);
  assert.deepEqual(state,before,'creating a candidate save must not clear the live draft');
});

test('video-only and attachments-only lessons can be saved', () => {
  for (const [key,value] of [['videos',[asset('v','video/mp4','شرح.mp4')]],['attachments',[asset('p','application/pdf','دليل.pdf')]]]) {
    const state = M.normalizeState({draft:{...M.emptyDraft(),title:'درس',[key]:value}});
    assert.equal(M.validate(state.draft),'');
    assert.equal(M.commit(state).tuts.length,1);
  }
});

test('adding a modality never replaces the other four', () => {
  const draft = allChannels();
  const photos = M.clone(draft.photos), audios = M.clone(draft.audios), attachments = M.clone(draft.attachments);
  M.addMedia(draft,'video',[asset('video2','video/mp4','ثان.mp4')]);
  assert.deepEqual(draft.photos,photos); assert.deepEqual(draft.audios,audios);
  assert.deepEqual(draft.attachments,attachments); assert.ok(draft.steps);
  M.addMedia(draft,'file',[asset('doc-id','application/msword','ملف.doc')]);
  assert.equal(draft.attachments.length,3); assert.equal(draft.videos[1].id,'video2');
  assert.equal(draft.photos[0].pins.length,1);
});

test('adding an image appends it and keeps the other channels', () => {
  const draft = allChannels();
  M.addMedia(draft,'photo',[asset('photo2','image/png','جديد.png')]);
  assert.equal(draft.photos.length,2); assert.deepEqual(draft.photos[1].pins,[]);
  assert.equal(draft.videos[0].id,'video-id');
  assert.equal(draft.audios[0].id,'audio-id'); assert.equal(draft.attachments.length,2);
});

test('a cancelled picker leaves all existing media intact', () => {
  const draft = allChannels(), before = M.clone(draft);
  for (const kind of ['video','photo','audio','file']) M.addMedia(draft,kind,[]);
  assert.deepEqual(draft,before);
});

test('point audio uses a stable point identifier and does not replace lesson audio', () => {
  const draft = allChannels();
  M.addMedia(draft,'audio',[asset('new-point-audio','audio/mp4','نقطة.m4a')],'point-1');
  assert.equal(draft.photos[0].pins[0].audio.id,'new-point-audio'); assert.equal(draft.audios[0].id,'audio-id');
  M.addMedia(draft,'audio',[asset('stale-point','audio/mp4','قديم.m4a')],'deleted-point');
  assert.equal(draft.audios.length,2);
  assert.equal(draft.audios[1].id,'stale-point');
});

test('legacy image/audio data and lesson recipients survive schema migration', () => {
  const legacy = {contacts:[{id:'c1',name:'أبي'}],tuts:[{id:'t1',title:'قديم',steps:'شرح',photo:'data:image/jpeg;base64,AAAA',audio:'data:audio/webm;base64,BBBB',to:['c1'],pins:[{x:10,y:20,text:'زر',audio:''}]}]};
  const migrated = M.normalizeState(legacy);
  assert.equal(migrated.tuts[0].photos[0].url, legacy.tuts[0].photo);
  assert.equal(migrated.tuts[0].audios[0].url,legacy.tuts[0].audio);
  assert.equal(migrated.tuts[0].photos[0].pins[0].text,'زر');
  assert.equal(migrated.tuts[0].attachments.length,0);
  assert.equal(migrated.tuts[0].videos.length,0);
  assert.ok(migrated.tuts[0].photos[0].pins[0].id);
});

test('blank titles and blank lessons are rejected', () => {
  const draft = M.emptyDraft();
  assert.ok(M.validate(draft)); draft.title = 'عنوان'; assert.ok(M.validate(draft));
  draft.steps = '   '; assert.equal(M.hasContent(draft),false);
});

test('cleanup collects every media reference without lesson and contact identifiers', () => {
  assert.deepEqual(M.mediaIds(allChannels()).sort(),['video-id','photo-id','audio-id','point-audio','pdf-id','xls-id'].sort());
});
