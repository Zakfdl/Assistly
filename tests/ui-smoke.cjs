/* Run with Node + Playwright. Android media callbacks are mocked; camera/mic hardware is not simulated. */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const {chromium} = require(require.resolve('playwright', {paths:[process.cwd(),process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || '']}));
const root = path.resolve(__dirname, '../app/src/main/assets');
const fixtures = path.join(__dirname, 'fixtures');
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const server = http.createServer((req,res) => {
  const file = path.resolve(root, '.' + (req.url === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) {res.writeHead(404);return res.end();}
  res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream'});
  res.end(fs.readFileSync(file));
});
(async () => {
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const browser = await chromium.launch({headless:true,executablePath:process.env.HELLODAD_BROWSER || undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
  try {
    const page = await browser.newPage({viewport:{width:412,height:915},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.route('https://appassets.androidplatform.net/media/**',route => {
      const id=route.request().url().split('/').pop();
      const [file,type]=id.startsWith('1111')?['video.mp4','video/mp4']:id.startsWith('2222')?['machine.png','image/png']:['audio.wav','audio/wav'];
      return route.fulfill({status:200,headers:{'Content-Type':type,'Access-Control-Allow-Origin':'*'},body:fs.readFileSync(path.join(fixtures,file))});
    });
    await page.addInitScript(() => {
      const ids={video:'11111111-1111-4111-8111-111111111111',photo:'22222222-2222-4222-8222-222222222222',audio:'33333333-3333-4333-8333-333333333333'};
      window.AndroidApp={
        loadState:()=>localStorage.getItem('__mockState') || '{}',
        saveState:json=>{if(window.failSave)return JSON.stringify({ok:false,error:'مساحة غير كافية'});localStorage.setItem('__mockState',json);return '{"ok":true}';},
        releaseMedia:()=>{},pageReady:()=>{},openAttachment:id=>{window.openedAttachment=id;},startNativeVoiceSearch:()=>{},
        pickMedia(kind,source,target){
          if(window.cancelNext){window.cancelNext=false;setTimeout(()=>HelloDad.onMedia({kind,target,files:[],cancelled:true}),5);return;}
          let files=kind==='file'?[{id:'55555555-5555-4555-8555-555555555555',name:'دليل "الغسالة" <script>.pdf',mime:'application/pdf',size:2048},{id:'66666666-6666-4666-8666-666666666666',name:'جدول.docx',mime:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',size:4096}]:[{id:ids[kind],name:'شرح.'+(kind==='video'?'mp4':kind==='photo'?'png':'wav'),mime:kind==='photo'?'image/png':kind==='video'?'video/mp4':'audio/wav',size:8192}];
          setTimeout(()=>HelloDad.onMedia({kind,target,files,errors:[]}),10);
        },
        startAudio(target){window.mockRecordTarget=target;setTimeout(()=>HelloDad.onRecordState({recording:true,target}),5);},
        stopAudio(){const target=window.mockRecordTarget;setTimeout(()=>{HelloDad.onRecordState({recording:false,target,processing:true});HelloDad.onMedia({kind:'audio',target,files:[{id:target?'44444444-4444-4444-8444-444444444444':ids.audio,name:'شرح.m4a',mime:'audio/wav',size:1234}],errors:[]});},10);}
      };
    });
    const origin='http://127.0.0.1:'+server.address().port;
    await page.goto(origin);
    await page.locator('[data-action="new"]').click();
    for(const id of ['video-section','photo-section','audio-section','steps-section','files-section']) assert.equal(await page.locator('#'+id).count(),1);
    await page.locator('#title').fill('كيف أشغّل الغسالة؟');
    await page.locator('#steps').fill('1. وصّل القابس.\n2. اختر البرنامج المناسب.');
    await page.locator('[data-kind="video"][data-source="pick"]').click();
    await page.locator('#video-section video').waitFor();
    await page.locator('[data-kind="photo"][data-source="pick"]').click();
    await page.locator('#pin-canvas img').waitFor();
    await page.waitForFunction(()=>document.querySelector('#pin-canvas img').naturalWidth>0);
    await page.locator('#pin-canvas img').click({position:{x:120,y:100}});
    await page.locator('#pin-text').fill('زر التشغيل');
    await page.locator('#photo-section [data-action="record"]').click();
    await page.getByText('⏹ إيقاف التسجيل',{exact:true}).click();
    await page.locator('#photo-section audio').waitFor();
    await page.locator('#audio-section [data-action="record"]').click();
    await page.getByText('⏹ إيقاف التسجيل',{exact:true}).click();
    await page.locator('#audio-section audio').waitFor();
    await page.locator('[data-kind="file"][data-source="pick"]').click();
    await page.locator('#files-section .file').first().waitFor();
    assert.equal(await page.locator('#files-section .file').count(),2);
    assert.equal(await page.locator('#files-section script').count(),0,'attachment names must be escaped');
    await page.evaluate(()=>{window.cancelNext=true;});
    await page.locator('[data-kind="video"][data-source="pick"]').click();
    await page.waitForFunction(()=>!document.querySelector('[data-action="save"]').disabled);
    assert.equal(await page.locator('#video-section video').count(),1,'cancel must retain previous video');
    await page.locator('[data-person="c1"]').check();
    await page.evaluate(()=>{window.failSave=true;});
    await page.locator('[data-action="save"]').click();
    assert.equal(await page.locator('#title').inputValue(),'كيف أشغّل الغسالة؟');
    assert.equal(await page.locator('#files-section .file').count(),2,'failed save keeps the full draft');
    await page.evaluate(()=>{window.failSave=false;HelloDad.flush();});
    await page.reload();
    assert.equal(await page.locator('#title').inputValue(),'كيف أشغّل الغسالة؟','draft survives process-like reload');
    assert.equal(await page.locator('#video-section video').count(),1);
    assert.equal(await page.locator('#audio-section audio').count(),1);
    assert.equal(await page.locator('#photo-section .pin').count(),1);
    assert.equal(await page.locator('#files-section .file').count(),2);
    if(process.env.HELLODAD_SCREENSHOTS){await page.screenshot({path:path.join(process.env.HELLODAD_SCREENSHOTS,'lesson-editor.png'),fullPage:true});}
    await page.locator('[data-action="save"]').click();
    assert.equal(await page.locator('video').count(),1);
    assert.equal(await page.locator('.steps').innerText(),'1. وصّل القابس.\n2. اختر البرنامج المناسب.');
    assert.equal(await page.locator('.file').count(),2);
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('__mockState')));
    assert.equal(saved.draft,null);assert.equal(saved.tuts.length,1);
    for(const key of ['video','photo','audio','steps'])assert.ok(saved.tuts[0][key]);
    assert.equal(saved.tuts[0].pins[0].text,'زر التشغيل');assert.ok(saved.tuts[0].pins[0].audio);
    await page.waitForFunction(()=>document.querySelector('video').readyState>=2);
    await page.locator('video').evaluate(video=>video.play());
    await page.waitForFunction(()=>document.querySelector('video').currentTime>0.1);
    await page.locator('.file .open').first().click();
    assert.equal(await page.evaluate(()=>window.openedAttachment),'55555555-5555-4555-8555-555555555555');
    await page.reload();
    await page.locator('[data-action="open"]').click();
    assert.equal(await page.locator('video').count(),1);
    assert.equal(await page.locator('.file').count(),2);
    await page.locator('[data-role="parent"]').click();
    await page.locator('[data-action="open"]').click();
    assert.equal(await page.locator('video').count(),1);
    assert.equal(await page.locator('.file').count(),2);
    assert.equal(await page.locator('[data-action="delete-lesson"]').count(),0);
    if(process.env.HELLODAD_SCREENSHOTS){await page.screenshot({path:path.join(process.env.HELLODAD_SCREENSHOTS,'lesson-player.png'),fullPage:true});}
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
    assert.deepEqual(errors,[]);
    console.log('PASS: all five sections; mixed lesson + pin audio; save failure; draft/reload; picker cancellation; video playback; attachments; parent view; no JS errors.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
