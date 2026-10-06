/** Image-first navigation, reusing crops from the supplied Picklary artwork.
 * These are menu illustrations, never named product photographs or rating outputs.
 * Links and localized labels are real HTML outside the bitmap. */
import fs from 'node:fs';
const registry=JSON.parse(fs.readFileSync(new URL('../data/menu-art.json',import.meta.url),'utf8'));
export function imageNavigation(C){
 const {T,esc,text,url,icon,products,guides,site,catLabels}=C;
 const labels={
  'home-court':['Pickleball players on court','\ucf54\ud2b8\uc5d0\uc11c \ud53c\ud074\ubcfc\uc744 \uc990\uae30\ub294 \uc120\uc218\ub4e4'],
  'self-check':['Choose between a drop and a drive','\ub4dc\ub86d\uacfc \ub4dc\ub77c\uc774\ube0c \uc120\ud0dd'],
  'video-review':['Video review','\uc601\uc0c1 \ubd84\uc11d'],
  'players':['Player profiles','\uc120\uc218 \ud504\ub85c\ud544'],
  'results':['Tournament results','\ub300\ud68c \uacb0\uacfc'],
  'schedule':['Event calendar','\ub300\ud68c \uc77c\uc815'],
  'downloads':['Program downloads','\ud504\ub85c\uadf8\ub7a8 \ub2e4\uc6b4\ub85c\ub4dc'],
  'paddles':['Paddles','\ud328\ub4e4'],'balls':['Balls','\uacf5'],'shoes':['Court shoes','\ucf54\ud2b8\ud654'],
  'apparel':['Apparel','\uc758\ub958'],'accessories':['Accessories','\uc561\uc138\uc11c\ub9ac'],
  'serve':['Serve','\uc11c\ube0c'],'return':['Return','\ub9ac\ud134'],'dink':['Dink','\ub529\ud06c'],
  'drop':['Third shot','3\uad6c'],'reset':['Reset','\ub9ac\uc14b'],'position':['Positioning','\ud3ec\uc9c0\uc154\ub2dd'],
  'confidence':['Practice','\uc5f0\uc2b5'],'guide-reset':['Low reset','\ub0ae\uc740 \ub9ac\uc14b'],
  'guide-dink':['Dink rally','\ub529\ud06c \ub7a0\ub9ac'],'guide-position':['Doubles coverage','\ubcf5\uc2dd \ucf54\ud2b8 \ucee4\ubc84'],
 };
 function image(l,key,cls='',eager=false){
  const m=registry[key];if(!m)throw Error('Unknown menu illustration: '+key);
  const [small,large]=m.variants;
  const label=labels[key]||[m.alt,m.alt];
  return `<img class="menu-art ${cls}" data-navigation-art="${key}" src="${large.path}" srcset="${small.path} ${small.width}w, ${large.path} ${large.width}w" sizes="(max-width: 700px) 92vw, (max-width: 1100px) 60vw, 720px" width="${large.width}" height="${large.height}" alt="${esc(T(l,label[0],label[1]))} ${T(l,'illustration','\uc77c\ub7ec\uc2a4\ud2b8')}" loading="${eager?'eager':'lazy'}" decoding="async"${eager?' fetchpriority="high"':''}>`;
 }
 function skillArt(l){return `<div class="menu-skills-art" aria-hidden="true">${['serve','dink','reset'].map(k=>image(l,k)).join('')}</div>`;}
 function gearArt(l){return `<div class="menu-gear-art" aria-hidden="true">${['paddles','shoes','apparel','accessories'].map(k=>`<div>${image(l,k)}</div>`).join('')}</div>`;}
 function clipArt(l){return `<div class="menu-film-art"><div class="menu-film-scene">${image(l,'guide-position')}<span class="menu-play-mark" aria-hidden="true">${icon('video')}</span></div><div class="menu-film-track" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div>`;}
 function art(l,path){
  if(/^dupr|^level/.test(path))return image(l,'self-check','menu-art-cover');
  if(/^vision/.test(path))return image(l,'video-review');
  if(/^clip|^video/.test(path))return clipArt(l);
  if(/^downloads|^tools/.test(path))return image(l,'downloads');
  if(/^gear\/(paddles|balls|shoes|apparel|accessories)\//.test(path))return image(l,path.split('/')[1]);
  if(/^gear/.test(path))return gearArt(l);
  if(/^tour\/players/.test(path))return image(l,'players');
  if(/^tour\/schedule/.test(path))return image(l,'schedule');
  if(/^tour\/rankings/.test(path))return image(l,'results');
  if(/^tour/.test(path))return `<div class="menu-tour-art">${image(l,'results')}${image(l,'players')}</div>`;
  if(/^learn/.test(path))return skillArt(l);
  return image(l,'home-court','menu-art-cover');
 }
 function keyFor(p){return /^dupr/.test(p)?'self':/^clip/.test(p)?'clip':/^vision/.test(p)?'vision':/^gear/.test(p)?'gear':/^tour/.test(p)?'tour':'learn';}
 function feature(l,p,title,description,state=''){
  const key=keyFor(p);
  return `<article class="ux-feature menu-feature menu-feature--${key}"><a href="${url(l,p)}" class="ux-feature-link"><div class="ux-feature-visual">${art(l,p)}</div><div class="ux-feature-body"><div class="menu-card-heading"><h2>${esc(title)}</h2><span class="menu-round-arrow" aria-hidden="true">${icon('arrow')}</span></div><p>${esc(description)}</p>${state?`<span class="ux-state">${esc(state)}</span>`:''}</div></a></article>`;
 }
 function quickGrid(l){
  const items=[
   ['dupr-self-check/','DUPR Self Check','DUPR \uc790\uac00\uc9c4\ub2e8','What would you play?','\uc774 \uc0c1\ud669\uc5d0\uc11c \uc5b4\ub5bb\uac8c \uce60\uae4c\uc694?','3D / 2D'],
   ['clip-lite/','Clip Lite','Clip Lite','Keep the rally. Cut the wait.','\uae30\ub2e4\ub9bc\uc740 \ube7c\uace0, \ub7a0\ub9ac\ub9cc.','Browser','\uc6f9 \ud3b8\uc9d1'],
   ['vision-rating/','Vision Rating','Vision Rating','Review your own match.','\ub0b4 \uacbd\uae30 \uc601\uc0c1 \ubd84\uc11d.','Desktop required','\ubcc4\ub3c4 \ud504\ub85c\uadf8\ub7a8 \ud544\uc694'],
   ['gear/','Gear Lab','Gear Lab','Find your next piece of gear.','\uc0ac\uc9c4\uc73c\ub85c \uace0\ub974\ub294 \uc7a5\ube44.','28 models','28\uac1c \ubaa8\ub378'],
   ['tour/','Tour Board','Tour Board','Champions and game scores.','\uc6b0\uc2b9 \uc120\uc218\uc640 \uac8c\uc784 \uc810\uc218.','Results','\uacbd\uae30 \uacb0\uacfc'],
   ['learn/','Learn','\uc2e4\uc804 \uac00\uc774\ub4dc','One pattern for your next point.','\ub2e4\uc74c \uacbd\uae30\uc5d0 \uc368 \ubcfc \ud55c \uac00\uc9c0.','9 guides','9\uac1c \uac00\uc774\ub4dc']
  ];
  return `<section class="section ux-quick-section" id="choose-path"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">EXPLORE PICKLARY</p><h2>${T(l,'Pick your next move.','\uadf8\ub9bc\uc73c\ub85c \uace0\ub974\ub294 \ub2e4\uc74c \ud50c\ub808\uc774.')}</h2></div><a class="menu-text-link" href="${url(l,'tools/')}">${T(l,'All tools','\ub3c4\uad6c \uc804\uccb4')}${icon('arrow')}</a></div><div class="ux-feature-grid menu-bento">${items.map(([p,en,ko,d,dk,s,sk])=>feature(l,p,T(l,en,ko),T(l,d,dk),T(l,s,sk||s))).join('')}</div><p class="menu-art-note">${T(l,'Menu artwork is illustrative. Product and player photographs are shown separately.','\uba54\ub274\ub294 \uc124\uba85\uc6a9 \uc77c\ub7ec\uc2a4\ud2b8\uc785\ub2c8\ub2e4. \uc81c\ud488\uacfc \uc120\uc218\uc758 \uc2e4\uc81c \uc0ac\uc9c4\uc740 \uac01 \ucf58\ud150\uce20\uc5d0 \uad6c\ubd84\ud574 \ud45c\uc2dc\ud569\ub2c8\ub2e4.')} <a href="${url(l,'media/')}#menu-art">${T(l,'Artwork notes','\uc774\ubbf8\uc9c0 \uc548\ub0b4')}</a></p></div></section>`;
 }
 function hero(l){return `<section class="ux-home-hero menu-home-hero"><div class="wrap ux-hero-grid"><div class="ux-hero-copy"><p class="eyebrow">PICKLARY / PLAY. REVIEW. IMPROVE.</p><h1>${T(l,'More court time.<br><em>Better next points.</em>','\uc990\uae30\ub294 \ud53c\ud074\ubcfc,<br><em>\ub354 \ub098\uc740 \ub2e4\uc74c \ud50c\ub808\uc774.</em>')}</h1><p>${T(l,'Check your game. Edit a rally. Find your next practice.','\ub0b4 \uc2e4\ub825\uc744 \ud655\uc778\ud558\uace0, \ub7a0\ub9ac\ub97c \ud3b8\uc9d1\ud558\uace0,<br>\ub2e4\uc74c \uacbd\uae30\ub97c \uc900\ube44\ud558\uc138\uc694.')}</p><div class="actions"><a class="button ux-primary" href="${url(l,'dupr-self-check/')}">${T(l,'Check my game','\ub0b4 \uc2e4\ub825 \ud655\uc778')}${icon('arrow')}</a><a class="button ux-outline" href="${url(l,'clip-lite/')}">${T(l,'Edit my video','\ub0b4 \uc601\uc0c1 \ud3b8\uc9d1')}</a></div><a href="#choose-path" class="menu-browse">${T(l,'Explore with images','\uc774\ubbf8\uc9c0\ub85c \ub458\ub7ec\ubcf4\uae30')}${icon('arrow')}</a></div><figure class="menu-hero-scene">${image(l,'home-court','menu-art-cover',true)}<figcaption><span>ON THE COURT, TOGETHER</span><span>${T(l,'Play with a plan.','\ub2e4\uc74c \ud50c\ub808\uc774\ub97c \uc900\ube44\ud558\uc138\uc694.')}</span></figcaption></figure></div></section>`;}
 function categoryStrip(l,active=''){
  return `<nav class="ux-category-strip menu-category-strip" aria-label="${T(l,'Gear categories','\uc7a5\ube44 \uc885\ub958')}">${Object.entries(catLabels).map(([k,v])=>`<a class="menu-category-${k}" href="${url(l,'gear/'+k+'/')}"${active===k?' aria-current="page"':''}><div class="menu-category-image">${image(l,k)}</div><span><strong>${esc(text(l,v))}</strong><small>${products.filter(p=>p.category===k).length} ${T(l,'models','\ubaa8\ub378')}</small>${icon('arrow')}</span></a>`).join('')}</nav>`;
 }
 const guideKeys={
  'first-session-plan':'home-court','third-shot-drive-or-drop':'self-check','transition-reset-footwork':'guide-reset',
  'purposeful-dinking':'guide-dink','return-depth-and-recovery':'guide-position','offensive-lob':'position',
  'paddle-demo-checklist':'paddles','court-shoe-fit-test':'shoes','match-review-worksheet':'video-review'
 };
 function guideCard(l,g){
  const key=guideKeys[g.slug]||'home-court',cover=['home-court','self-check','guide-reset','guide-dink','guide-position'].includes(key);
  return `<article class="guide-card ux-guide menu-guide"><a href="${url(l,'learn/'+g.slug+'/')}"><div class="ux-guide-art">${image(l,key,cover?'menu-art-cover':'')}<span class="ux-guide-tag">${esc(g.level)}</span></div><div class="ux-guide-copy"><h3>${esc(text(l,g.title))}</h3><p>${esc(text(l,g.dek))}</p><span class="read-link">${T(l,'Open guide','\uac00\uc774\ub4dc \uc5f4\uae30')}${icon('arrow')}</span></div></a></article>`;
 }
 function topics(l){
  const items=[['serve','return-depth-and-recovery'],['drop','third-shot-drive-or-drop'],['dink','purposeful-dinking'],['reset','transition-reset-footwork'],['position','return-depth-and-recovery'],['confidence','first-session-plan']];
  return `<nav class="menu-topic-rail" aria-label="${T(l,'Practice topics','\uc5f0\uc2b5 \uc8fc\uc81c')}">${items.map(([k,slug])=>`<a href="${url(l,'learn/'+slug+'/')}">${image(l,k)}<strong>${T(l,...labels[k])}</strong></a>`).join('')}</nav>`;
 }
 function introArt(l,kicker){
  const key=(kicker||'').toUpperCase();
  // Keep actual working controls above the fold; navigation illustrations belong to hubs.
  if(key.includes('ORIGINAL COURT TOOL')||key.includes('CLIP LITE /'))return '';
  if(key.startsWith('GEAR LAB / '))return image(l,key.split(' / ')[1].toLowerCase());
  if(key.includes('GEAR'))return gearArt(l);
  if(key.includes('PLAYERS'))return image(l,'players');
  if(key.includes('RANKINGS'))return image(l,'results');
  if(key.includes('TOUR')||key.includes('FINALS')||key.includes('RESULTS'))return `<div class="menu-tour-art">${image(l,'results')}${image(l,'players')}</div>`;
  if(key.includes('LEARN'))return skillArt(l);
  if(key.includes('KNOW / REVIEW')||key.includes('SELF-CHECK'))return image(l,'self-check','menu-art-cover');
  if(key.includes('VISION'))return image(l,'video-review');
  if(key.includes('VIDEO TOOLS'))return clipArt(l);
  if(key.includes('TOOLS')||key.includes('DOWNLOAD'))return image(l,'downloads');
  return '';
 }
 function scheduleVisual(l){return `<div class="menu-schedule-art">${image(l,'schedule')}<span>${T(l,'Event calendar','\ub300\ud68c \uce98\ub9b0\ub354')}</span></div>`;}
 function banner(l,key,title,copy,link,label){return `<div class="menu-section-banner"><div class="menu-banner-image">${image(l,key)}</div><div><p class="eyebrow">PICKLARY</p><h2>${esc(title)}</h2><p>${esc(copy)}</p><a class="button secondary" href="${url(l,link)}">${esc(label)}${icon('arrow')}</a></div></div>`;}
 function credits(l){return `<section class="callout" id="menu-art"><h2>${T(l,'Menu illustrations','\uba54\ub274 \uc77c\ub7ec\uc2a4\ud2b8')}</h2><p>${T(l,'Navigation art is cropped from the existing Picklary menu and learning illustrations supplied with the website source. The original style is retained; buttons, localized names and links are live HTML. These images are not official DUPR endorsements, measured ratings, real match results, or photographs of a named product or player.','\uba54\ub274\uc640 \ud559\uc2b5 \uc774\ubbf8\uc9c0\ub294 \uae30\uc874 Picklary \uc18c\uc2a4\uc5d0 \ud3ec\ud568\ub41c \uc77c\ub7ec\uc2a4\ud2b8\uc5d0\uc11c \uc0ac\uc6a9\ud560 \ubd80\ubd84\uc744 \uc798\ub77c \uc7ac\ubc30\uce58\ud588\uc2b5\ub2c8\ub2e4. \ubc84\ud2bc\u00b7\ud55c\uad6d\uc5b4/\uc601\uc5b4 \uba54\ub274\uba85\u00b7\ub9c1\ud06c\ub294 \uc2e4\uc81c HTML\uc785\ub2c8\ub2e4. \uacf5\uc2dd DUPR \uc778\uc99d, \uce21\uc815\ub41c \uc810\uc218, \uc2e4\uc81c \uacbd\uae30 \uacb0\uacfc\ub098 \ud2b9\uc815 \uc0c1\ud488\u00b7\uc120\uc218\uc758 \uc0ac\uc9c4\uc744 \uc758\ubbf8\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.')}</p></section>`;}
 return {image,art,gearArt,skillArt,clipArt,hero,quickGrid,feature,categoryStrip,guideCard,topics,introArt,banner,scheduleVisual,credits};
}
