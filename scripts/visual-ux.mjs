
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
 function gearArt(l){
  return `<div class="ux-gear-art" aria-hidden="true">${['franklin-c45','six-zero-dbd','wilson-pickle-pro'].map((m,i)=>photo(l,m,'ux-gear-object object-'+i,false,false)).join('')}</div>`;
 }
 function art(l,p,n=0){
  if(/^gear/.test(p))return gearArt(l);
  if(/^tour/.test(p))return `<div class="ux-tour-art">${photo(l,'ben-johns','ux-star',false,false)}${photo(l,'anna-leigh-waters','ux-star',false,false)}<span class="ux-trophy">${icon('trophy')}</span></div>`;
  return diagram(/^vision/.test(p)?'vision':/^clip/.test(p)?'clip':/^download/.test(p)?'download':/^video|^tools/.test(p)?'notes':/^learn/.test(p)?'learn':'court',n);
 }
 function featureCard(l,p,title,description,state='',n=0){
  const k=iconsForRel(p),tone=p.startsWith('vision')?'blue':/^clip|^video|^download|^tools/.test(p)?'violet':p.startsWith('tour')?'gold':p.startsWith('gear')?'sand':'mint';
  return `<article class="ux-feature ux-tone-${tone}"><a href="${url(l,p)}" class="ux-feature-link"><div class="ux-feature-visual">${art(l,p,n)}<span class="ux-visual-label">${T(l,'EXPLORE','바로 시작')}</span></div><div class="ux-feature-body"><div class="ux-card-top"><span class="ux-tile-icon">${icon(k)}</span>${state?`<span class="ux-state">${esc(state)}</span>`:''}</div><h2>${esc(title)}</h2><p>${esc(description)}</p><span class="ux-go">${T(l,'Explore','자세히 보기')}${icon('arrow')}</span></div></a></article>`;
 }
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
 function quickGrid(l){
  return `<section class="section ux-quick-section"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">PICK YOUR NEXT MOVE</p><h2>${T(l,'What brings you to the court?','오늘은 무엇을 해 볼까요?')}</h2></div><p class="ux-helper">${T(l,'Six clear paths. One place to start.','실력 확인부터 경기 결과까지, 한눈에.')}</p></div><div class="ux-feature-grid">${[
   ['dupr-self-check/','DUPR Self Check','DUPR 자가진단','Read the court. Choose your next shot.','코트를 보고 다음 샷을 선택하세요.','10 + 10'],
   ['vision-rating/','Vision Rating','Vision Rating','See your own match through a different lens.','내 경기 영상에서 개선할 지점을 찾으세요.','Desktop'],
   ['clip-lite/','Clip Lite','Clip Lite','Keep the rally. Leave out the waiting.','기다리는 시간은 빼고 랠리만 남기세요.','Browser'],
   ['tour/','Tour Board','Tour Board','Champions, game scores and the next event.','우승 선수, 게임별 점수, 다음 대회.','Results'],
   ['gear/','Gear Lab','Gear Lab','Find a model. Compare with a purpose.','실제 제품을 보고 목적에 맞게 비교하세요.','28 models'],
   ['learn/','Learn a pattern','실전 가이드','One situation. One useful change.','하나의 상황에서 하나씩 바꿔 보세요.','9 guides']
  ].map(([p,en,ko,d,dk,b],i)=>featureCard(l,p,T(l,en,ko),T(l,d,dk),p==='vision-rating/'?T(l,'Desktop required','별도 프로그램 필요'):b==='Browser'?T(l,'Browser','웹 편집'):b==='Results'?T(l,'Results','경기 결과'):b==='28 models'?T(l,'28 models','28개 모델'):b==='9 guides'?T(l,'9 guides','9개 가이드'):b,i)).join('')}</div></div></section>`;
 }
 function hero(l){
  return `<section class="ux-home-hero"><div class="wrap ux-hero-grid"><div class="ux-hero-copy"><p class="eyebrow">${icon('court')} YOUR NEXT POINT STARTS HERE</p><h1>${T(l,'See the game.<br><em>Find your edge.</em>','한눈에 보고,<br><em>더 잘 플레이하세요.</em>')}</h1><p>${T(l,'Check your decisions. Review your rallies. Explore gear and the pro game—all in one place.','내 판단을 확인하고, 랠리를 편집하고, 장비와 프로 경기를 둘러보세요. Picklary에서 다음 플레이를 준비합니다.')}</p><div class="actions"><a class="button ux-primary" href="${url(l,'dupr-self-check/')}">${icon('court')}${T(l,'Check my game','내 실력 확인')}${icon('arrow')}</a><a class="button ux-outline" href="${url(l,'clip-lite/')}">${icon('clip')}${T(l,'Edit my video','내 영상 편집')}</a></div><div class="ux-hero-links"><a href="${url(l,'vision-rating/')}">${icon('scan')} Vision Rating <small>${T(l,'Desktop','별도 프로그램')}</small></a><span>KO / EN</span></div></div><a class="ux-court-feature" href="${url(l,'dupr-self-check/')}"><div class="ux-preview-head"><span>${icon('court')} DUPR SELF CHECK</span><span class="ux-small-chip">3D / 2D</span></div>${diagram('court')}<div class="ux-preview-options"><span>${T(l,'Shot','샷')}</span><span>${T(l,'Power','강도')}</span><span>${T(l,'Target','방향')}</span></div><div class="ux-preview-bottom"><div><strong>${T(l,'What would you play?','지금, 어떤 샷을 치시겠어요?')}</strong><small>${T(l,'Court illustration · independent practice estimate','코트 개념도 · 공식 DUPR이 아닌 참고 추정')}</small></div>${icon('arrow')}</div></a></div></section>`;
 }
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
 function guideCard(l,g,i=0){
  const k=/paddle|shoe/.test(g.slug)?'paddle':/review/.test(g.slug)?'video':'court';
  return `<article class="guide-card ux-guide"><a href="${url(l,'learn/'+g.slug+'/')}"><div class="ux-guide-art ux-guide-art-${i%4}">${/paddle/.test(g.slug)?gearArt(l):diagram(k,i)}<span class="ux-guide-tag">${esc(g.level)}</span></div><div class="ux-guide-copy"><h3>${esc(text(l,g.title))}</h3><p>${esc(text(l,g.dek))}</p><span class="read-link">${T(l,'Learn this pattern','이 패턴 배우기')}${icon('arrow')}</span></div></a></article>`;
 }
 function categoryStrip(l,active=''){
  const ids=['franklin-c45','franklin-x40','wilson-pickle-pro','selkirk-7-inch-shorts','tourna-mega-tac'];
  return `<nav class="ux-category-strip" aria-label="${T(l,'Gear categories','장비 종류')}">${Object.entries(catLabels).map(([k,v],i)=>`<a href="${url(l,'gear/'+k+'/')}" ${active===k?'aria-current="page"':''}>${photo(l,ids[i],'ux-category-img',false,false)}<span>${icon(iconsForRel('gear/'+k+'/'))}<strong>${esc(text(l,v))}</strong><small>${products.filter(p=>p.category===k).length}</small></span></a>`).join('')}</nav>`;
 }
 function brandChips(l,list){
  const brands=[...new Set(list.map(p=>p.brand))];
  return `<div class="ux-brand-chips" role="group" aria-label="${T(l,'Choose brand','브랜드 선택')}"><button type="button" data-brand-chip="" aria-pressed="true">${T(l,'All brands','전체')} <small>${list.length}</small></button>${brands.map(b=>`<button type="button" data-brand-chip="${esc(b)}" aria-pressed="false">${esc(b)} <small>${list.filter(p=>p.brand===b).length}</small></button>`).join('')}</div>`;
 }
 function introArt(l,kicker){
  if(kicker==='GEAR / RESEARCH')return gearArt(l);
  if(kicker==='TOUR BOARD')return art(l,'tour/');
  if(kicker==='LEARN / PRACTICE')return diagram('learn',1);
  if(kicker==='KNOW / REVIEW / IMPROVE')return diagram('court');
  if(kicker==='VIDEO TOOLS / RESTORED')return diagram('clip');
  if(kicker.startsWith('VISION RATING'))return diagram('vision');
  return '';
 }
 function homeBody(l,sectionHead,button){
  const featured=['franklin-c45','six-zero-dbd','wilson-pickle-pro','franklin-x40'].map(id=>products.find(x=>x.id===id));
  return hero(l)+quickGrid(l)+`<section class="section ux-results-section"><div class="wrap">${sectionHead(l,'TOUR BOARD / FINALS',T(l,'Who won? See the details.','누가 우승했을까요?'),T(l,'Published scores from the '+site.editorialDate+' edition. Not a live feed.','공개 점수를 정리한 '+site.editorialDate+' 기준 기록입니다. 실시간 피드가 아닙니다.'),button(l,'tour/results/','Results center','경기 결과 센터','text-button'))}<div class="grid two">${events.slice(0,2).map(e=>eventCard(l,e)).join('')}</div></div></section>
  <section class="section"><div class="wrap">${sectionHead(l,'GEAR LAB / BROWSE VISUALLY',T(l,'Find the right fit.','사진으로 보고, 나에게 맞게.'),'',button(l,'gear/','Explore Gear Lab','Gear Lab 둘러보기','text-button'))}${categoryStrip(l)}<div class="ux-product-shortlist">${featured.map(p=>`<a class="ux-mini-product" href="${url(l,'gear/'+p.category+'/')}#${p.id}">${photo(l,p.media,'ux-mini-product-photo',false,false)}<span><small>${esc(p.brand)}</small><strong>${esc(p.name)}</strong></span>${icon('arrow')}</a>`).join('')}</div></div></section>
  <section class="section tint"><div class="wrap">${sectionHead(l,'LEARN / ONE PATTERN AT A TIME',T(l,'Take one idea onto the court.','다음 경기에 써 볼 한 가지.'),'',button(l,'learn/','All guides','전체 가이드','text-button'))}<div class="grid three">${guides.slice(1,4).map((g,i)=>guideCard(l,g,i+1)).join('')}</div></div></section>
  <section class="section ux-last-move"><div class="wrap"><div class="ux-last-move-panel"><div><p class="eyebrow">WATCH → MARK → PRACTICE</p><h2>${T(l,'Your next practice<br>is in your last match.','지난 경기 안에<br>다음 연습이 있습니다.')}</h2><p>${T(l,'Start with ten rallies. Write down one thing to change.','10개의 랠리를 보고, 바꿔 볼 한 가지를 기록하세요.')}</p>${button(l,'tools/review/','Open match notes','경기 분석 노트 열기','lime')}</div>${diagram('notes')}</div></div></section>`;
 }
 return {icon,navIcon,bottomNav,diagram,art,featureCard,toolCard,hero,quickGrid,homeBody,eventCard,guideCard,people,avatar,categoryStrip,brandChips,introArt};
}
