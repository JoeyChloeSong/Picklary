
(() => {
  'use strict';
  const cfg = window.CLIP_LITE_CONFIG || {};
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const state = { file:null, url:'', inPoint:null, cuts:[], ffmpeg:null, fetchFile:null, toBlobURL:null, inputWritten:false, inputName:'' };
  const video = $('#video');
  const input = $('#videoInput');
  const workspace = $('#workspace');
  const videoShell = $('#videoShell');
  const exportBtn = $('#exportBtn');
  const cutsList = $('#cutsList');
  const timeline = $('#timeline');
  const cutHighlights = $('#cutHighlights');
  const currentTimeEl = $('#currentTime');
  const durationEl = $('#duration');
  const inInput = $('#inInput');
  const outInput = $('#outInput');
  const statusBox = $('#statusBox');
  const statusText = $('#statusText');
  const progressBar = $('#progressBar');
  const toast = $('#toast');
  const stepTwo = $('#stepTwo');

  let busy=false, cancelRequested=false, saving=false, started=0, heartbeat=null, previewEnd=null, lastLog='';
  function assertActive(){if(cancelRequested||!busy)throw new DOMException('Export cancelled','AbortError');}
  const local=(en,ko)=>cfg.lang==='ko'?ko:en;
  function t(key){ return (cfg.strings && cfg.strings[key]) || key; }
  function notify(msg){ toast.textContent=msg; toast.classList.add('show'); clearTimeout(notify.timer); notify.timer=setTimeout(()=>toast.classList.remove('show'),2200); }
  function fmt(sec){const n=Number.isFinite(sec)?Math.max(0,Math.round(sec*1000)):0,h=Math.floor(n/3600000),m=Math.floor((n%3600000)/60000),ss=Math.floor((n%60000)/1000),ms=n%1000;return (h?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(ss).padStart(2,'0')+'.'+String(ms).padStart(3,'0');}
  function parseTime(v){ v=String(v||'').trim(); if(!v) return NaN; if(/^\d+(\.\d+)?$/.test(v)) return Number(v); const parts=v.split(':').map(Number); if(parts.some(Number.isNaN)) return NaN; let out=0; for(const n of parts) out=out*60+n; return out; }
  function timeArg(sec){ return Math.max(0,sec).toFixed(3); }
  function ext(name){ const m=String(name).match(/\.([a-zA-Z0-9]{1,6})$/); return m?m[1].toLowerCase():'mp4'; }
  function safeBase(name){ return String(name||'video').replace(/\.[^.]+$/,'').replace(/[^a-zA-Z0-9_-]+/g,'_').slice(0,70)||'video'; }

  function setLoaded(on){ workspace.classList.toggle('loaded',on); videoShell.classList.toggle('has-video',on); stepTwo.classList.toggle('disabled',!on); renderCuts(); }
  function updateTimes(){ currentTimeEl.textContent=fmt(video.currentTime||0); durationEl.textContent=fmt(video.duration||0); if(Number.isFinite(video.duration)&&video.duration>0) timeline.value=(video.currentTime/video.duration)*1000; if(state.inPoint!=null)renderTimelineHighlights(); }
  function renderTimelineHighlights(){
    if(!cutHighlights)return;
    cutHighlights.innerHTML='';
    const duration=Number(video.duration);
    if(!state.file||!Number.isFinite(duration)||duration<=0)return;
    const addSegment=(start,end,draft=false,index=0)=>{
      const safeStart=Math.max(0,Math.min(duration,Number(start)));
      const safeEnd=Math.max(safeStart,Math.min(duration,Number(end)));
      if(!(safeEnd>safeStart))return;
      const segment=document.createElement('span');
      segment.className='timeline-cut-segment'+(draft?' is-draft':'');
      segment.style.left=((safeStart/duration)*100).toFixed(4)+'%';
      segment.style.width=(((safeEnd-safeStart)/duration)*100).toFixed(4)+'%';
      segment.title=(draft?'IN → current':'Cut '+(index+1))+': '+fmt(safeStart)+' → '+fmt(safeEnd);
      cutHighlights.appendChild(segment);
    };
    state.cuts.forEach((cut,index)=>addSegment(cut.start,cut.end,false,index));
    if(state.inPoint!=null){
      const current=Math.max(state.inPoint,Number(video.currentTime)||state.inPoint);
      addSegment(state.inPoint,current,true,state.cuts.length);
    }
  }
  function seek(delta){ if(!state.file)return; video.currentTime=Math.min(video.duration||Infinity,Math.max(0,(video.currentTime||0)+delta)); updateTimes(); }
  async function togglePlay(){ if(!state.file)return; previewEnd=null;try{if(video.paused) await video.play(); else video.pause();}catch(e){notify(e.message);} $('#playBtn').textContent=video.paused?'▶':'Ⅱ'; }
  function loadFile(file){
    if(busy){notify(local('Cancel export before changing the file.','\ucd94\ucd9c\uc744 \ucde8\uc18c\ud55c \ub4a4 \ud30c\uc77c\uc744 \ubcc0\uacbd\ud558\uc138\uc694.'));return;}
    if(state.ffmpeg){state.ffmpeg.terminate();state.ffmpeg=null;}
    previewEnd=null;
    if(!file || !(file.type.startsWith('video/') || /\.(mp4|mov|m4v|mkv|webm|avi)$/i.test(file.name))){ notify(t('invalidFile')); return; }
    if(state.url) URL.revokeObjectURL(state.url);
    state.file=file; state.url=URL.createObjectURL(file); state.inPoint=null; state.cuts=[]; state.inputWritten=false; state.inputName='input.'+ext(file.name);
    video.src=state.url; video.muted=false; video.volume=1; video.load();
    $('#fileName').textContent=file.name; setLoaded(false); setStatus(local('Reading local video metadata...','\ub85c\uceec \uc601\uc0c1 \uc815\ubcf4\ub97c \uc77d\ub294 \uc911...'),0);
  }
  input.addEventListener('change',()=>loadFile(input.files[0]));
  $('#chooseBtn').addEventListener('click',()=>input.click());
  $('#dropChoose').addEventListener('click',()=>input.click());
  ['dragenter','dragover'].forEach(ev=>videoShell.addEventListener(ev,e=>{e.preventDefault();videoShell.classList.add('drop-active')}));
  ['dragleave','drop'].forEach(ev=>videoShell.addEventListener(ev,e=>{e.preventDefault();videoShell.classList.remove('drop-active')}));
  videoShell.addEventListener('drop',e=>loadFile(e.dataTransfer.files[0]));
  video.addEventListener('loadedmetadata',()=>{setLoaded(true);statusBox.classList.remove('show');$('#playBtn').textContent='▶';notify(t('loaded'));timeline.value=0;updateTimes();inInput.value='0';outInput.value=Math.min(video.duration,10).toFixed(3);renderTimelineHighlights()});
  video.addEventListener('play',()=>{$('#playBtn').textContent='\u2161';$('#playBtn').setAttribute('aria-pressed','true');});
  video.addEventListener('pause',()=>{$('#playBtn').textContent='\u25b6';$('#playBtn').setAttribute('aria-pressed','false');});
  video.addEventListener('timeupdate',updateTimes); video.addEventListener('ended',()=>$('#playBtn').textContent='▶');
  timeline.addEventListener('input',()=>{if(video.duration)video.currentTime=(Number(timeline.value)/1000)*video.duration});
  $('#playBtn').addEventListener('click',togglePlay);
  $$('[data-seek]').forEach(b=>b.addEventListener('click',()=>seek(Number(b.dataset.seek))));
  $('#muteBtn').addEventListener('click',()=>{video.muted=!video.muted;$('#muteBtn').textContent=video.muted?'🔇':'🔊'});
  $('#volume').addEventListener('input',e=>{video.volume=Number(e.target.value);video.muted=video.volume===0});

  function markIn(){ if(busy||!state.file||!Number.isFinite(video.duration))return; state.inPoint=video.currentTime; inInput.value=state.inPoint.toFixed(3); renderTimelineHighlights(); notify(t('inMarked')+' '+fmt(state.inPoint)); }
  function addCut(start,end){
    if(!state.file||busy||!Number.isFinite(video.duration))return;
    start=Number(start);end=Number(end);
    if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start){notify(t('badRange'));return;}
    if(start<0||end>(video.duration||Infinity)){notify(t('outsideRange'));return;}
    state.cuts.push({start,end}); state.cuts.sort((a,b)=>a.start-b.start); state.inPoint=null; renderCuts(); notify(t('clipAdded'));
  }
  function markOut(){ if(busy)return;if(state.inPoint==null){notify(t('markInFirst'));return;} outInput.value=video.currentTime.toFixed(3); addCut(state.inPoint,video.currentTime); }
  $('#markIn').addEventListener('click',markIn); $('#markOut').addEventListener('click',markOut);
  $('#addDirect').addEventListener('click',()=>addCut(parseTime(inInput.value),parseTime(outInput.value)));
  function renderCuts(){
    cutsList.innerHTML='';
    if(!state.cuts.length){cutsList.innerHTML='<div class="empty-cuts">'+t('noCuts')+'</div>';}
    state.cuts.forEach((c,i)=>{
      const row=document.createElement('div');row.className='cut-row';row.innerHTML='<span class="cut-num">'+(i+1)+'</span><button class="control-btn cut-time" data-preview="'+i+'">'+fmt(c.start)+' → '+fmt(c.end)+'</button><span class="cut-duration">'+(c.end-c.start).toFixed(1)+'s</span><button class="icon-btn" aria-label="Delete" data-delete="'+i+'">×</button>';cutsList.appendChild(row);
    });
    $$('[data-delete]',cutsList).forEach(b=>b.addEventListener('click',()=>{if(!busy){state.cuts.splice(Number(b.dataset.delete),1);renderCuts();}}));
    $$('[data-preview]',cutsList).forEach(b=>b.addEventListener('click',async()=>{const c=state.cuts[Number(b.dataset.preview)];previewEnd=c.end;video.currentTime=c.start;try{await video.play();}catch(e){notify(e.message);}}));
    exportBtn.disabled=busy||!state.file||!Number.isFinite(video.duration)||!state.cuts.length; $('#cutCount').textContent=String(state.cuts.length); renderTimelineHighlights();
  }
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&busy){e.preventDefault();cancelExport();return;}
    if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName))return;
    if(e.code==='Space'){e.preventDefault();togglePlay();}
    else if(e.key.toLowerCase()==='i')markIn();
    else if(e.key.toLowerCase()==='o')markOut();
    else if(e.key==='ArrowLeft')seek(-3);
    else if(e.key==='ArrowRight')seek(3);
  });

  function setStatus(msg,pct){ statusBox.classList.add('show'); statusText.textContent=msg; if(Number.isFinite(pct))progressBar.style.width=Math.max(0,Math.min(100,pct))+'%'; }
  async function ensureFFmpeg(){
    if(state.ffmpeg)return state.ffmpeg;
    setStatus(t('loadingEngine'),3);
    const mod=await import('/assets/tools/ffmpeg-engine.js');
    assertActive();
    const ffmpeg=new mod.FFmpeg();state.ffmpeg=ffmpeg;
    ffmpeg.on('log',({message})=>{lastLog=String(message||'').slice(-140);});
    await ffmpeg.load({coreBase:cfg.coreBase});assertActive();
    state.fetchFile=mod.fetchFile;setStatus(t('engineReady'),8);return ffmpeg;
  }
  async function writeInput(){ if(state.inputWritten)return; const ff=await ensureFFmpeg(); setStatus(t('readingVideo'),8); const bytes=await state.fetchFile(state.file);assertActive();await ff.writeFile(state.inputName,bytes);assertActive();state.inputWritten=true; }
  async function fileBytes(name){ return await state.ffmpeg.readFile(name); }
  async function encodeClip(c,i){
    const out='clip_'+String(i+1).padStart(2,'0')+'.mp4'; const dur=c.end-c.start;
    setStatus(t('creatingClip')+' '+(i+1)+'/'+state.cuts.length,12+(i/state.cuts.length)*65);
    const common=['-ss',timeArg(c.start),'-i',state.inputName,'-t',timeArg(dur),'-map','0:v:0','-map','0:a:0?','-c:v','libx264','-preset','ultrafast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart','-y',out];
    let rc=await state.ffmpeg.exec(common);
    if(rc!==0){
      await state.ffmpeg.deleteFile(out).catch(()=>{});
      rc=await state.ffmpeg.exec(['-ss',timeArg(c.start),'-i',state.inputName,'-t',timeArg(dur),'-map','0:v:0','-map','0:a:0?','-c:v','mpeg4','-q:v','4','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart','-y',out]);
    }
    if(rc!==0)throw new Error(t('encodeFailed')+' '+(i+1));
    return out;
  }
  async function combineClips(names){
    const list=names.map(n=>"file '"+n+"'").join('\n'); await state.ffmpeg.writeFile('concat.txt',new TextEncoder().encode(list));
    let rc=await state.ffmpeg.exec(['-f','concat','-safe','0','-i','concat.txt','-c','copy','-movflags','+faststart','-y','combined.mp4']);
    if(rc!==0)throw new Error(t('combineFailed')); return 'combined.mp4';
  }
  async function zipFiles(entries){
    const {zipStore}=await import('/assets/tools/zip-store.js');return zipStore(entries);
  }
  function selectedMode(){ return ($('input[name="exportMode"]:checked')||{}).value||'combined'; }
  function mimeFor(name){return name.endsWith('.zip')?'application/zip':'video/mp4'}
  async function requestHandle(name){
    if(!window.showSaveFilePicker)return null;
    try{return await window.showSaveFilePicker({suggestedName:name,types:[{description:name.endsWith('.zip')?'ZIP archive':'MP4 video',accept:{[mimeFor(name)]:[name.endsWith('.zip')?'.zip':'.mp4']}}]});}
    catch(e){if(e.name==='AbortError')throw e;return null;}
  }
  async function saveBlob(blob,name,handle){
    if(handle){const w=await handle.createWritable();await w.write(blob);await w.close();return;}
    const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),10000);
  }
  async function cleanup(names){for(const n of names){try{await state.ffmpeg.deleteFile(n)}catch(e){}}}
  const cancelBtn=document.createElement('button');cancelBtn.id='cancelExport';cancelBtn.type='button';cancelBtn.className='control-btn';cancelBtn.textContent=local('Cancel export (Esc)','\ucd94\ucd9c \ucde8\uc18c (Esc)');cancelBtn.hidden=true;exportBtn.after(cancelBtn);
  const activity=document.createElement('p');activity.id='engineActivity';activity.className='engine-activity';activity.setAttribute('role','status');statusBox.append(activity);
  function setBusy(value){
    busy=value;cancelBtn.hidden=!value;cancelBtn.disabled=false;
    for(const q of ['#chooseBtn','#dropChoose','#videoInput','#addDirect','#markIn','#markOut','input[name="exportMode"]','[data-delete]'])$$(q).forEach(el=>el.disabled=value);
    renderCuts();
  }
  function cancelExport(){if(!busy||saving)return;cancelRequested=true;cancelBtn.disabled=true;state.ffmpeg?.terminate();state.ffmpeg=null;state.inputWritten=false;setStatus(local('Cancelling export...','\ucd94\ucd9c\uc744 \ucde8\uc18c\ud558\ub294 \uc911...'),0);}
  cancelBtn.addEventListener('click',cancelExport);
  video.addEventListener('timeupdate',()=>{if(previewEnd!=null&&video.currentTime>=previewEnd){video.pause();previewEnd=null;}});
  video.addEventListener('error',()=>{setLoaded(false);setStatus(local('This browser cannot decode the video. Try MP4/H.264/AAC; keep your original file.','\uc774 \ube0c\ub77c\uc6b0\uc800\ub85c \uc7ac\uc0dd\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4. MP4/H.264/AAC \ud615\uc2dd\uc744 \ud655\uc778\ud558\uc138\uc694.'),0);});
  const full=document.createElement('button');full.type='button';full.className='control-btn';full.id='fullScreen';full.textContent=local('Full screen','\uc804\uccb4 \ud654\uba74');$('#playBtn').parentElement.append(full);
  full.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await workspace.requestFullscreen();}catch(e){notify(e.message);}});
  const projectBtn=document.createElement('button');projectBtn.type='button';projectBtn.className='control-btn';projectBtn.id='exportCuts';projectBtn.textContent=local('Save cut list (JSON)','\uad6c\uac04 \ubaa9\ub85d \uc800\uc7a5 (JSON)');$('#cutsList').after(projectBtn);
  projectBtn.addEventListener('click',async()=>{if(!state.file)return;const data={schema:'picklary.cuts.v1',fileName:state.file.name,cuts:state.cuts};await saveBlob(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),'picklary-cuts.json');});
  exportBtn.addEventListener('click',async()=>{
    if(busy||!state.file||!state.cuts.length)return;
    if(state.file.size>750*1024*1024){notify(local('This browser export is limited to 750 MB input files. Use the desktop program for larger files.','\ube0c\ub77c\uc6b0\uc800 \ucd94\ucd9c\uc740 750MB \uc774\ud558 \ud30c\uc77c\uc744 \uc0ac\uc6a9\ud558\uc138\uc694.'));return;}
    const mode=selectedMode(),base=safeBase(state.file.name),name=mode==='combined'?base+'_combined.mp4':base+'_'+(mode==='separate'?'clips':'clips_and_combined')+'.zip';
    let handle=null;cancelRequested=false;saving=false;setBusy(true);
    try{handle=await requestHandle(name);assertActive();}catch(e){setBusy(false);setStatus(t('saveCancelled'),0);return;}
    started=Date.now();lastLog='';const created=state.cuts.map((_,i)=>'clip_'+String(i+1).padStart(2,'0')+'.mp4').concat(['combined.mp4','concat.txt']);
    heartbeat=setInterval(()=>{activity.textContent=local('Elapsed ','\uacbd\uacfc ')+Math.round((Date.now()-started)/1000)+'s'+(lastLog?' | '+lastLog:'');},1000);
    try{
      await writeInput();const names=[];
      for(let i=0;i<state.cuts.length;i++){assertActive();names.push(await encodeClip(state.cuts[i],i));}
      let blob;
      if(mode==='combined'){const combined=await combineClips(names);blob=new Blob([await fileBytes(combined)],{type:'video/mp4'});}
      else{const entries={};for(const n of names)entries[n]=await fileBytes(n);if(mode==='both'){const combined=await combineClips(names);entries[base+'_combined.mp4']=await fileBytes(combined);}blob=new Blob([await zipFiles(entries)],{type:'application/zip'});}
      assertActive();
      saving=true;cancelBtn.hidden=true;setStatus(t('saving'),96);await saveBlob(blob,name,handle);setStatus(t('done'),100);notify(t('done'));
    }catch(err){
      if(cancelRequested||err?.name==='AbortError'){setStatus(local('Export cancelled.','\ucd94\ucd9c\uc744 \ucde8\uc18c\ud588\uc2b5\ub2c8\ub2e4.'),0);}
      else{console.error(err);setStatus(local('Export failed. The source has not been uploaded or returned as a finished edit. ','\ucd94\ucd9c \uc2e4\ud328. \uc6d0\ubcf8\uc744 \uc644\ub8cc \uc601\uc0c1\ucc98\ub7fc \ubc18\ud658\ud558\uc9c0 \uc54a\uc558\uc2b5\ub2c8\ub2e4. ')+(err?.message||String(err)),0);}
    }finally{clearInterval(heartbeat);if(state.ffmpeg){await cleanup(created);state.ffmpeg.terminate();state.ffmpeg=null;}state.inputWritten=false;saving=false;setBusy(false);}
  });
  window.addEventListener('beforeunload',()=>{state.ffmpeg?.terminate();if(state.url)URL.revokeObjectURL(state.url);});

  renderCuts();
})();
