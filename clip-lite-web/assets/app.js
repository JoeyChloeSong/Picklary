
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

  function t(key){ return (cfg.strings && cfg.strings[key]) || key; }
  function notify(msg){ toast.textContent=msg; toast.classList.add('show'); clearTimeout(notify.timer); notify.timer=setTimeout(()=>toast.classList.remove('show'),2200); }
  function fmt(sec){ if(!Number.isFinite(sec)) return '00:00.000'; const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=Math.floor(sec%60),ms=Math.round((sec-Math.floor(sec))*1000); return (h?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(ms).padStart(3,'0'); }
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
  async function togglePlay(){ if(!state.file)return; if(video.paused) await video.play(); else video.pause(); $('#playBtn').textContent=video.paused?'▶':'Ⅱ'; }
  function loadFile(file){
    if(!file || !(file.type.startsWith('video/') || /\.(mp4|mov|m4v|mkv|webm|avi)$/i.test(file.name))){ notify(t('invalidFile')); return; }
    if(state.url) URL.revokeObjectURL(state.url);
    state.file=file; state.url=URL.createObjectURL(file); state.inPoint=null; state.cuts=[]; state.inputWritten=false; state.inputName='input.'+ext(file.name);
    video.src=state.url; video.muted=false; video.volume=1; video.load();
    $('#fileName').textContent=file.name; setLoaded(true); notify(t('loaded'));
  }
  input.addEventListener('change',()=>loadFile(input.files[0]));
  $('#chooseBtn').addEventListener('click',()=>input.click());
  $('#dropChoose').addEventListener('click',()=>input.click());
  ['dragenter','dragover'].forEach(ev=>videoShell.addEventListener(ev,e=>{e.preventDefault();videoShell.classList.add('drop-active')}));
  ['dragleave','drop'].forEach(ev=>videoShell.addEventListener(ev,e=>{e.preventDefault();videoShell.classList.remove('drop-active')}));
  videoShell.addEventListener('drop',e=>loadFile(e.dataTransfer.files[0]));
  video.addEventListener('loadedmetadata',()=>{timeline.value=0;updateTimes();inInput.value='0';outInput.value=Math.min(video.duration,10).toFixed(3);renderTimelineHighlights()});
  video.addEventListener('timeupdate',updateTimes); video.addEventListener('ended',()=>$('#playBtn').textContent='▶');
  timeline.addEventListener('input',()=>{if(video.duration)video.currentTime=(Number(timeline.value)/1000)*video.duration});
  $('#playBtn').addEventListener('click',togglePlay);
  $$('[data-seek]').forEach(b=>b.addEventListener('click',()=>seek(Number(b.dataset.seek))));
  $('#muteBtn').addEventListener('click',()=>{video.muted=!video.muted;$('#muteBtn').textContent=video.muted?'🔇':'🔊'});
  $('#volume').addEventListener('input',e=>{video.volume=Number(e.target.value);video.muted=video.volume===0});

  function markIn(){ if(!state.file)return; state.inPoint=video.currentTime; inInput.value=state.inPoint.toFixed(3); renderTimelineHighlights(); notify(t('inMarked')+' '+fmt(state.inPoint)); }
  function addCut(start,end){
    if(!state.file)return;
    start=Number(start);end=Number(end);
    if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start){notify(t('badRange'));return;}
    if(start<0||end>(video.duration||Infinity)){notify(t('outsideRange'));return;}
    state.cuts.push({start,end}); state.cuts.sort((a,b)=>a.start-b.start); state.inPoint=null; renderCuts(); notify(t('clipAdded'));
  }
  function markOut(){ if(state.inPoint==null){notify(t('markInFirst'));return;} outInput.value=video.currentTime.toFixed(3); addCut(state.inPoint,video.currentTime); }
  $('#markIn').addEventListener('click',markIn); $('#markOut').addEventListener('click',markOut);
  $('#addDirect').addEventListener('click',()=>addCut(parseTime(inInput.value),parseTime(outInput.value)));
  function renderCuts(){
    cutsList.innerHTML='';
    if(!state.cuts.length){cutsList.innerHTML='<div class="empty-cuts">'+t('noCuts')+'</div>';}
    state.cuts.forEach((c,i)=>{
      const row=document.createElement('div');row.className='cut-row';row.innerHTML='<span class="cut-num">'+(i+1)+'</span><button class="control-btn cut-time" data-preview="'+i+'">'+fmt(c.start)+' → '+fmt(c.end)+'</button><span class="cut-duration">'+(c.end-c.start).toFixed(1)+'s</span><button class="icon-btn" aria-label="Delete" data-delete="'+i+'">×</button>';cutsList.appendChild(row);
    });
    $$('[data-delete]',cutsList).forEach(b=>b.addEventListener('click',()=>{state.cuts.splice(Number(b.dataset.delete),1);renderCuts()}));
    $$('[data-preview]',cutsList).forEach(b=>b.addEventListener('click',async()=>{const c=state.cuts[Number(b.dataset.preview)];video.currentTime=c.start;await video.play();setTimeout(()=>{if(video.currentTime>=c.end-.1)video.pause()},Math.max(100,(c.end-c.start)*1000))}));
    exportBtn.disabled=!state.file||!state.cuts.length; $('#cutCount').textContent=String(state.cuts.length); renderTimelineHighlights();
  }
  document.addEventListener('keydown',e=>{
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
    const ffmpegMod=await import('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/index.js');
    const utilMod=await import('https://unpkg.com/@ffmpeg/util@0.12.1/dist/esm/index.js');
    const ffmpeg=new ffmpegMod.FFmpeg();
    ffmpeg.on('progress',({progress})=>setStatus(t('processing'),10+Math.round(progress*80)));
    ffmpeg.on('log',({message})=>{ if(cfg.debug) console.log(message); });
    const core='https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const worker='https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/worker.js';
    await ffmpeg.load({
      classWorkerURL:await utilMod.toBlobURL(worker,'text/javascript'),
      coreURL:await utilMod.toBlobURL(core+'/ffmpeg-core.js','text/javascript'),
      wasmURL:await utilMod.toBlobURL(core+'/ffmpeg-core.wasm','application/wasm')
    });
    state.ffmpeg=ffmpeg;state.fetchFile=utilMod.fetchFile;state.toBlobURL=utilMod.toBlobURL;setStatus(t('engineReady'),8);return ffmpeg;
  }
  async function writeInput(){ if(state.inputWritten)return; const ff=await ensureFFmpeg(); setStatus(t('readingVideo'),8); await ff.writeFile(state.inputName,await state.fetchFile(state.file)); state.inputWritten=true; }
  async function fileBytes(name){ return await state.ffmpeg.readFile(name); }
  async function encodeClip(c,i){
    const out='clip_'+String(i+1).padStart(2,'0')+'.mp4'; const dur=c.end-c.start;
    setStatus(t('creatingClip')+' '+(i+1)+'/'+state.cuts.length,12+(i/state.cuts.length)*65);
    const common=['-ss',timeArg(c.start),'-i',state.inputName,'-t',timeArg(dur),'-map','0:v:0','-map','0:a:0?','-c:v','libx264','-preset','ultrafast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart','-y',out];
    let rc=await state.ffmpeg.exec(common);
    if(rc!==0){
      await state.ffmpeg.deleteFile(out).catch(()=>{});
      rc=await state.ffmpeg.exec(['-ss',timeArg(c.start),'-i',state.inputName,'-t',timeArg(dur),'-map','0:v:0','-map','0:a:0?','-c:v','mpeg4','-q:v','4','-c:a','aac','-b:a','160k','-movflags','+faststart','-y',out]);
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
    const {zipSync}=await import('https://cdn.jsdelivr.net/npm/fflate@0.8.2/esm/browser.js'); return zipSync(entries,{level:0});
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
  exportBtn.addEventListener('click',async()=>{
    if(!state.file||!state.cuts.length)return;
    const mode=selectedMode(),base=safeBase(state.file.name),name=mode==='combined'?base+'_combined.mp4':base+'_'+(mode==='separate'?'clips':'clips_and_combined')+'.zip';
    let handle=null;
    try{handle=await requestHandle(name);}catch(e){if(e.name==='AbortError'){setStatus(t('saveCancelled'),0);return;}}
    exportBtn.disabled=true; const created=[];
    try{
      await writeInput(); const clipNames=[];
      for(let i=0;i<state.cuts.length;i++){const n=await encodeClip(state.cuts[i],i);clipNames.push(n);created.push(n)}
      let blob;
      if(mode==='combined'){
        const combined=await combineClips(clipNames);created.push(combined);blob=new Blob([await fileBytes(combined)],{type:'video/mp4'});
      }else{
        const entries={};for(const n of clipNames)entries[n]=await fileBytes(n);
        if(mode==='both'){const combined=await combineClips(clipNames);created.push(combined);entries[base+'_combined.mp4']=await fileBytes(combined)}
        blob=new Blob([await zipFiles(entries)],{type:'application/zip'});
      }
      setStatus(t('saving'),96);await saveBlob(blob,name,handle);setStatus(t('done'),100);notify(t('done'));
    }catch(err){console.error(err);setStatus(t('failed')+' '+(err&&err.message?err.message:String(err)),0);notify(t('failed'));}
    finally{await cleanup(created);exportBtn.disabled=false;}
  });
  renderCuts();
})();
