import {imageNavigation} from './image-navigation.mjs';

/** Visual navigation components. No ratings, scores or photos are invented here.
 *  Decorative court/workflow drawings are illustrative UI, not analysis outputs.
 *  All event names/scores come from data/results.json. All photos use media registry.
 */
export function createVisualUX(C) {
 const {T,esc,text,url,photo,ref,players,products,events,guides,site,catLabels,divLabels}=C;
 const iconPaths={
  home:'<path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7"/>',
  court:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M4 9h16M4 15h16M12 2v7m0 6v7M2 12h20"/>',
  video:'<rect x="2" y="5" width="14" height="14" rx="3"/><path d="m16 10 6-3v10l-6-3"/>',
  clip:'<circle cx="5" cy="6" r="3"/><circle cx="5" cy="18" r="3"/><path d="m8 8 13 13M8 16 21 3M10 12l2 2"/>',
  trophy:'<path d="M7 3h10v7a5 5 0 0 1-10 0V3ZM7 5H3v4a4 4 0 0 0 4 4M17 5h4v4a4 4 0 0 1-4 4M12 15v5m-5 2h10"/>',
  paddle:'<path d="M6 3c3-3 9-1 12 2s4 7 1 10-8 3-11 0S3 6 6 3Zm2 12-5 6m4-5-3-3"/>',
  learn:'<path d="M12 6c-3-3-7-3-10-2v16c3-1 7-1 10 2m0-16c3-3 7-3 10-2v16c-3-1-7-1-10 2V6"/>',
  ball:'<circle cx="12" cy="12" r="10"/><circle cx="8" cy="8" r="1"/><circle cx="16" cy="9" r="1"/><circle cx="12" cy="16" r="1"/>',
  shoes:'<path d="m3 11 5-2 3-6 4 6 6 5v6H2v-7l1-2ZM3 16h18M11 10l3 2m-5 1 3 2"/>',
  apparel:'<path d="m8 3 4 2 4-2 6 4-4 5-2-1v11H8V11l-2 1-4-5 6-4Z"/>',
  bag:'<rect x="4" y="7" width="16" height="15" rx="3"/><path d="M8 7V5a4 4 0 0 1 8 0v2M8 14h8"/>',
  arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
  check:'<path d="m5 12 4 4L20 5"/>',
  download:'<path d="M12 2v13m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  calendar:'<rect x="3" y="5" width="18" height="17" rx="3"/><path d="M7 2v6m10-6V2M3 11h18m-13 5h1m6 0h1"/>',
  rank:'<path d="M3 21V11h6v10M9 21V3h6v18m0 0V8h6v13"/>',
  user:'<circle cx="12" cy="7" r="4"/><path d="M3 22v-2a9 9 0 0 1 18 0v2"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 7 7"/>',
  scan:'<path d="M8 2H2v6m14-6h6v6M2 16v6h6m14-6v6h-6M2 12h20"/><circle cx="12" cy="8" r="2"/><path d="M8 18v-2a4 4 0 0 1 8 0v2"/>',
 };
 function icon(key,cls=''){return `<svg class="ux-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${iconPaths[key]||iconPaths.court}</svg>`;}
 const iconsForRel=rel=>/^gear\/paddles/.test(rel)?'paddle':/^gear\/balls/.test(rel)?'ball':/^gear\/shoes/.test(rel)?'shoes':/^gear\/apparel/.test(rel)?'apparel':/^gear\/accessories/.test(rel)?'bag':/^gear/.test(rel)?'paddle':/^tour\/rankings/.test(rel)?'rank':/^tour\/players/.test(rel)?'user':/^tour\/schedule/.test(rel)?'calendar':/^tour/.test(rel)?'trophy':/^dupr|^level/.test(rel)?'court':/^vision/.test(rel)?'scan':/^clip/.test(rel)?'clip':/^download/.test(rel)?'download':/^video|^tools/.test(rel)?'video':/^learn/.test(rel)?'learn':'home';
 function diagram(kind='court',idx=0){
  const paths=['M123 146 Q205 22 281 128','M138 166 Q183 111 223 118','M112 160 Q231 195 278 91','M171 170 Q165 30 272 76','M124 158 Q203 56 276 138','M135 162 Q216 -2 274 65'];
  const court=`<path d="M133 26h148l47 160H82z" fill="#164e59" stroke="#b4ecdd" stroke-width="2"/><path d="M119 72h176l17 56H102z" fill="#48a799" fill-opacity=".35"/><path d="M110 102h194M207 26v46m0 56v58" stroke="#e7fff5" stroke-width="2"/><path d="M101 103h210" stroke="#122c35" stroke-width="7"/><path d="M101 101h210" stroke="#def2e9" stroke-width="2"/><circle cx="138" cy="150" r="9" fill="#9bffe1" stroke="#103039" stroke-width="3"/><circle cx="251" cy="149" r="9" fill="#9bffe1" stroke="#103039" stroke-width="3"/><circle cx="171" cy="71" r="8" fill="#ffc578" stroke="#103039" stroke-width="3"/><circle cx="247" cy="65" r="8" fill="#ffc578" stroke="#103039" stroke-width="3"/>`;
  if(kind==='clip'||kind==='download'||kind==='video'||kind==='notes')return `<div class="ux-art art-${kind}" aria-hidden="true"><svg viewBox="0 0 420 230" focusable="false"><rect x="25" y="16" width="370" height="198" rx="12" fill="#122c3b" stroke="#6c99aa" stroke-opacity=".5"/><circle cx="41" cy="29" r="3" fill="#7af1cd"/><circle cx="52" cy="29" r="3" fill="#496570"/><circle cx="63" cy="29" r="3" fill="#496570"/><rect x="40" y="43" width="244" height="101" rx="4" fill="#236478"/><path d="M110 51h101l40 86H81zM98 99h136M160 51v26m0 25v36" fill="none" stroke="#acf0df" stroke-width="1.6"/><circle cx="129" cy="111" r="6" fill="#abffe5"/><circle cx="198" cy="76" r="5" fill="#ffc578"/><path d="m151 78 20 12-20 12Z" fill="white" opacity=".9"/><rect x="298" y="43" width="83" height="48" rx="5" fill="#1f3f50"/><rect x="308" y="54" width="50" height="5" rx="2" fill="#a5beca"/><rect x="308" y="67" width="40" height="4" rx="2" fill="#587b8e"/><rect x="298" y="100" width="83" height="44" rx="5" fill="#296655"/><path d="m329 122 6 6 13-15" fill="none" stroke="#acffdf" stroke-width="3"/><rect x="40" y="156" width="341" height="11" rx="3" fill="#294b60"/><rect x="49" y="158" width="65" height="7" rx="2" fill="#80e0bd"/><rect x="142" y="158" width="91" height="7" rx="2" fill="#8ac4e4"/><rect x="264" y="158" width="75" height="7" rx="2" fill="#c1b4ef"/><rect x="40" y="178" width="90" height="21" rx="4" fill="#386378"/><rect x="141" y="178" width="90" height="21" rx="4" fill="#386378"/><rect x="291" y="178" width="90" height="21" rx="4" fill="#80e0bd"/><path d="M177 151v22" stroke="#fff" stroke-width="2"/></svg></div>`;
  return `<div class="ux-art art-${kind}" aria-hidden="true"><svg viewBox="0 0 420 230" focusable="false"><ellipse cx="208" cy="197" rx="129" ry="13" fill="#061c25" opacity=".18"/><g>${court}<path d="${paths[idx%paths.length]}" fill="none" stroke="#d0ff62" stroke-width="3" stroke-dasharray="${kind==='vision'?'4 5':'0'}"/><circle cx="${kind==='vision'?222:idx%2?223:281}" cy="${kind==='vision'?117:idx%2?118:128}" r="5" fill="#deff77" stroke="#334929" stroke-width="1.5"/></g>${kind==='vision'?'<path d="M128 134v-8h22m-22 40v8h22m91-42v-8h22m0 40v8h-22M91 115h227" fill="none" stroke="#a7ddff" stroke-width="2"/><rect x="22" y="22" width="69" height="26" rx="5" fill="#c4d7ff" fill-opacity=".18"/><circle cx="38" cy="35" r="4" fill="#bedaff"/><path d="M49 35h26" stroke="#bedaff" stroke-width="2"/>':'<circle cx="45" cy="42" r="19" fill="#99f0d0" fill-opacity=".12"/><path d="m37 42 6 6 12-13" fill="none" stroke="#a3ffe0" stroke-width="2.5"/>'}</svg></div>`;
 }
 const I=imageNavigation({...C,icon});
 function gearArt(l){return I.gearArt(l);}
 function art(l,p,n=0){return I.art(l,p);}
 function featureCard(l,p,title,description,state='',n=0){return I.feature(l,p,title,description,state);}
 function toolCard(l,n,p,title,body,state){
  // Older long descriptions remain on the actual tool pages; the hub stays scannable.
  const copy={
   'dupr-self-check/':T(l,'Choose the shot, power and target on a 3D/2D court.','3D/2D 코트에서 샷·강도·방향을 선택하세요.'),
   'vision-rating/':T(l,'Review your match with the separately installed local analyzer.','별도 설치한 로컬 분석기로 내 경기를 확인하세요.'),
   'clip-lite/':T(l,'Mark the rallies you want to keep. Prepare an MP4 or ZIP export.','남길 랠리만 선택하고 MP4·ZIP 추출을 준비하세요.'),
   'downloads/':T(l,'Check the available web bundle and desktop package status.','웹 편집기 묶음과 데스크톱 파일 제공 여부를 확인하세요.'),
   'tools/review/':T(l,'Log timestamps and one change for your next practice.','영상의 시점과 다음 연습에서 바꿀 한 가지를 기록하세요.')
  };
  return featureCard(l,p,title,copy[p]||body,state,Number(n)||0);
 }
 function quickGrid(l){return I.quickGrid(l);}
 function hero(l){return I.hero(l);}
 function navIcon(l,rel){return icon(iconsForRel(rel))}
 function bottomNav(l,rel){
  return `<nav class="ux-mobile-dock" aria-label="${T(l,'Quick access','빠른 이동')}">${[
   ['','home','Home','홈'],['dupr-self-check/','court','Self-check','자가진단'],['clip-lite/','clip','Clip Lite','편집'],['gear/','paddle','Gear','장비'],['tour/','trophy','Tour','투어']
  ].map(([p,k,en,ko])=>`<a href="${url(l,p)}" ${(p===''?rel==='':rel.startsWith(p))?'aria-current="page"':''}>${icon(k)}<span>${T(l,en,ko)}</span></a>`).join('')}</nav>`;
 }
 function findPlayer(name){
  const key=s=>s.toLowerCase().replace(/[^a-z]/g,'').replace(/^gabe/,'gabriel');
  return players.find(p=>key(p.name)===key(name));
 }
 function avatar(l,name,cls=''){
  const p=findPlayer(name);
  if(p)return photo(l,p.media,'ux-avatar '+cls,false,false);
  return `<span class="ux-avatar ux-initials ${cls}" aria-label="${esc(name)}">${esc(name.split(/\s+/).slice(0,2).map(s=>s[0]).join(''))}</span>`;
 }
 function people(l,names,cls=''){return `<div class="ux-people ${cls}">${names.map(n=>avatar(l,n)).join('')}</div>`}
 function miniResult(l,r){
  if(!r.winner.length)return `<div class="ux-final-empty">${icon('clock')}<strong>${T(l,'Result not yet verified','아직 결과를 확인하지 못했습니다.')}</strong><p>${T(l,'No champion or score is inferred.','우승자나 스코어를 추정하지 않습니다.')}</p></div>`;
  const gw=r.games.filter(g=>g[0]>g[1]).length,gl=r.games.length-gw;
  const score=r.series?.join('–')||(r.games.length?`${gw}–${gl}`:'—');
  return `<div class="ux-final-score"><div class="ux-final-people">${people(l,r.winner)}<div><span class="ux-result-label">${icon('trophy')}${T(l,'CHAMPION','우승')}</span><strong>${r.winner.map(esc).join(' / ')}</strong></div></div><span class="ux-match-score">${score}<small>${r.series?T(l,'series','시리즈'):T(l,'games','게임')}</small></span></div><div class="ux-runner"><span>${T(l,'Runner-up','준우승')}</span><strong>${r.runnerUp.map(esc).join(' / ')}</strong></div><div class="ux-score-chips">${r.games.length?r.games.map((g,i)=>`<span><small>G${i+1}</small><b>${g.join('–')}</b></span>`).join(''):`<p>${r.series?T(l,'Match/game points not entered.','개별 매치·게임 점수 미입력'):T(l,'Game points not verified.','게임별 점수 미확인')}</p>`}</div>`;
 }
 function eventCard(l,e){
  let primary=e.rows.findIndex(r=>r.division==='XD' && r.games.length && r.winner.every(n=>findPlayer(n)));
  if(primary<0)primary=e.rows.findIndex(r=>r.games.length||r.series);
  primary=Math.max(0,primary);
  const id='card-'+e.slug;
  const state=e.status==='complete'?T(l,'5 finals verified','5개 결승 확인'):e.status==='complete-series'?T(l,'Series confirmed','시리즈 확인'):e.status==='partial-scores'?T(l,'Champions confirmed · partial scores','우승 확인 · 일부 점수 미확인'):T(l,'Partial results','일부 결과 확인');
  return `<article class="event-card ux-event" data-result-card><header class="ux-event-head"><div class="card-top"><span class="pill">${esc(e.tour)}</span><time class="small">${e.end.replaceAll('-','.')}</time></div><h3><a href="${url(l,'tour/results/'+e.slug+'/')}">${esc(text(l,e.title))}</a></h3><p>${esc(text(l,e.place))}</p><span class="ux-event-state${e.status.startsWith('partial')?' is-partial':''}">${esc(state)}</span></header><div class="ux-division-tabs" role="tablist" aria-label="${esc(text(l,e.title))} ${T(l,'divisions','종목')}">${e.rows.map((r,i)=>`<button type="button" role="tab" id="${id}-tab-${i}" data-result-tab="${i}" aria-controls="${id}-panel-${i}" aria-selected="${i===primary}" tabindex="${i===primary?0:-1}">${esc(text(l,divLabels[r.division]))}${!r.winner.length?'<span aria-hidden="true"> ·</span>':''}</button>`).join('')}</div><div class="ux-final-panels">${e.rows.map((r,i)=>`<div id="${id}-panel-${i}" class="ux-final-panel" role="tabpanel" aria-labelledby="${id}-tab-${i}" data-result-panel="${i}" ${i===primary?'':'hidden'}>${miniResult(l,r)}</div>`).join('')}</div><footer><span>${icon('clock')}${T(l,'Checked','확인')} ${e.checked.replaceAll('-','.')}</span><a class="ux-go" href="${url(l,'tour/results/'+e.slug+'/')}">${T(l,'All results','전체 결과')}${icon('arrow')}</a></footer></article>`;
 }
 function guideCard(l,g,i=0){return I.guideCard(l,g);}
 function categoryStrip(l,active=''){return I.categoryStrip(l,active);}
 function brandChips(l,list){
  const brands=[...new Set(list.map(p=>p.brand))];
  return `<div class="ux-brand-chips" role="group" aria-label="${T(l,'Choose brand','브랜드 선택')}"><button type="button" data-brand-chip="" aria-pressed="true">${T(l,'All brands','전체')} <small>${list.length}</small></button>${brands.map(b=>`<button type="button" data-brand-chip="${esc(b)}" aria-pressed="false">${esc(b)} <small>${list.filter(p=>p.brand===b).length}</small></button>`).join('')}</div>`;
 }
 function introArt(l,kicker){return I.introArt(l,kicker);}
 function homeBody(l,sectionHead,button){
  const featured=['franklin-c45','six-zero-dbd','wilson-pickle-pro','franklin-x40'].map(id=>products.find(x=>x.id===id));
  return hero(l)+quickGrid(l)+`<section class="section ux-results-section"><div class="wrap">${sectionHead(l,'TOUR BOARD / FINALS',T(l,'Who won? See the details.','\ub204\uac00 \uc6b0\uc2b9\ud588\uc744\uae4c\uc694?'),T(l,'Published results from '+site.editorialDate+'. Not a live feed.','\uacb0\uacfc \uae30\uc900\uc77c '+site.editorialDate+' / \uc2e4\uc2dc\uac04 \ud53c\ub4dc\uac00 \uc544\ub2d9\ub2c8\ub2e4.'),button(l,'tour/results/','All results','\uc804\uccb4 \uacb0\uacfc','text-button'))}<div class="grid two">${events.slice(0,2).map(e=>eventCard(l,e)).join('')}</div></div></section>
  <section class="section menu-gear-section"><div class="wrap">${sectionHead(l,'GEAR LAB',T(l,'See it. Compare it.','\ubcf4\uace0, \ube44\uad50\ud558\uace0.'),'',button(l,'gear/','Explore gear','\uc7a5\ube44 \ub458\ub7ec\ubcf4\uae30','text-button'))}${categoryStrip(l)}<div class="ux-product-shortlist">${featured.map(p=>`<a class="ux-mini-product" href="${url(l,'gear/'+p.category+'/')}#${p.id}">${photo(l,p.media,'ux-mini-product-photo',false,false)}<span><small>${esc(p.brand)}</small><strong>${esc(p.name)}</strong></span>${icon('arrow')}</a>`).join('')}</div></div></section>
  <section class="section tint"><div class="wrap">${sectionHead(l,'LEARN / ON COURT',T(l,'Take one idea onto the court.','\ub2e4\uc74c \uacbd\uae30\uc5d0 \uc368 \ubcfc \ud55c \uac00\uc9c0.'),'',button(l,'learn/','All guides','\uc804\uccb4 \uac00\uc774\ub4dc','text-button'))}${I.topics(l)}<div class="grid three">${guides.slice(1,4).map((g,i)=>guideCard(l,g,i+1)).join('')}</div></div></section>
  <section class="section"><div class="wrap">${I.banner(l,'video-review',T(l,'Your next practice is in your last match.','\uc9c0\ub09c \uacbd\uae30 \uc548\uc5d0 \ub2e4\uc74c \uc5f0\uc2b5\uc774 \uc788\uc2b5\ub2c8\ub2e4.'),T(l,'Mark ten rallies and one decision to change.','10\uac1c \ub7a0\ub9ac\uc640 \ubc14\uafd4 \ubcfc \ud310\ub2e8 \ud558\ub098\ub97c \uae30\ub85d\ud558\uc138\uc694.'),'tools/review/',T(l,'Open match notes','\uacbd\uae30 \ubd84\uc11d \ub178\ud2b8'))}</div></section>`;
 }

 return {images:I,icon,navIcon,bottomNav,diagram,art,featureCard,toolCard,hero,quickGrid,homeBody,eventCard,guideCard,people,avatar,categoryStrip,brandChips,introArt};
}
