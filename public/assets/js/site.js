/* No trackers, API keys, external imports or network uploads. */
'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const lang=document.documentElement.lang==='ko'?'ko':'en';
 const t=(en,ko)=>lang==='ko'?ko:en;
 const $=(q,r=document)=>r.querySelector(q);
 const $$=(q,r=document)=>Array.from(r.querySelectorAll(q));
 const header=$('.site-header'),toggle=$('.menu-toggle');
 function closeMenu(){if(!toggle)return;toggle.setAttribute('aria-expanded','false');header.classList.remove('nav-open')}
 toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));header.classList.toggle('nav-open',!open)});
 $('#primary-nav')?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
 function imageFailed(img){const m=img.closest('.media');if(!m)return;m.classList.add('is-missing');const f=$('.media-fallback',m);if(f)f.hidden=false;}
 $$('img').forEach(img=>{img.addEventListener('error',()=>imageFailed(img));if(img.complete&&img.naturalWidth===0)imageFailed(img)});
 // An old editorial snapshot is never labeled live by the UI.
 $$('[data-as-of]').forEach(el=>{
  const days=Math.floor((Date.now()-Date.parse(el.dataset.asOf+'T00:00:00Z'))/86400000),note=$('[data-stale-warning]',el);
  if(days>14&&note){note.hidden=false;note.textContent=t('This saved edition is '+days+' days old. Open the listed source for later changes.','이 저장된 판은 '+days+'일 전 자료입니다. 이후 변경은 출처를 확인하세요.');}
 });
 const search=$('[data-product-search]'),brand=$('[data-brand-filter]'),cards=$$('[data-product]');
 function filterProducts(){
  const q=(search?.value||'').trim().toLocaleLowerCase(),b=brand?.value||'';let count=0;
  cards.forEach(c=>{const show=(!q||c.dataset.search.includes(q))&&(!b||c.dataset.brand===b);c.hidden=!show;if(show)count++});
  $$('[data-brand-group]').forEach(g=>g.hidden=!$('[data-product]:not([hidden])',g));
  const n=$('[data-product-count]');if(n)n.textContent=count;const e=$('[data-product-empty]');if(e)e.hidden=count!==0;
 }
 search?.addEventListener('input',filterProducts);brand?.addEventListener('change',filterProducts);
 $('[data-reset-filter]')?.addEventListener('click',()=>{search.value='';brand.value='';filterProducts();search.focus()});
 const compared=new Map(),panel=$('[data-compare-panel]'),content=$('[data-compare-content]');
 $$('[data-compare]').forEach(cb=>cb.addEventListener('change',()=>{
  if(cb.checked&&compared.size>=3){cb.checked=false;window.alert(t('Compare up to three products at a time.','한 번에 최대 3개 제품을 비교하세요.'));return;}
  if(cb.checked)compared.set(cb.dataset.compare,{name:cb.dataset.name,note:cb.dataset.note});else compared.delete(cb.dataset.compare);
  if(!panel||!content)return;panel.hidden=!compared.size;content.replaceChildren();
  compared.forEach((p,id)=>{const a=document.createElement('article'),h=document.createElement('h3'),body=document.createElement('p'),link=document.createElement('a');h.textContent=p.name;body.textContent=p.note;link.href='#'+id;link.textContent=t('Back to model','모델로 돌아가기');a.append(h,body,link);content.append(a)});
 }));
 const playerSearch=$('[data-player-search]');
 playerSearch?.addEventListener('input',()=>{const q=playerSearch.value.trim().toLocaleLowerCase();let n=0;$$('[data-player]').forEach(c=>{c.hidden=!c.dataset.player.includes(q);if(!c.hidden)n++});const e=$('[data-player-empty]');if(e)e.hidden=n!==0});
 const selfForm=$('#self-check');
 selfForm?.addEventListener('submit',e=>{
  e.preventDefault();if(!selfForm.reportValidity())return;
  const answers=$$('fieldset',selfForm).map(f=>({v:$('input:checked',f).value,guide:f.dataset.guide}));
  const observed=answers.filter(a=>a.v!=='na').sort((a,b)=>Number(a.v)-Number(b.v));
  const guide=observed.length?observed[0].guide:'match-review-worksheet';
  const out=$('#self-check-output');out.replaceChildren();out.hidden=false;
  const h=document.createElement('h2'),p=document.createElement('p'),a=document.createElement('a');
  h.textContent=t('Choose one condition to improve.','바꿔 볼 조건 한 가지를 정하세요.');
  p.textContent=observed.length?t('Your lowest self-reported area is a starting point, not a skill rating. Try the linked practice and review ten consecutive rallies next time.','자가 보고에서 가장 어려웠던 항목은 연습 시작점이지 실력 등급이 아닙니다. 연결된 연습을 해 보고 다음에 연속된 10개 랠리를 확인하세요.'):t('You have not observed these situations yet. Start by recording ten rallies and identify one repeatable condition.','아직 이 상황들을 관찰하지 못했습니다. 10개 랠리를 기록하고 반복되는 조건 하나를 찾아보세요.');
  a.href='/'+lang+'/learn/'+guide+'/';a.textContent=t('Open the starting guide →','시작 가이드 보기 →');out.append(h,p,a);out.setAttribute('tabindex','-1');out.focus();
 });
 // Local-video worksheet: note data only. Source video bytes never enter an export.
 const form=$('#review-form');if(!form)return;
 const video=$('#review-video'),file=$('#review-file'),list=$('#rally-list'),status=$('#notes-status'),videoMessage=$('#video-message');
 const key='picklary-review-v1';let rows=[],objectURL='';
 const phaseLabels={serve:t('Serve / return','서브·리턴'),third:t('Third shot','3구'),transition:t('Transition','전환'),kitchen:t('Kitchen','키친'),finish:t('Finish / defence','마무리·수비')};
 const say=msg=>{status.textContent=msg};
 function validRows(value){
  if(!Array.isArray(value)||value.length>200)throw Error('Invalid worksheet');
  return value.map(r=>{
   if(!r||!Number.isFinite(Number(r.time))||Number(r.time)<0||!Object.hasOwn(phaseLabels,r.phase)||typeof r.note!=='string'||typeof r.change!=='string')throw Error('Invalid row');
   return {time:Number(r.time),phase:r.phase,note:r.note.slice(0,600),change:r.change.slice(0,240)};
  });
 }
 function render(){
  list.replaceChildren();$('#rally-count').textContent=rows.length;
  if(!rows.length){const p=document.createElement('p');p.className='empty-note';p.textContent=t('Add a rally to start your worksheet.','랠리를 추가하면 분석 노트가 시작됩니다.');list.append(p);return;}
  rows.forEach((r,i)=>{
   const el=document.createElement('article');el.className='rally-row';
   const time=document.createElement('button');time.type='button';time.className='rally-time';time.textContent=r.time.toFixed(1)+'s';time.setAttribute('aria-label',t('Seek to ','재생 위치 ')+r.time.toFixed(1));time.addEventListener('click',()=>{if(video.src&&Number.isFinite(video.duration))video.currentTime=Math.min(video.duration,r.time)});
   const phase=document.createElement('span');phase.className='rally-phase';phase.textContent=String(i+1).padStart(2,'0')+' · '+phaseLabels[r.phase];
   const obs=document.createElement('div');obs.className='rally-observation';const oh=document.createElement('h3');oh.textContent=t('Observation','관찰');const op=document.createElement('p');op.textContent=r.note;obs.append(oh,op);
   const change=document.createElement('div');change.className='rally-change';const ch=document.createElement('h3');ch.textContent=t('Next test','다음 실험');const cp=document.createElement('p');cp.textContent=r.change;change.append(ch,cp);
   const del=document.createElement('button');del.type='button';del.className='rally-delete';del.textContent='×';del.setAttribute('aria-label',t('Remove rally ','랠리 삭제 ')+(i+1));del.addEventListener('click',()=>{rows.splice(i,1);render();say(t('Row removed. Save again to update the stored copy.','행을 삭제했습니다. 저장된 사본도 갱신하려면 다시 저장하세요.'))});
   el.append(time,phase,obs,change,del);list.append(el);
  });
 }
 file.addEventListener('change',()=>{
  const f=file.files?.[0];if(!f)return;
  if(!f.type.startsWith('video/')&&!/\.(mp4|mov|webm|m4v|mkv)$/i.test(f.name)){videoMessage.textContent=t('Please choose a video file.','영상 파일을 선택하세요.');return;}
  video.pause();video.removeAttribute('src');video.load();if(objectURL)URL.revokeObjectURL(objectURL);
  objectURL=URL.createObjectURL(f);video.src=objectURL;video.load();videoMessage.textContent=t('Loading locally. Nothing is uploaded.','로컬에서 불러오는 중입니다. 업로드하지 않습니다.');
 });
 video.addEventListener('loadedmetadata',()=>{videoMessage.textContent=t('Video ready · ','영상 준비 완료 · ')+Math.round(video.duration)+'s'});
 video.addEventListener('error',()=>videoMessage.textContent=t('This browser could not decode the file. Your video was not uploaded.','이 브라우저에서 파일을 재생하지 못했습니다. 영상은 업로드되지 않았습니다.'));
 $$('[data-video-seek]').forEach(b=>b.addEventListener('click',()=>{if(Number.isFinite(video.duration))video.currentTime=Math.max(0,Math.min(video.duration,video.currentTime+Number(b.dataset.videoSeek)))}));
 $('#capture-time').addEventListener('click',()=>{$('#review-time').value=(video.currentTime||0).toFixed(1);$('#review-note').focus()});
 form.addEventListener('submit',e=>{
  e.preventDefault();if(!form.reportValidity())return;
  if(rows.length>=200){say(t('Limit reached: export this worksheet before starting another.','기록 한도에 도달했습니다. 노트를 내보낸 뒤 새로 시작하세요.'));return;}
  const row={time:Number($('#review-time').value),phase:$('#review-phase').value,note:$('#review-note').value.trim(),change:$('#review-change').value.trim()};
  if(!row.note||!row.change){say(t('Enter an observation and a next test.','관찰과 다음 실험을 입력하세요.'));return;}
  rows.push(...validRows([row]));render();$('#review-note').value='';$('#review-change').value='';say(t('Rally added. Not saved until you choose Save here.','랠리를 추가했습니다. 저장 버튼을 누르기 전에는 저장되지 않습니다.'));
 });
 $('#save-notes').addEventListener('click',()=>{try{localStorage.setItem(key,JSON.stringify({version:1,rows}));say(t('Saved in this browser. The video is not included.','이 브라우저에 저장했습니다. 영상은 포함되지 않습니다.'));}catch{say(t('Browser storage is unavailable. Export the worksheet instead.','브라우저 저장 공간을 사용할 수 없습니다. 대신 노트를 내보내세요.'));}});
 $('#load-notes').addEventListener('click',()=>{try{const raw=localStorage.getItem(key);if(!raw){say(t('No saved worksheet in this browser.','이 브라우저에 저장된 노트가 없습니다.'));return;}const parsed=JSON.parse(raw);if(parsed.version!==1)throw Error('Version');const loaded=validRows(parsed.rows);if(rows.length&&!window.confirm(t('Replace the current unsaved list?','현재 목록을 저장된 내용으로 바꿀까요?')))return;rows=loaded;render();say(t('Saved notes loaded. Select the matching video yourself.','노트를 불러왔습니다. 해당 영상은 직접 선택하세요.'));}catch{say(t('Could not read the saved worksheet. No data was sent.','저장된 노트를 읽지 못했습니다. 데이터는 전송하지 않았습니다.'));}});
 $('#clear-notes').addEventListener('click',()=>{if(!window.confirm(t('Delete current and saved notes from this browser?','현재 노트와 이 브라우저에 저장된 노트를 모두 지울까요?')))return;rows=[];render();try{localStorage.removeItem(key);say(t('Current and saved notes deleted.','현재 노트와 저장된 노트를 삭제했습니다.'));}catch{say(t('Current notes cleared. Clear browser site data to remove inaccessible storage.','현재 노트를 지웠습니다. 저장 공간에 접근할 수 없어 저장된 내용은 브라우저 사이트 데이터에서 지워 주세요.'));}});
 function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000);}
 function csvCell(value){let s=String(value);if(/^[\s]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
 $('#export-csv').addEventListener('click',()=>{const data=[['seconds','phase','observation','next_test'],...rows.map(r=>[r.time,r.phase,r.note,r.change])].map(row=>row.map(csvCell).join(',')).join('\r\n');download(new Blob(['\uFEFF'+data],{type:'text/csv;charset=utf-8'}),'picklary-review.csv');say(t('CSV exported. No video bytes included.','CSV를 내보냈습니다. 영상 데이터는 포함하지 않습니다.'));});
 $('#export-json').addEventListener('click',()=>{download(new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),rows},null,2)],{type:'application/json'}),'picklary-review.json');say(t('JSON worksheet exported.','JSON 노트를 내보냈습니다.'));});
 window.addEventListener('beforeunload',()=>{if(objectURL)URL.revokeObjectURL(objectURL)});
 render();
});
