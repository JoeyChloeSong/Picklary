import {restoredTools} from './restored-tools.mjs';
import {packageTools} from './package-tools.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUT=path.join(ROOT,'dist');
const read=n=>JSON.parse(fs.readFileSync(path.join(ROOT,'data',n+'.json'),'utf8'));
const site=read('site'), guides=read('guides'), products=read('products'), players=read('players'),
      media=read('media'), sources=read('sources'), events=read('results'), schedule=read('schedule'), rankings=read('rankings');
if(site.adServingEnabled) throw new Error('Ad serving is deliberately disabled. Complete the consent, rights and AdSense review checklist before introducing an ad loader.');
const cacheFile=path.join(ROOT,'data','media-cache.json');
const cache=fs.existsSync(cacheFile)?JSON.parse(fs.readFileSync(cacheFile,'utf8')):{};
fs.rmSync(OUT,{recursive:true,force:true});
fs.mkdirSync(OUT,{recursive:true});
fs.cpSync(path.join(ROOT,'public'),OUT,{recursive:true});
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,10);
const asset=(folder,name)=>{
 const src=fs.readFileSync(path.join(ROOT,'public/assets',folder,name));
 const ext=path.extname(name), file=path.basename(name,ext)+'.'+hash(src)+ext;
 fs.writeFileSync(path.join(OUT,'assets',folder,file),src);
 fs.rmSync(path.join(OUT,'assets',folder,name));
 return '/assets/'+folder+'/'+file;
};
const css=asset('css','site.css'), js=asset('js','site.js');
const toolCss=asset('tools','tools.css'),selfJs=asset('tools','self-check.js'),clipJs=asset('tools','clip-editor.js');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const T=(l,en,ko)=>l==='ko'?ko:en;
const text=(l,v)=>typeof v==='string'?v:(v?.[l]??v?.en??'');
const url=(l,rel='')=>'/'+l+'/'+rel;
const absolute=rel=>site.url+rel;
const D=d=>String(d).replaceAll('-','.');
const pages=[];
const catLabels={
 paddles:{en:'Paddles',ko:'패들'}, balls:{en:'Balls',ko:'공'}, shoes:{en:'Shoes',ko:'신발'},
 apparel:{en:'Apparel',ko:'의류'}, accessories:{en:'Accessories',ko:'액세서리'}
};
const divLabels={
 MS:{en:"Men’s singles",ko:'남자 단식'},WS:{en:"Women’s singles",ko:'여자 단식'},
 MD:{en:"Men’s doubles",ko:'남자 복식'},WD:{en:"Women’s doubles",ko:'여자 복식'},
 XD:{en:'Mixed doubles',ko:'혼합복식'},TEAM:{en:'Team series',ko:'팀 시리즈'}
};
function ref(l,id,label){
 const s=sources[id]; if(!s)throw new Error('Unknown source '+id);
 return `<a class="source-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(label||s.title)} <span aria-hidden="true">↗</span></a>`;
}
function refs(l,ids){
 const unique=[...new Set(ids.filter(Boolean))];
 return `<aside class="sources"><h2>${T(l,'Sources & verification','출처와 확인 기준')}</h2><p>${T(l,'Facts are linked to the source used for this edition. A source check is not a claim that the page is live.','이 판에서 확인한 사실의 출처입니다. 출처 확인일은 실시간 데이터 연동을 의미하지 않습니다.')}</p><ul>${unique.map(id=>`<li>${ref(l,id)} <span>${T(l,'Checked','확인')} ${D(sources[id].checked)}</span></li>`).join('')}</ul></aside>`;
}
function photo(l,id,cls='',eager=false,caption=true){
 const m=media[id]; if(!m)throw new Error('Unknown media '+id);
 const local=cache[id]?.path||m.local;
 const src=local&&fs.existsSync(path.join(OUT,local))?local:m.url;
 if(!src)throw new Error('Missing photo '+id);
 return `<figure class="media ${cls}" data-media="${esc(id)}"><div class="media-stage"><img src="${esc(src)}" alt="${esc(m.subject)}" width="${m.kind==='athlete'?640:700}" height="${m.kind==='athlete'?800:700}" loading="${eager?'eager':'lazy'}" decoding="async" ${eager?'fetchpriority="high"':''} referrerpolicy="no-referrer"><span class="media-fallback" hidden>${T(l,'Image unavailable from its source.','원본 출처의 이미지를 불러오지 못했습니다.')}<small>${esc(m.subject)}</small></span></div>${caption?`<figcaption>${ref(l,m.source,T(l,'Image source','사진 출처'))}</figcaption>`:''}</figure>`;
}
function pill(s,cls=''){return `<span class="pill ${cls}">${esc(s)}</span>`}
function button(l,rel,en,ko,cls=''){return `<a class="button ${cls}" href="${url(l,rel)}">${T(l,en,ko)} <span aria-hidden="true">↗</span></a>`}
function tourNav(l,active=''){
 return `<nav class="subnav" aria-label="${T(l,'Tour Board','투어 보드')}">${[
 ['tour/','Board','투어 보드'],['tour/results/','Results','경기 결과'],['tour/schedule/','Events & schedule','대회 일정'],
 ['tour/players/','Players','선수'],['tour/rankings/','Rankings','랭킹']
 ].map(([p,en,ko])=>`<a href="${url(l,p)}" ${active===p?'aria-current="page"':''}>${T(l,en,ko)}</a>`).join('')}</nav>`;
}
function gearNav(l,active=''){return `<nav class="subnav" aria-label="${T(l,'Gear categories','장비 종류')}">${Object.entries(catLabels).map(([k,v])=>`<a href="${url(l,'gear/'+k+'/')}" ${active===k?'aria-current="page"':''}>${esc(text(l,v))}</a>`).join('')}</nav>`}
function header(l,rel){
 const nav=[['','Home','\ud648'],['level-check/','Skill tools','\ub0b4 \uc2e4\ub825 \ud655\uc778'],['video-tools/','Video tools','\uc601\uc0c1 \ub3c4\uad6c'],['learn/','Learn','\ubc30\uc6b0\uae30'],['gear/','Gear Lab','Gear Lab'],['tour/','Tour Board','Tour Board']];
 const other=l==='ko'?'en':'ko';
 return `<div class="edition"><div class="wrap"><span>INDEPENDENT PICKLEBALL JOURNAL</span><span>${T(l,'Edition 01','에디션 01')} · ${D(site.editorialDate)}</span></div></div>
 <header class="site-header"><div class="wrap header-inner"><a class="brand" href="${url(l)}" aria-label="Picklary ${T(l,'home','홈')}"><span class="brand-icon" aria-hidden="true">p.</span>Picklary<span class="brand-dot">●</span></a>
 <button class="menu-toggle" type="button" aria-controls="primary-nav" aria-expanded="false">${T(l,'Menu','메뉴')}</button>
 <nav id="primary-nav" aria-label="${T(l,'Primary navigation','주 메뉴')}">${nav.map(([p,en,ko])=>`<a href="${url(l,p)}" ${(p===''?rel==='':p==='level-check/'?/^(level-check|dupr-self-check|vision-rating)\//.test(rel):p==='video-tools/'?/^(video-tools|clip-lite|downloads|tools)\//.test(rel):rel.startsWith(p))?'aria-current="page"':''}>${T(l,en,ko)}</a>`).join('')}</nav>
 <a class="lang-switch" href="${url(other,rel)}" lang="${other}" hreflang="${other}">${other==='ko'?'한국어':'EN'}</a></div></header>`;
}
function footer(l){
 return `<footer class="site-footer"><div class="wrap footer-grid"><div><a class="brand" href="${url(l)}">Picklary<span class="brand-dot">●</span></a><p>${T(l,'A better question for your next point. Practical guides, identifiable gear and source-led results.','다음 포인트를 위한 더 나은 질문. 실전 가이드, 정확히 구분한 장비, 출처를 갖춘 경기 결과.')}</p><p class="small">© 2026 Picklary · ${T(l,'Edited by Shawn','편집 Shawn')}</p></div><div><h2>${T(l,'Explore','둘러보기')}</h2><a href="${url(l,'learn/')}">${T(l,'Learning library','실전 가이드')}</a><a href="${url(l,'gear/')}">Gear Lab</a><a href="${url(l,'tour/results/')}">${T(l,'Results desk','경기 결과')}</a><a href="${url(l,'tools/')}">${T(l,'Practice tools','연습 도구')}</a></div><div><h2>${T(l,'About the work','운영과 편집')}</h2><a href="${url(l,'about/')}">${T(l,'About Picklary','Picklary 소개')}</a><a href="${url(l,'editorial-policy/')}">${T(l,'Editorial method','편집 원칙')}</a><a href="${url(l,'corrections/')}">${T(l,'Corrections','정정 내역')}</a><a href="${url(l,'contact/')}">${T(l,'Contact','문의')}</a></div><div><h2>${T(l,'Transparency','투명성')}</h2><a href="${url(l,'privacy/')}">${T(l,'Privacy','개인정보 처리')}</a><a href="${url(l,'terms/')}">${T(l,'Terms','이용 안내')}</a><a href="${url(l,'media/')}">${T(l,'Image credits','이미지 출처')}</a><a href="${url(l,'sitemap/')}">${T(l,'Site map','사이트맵')}</a></div></div><div class="wrap footer-bottom">${T(l,'No paid rankings. No invented match scores. Product pages are research notes, not claimed hands-on tests.','유료 순위와 추정 스코어를 싣지 않습니다. 장비 콘텐츠는 제품 조사 노트이며 직접 테스트한 리뷰로 가장하지 않습니다.')}</div></footer>`;
}
function page(l,rel,title,description,body,opts={}){
 const canonical=absolute(url(l,rel));
 const schemas=[{'@context':'https://schema.org','@type':rel===''?'WebSite':'WebPage','name':title,'url':canonical,'inLanguage':l,'description':description}];
 if(opts.article) schemas.push({'@context':'https://schema.org','@type':'Article','headline':title,'description':description,
   'mainEntityOfPage':canonical,'datePublished':site.editorialDate,'dateModified':site.editorialDate,
   'author':{'@type':'Person','name':site.editor,'url':absolute(url(l,'about/'))},
   'publisher':{'@type':'Organization','name':'Picklary','url':site.url}});
 const doc=`<!doctype html>
 <html lang="${l}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
 <title>${esc(title)} · Picklary</title><meta name="description" content="${esc(description)}">
 <meta name="robots" content="${opts.noindex?'noindex,follow':'index,follow'}">
 <link rel="canonical" href="${canonical}">
 ${['en','ko'].map(x=>`<link rel="alternate" hreflang="${x}" href="${absolute(url(x,rel))}">`).join('')}
 <link rel="alternate" hreflang="x-default" href="${absolute(url('en',rel))}">
 <meta name="google-adsense-account" content="${esc(site.publisherId)}">
 <meta property="og:type" content="${opts.article?'article':'website'}"><meta property="og:title" content="${esc(title)}">
 <meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:site_name" content="Picklary">
 <meta name="picklary-version" content="${site.version}"><meta name="theme-color" content="#123d39"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
 <link rel="stylesheet" href="${css}"><link rel="stylesheet" href="${toolCss}"><script defer src="${js}"></script>${(opts.scripts||[]).map(src=>`<script defer src="${src}"></script>`).join('')}
 <script type="application/ld+json">${JSON.stringify(schemas).replaceAll('<','\\u003c')}</script></head>
 <body class="${/^(dupr-self-check|clip-lite)\//.test(rel)?'interactive-tool-page':''}"><a class="skip-link" href="#main">${T(l,'Skip to content','본문 바로가기')}</a>${header(l,rel)}
 <main id="main">${body}</main>${footer(l)}</body></html>`;
 const dest=path.join(OUT,l,rel,'index.html');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,doc);
 pages.push({path:url(l,rel),title,locale:l,rel,indexable:!opts.noindex});
}
function sectionHead(l,kicker,title,description='',action=''){
 return `<div class="section-heading"><div><p class="eyebrow">${esc(kicker)}</p><h2>${esc(title)}</h2>${description?`<p>${esc(description)}</p>`:''}</div>${action}</div>`;
}
function intro(l,kicker,title,dek,more=''){
 return `<section class="page-intro"><div class="wrap"><p class="eyebrow">${esc(kicker)}</p><h1>${esc(title)}</h1><p class="dek">${esc(dek)}</p>${more}</div></section>`;
}
function guideCard(l,g,i=0){
 return `<article class="guide-card"><a href="${url(l,'learn/'+g.slug+'/')}"><div class="card-top"><span class="eyebrow">${esc(g.level)}</span><span class="card-number">${String(i+1).padStart(2,'0')}</span></div><h3>${esc(text(l,g.title))}</h3><p>${esc(text(l,g.dek))}</p><span class="read-link">${T(l,'Read the guide','가이드 읽기')} <b aria-hidden="true">↗</b></span></a></article>`;
}
function playerLink(l,name){
 const n=name.toLowerCase().replace(/[^a-z ]/g,'');
 const p=players.find(p=>p.name.toLowerCase().replace(/[^a-z ]/g,'')===n);
 return p?`<a href="${url(l,'tour/players/')}#${p.slug}">${esc(name)}</a>`:esc(name);
}
const winnerCount=e=>e.rows.filter(r=>r.winner.length).length;
const pointCount=e=>e.rows.filter(r=>r.games.length).length;
function eventStatus(l,e){
 return e.status==='complete'?T(l,'All 5 finals verified','5개 결승 확인'):
 e.status==='complete-series'?T(l,'Series confirmed','시리즈 확인'):
 e.status==='partial-scores'?T(l,'Champions confirmed · partial scores','우승 확인 · 일부 점수 미확인'):
 T(l,'Partial results','일부 결과 확인');
}
function eventCard(l,e){
 const primary=e.rows.find(r=>r.games.length)||e.rows[0];
 return `<article class="event-card"><div class="card-top">${pill(e.tour)}<span class="small">${D(e.end)}</span></div><h3><a href="${url(l,'tour/results/'+e.slug+'/')}">${esc(text(l,e.title))}</a></h3><p class="event-state">${eventStatus(l,e)}</p><p>${esc(text(l,e.intro))}</p><div class="event-winner"><small>${esc(text(l,divLabels[primary.division]))}</small><strong>${primary.winner.map(n=>esc(n)).join(' / ')}</strong>${primary.games.length?`<span>${primary.games.map(g=>g.join('–')).join(' · ')}</span>`:`<span>${T(l,'Series','시리즈')} ${primary.series?.join('–')||''}</span>`}</div><a class="read-link" href="${url(l,'tour/results/'+e.slug+'/')}">${T(l,'Results inside Picklary','Picklary에서 결과 보기')} ↗</a></article>`;
}
function home(l){
 const b=`<section class="home-hero"><div class="wrap hero-grid"><div class="hero-copy"><p class="eyebrow">PLAY WITH A PLAN</p><h1>${T(l,'Know the<br><em>next shot.</em>','생각하며 치는<br><em>다음 한 샷.</em>')}</h1><p class="hero-dek">${T(l,'Less hype. More useful decisions. Learn a pattern, compare the right gear, and follow the game without losing the details.','과장보다 판단 기준을. 하나의 패턴을 배우고, 내게 맞는 장비를 비교하고, 경기 결과의 맥락까지 읽어 보세요.')}</p><div class="actions">${button(l,'dupr-self-check/','DUPR Self Check','DUPR \uc790\uac00\uc9c4\ub2e8')}${button(l,'clip-lite/','Edit a video','\uc601\uc0c1 \ud3b8\uc9d1','secondary')}${button(l,'vision-rating/','Vision Rating','Vision Rating','secondary')}</div><p class="hero-foot">${T(l,'Independent editorial · English / 한국어','독립 편집 콘텐츠 · 한국어 / English')}</p></div><div class="hero-notebook"><div class="notebook-top"><span>THE COURT-SIDE NOTEBOOK</span><span>01 / 26</span></div><div class="hero-portraits">${photo(l,'ben-johns','portrait',true,false)}${photo(l,'anna-leigh-waters','portrait',true,false)}</div><div class="notebook-copy"><p class="eyebrow">${T(l,'WATCH THE DECISION','판단의 순간을 보세요')}</p><h2>${T(l,'What happens before<br>the highlight?','하이라이트 직전에는<br>무슨 일이 있었을까요?')}</h2><p>${T(l,'Start with contact height, balance and the next recoverable position.','타점의 높이, 균형, 다음 공을 준비할 위치부터 보세요.')}</p><a class="read-link" href="${url(l,'tour/players/')}">${T(l,'Player study notes','선수 관찰 노트')} ↗</a><small>${ref(l,'athlete-ben-johns','Ben Johns')} · ${ref(l,'athlete-anna-leigh-waters','Anna Leigh Waters')}</small></div></div></div></section>

 <section class="tools-launch"><div class="wrap"><div class="grid three">${[
 ['01','dupr-self-check/','DUPR Self Check','DUPR \uc790\uac00\uc9c4\ub2e8','Choose shots on a 3D/2D court. Ten questions, optionally twenty.','3D/2D \ucf54\ud2b8\uc5d0\uc11c \uc0f7\uc744 \uc120\ud0dd\ud569\ub2c8\ub2e4. 10\ubb38\ud56d + \uc120\ud0dd 10\ubb38\ud56d.'],
 ['02','vision-rating/','Vision Rating','Vision Rating','Original local video-analysis workflow. Separate desktop package required.','\uae30\uc874 \ub85c\uceec \uc601\uc0c1 \ubd84\uc11d. \ubcc4\ub3c4 \ub370\uc2a4\ud06c\ud1b1 \ud504\ub85c\uadf8\ub7a8\uc774 \ud544\uc694\ud569\ub2c8\ub2e4.'],
 ['03','clip-lite/','Clip Lite','Clip Lite','Cut rallies and export MP4 or ZIP. Download the local web bundle.','\ub7a0\ub9ac\ub97c \ud3b8\uc9d1\ud558\uace0 MP4/ZIP\uc73c\ub85c \ucd94\ucd9c\ud569\ub2c8\ub2e4. \ub85c\uceec \uc6f9 \ubb36\uc74c\ub3c4 \uc81c\uacf5\ud569\ub2c8\ub2e4.']
 ].map(([n,p,en,ko,d,dk])=>`<article class="restored-card"><span class="tool-number">${n}</span><h2>${T(l,en,ko)}</h2><p>${T(l,d,dk)}</p>${button(l,p,'Open tool','\ub3c4\uad6c \uc5f4\uae30','secondary')}</article>`).join('')}</div></div></section>
 <section class="path-strip"><div class="wrap paths">${[
 ['01','learn/','Learn one pattern','하나의 패턴 배우기','From return to reset.','리턴부터 리셋까지.'],
 ['02','gear/','Choose with a reason','이유가 있는 장비 선택','Photos, sources, comparison prompts.','제품 사진·출처·비교 질문.'],
 ['03','tour/','Follow the context','경기의 맥락 읽기','Scores are only the starting point.','점수는 출발점입니다.']
 ].map(([n,p,en,ko,d,dk])=>`<a href="${url(l,p)}"><span>${n}</span><div><h2>${T(l,en,ko)}</h2><p>${T(l,d,dk)}</p></div><b aria-hidden="true">↗</b></a>`).join('')}</div></section>
 <section class="section"><div class="wrap">${sectionHead(l,'LEARN / PRACTICE',T(l,'Build a more repeatable game.','다시 해도 되는 플레이를 만드세요.'),'',button(l,'learn/','All guides','전체 가이드','text-button'))}<div class="grid three">${guides.slice(1,4).map((g,i)=>guideCard(l,g,i)).join('')}</div></div></section>
 <section class="section tint"><div class="wrap">${sectionHead(l,'TOUR DESK',T(l,'Results with the missing pieces marked.','확인된 결과, 표시된 빈칸.'),T(l,'Checked for the October 4 edition. Unverified finals stay pending—not guessed.','10월 4일 판의 확인 결과입니다. 확인하지 못한 결승은 추정하지 않습니다.'))}<div class="grid three">${events.slice(0,3).map(e=>eventCard(l,e)).join('')}</div></div></section>
 <section class="section"><div class="wrap gear-feature"><div>${photo(l,'franklin-c45','product-feature',false)}${pill(T(l,'MODEL-MATCHED IMAGERY','모델을 대조한 실제 이미지'))}</div><div><p class="eyebrow">GEAR LAB</p><h2>${T(l,'The right question beats<br>another “best” list.','“최고의 패들” 목록보다<br>나에게 필요한 질문.')}</h2><p>${T(l,'Can you reset with it? Does the handle fit? Can you repeat the shot after ten minutes? Our demo checklist gives you a comparison you can actually use.','이 패들로 리셋할 수 있나요? 핸들은 맞나요? 10분 뒤에도 같은 샷을 반복할 수 있나요? 실제로 써 볼 수 있는 비교 기준을 정리했습니다.')}</p><div class="actions">${button(l,'gear/','Explore the lab','장비 연구실 보기')}${button(l,'learn/paddle-demo-checklist/','Paddle demo checklist','패들 시타 체크리스트','secondary')}</div></div></div></section>
 <section class="section dark"><div class="wrap tool-feature"><div><p class="eyebrow">MAKE IT YOURS</p><h2>${T(l,'Turn ten rallies into<br>your next practice.','10개의 랠리로<br>다음 연습을 정하세요.')}</h2><p>${T(l,'Review a local video, mark the phase and write one testable change. No video upload. No invented AI rating.','로컬 영상을 보고 경기 국면을 표시한 뒤 검증할 변화 한 가지를 적으세요. 영상 업로드도, 근거 없는 AI 레이팅도 없습니다.')}</p></div>${button(l,'tools/review/','Open the match worksheet','경기 분석 도구 열기','lime')}</div></section>`;
 page(l,'',T(l,'Play with a plan','생각하며 치는 피클볼'),T(l,'Practical pickleball guides, model-matched gear, sourced tournament results and local review tools.','실전 피클볼 가이드, 정확한 장비 이미지, 출처가 있는 대회 결과와 로컬 경기 분석 도구.'),b);
}
function learn(l){
 page(l,'learn/',T(l,'A practical learning library','실전에 연결하는 피클볼 가이드'),T(l,'Learn a decision, test it on court, and come back with a better question.','경기 중 판단 하나를 배우고 코트에서 확인해 보세요.'),
 intro(l,'LEARN / PRACTICE',T(l,'One decision at a time.','한 번에 하나의 판단.'),T(l,'Start at the situation that keeps breaking down. Each guide ends with a repeatable task, not a promise of a higher rating.','가장 자주 무너지는 상황부터 시작하세요. 모든 가이드는 레이팅 상승 약속 대신 반복 가능한 연습으로 마무리합니다.'))+
 `<section class="section"><div class="wrap"><div class="grid three">${guides.map((g,i)=>guideCard(l,g,i)).join('')}</div></div></section>`);
 for(const g of guides){
 const title=text(l,g.title);
 page(l,'learn/'+g.slug+'/',title,text(l,g.dek),
 `<section class="article-intro"><div class="wrap narrow"><a class="back" href="${url(l,'learn/')}">← ${T(l,'Learning library','실전 가이드')}</a><p class="eyebrow">${esc(g.level)} / PICKLARY NOTE</p><h1>${esc(title)}</h1><p class="dek">${esc(text(l,g.dek))}</p><div class="byline">${T(l,'Picklary editorial · Shawn','Picklary 편집 · Shawn')} <span>${D(g.date)}</span></div></div></section>
 <div class="wrap article-layout"><aside class="article-toc"><h2>${T(l,'In this guide','이 글의 순서')}</h2>${g.sections.map((s,i)=>`<a href="#section-${i+1}">${String(i+1).padStart(2,'0')} ${esc(text(l,s.heading))}</a>`).join('')}<a href="#practice">${T(l,'Take it to the court','코트에서 해 보기')}</a></aside>
 <article class="prose"><div class="takeaway"><span class="eyebrow">${T(l,'TAKE THIS WITH YOU','이것만 기억하세요')}</span><p>${esc(text(l,g.takeaway))}</p></div>
 ${g.sections.map((s,i)=>`<section id="section-${i+1}"><h2>${esc(text(l,s.heading))}</h2>${s.paragraphs.map(p=>`<p>${esc(text(l,p))}</p>`).join('')}</section>`).join('')}
 <section class="practice-card" id="practice"><span class="eyebrow">ON-COURT TASK</span><h2>${T(l,'Try it, then record it.','해 보고, 기록하세요.')}</h2><p>${esc(text(l,g.drill))}</p>${button(l,'tools/review/','Open your worksheet','분석 노트 열기','secondary')}</section>
 <p class="evidence">${esc(text(l,g.basis))}</p>${g.sources.length?refs(l,g.sources):''}</article></div>
 <section class="section"><div class="wrap">${sectionHead(l,'CONTINUE',T(l,'Your next useful read','다음으로 읽기'))}<div class="grid two">${g.related.map(s=>guides.find(x=>x.slug===s)).filter(Boolean).map((x,i)=>guideCard(l,x,i)).join('')}</div></div></section>`,{article:true});
 }
}
const gearNotes={
 paddles:{
 title:{en:'Test the shot you miss.',ko:'실수하는 샷으로 비교하세요.'},
 intro:{en:'Ten identifiable paddle models, grouped by brand. The notes distinguish manufacturer information from a proposed on-court test. No unsourced laboratory ratings, “pro approved” score or current-price promises.',ko:'모델을 구분한 패들 10종을 브랜드별로 정리했습니다. 제조사 정보와 코트에서 해 볼 비교 질문을 구분하며, 출처 없는 실험 점수·프로 인증 점수·현재 가격은 제시하지 않습니다.'},
 checklist:[['Start with resets, not serves.','서브보다 리셋부터 확인하세요.'],['Compare like-for-like grip thickness.','그립 두께를 비슷하게 맞춰 비교하세요.'],['Verify the exact model and event eligibility.','정확한 모델과 대회 사용 가능 여부를 확인하세요.']],
 guide:'paddle-demo-checklist'},
 balls:{
 title:{en:'Match the ball to the session.',ko:'플레이하는 곳의 공부터 확인하세요.'},
 intro:{en:'Four outdoor-ball references from four brands. The club’s actual ball, court surface and condition of the ball are more useful starting points than color or a claim that one model suits every session.',ko:'네 브랜드의 실외공 네 가지입니다. 색상이나 만능 제품이라는 설명보다 실제 클럽 사용 모델, 코트 표면, 공의 상태부터 확인하는 것이 유용합니다.'},
 checklist:[['Ask the club which model it uses.','클럽이 실제 사용하는 모델을 물어보세요.'],['Use the same ball when comparing paddles.','패들 비교에는 같은 공을 사용하세요.'],['Keep damaged balls out of your comparison.','손상된 공은 비교에서 제외하세요.']],
 guide:'first-session-plan'},
 shoes:{
 title:{en:'Fit first. Then footwork.',ko:'핏을 먼저, 움직임은 그다음.'},
 intro:{en:'Court-shoe comparisons from ASICS, Wilson, Babolat and Skechers. The pictured edition is identified. A shoe from the right category still needs a fit check on your own foot; none is a promise to prevent injury.',ko:'ASICS·Wilson·Babolat·Skechers의 코트화를 비교합니다. 사진의 버전을 표시했습니다. 적절한 종류의 신발이어도 내 발에 맞는지 확인해야 하며 부상 방지를 보장하지 않습니다.'},
 checklist:[['Use the socks you actually play in.','실제 경기용 양말을 신고 확인하세요.'],['Check heel hold and side-to-side movement.','뒤꿈치 고정과 신발 안의 측면 움직임을 확인하세요.'],['Read the surface, size and return conditions.','코트 표면·사이즈·반품 조건을 읽어 보세요.']],
 guide:'court-shoe-fit-test'},
 apparel:{
 title:{en:'Move in it before you choose it.',ko:'입고 움직여 본 뒤 고르세요.'},
 intro:{en:'Five garments from Selkirk and JOOLA: tops, a tank, shorts and a skort. Garment photographs replace the old athlete-headshot substitutes. Check current sizing and materials; colorway availability is not guaranteed.',ko:'Selkirk와 JOOLA의 상의·탱크톱·쇼츠·스코트 5종입니다. 과거 선수 얼굴을 의류 사진처럼 쓰던 부분을 실제 의류 이미지로 교체했습니다. 현재 사이즈와 소재를 확인하세요. 색상 재고를 보장하지 않습니다.'},
 checklist:[['Reach overhead without pulling the hem.','밑단을 잡지 않고 팔을 올려 보세요.'],['Check pockets while moving, not standing.','서 있을 때가 아닌 움직일 때의 주머니를 확인하세요.'],['Separate sun-protection claims from fit.','자외선 차단 표기와 핏은 구분해서 확인하세요.']],
 guide:'court-shoe-fit-test'},
 accessories:{
 title:{en:'Small changes. Clear purposes.',ko:'작은 장비에도 분명한 목적을.'},
 intro:{en:'An overgrip, a carrying bag, two identifiable eyewear options and a paddle cleaner. These solve different problems. Start with the problem you have; an expensive accessory is not automatically an upgrade.',ko:'오버그립, 가방, 구분 가능한 보호안경 두 가지와 패들 클리너입니다. 각각 해결하는 문제가 다릅니다. 현재 불편한 점부터 정하고 비싼 액세서리가 무조건 업그레이드라고 생각하지 마세요.'},
 checklist:[['Change one setup variable at a time.','세팅은 한 번에 하나씩 바꾸세요.'],['Check eyewear documentation, not appearance.','보호안경은 외형보다 기준 문서를 확인하세요.'],['Follow your paddle’s own care instructions.','패들 관리에는 해당 제조사의 지침을 따르세요.']],
 guide:'paddle-demo-checklist'}
};
function productCard(l,p){
 return `<article class="product-card" id="${p.id}" data-product data-brand="${esc(p.brand)}" data-search="${esc((p.brand+' '+p.name+' '+p.tag).toLowerCase())}">
 ${photo(l,p.media,'product-photo',false,false)}<div class="product-body"><div class="card-top"><span class="eyebrow">${esc(p.brand)}</span>${pill(p.tag)}</div><h3>${esc(p.name)}</h3>${p.variant?`<p class="variant">${esc(l==='ko'?(p.variantKo||p.variant):p.variant)}</p>`:''}<p>${esc(text(l,p.summary))}</p><details><summary>${T(l,'What to check in person','직접 확인할 질문')}</summary><p>${esc(text(l,p.test))}</p><p class="small">${esc(text(l,p.evidence))}</p></details><div class="product-foot">${ref(l,p.source,T(l,'Product & image source','제품·사진 출처'))}<label class="compare-choice"><input type="checkbox" data-compare="${p.id}" data-name="${esc(p.brand+' '+p.name)}" data-note="${esc(text(l,p.test))}">${T(l,'Compare','비교')}</label></div></div></article>`;
}
function gear(l){
 const featured=['franklin-c45','franklin-x40','wilson-pickle-pro','selkirk-7-inch-shorts','tourna-mega-tac'];
 const cards=Object.entries(catLabels).map(([k,v],i)=>`<a class="category-card" href="${url(l,'gear/'+k+'/')}">${photo(l,featured[i],'category-photo',false,false)}<div><span class="eyebrow">${String(i+1).padStart(2,'0')} / GEAR</span><h2>${esc(text(l,v))}</h2><p>${T(l,'Compare by purpose and brand.','용도와 브랜드로 비교하세요.')}</p><span class="read-link">${products.filter(p=>p.category===k).length} ${T(l,'models','모델')} ↗</span></div></a>`).join('');
 page(l,'gear/',T(l,'Gear Lab','장비 연구실 · Gear Lab'),T(l,'Model-matched product photos, brand-organized options and practical comparison questions.','모델을 대조한 실제 제품 사진, 브랜드별 선택지와 실전 비교 질문.'),
 intro(l,'GEAR / RESEARCH',T(l,'Buy less blindly.','막연하게 고르지 마세요.'),T(l,'A narrower shortlist with better evidence. Browse identifiable products, then test what matters on your court.','근거가 분명한 선택지를 비교하세요. 제품을 정확히 구분한 뒤 내 코트에서 중요한 기준을 확인합니다.'))+
 `<section class="section"><div class="wrap"><div class="category-grid">${cards}</div><div class="callout"><h2>${T(l,'What this lab does—and does not do','장비 연구실의 기준')}</h2><p>${T(l,'Photos are matched to a named product or explicitly described model family. We do not claim to have tested every product, calculate a laboratory spin score or promise current stock. Links are ordinary source links; no affiliate tracking has been added in this edition.','사진을 실제 제품 또는 명확히 설명한 제품군과 연결합니다. 모든 제품을 직접 테스트했다고 주장하거나 실험 스핀 점수를 계산하거나 현재 재고를 약속하지 않습니다. 이 판의 링크에는 제휴 추적 코드를 추가하지 않았습니다.')}</p>${button(l,'learn/paddle-demo-checklist/','Read the demo method','시타 방법 읽기','secondary')}</div></div></section>`);
 for(const k of Object.keys(catLabels)){
 const n=gearNotes[k],list=products.filter(p=>p.category===k),brands=[...new Set(list.map(p=>p.brand))];
 page(l,'gear/'+k+'/',text(l,catLabels[k])+' · Gear Lab',text(l,n.intro),
 intro(l,'GEAR LAB / '+k.toUpperCase(),text(l,n.title),text(l,n.intro),gearNav(l,k))+
 `<section class="section"><div class="wrap"><div class="decision-strip">${n.checklist.map((x,i)=>`<div><span>0${i+1}</span><p>${T(l,...x)}</p></div>`).join('')}</div><div class="filterbar" data-filter-root><label>${T(l,'Find a model','모델 찾기')}<input type="search" data-product-search placeholder="${T(l,'Name or brand','이름 또는 브랜드')}"></label><label>${T(l,'Brand','브랜드')}<select data-brand-filter><option value="">${T(l,'All brands','전체 브랜드')}</option>${brands.map(b=>`<option>${esc(b)}</option>`).join('')}</select></label><p aria-live="polite"><b data-product-count>${list.length}</b> ${T(l,'models','모델')}</p><button class="button secondary" type="button" data-reset-filter>${T(l,'Reset','초기화')}</button></div>
 <div class="product-groups">${brands.map(brand=>`<section class="brand-group" data-brand-group><h2>${esc(brand)} <span>${list.filter(x=>x.brand===brand).length}</span></h2><div class="grid three">${list.filter(x=>x.brand===brand).map(p=>productCard(l,p)).join('')}</div></section>`).join('')}</div>
 <p class="empty-note" data-product-empty hidden>${T(l,'No model matches. Reset the filter to see all products.','일치하는 모델이 없습니다. 필터를 초기화해 전체 제품을 보세요.')}</p>
 <section class="compare-panel" data-compare-panel hidden><h2>${T(l,'Your comparison questions','내 비교 질문')}</h2><div data-compare-content class="grid three"></div><p class="small">${T(l,'Up to three products, compared by what to check—not a paid or laboratory ranking.','최대 3개 제품의 확인 질문을 비교합니다. 유료 순위나 실험 점수가 아닙니다.')}</p></section>
 <div class="callout"><h2>${T(l,'Before you choose','선택하기 전에')}</h2><p>${T(l,'Availability, versions and certification can change. Check the exact product at the source. A useful comparison changes one variable at a time and includes the shots or movements you find difficult.','재고·버전·승인 상태는 바뀔 수 있습니다. 출처에서 정확한 제품을 확인하세요. 비교할 때는 한 번에 한 조건씩 바꾸고 어려운 샷이나 움직임을 반드시 포함하세요.')}</p>${button(l,'learn/'+n.guide+'/','Use the checklist','체크리스트 보기','secondary')}</div></div></section>`);
 }
}
function scoreRow(l,r){
 const label=text(l,divLabels[r.division]);
 if(!r.winner.length) return `<article class="result-row pending"><div class="division">${esc(label)}</div><div><span class="result-label">${T(l,'Verification pending','개별 결과 확인 전')}</span><p>${T(l,'No champion or score is inferred from the draw, seed or schedule.','대진·시드·일정에서 우승자나 점수를 추정하지 않습니다.')}</p></div><span class="small">${T(l,'Not entered','미입력')}</span></article>`;
 const gamesWon=r.games.filter(g=>g[0]>g[1]).length, gamesLost=r.games.length-gamesWon;
 return `<article class="result-row"><div class="division">${esc(label)}<strong>${r.series?`${r.series.join('–')} <small>${T(l,'series','시리즈')}</small>`:r.games.length?`${gamesWon}–${gamesLost} <small>${T(l,'games','게임')}</small>`:''}</strong></div><div class="podium"><div><span class="result-label gold">${T(l,'Champion','우승')}</span><strong>${r.winner.map(n=>playerLink(l,n)).join(' / ')}</strong></div><div><span class="result-label">${T(l,'Runner-up','준우승')}</span><span>${r.runnerUp.map(n=>playerLink(l,n)).join(' / ')}</span></div></div><div class="result-detail">${r.games.length?`<div class="game-scores">${r.games.map((g,i)=>`<span><small>G${i+1}</small><b>${g[0]}–${g[1]}</b></span>`).join('')}</div>`:`<p class="small">${r.series?T(l,'Individual match/game scores not entered.','개별 매치·게임 점수는 미입력입니다.'):T(l,'Game points not verified in this edition.','이 판에서 게임별 점수를 확인하지 못했습니다.')}</p>`}${ref(l,r.source,T(l,'Result source','결과 출처'))}</div></article>`;
}
function tour(l){
 page(l,'tour/',T(l,'Tour Board','투어 보드'),T(l,'Read verified finals, follow event dates and separate official rankings from independent ratings.','확인된 결승 결과와 대회 일정, 공식 랭킹과 독립 레이팅의 차이를 확인하세요.'),
 intro(l,'TOUR BOARD',T(l,'Follow the game.<br>Keep the context.','경기를 보고,<br>맥락을 읽으세요.').replaceAll('<br>',' '),T(l,'Results, dates and player study notes in one place. A visible gap is more useful than a confident guess.','결과, 일정, 선수 관찰 노트를 한곳에서. 자신 있는 추정보다 미확인 표시가 더 유용합니다.'),tourNav(l,'tour/'))+
 `<section class="section"><div class="wrap">${sectionHead(l,'RESULTS / OCTOBER EDITION',T(l,'The results desk','경기 결과 데스크'))}<div class="grid two">${events.map(e=>eventCard(l,e)).join('')}</div></div></section>
 <section class="section tint"><div class="wrap"><div class="grid three">${[
 ['tour/schedule/','Events & schedule','대회 일정','Dates and result availability are separate.','대회 날짜와 결과 확인 여부는 구분합니다.'],
 ['tour/players/','Players to study','관찰할 선수들','Follow a decision, not just a familiar face.','익숙한 얼굴보다 판단의 순간을 보세요.'],
 ['tour/rankings/','Which ranking?','어떤 랭킹인가요?','PPA points and independent Elo are different.','PPA 포인트와 독립 Elo는 다릅니다.']
 ].map(([p,en,ko,d,dk])=>`<a class="link-card" href="${url(l,p)}"><span class="eyebrow">EXPLORE</span><h2>${T(l,en,ko)}</h2><p>${T(l,d,dk)}</p><span>↗</span></a>`).join('')}</div></div></section>`);
 page(l,'tour/results/',T(l,'Tournament results','대회 경기 결과'),T(l,'Champions, finalists and verified game-by-game scores, separated into PPA, MLP and Asia.','PPA·MLP·아시아의 우승, 준우승, 확인된 게임별 점수.'),
 intro(l,'RESULTS / SOURCE-LED',T(l,'Read the score here.','결과는 여기에서 확인하세요.'),T(l,'Four updated event records. Game points are always shown from the champion’s side; series results are labeled separately.','네 대회의 결과를 새로 정리했습니다. 게임별 점수는 우승자 기준이며 시리즈 스코어는 별도로 표시합니다.'),tourNav(l,'tour/results/'))+
 `<section class="section"><div class="wrap"><div class="coverage-note" data-as-of="${site.editorialDate}"><strong>${T(l,'Editorial check','편집 확인')} ${D(site.editorialDate)}</strong><p>${T(l,'Las Vegas: one of five finals verified. Kuala Lumpur: five winners, four score lines. Arizona: all five finals. MLP: championship series only. This is not a live feed.','라스베이거스는 5개 중 1개 결승, 쿠알라룸푸르는 우승 5개·점수 4개, 애리조나는 5개 결승, MLP는 챔피언십 시리즈 결과를 확인했습니다. 실시간 피드가 아닙니다.')}</p><p data-stale-warning hidden></p></div><div class="grid two">${events.map(e=>eventCard(l,e)).join('')}</div></div></section>`);
 for(const e of events) page(l,'tour/results/'+e.slug+'/',text(l,e.title)+' · '+T(l,'Results','경기 결과'),text(l,e.intro),
 intro(l,e.tour+' / FINALS',text(l,e.title),text(l,e.intro),`<div class="meta-line"><span>${D(e.start)} — ${D(e.end)}</span><span>${esc(text(l,e.place))}</span></div>${tourNav(l,'tour/results/')}`)+
 `<section class="section"><div class="wrap"><div class="results-heading">${pill(eventStatus(l,e))}<span>${T(l,'Checked','확인')} ${D(e.checked)}</span></div><p class="small">${T(l,'Games: champion’s points first. “Not verified” does not mean 0–0 or a walkover.','게임별 점수는 우승자 점수가 먼저입니다. “미확인”은 0–0이나 부전승을 의미하지 않습니다.')}</p><div class="result-board">${e.rows.map(r=>scoreRow(l,r)).join('')}</div>
 <div class="two-columns section-inner"><div class="prose"><p class="eyebrow">PICKLARY / READING PROMPT</p><h2>${T(l,'What the score can—and cannot—tell you','점수가 알려 주는 것과 알려 주지 않는 것')}</h2><p>${esc(text(l,e.insight))}</p><p>${T(l,'This is an editorial question based on the published result, not a claim that Picklary reviewed the full match video. Use the score to choose what to watch next; use footage to test the tactical explanation.','공개 결과를 바탕으로 한 관전 질문이며 전체 경기 영상을 직접 분석했다는 뜻은 아닙니다. 점수로 다음 관찰 대상을 정하고, 실제 영상으로 전술 설명이 맞는지 확인하세요.')}</p>${button(l,'learn/'+e.guide+'/','Practice connection','연습으로 연결하기','secondary')}</div>${refs(l,[e.source,...e.rows.map(r=>r.source)])}</div></div></section>`,{article:true});
}
function eventSchedule(l){
 page(l,'tour/schedule/',T(l,'Events & schedule','대회 일정'),T(l,'Upcoming tour dates plus the coverage status of completed events.','다가오는 대회와 완료 대회의 결과 확인 상태.'),
 `<section class="schedule-hero"><div class="wrap"><div class="schedule-hero-grid"><div><p class="eyebrow">EVENTS / SCHEDULE</p><h1>${T(l,'Dates first.<br>Details in place.','일정은 분명하게.<br>내용은 제자리에.')}</h1><p class="dek">${T(l,'Follow the next event by date, then open its verified result record.','대회 일정과 결과 확인 상태를 나누어 보여 줍니다. 다음 대회를 보고 확인된 결과 기록으로 이어 가세요.')}</p><div class="actions">${button(l,'tour/results/','Open result records','경기 결과 열기','lime')}${button(l,'tour/','Tour Board','투어 보드','light')}</div></div><div class="schedule-note"><span class="eyebrow">OCTOBER / NOVEMBER</span><h2>${T(l,'Next on the calendar','다음 대회 일정')}</h2>${schedule.slice(0,2).map(e=>`<div><strong>${esc(e.title)}</strong><span>${D(e.start)} — ${D(e.end)}</span></div>`).join('')}<p class="small">${T(l,'Date/source check','일정·출처 확인')} ${D(site.editorialDate)}</p></div></div><div class="schedule-stats"><div><strong>${events.length}</strong><span>${T(l,'Result records','대회 결과 기록')}</span></div><div><strong>${schedule.length}</strong><span>${T(l,'Upcoming dates in this edition','이 판의 다음 일정')}</span></div><div><strong>3</strong><span>PPA · MLP · ASIA</span></div></div></div></section>`+
 `<div class="wrap">${tourNav(l,'tour/schedule/')}</div><section class="section"><div class="wrap">${sectionHead(l,'UP NEXT',T(l,'Upcoming in this edition','이 판의 다음 일정'),T(l,'Dates are a snapshot. Confirm venue, registration and times with the organizer before planning travel.','일정 스냅샷입니다. 이동이나 참가 계획 전에는 주최 측에서 장소·등록·시간을 확인하세요.'))}<div class="schedule-list">${schedule.map(e=>`<article><time>${D(e.start)}<small>— ${D(e.end)}</small></time><div>${pill(e.tour)}<h2>${esc(e.title)}</h2></div>${ref(l,e.source,T(l,'Organizer','주최 측'))}</article>`).join('')}</div><div class="callout"><h2>${T(l,'A date is not a result','날짜가 지났다고 결과가 확인된 것은 아닙니다')}</h2><p>${T(l,'This calendar is manually reviewed. When an event ends, the site does not automatically declare a champion. Published results require an identifiable source for the named division, opponent and score. A schedule change should update the calendar without silently rewriting an old result.','이 일정은 수동으로 검토합니다. 종료일이 지나도 우승자를 자동으로 확정하지 않습니다. 결과를 게시하려면 종목·상대·스코어를 확인할 출처가 있어야 합니다. 일정 변경과 기존 결과 수정은 별개로 관리합니다.')}</p></div>${refs(l,['ppa-schedule','mlp-schedule'])}</div></section>`);
}
function playersPage(l){
 page(l,'tour/players/',T(l,'Player study notes','선수 관찰 노트'),T(l,'Source-matched photographs and one learning question for each player; junior prospects are labeled separately.','출처를 대조한 선수 사진과 각 선수의 관찰 질문. 주니어 유망주는 별도로 표시합니다.'),
 intro(l,'PLAYERS / OBSERVATION',T(l,'Study the choice,<br>not just the champion.','우승자보다 먼저,<br>선택의 순간을 보세요.').replaceAll('<br>',' '),T(l,'Nineteen professional profiles and one junior-development note. These are viewing prompts, not current ranking claims or claims of personal coaching.', '프로 선수 19명과 주니어 성장 노트 1명입니다. 현재 순위나 직접 코칭했다는 주장이 아니라 경기를 볼 때의 관찰 질문입니다.'),tourNav(l,'tour/players/'))+
 `<section class="section"><div class="wrap"><label class="standalone-search">${T(l,'Find a player','선수 찾기')}<input type="search" data-player-search placeholder="${T(l,'Search by name','이름으로 찾기')}"></label><div class="player-grid">${players.map(p=>`<article class="player-card" id="${p.slug}" data-player="${esc(p.name.toLowerCase())}">${photo(l,p.media,'portrait',false,false)}<div class="player-body"><div class="card-top">${pill(p.country)}${p.kind==='junior'?pill(T(l,'Junior prospect','주니어 유망주'),'junior'):''}</div><h2>${esc(p.name)}</h2><h3>${esc(text(l,p.style))}</h3><p>${esc(text(l,p.watch))}</p><div class="player-links">${ref(l,p.source,T(l,'Profile & photo source','프로필·사진 출처'))}<a href="${url(l,'learn/'+p.lesson+'/')}">${T(l,'Related practice','관련 연습')} ↗</a></div></div></article>`).join('')}</div><p data-player-empty hidden>${T(l,'No matching player.','일치하는 선수가 없습니다.')}</p><p class="evidence">${T(l,'Use the date and the original profile to check changing facts. The editorial viewing prompts are Picklary’s interpretation; player ages, live DUPR and current sponsorships are deliberately not inferred.','변동되는 사실은 출처의 날짜와 원래 프로필에서 확인하세요. 관찰 질문은 Picklary의 해석이며 나이·실시간 DUPR·현재 스폰서를 추정해서 싣지 않았습니다.')}</p></div></section>`);
}
function rankingsPage(l){
 const table=(rows,type)=>`<table class="ranking-table"><thead><tr><th scope="col">#</th><th scope="col">${T(l,'Player','선수')}</th><th scope="col">${type==='elo'?'Elo':T(l,'Points','포인트')}</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.rank}</td><td>${playerLink(l,r.name)}</td><td>${Number(r[type]).toLocaleString('en-US',{maximumFractionDigits:1})}</td></tr>`).join('')}</tbody></table>`;
 page(l,'tour/rankings/',T(l,'Rankings: know the system','랭킹: 기준부터 구분하기'),T(l,'PPA composite world rankings and five independent PickleWave Elo boards, clearly separated.','PPA 종합 세계랭킹과 PickleWave의 5개 독립 Elo 표를 분리해 제공합니다.'),
 intro(l,'RANKINGS / METHOD',T(l,'A number needs a definition.','숫자에는 기준이 필요합니다.'),T(l,'PPA points, an independent Elo model and DUPR are not interchangeable. This page identifies the source before showing the order.','PPA 포인트, 독립 Elo 모델, DUPR는 서로 바꿔 쓸 수 없습니다. 순서보다 출처와 기준을 먼저 표시합니다.'),tourNav(l,'tour/rankings/'))+
 `<section class="section"><div class="wrap">${sectionHead(l,'OFFICIAL PPA / WPR',T(l,'Composite world rankings','종합 세계랭킹'),T(l,'Snapshot of the PPA board checked October 4, 2026. These are individual multi-discipline standings, not fixed doubles-team rankings.','2026년 10월 4일 확인한 PPA 표의 스냅샷입니다. 여러 종목을 합산한 개인 순위이며 고정 복식팀 순위가 아닙니다.'))}
 <div class="method-strip"><div><strong>50%</strong><span>${T(l,'Gender doubles','남·여 복식')}</span></div><div><strong>35%</strong><span>${T(l,'Mixed doubles','혼합복식')}</span></div><div><strong>15%</strong><span>${T(l,'Singles','단식')}</span></div><p>${T(l,'Weighted PPA points over the last 52 weeks.','최근 52주 PPA 포인트의 가중 합산.')} ${ref(l,'ppa-wpr',T(l,'Method & source','기준·출처'))}</p></div>
 <div class="grid two"><section class="ranking-card"><h2>${T(l,'Men / WPR','남자 / WPR')}</h2>${table(rankings.wpr.men,'points')}</section><section class="ranking-card"><h2>${T(l,'Women / WPR','여자 / WPR')}</h2>${table(rankings.wpr.women,'points')}</section></div>
 <div class="callout"><h2>${T(l,'Read the two systems differently','두 체계는 다르게 읽으세요')}</h2><p>${T(l,'Tour points summarize results within a tour’s scoring rules and time window. Elo is a model of results that depends on its input matches and update choices. Neither board measures your personal improvement directly. Use a source-consistent snapshot when comparing players, and do not infer an official seed from the independent board below.','투어 포인트는 해당 투어의 배점과 기간에 따른 성적을 합산합니다. Elo는 입력된 경기와 갱신 방식에 영향을 받는 결과 기반 모델입니다. 둘 다 내 실력 향상을 직접 측정하는 수치는 아닙니다. 선수 비교에는 같은 출처의 같은 시점 자료를 사용하고 아래 독립 표에서 공식 시드를 추정하지 마세요.')}</p></div></div></section>
 <section class="section tint" id="five-disciplines"><div class="wrap wide">${sectionHead(l,'INDEPENDENT MODEL / NOT OFFICIAL PPA',T(l,'Five disciplines. One comparison view.','5개 종목을 한눈에.'),T(l,'PickleWave Elo snapshots. The source labels its page October 5 (UTC-date context); the underlying match-data cutoff is not independently established here. Do not read this as a live or official world-ranking table.','PickleWave Elo 스냅샷입니다. 출처의 페이지 날짜는 10월 5일로 표시되며 원경기 데이터의 마감 시점은 독립적으로 확인되지 않았습니다. 실시간 또는 공식 세계랭킹으로 읽지 마세요.'))}
 <div class="ranking-five">${rankings.disciplines.map(c=>`<section class="ranking-card" id="${c.division.toLowerCase()}"><span class="eyebrow">PICKLEWAVE ELO</span><h2>${esc(text(l,divLabels[c.division]))}</h2>${table(c.items,'elo')}${ref(l,c.source,T(l,'Source snapshot','출처 스냅샷'))}</section>`).join('')}</div><p class="evidence">${T(l,'Doubles rows rank individuals, not partnerships. Mixed doubles is the provider’s combined individual list. Equal displayed Elo numbers retain the order shown by the provider; Picklary does not invent a tie-break.','복식의 행은 조합이 아닌 개인 순위입니다. 혼복은 제공자의 남녀 통합 개인 목록입니다. 표시 Elo가 같은 경우에도 출처에 보이는 순서를 유지하며 자체 타이브레이크를 만들지 않습니다.')}</p></div></section>`);
}
function tools(l){
 const body=intro(l,'PICKLARY / ALL TOOLS',T(l,'Choose a tool for the job.','\ud544\uc694\ud55c \ub3c4\uad6c\ub97c \uc120\ud0dd\ud558\uc138\uc694.'),T(l,'The court-based self-check, video editing and desktop analysis entry points are restored. Worksheets remain supplementary.','\ucf54\ud2b8\ud615 \uc790\uac00\uc9c4\ub2e8, \uc601\uc0c1 \ud3b8\uc9d1, \ub370\uc2a4\ud06c\ud1b1 \ubd84\uc11d \uc9c4\uc785 \uacbd\ub85c\ub97c \ubcf5\uc6d0\ud588\uc2b5\ub2c8\ub2e4. \ub178\ud2b8\ub294 \ubcf4\uc870 \uae30\ub2a5\uc73c\ub85c \uc720\uc9c0\ud569\ub2c8\ub2e4.'))+
 `<section class="section"><div class="wrap"><div class="grid three">${[
 ['dupr-self-check/','DUPR Self Check','DUPR \uc790\uac00\uc9c4\ub2e8'],['vision-rating/','Vision Rating (local desktop)','Vision Rating (\ub85c\uceec \ub370\uc2a4\ud06c\ud1b1)'],['clip-lite/','Clip Lite video editor','Clip Lite \uc601\uc0c1 \ud3b8\uc9d1\uae30'],['downloads/','Program downloads','\ud504\ub85c\uadf8\ub7a8 \ub2e4\uc6b4\ub85c\ub4dc'],['tools/self-check/','Supplement: practice priorities','\ubcf4\uc870: \uc5f0\uc2b5 \uc6b0\uc120\uc21c\uc704'],['tools/review/','Supplement: match notes','\ubcf4\uc870: \uacbd\uae30 \ubd84\uc11d \ub178\ud2b8']
 ].map(([rel,en,ko],i)=>`<article class="restored-card"><span class="tool-number">0${i+1}</span><h2>${T(l,en,ko)}</h2>${button(l,rel,'Open','\uc5f4\uae30','secondary')}</article>`).join('')}</div></div></section>`;
 page(l,'tools/',T(l,'All Picklary tools','Picklary \ub3c4\uad6c \uc804\uccb4'),T(l,'Self-check, video editing, local analysis setup, downloads and supplementary notes.','\uc790\uac00\uc9c4\ub2e8, \uc601\uc0c1 \ud3b8\uc9d1, \ub85c\uceec \ubd84\uc11d \uc548\ub0b4, \ub2e4\uc6b4\ub85c\ub4dc\uc640 \ubcf4\uc870 \ub178\ud2b8.'),body);
 const questions=[
 ['Serve and return','서브·리턴','Can you begin a rally without rushing the contact?','급하게 타구하지 않고 랠리를 시작할 수 있나요?','return-depth-and-recovery'],
 ['Third shot','3구','Can you choose drive or drop from contact height and balance?','타점과 균형을 기준으로 드라이브·드롭을 선택하나요?','third-shot-drive-or-drop'],
 ['Transition','전환 구역','Can you stop and reset instead of running through the hit?','뛰면서 치기보다 멈추고 리셋할 수 있나요?','transition-reset-footwork'],
 ['Dinking','딩크','Can you keep a neutral ball low without forcing an attack?','공격을 억지로 만들지 않고 중립구를 낮게 유지하나요?','purposeful-dinking'],
 ['Recovery','회복','Can you recover with your partner before the opponent hits?','상대 타구 전에 파트너와 함께 준비 위치를 잡나요?','first-session-plan'],
 ['Review','경기 검토','Can you describe the decision before an error, not just the error itself?','실수만이 아니라 실수 직전의 판단을 설명할 수 있나요?','match-review-worksheet']
 ];
 page(l,'tools/self-check/',T(l,'Practice priority check','연습 우선순위 점검'),T(l,'Six questions to choose what to practise next. Not an official rating.','다음 연습을 고르는 여섯 질문. 공식 레이팅이 아닙니다.'),
 intro(l,'SELF-CHECK / NOT A RATING',T(l,'Where does your pattern break?','어디에서 흐름이 끊기나요?'),T(l,'Think about your last few games, not your single best rally. “Not observed” is a useful answer.','가장 잘한 랠리 한 번이 아닌 최근 몇 게임을 생각하세요. “관찰하지 못함”도 유용한 답입니다.'))+
 `<section class="section"><div class="wrap narrow"><form id="self-check">${questions.map((q,i)=>`<fieldset data-guide="${q[4]}"><legend><span>0${i+1}</span>${T(l,q[2],q[3])}</legend>${[[0,'Not yet','아직 어려움'],[1,'Sometimes','가끔 가능'],[2,'Usually','대체로 가능'],['na','Not observed','관찰하지 못함']].map(([v,en,ko])=>`<label class="radio-option"><input type="radio" name="q${i}" value="${v}" required>${T(l,en,ko)}</label>`).join('')}</fieldset>`).join('')}<button class="button" type="submit">${T(l,'Choose my practice focus','연습 주제 확인')}</button></form><section class="tool-output" id="self-check-output" aria-live="polite" hidden></section><p class="evidence">${T(l,'This is a self-reported learning aid, not a DUPR calculation, selection test or coaching diagnosis. No answers are transmitted or automatically saved.','자가 보고형 학습 도구이며 DUPR 계산·선발 시험·코칭 진단이 아닙니다. 응답은 전송되거나 자동 저장되지 않습니다.')}</p></div></section>`,{noindex:true});
 page(l,'tools/review/',T(l,'Ten-rally video worksheet','10개 랠리 영상 분석 노트'),T(l,'Review a local video and export your own decisions as CSV or JSON, without uploading the video.','영상 업로드 없이 로컬 영상을 확인하고 판단 기록을 CSV·JSON으로 내보내세요.'),
 intro(l,'REVIEW / LOCAL VIDEO',T(l,'Make the error explainable.','실수의 이유를 설명해 보세요.'),T(l,'Look at the decision before the miss. Add ten consecutive rallies—not only the highlights. Notes can be saved in this browser or exported; source video is never included in exports.','실수 직전의 판단을 보세요. 하이라이트만 고르지 말고 연속된 10개 랠리를 기록하세요. 노트만 브라우저에 저장하거나 내보내며 원본 영상은 내보내기에 포함되지 않습니다.'))+
 `<section class="section"><div class="wrap"><div class="review-layout"><div class="video-workspace"><label class="file-picker">${T(l,'Choose a video from your device','기기에서 영상 선택')}<input id="review-file" type="file" accept="video/*"></label><video id="review-video" controls playsinline preload="metadata"></video><p class="small">${T(l,'Browser-supported files only. If playback fails, no file is uploaded; convert a copy with a trusted editor.','브라우저에서 지원하는 파일만 재생됩니다. 재생되지 않아도 업로드하지 않으며 신뢰할 수 있는 편집기로 복사본을 변환하세요.')}</p><div class="actions"><button class="button secondary" type="button" data-video-seek="-3">−3s</button><button class="button secondary" type="button" id="capture-time">${T(l,'Use current time','현재 시점 기록')}</button><button class="button secondary" type="button" data-video-seek="3">+3s</button></div><p id="video-message" role="status"></p></div>
 <form id="review-form" class="review-form"><h2>${T(l,'Log a decision','판단 기록하기')}</h2><label>${T(l,'Time (seconds)','시점 (초)')}<input id="review-time" type="number" min="0" step="0.1" value="0" required></label><label>${T(l,'Phase','경기 국면')}<select id="review-phase">${[
 ['serve','Serve / return','서브·리턴'],['third','Third shot','3구'],['transition','Transition','전환 구역'],['kitchen','Kitchen','키친'],['finish','Finish / defence','마무리·수비']
 ].map(([v,en,ko])=>`<option value="${v}">${T(l,en,ko)}</option>`).join('')}</select></label><label>${T(l,'What happened before the miss?','실수 직전 어떤 일이 있었나요?')}<textarea id="review-note" rows="3" maxlength="600" required></textarea></label><label>${T(l,'One change to test','검증할 변화 한 가지')}<input id="review-change" maxlength="240" required></label><button class="button" type="submit">${T(l,'Add rally','랠리 추가')}</button></form></div>
 <section class="worksheet"><div class="section-heading"><div><p class="eyebrow">YOUR WORKSHEET</p><h2><span id="rally-count">0</span> ${T(l,'rallies recorded','개 랠리 기록')}</h2></div><div class="actions small-actions"><button class="button secondary" id="save-notes" type="button">${T(l,'Save here','이 기기에 저장')}</button><button class="button secondary" id="load-notes" type="button">${T(l,'Load','불러오기')}</button><button class="button secondary" id="export-csv" type="button">CSV ↓</button><button class="button secondary" id="export-json" type="button">JSON ↓</button><button class="button secondary danger" id="clear-notes" type="button">${T(l,'Delete all','모두 삭제')}</button></div></div><p id="notes-status" role="status"></p><div id="rally-list"></div></section>
 <div class="callout"><h2>${T(l,'From observation to a test','관찰을 연습으로 바꾸기')}</h2><p>${T(l,'A note such as “bad drop” is an outcome. “Hit while still moving forward; test a stop before contact” identifies a condition you can change. Count repeated conditions across your notes before choosing the next drill.','“드롭 실패”는 결과입니다. “계속 전진하면서 타구함; 타구 전 멈추기 실험”은 바꿀 수 있는 조건을 드러냅니다. 반복되는 조건을 먼저 세어 본 뒤 다음 드릴을 정하세요.')}</p>${button(l,'learn/match-review-worksheet/','Read the review method','분석 방법 읽기','secondary')}</div></div></section>`,{noindex:true});
}

function policyPages(l){
 const policies=read('policies');
 for(const [slug,p] of Object.entries(policies)){
 let extra='';
 if(slug==='contact')extra=`<div class="contact-card"><span class="eyebrow">EDITORIAL CONTACT</span><a href="mailto:${esc(site.email)}">${esc(site.email)}</a><p>${T(l,'Include a page link and a specific correction.','페이지 링크와 구체적인 수정 사항을 포함해 주세요.')}</p></div>`;
 if(slug==='about')extra=`<div class="actions">${button(l,'learn/','Read the learning library','실전 가이드 읽기')}${button(l,'editorial-policy/','Editorial method','편집 원칙','secondary')}</div>`;
 page(l,slug+'/',text(l,p.title),text(l,p.dek),intro(l,'PICKLARY / '+slug.toUpperCase(),text(l,p.title),text(l,p.dek))+
 `<section class="section"><div class="wrap narrow prose">${extra}${p.sections.map(s=>`<section><h2>${esc(text(l,s.heading))}</h2>${s.paragraphs.map(x=>`<p>${esc(text(l,x))}</p>`).join('')}</section>`).join('')}${slug==='privacy'?refs(l,['adsense-verify','adsense-cmp']):''}</div></section>`);
 }
 const ids=Object.keys(media);
 page(l,'media/',T(l,'Image credits','이미지 출처'),T(l,'The named subject, original source and rights status of editorial images.','편집 이미지의 대상, 원출처, 권리 확인 상태.'),
 intro(l,'MEDIA / ATTRIBUTION',T(l,'Every picture needs the right name.','모든 사진에는 맞는 이름이 필요합니다.'),T(l,'These credits identify the source, not a transfer of copyright or a permission to reuse. Contact the editor about an incorrect mapping or a rights request.','이 목록은 출처를 표시하며 저작권 이전이나 재사용 허가를 의미하지 않습니다. 잘못된 연결이나 권리 요청은 편집자에게 알려 주세요.'))+
 `<section class="section"><div class="wrap"><div class="callout"><h2>${T(l,'Photo handling','사진 관리')}</h2><p>${T(l,'Images are linked to an official profile or product source. Some source-provided files are included locally; others are requested from the source CDN. We do not use a different person or product as a fallback. Rights remain with the original rights holders.','이미지는 공식 프로필 또는 제품 출처와 연결합니다. 일부 제공 파일은 로컬로 포함되어 있고 나머지는 원출처 CDN에서 불러옵니다. 다른 인물이나 제품의 사진을 대체 이미지로 쓰지 않습니다. 권리는 원권리자에게 있습니다.')}</p></div><div class="credit-list">${ids.map(id=>`<article><strong>${esc(media[id].subject)}</strong><span>${ref(l,media[id].source,T(l,'Original source','원출처'))}</span><span class="small">${T(l,'Checked','확인')} ${D(media[id].checked)}</span></article>`).join('')}</div></div></section>`,{noindex:true});
}
for(const l of site.locales){home(l);learn(l);gear(l);tour(l);eventSchedule(l);playersPage(l);rankingsPage(l);tools(l);policyPages(l);}
const restoredReleaseState=restoredTools({ROOT,OUT,page,intro,T,esc,url,button,site,toolCss,selfJs,clipJs});
packageTools(ROOT,OUT,site);
for(const l of site.locales){
 const rows=pages.filter(p=>p.locale===l&&p.indexable);
 page(l,'sitemap/',T(l,'Site map','사이트맵'),T(l,'Find a guide, gear category, result or policy page.','가이드, 장비 종류, 경기 결과, 운영 안내를 찾으세요.'),
 intro(l,'DIRECTORY',T(l,'Find your next page.','다음 페이지 찾기.'),T(l,'A direct index of the editorial website.','편집 콘텐츠의 전체 목록입니다.'))+
 `<section class="section"><div class="wrap"><div class="sitemap-list">${rows.map(p=>`<a href="${p.path}">${esc(p.title)} ↗</a>`).join('')}</div></div></section>`,{noindex:true});
}
const indexable=pages.filter(p=>p.indexable);
const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+
 indexable.map(p=>`<url><loc>${absolute(p.path)}</loc><lastmod>${site.editorialDate}</lastmod>${site.locales.map(l=>`<xhtml:link rel="alternate" hreflang="${l}" href="${absolute(url(l,p.rel))}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${absolute(url('en',p.rel))}"/></url>`).join('\n')+'\n</urlset>\n';
fs.writeFileSync(path.join(OUT,'sitemap.xml'),sitemap);
fs.writeFileSync(path.join(OUT,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /data/\nSitemap: ${site.url}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT,'ads.txt'),`google.com, ${site.publisherId.replace('ca-','')}, DIRECT, f08c47fec0942fa0\n`);
const simple=(title,body)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>${title} · Picklary</title><link rel="icon" href="/assets/favicon.svg"><link rel="stylesheet" href="${css}"></head><body><main class="error-page"><a class="brand" href="/en/">Picklary●</a><h1>${title}</h1>${body}<div class="actions"><a class="button" href="/en/">English</a><a class="button secondary" href="/ko/">한국어</a></div></main></body></html>`;
fs.writeFileSync(path.join(OUT,'index.html'),simple('Picklary','<p>Choose your language. On the main site, the root address redirects to English.</p>'));
fs.writeFileSync(path.join(OUT,'404.html'),simple('Page not found','<p>This page is not part of the current editorial edition. Find the new learning library, gear research and tour results from the home page.</p><p>현재 판에서 제공하지 않는 페이지입니다. 홈에서 새 가이드·장비·경기 결과를 찾아보세요.</p>'));
const redirects=read('redirects');
fs.writeFileSync(path.join(OUT,'_redirects'),`# No SPA catch-all. Unknown paths use 404.html, not a soft-404 homepage.\n/ /en/ 301!\n`+
 redirects.map(r=>`${r.from} ${r.to} ${r.status||301}`).join('\n')+
 '\n# Old store URLs have no replacement commerce content.\n/cart/* /404.html 404\n/checkout/* /404.html 404\n/wp-admin/* /404.html 404\n');
fs.writeFileSync(path.join(OUT,'_headers'),`/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Cache-Control: public, max-age=0, must-revalidate\n/assets/css/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/js/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/tools/*\n  Cache-Control: public, max-age=0, must-revalidate\n/assets/vendor/*\n  Cache-Control: public, max-age=86400\n/downloads/*\n  Cache-Control: public, max-age=0, must-revalidate\n/assets/media/*\n  Cache-Control: public, max-age=86400\n/ads.txt\n  Cache-Control: public, max-age=3600\n/robots.txt\n  Cache-Control: public, max-age=3600\n/sitemap.xml\n  Cache-Control: public, max-age=3600\n`);
fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'test-results','build-manifest.json'),JSON.stringify({version:site.version,editorialDate:site.editorialDate,css,js,toolCss,selfJs,clipJs,desktopReleases:restoredReleaseState,pages},null,2));
console.log(`Built Picklary ${site.version}: ${pages.length+2} HTML files; ${indexable.length} indexable URLs. Ad serving: OFF.`);
