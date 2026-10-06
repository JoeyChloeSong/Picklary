/** Offline, dependency-free release checks. They do not certify AdSense approval,
 *  image licences, remote availability, or editorial factual truth. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'), DIST=path.join(ROOT,'dist');
const read=n=>JSON.parse(fs.readFileSync(path.join(ROOT,'data',n+'.json'),'utf8'));
const site=read('site'), products=read('products'), players=read('players'), media=read('media'),
 sources=read('sources'), guides=read('guides'), results=read('results'), rankings=read('rankings'), redirects=read('redirects');
const errors=[], warnings=[];
const check=(v,s)=>{if(!v)errors.push(s)};
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(d,x.name)):[path.join(d,x.name)]);
if(!fs.existsSync(DIST))throw new Error('Build first: npm run build');
const all=walk(DIST), htmls=all.filter(x=>x.endsWith('.html')), docs=new Map();
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
for(const file of htmls)docs.set(file,fs.readFileSync(file,'utf8'));
const resolveTarget=(raw,from)=>{
 const u=new URL(decode(raw),site.url+from);
 if(u.origin!==site.url)return null;
 let p;try{p=decodeURIComponent(u.pathname)}catch{return {bad:true,raw}};
 const target=path.resolve(DIST,'.'+p);
 if(target!==DIST&&!target.startsWith(DIST+path.sep))return {bad:true,raw};
 const f=fs.existsSync(target)&&fs.statSync(target).isDirectory()?path.join(target,'index.html'):target;
 return {file:f,fragment:decodeURIComponent(u.hash.slice(1)),raw};
};
let refs=0,jsonld=0,indexed=0;
const canonicals=new Set(),titles=new Set();
for(const [file,html] of docs){
 const rel='/'+path.relative(DIST,file).split(path.sep).join('/');
 const loc=rel.replace(/index\.html$/,'');
 check(!/\/undefined\/|href=["']#["']/.test(html),'Undefined/empty destination: '+rel);
 check((html.match(/<h1(?:\s|>)/g)||[]).length===1,'Expected one H1: '+rel);
 check(!/pagead2\.googlesyndication|adsbygoogle\.js/.test(html),'Ad-serving script must remain OFF: '+rel);
 check(!/<iframe|data-netlify|netlify-honeypot/.test(html),'Unexpected third-party embed or server form: '+rel);
 if(rel!=='/index.html'&&rel!=='/404.html'){
  const c=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  check(c===site.url+loc,'Wrong canonical: '+rel);
  check(!canonicals.has(c),'Duplicate canonical: '+rel);canonicals.add(c);
  const title=html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  check(title&&!titles.has(title),'Missing/duplicate title: '+rel);titles.add(title);
  const desc=html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  check(desc&&desc.length>=25,'Missing/short description: '+rel);
  for(const l of ['en','ko','x-default'])check(html.includes(`hreflang="${l}"`),'Missing hreflang '+l+': '+rel);
  check(html.includes(site.publisherId),'Missing ownership meta: '+rel);
  if(!/content="noindex/.test(html))indexed++;
 }
 for(const b of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
  try{JSON.parse(b[1]);jsonld++}catch{errors.push('Invalid JSON-LD: '+rel)}
 }
 for(const a of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
  if(/^(?:mailto:|tel:|blob:|data:)/.test(a[1]))continue;
  const target=resolveTarget(a[1],loc);if(!target)continue;refs++;
  check(!target.bad&&fs.existsSync(target.file),'Broken reference '+rel+' -> '+a[1]);
  if(!target.bad&&target.fragment&&docs.has(target.file)){
   const body=docs.get(target.file);
   check(body.includes(`id="${target.fragment}"`),'Missing fragment '+rel+' -> '+a[1]);
  }
 }
}
const sitemap=fs.readFileSync(path.join(DIST,'sitemap.xml'),'utf8');
const sm=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
check(new Set(sm).size===sm.length,'Duplicate sitemap URLs');
check(sm.length===indexed,'Sitemap/indexable count differs');
for(const u of sm){
 const t=resolveTarget(u,'/');
 check(t&&docs.has(t.file),'Sitemap target absent: '+u);
 if(t&&docs.has(t.file))check(!/content="noindex/.test(docs.get(t.file)),'Noindex in sitemap: '+u);
}
for(const [file,html] of docs)if(!/content="noindex/.test(html)){
 const c=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
 check(sm.includes(c),'Indexable page not in sitemap: '+c);
}
for(const key of ['data','legacy','admin','scripts','node_modules','.github'])check(!fs.existsSync(path.join(DIST,key)),'Private/source folder published: '+key);
check(fs.readFileSync(path.join(DIST,'ads.txt'),'utf8').trim()===`google.com, ${site.publisherId.replace('ca-','')}, DIRECT, f08c47fec0942fa0`,'ads.txt mismatch');
check(!/^\/\*\s+.*\s+200/m.test(fs.readFileSync(path.join(DIST,'_redirects'),'utf8')),'SPA catch-all soft 404');
const uniq=(list,key,label)=>check(new Set(list.map(x=>x[key])).size===list.length,'Duplicate '+label);
uniq(products,'id','product');uniq(players,'slug','player');uniq(guides,'slug','guide');uniq(results,'slug','event');uniq(redirects,'from','redirect');
for(const p of products){
 check(media[p.media]?.kind==='product','Product lacks subject media: '+p.id);
 check(sources[p.source],'Unknown product source: '+p.id);
 check(p.summary.en&&p.summary.ko&&p.test.en&&p.test.ko,'Missing product translation: '+p.id);
}
for(const p of players){
 check(media[p.media]?.subject===p.name,'Player/media identity label mismatch: '+p.slug);
 check(sources[p.source],'Unknown player source: '+p.slug);
 check(guides.some(g=>g.slug===p.lesson),'Missing player lesson: '+p.slug);
}
const cacheFile=path.join(ROOT,'data/media-cache.json');
const mediaCache=fs.existsSync(cacheFile)?JSON.parse(fs.readFileSync(cacheFile,'utf8')):{};
const hashes=new Map();let local=0,remote=0;
for(const [id,m] of Object.entries(media)){
 check(sources[m.source],'Unknown media source: '+id);
 check((m.local&&!m.url)||/^https:\/\//.test(m.url),'Missing or non-HTTPS image source: '+id);
 check(m.subject&&m.checked&&m.rights,'Incomplete media record: '+id);
 const localPath=mediaCache[id]?.path||m.local;
 if(localPath){
  const f=path.join(DIST,localPath);check(fs.existsSync(f),'Local media missing '+id);
  if(fs.existsSync(f)){
   local++;const h=crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
   check(!hashes.has(h),'Duplicate local media hash across subjects: '+id+' / '+hashes.get(h));hashes.set(h,id);
  }
 }else remote++;
}
for(const g of guides){
 check(g.title.en&&g.title.ko&&g.sections.length>=3,'Incomplete bilingual guide '+g.slug);
 for(const s of g.sources)check(sources[s],'Unknown guide source '+s);
 for(const x of g.related)check(guides.some(t=>t.slug===x),'Unknown related guide '+x);
}
let confirmedRows=0,pendingRows=0,unscoredRows=0;
for(const event of results){
 check(sources[event.source],'Unknown event source '+event.slug);
 uniq(event.rows,'division','event division '+event.slug);
 for(const r of event.rows){
  if(r.status==='pending'){
   pendingRows++;check(!r.winner.length&&!r.runnerUp.length&&!r.games.length&&!r.series,'Invented pending values '+event.slug);
   continue;
  }
  confirmedRows++;check(r.winner.length&&r.runnerUp.length&&sources[r.source],'Unattributed result '+event.slug);
  if(!r.games.length&&!r.series)unscoredRows++;
  for(const game of r.games){
   check(game.length===2&&game.every(x=>Number.isInteger(x)&&x>=0),'Invalid game '+event.slug);
   check(Math.max(...game)>=11&&Math.abs(game[0]-game[1])>=2,'Invalid final game score '+event.slug);
  }
  if(r.games.length)check(r.games.filter(g=>g[0]>g[1]).length>r.games.filter(g=>g[0]<g[1]).length,'Wrong winner orientation '+event.slug);
  if(r.series)check(r.division==='TEAM'&&!r.games.length,'Series conflated with games '+event.slug);
 }
}
for(const r of redirects){
 check([301,302].includes(r.status),'Invalid migration status '+r.from);
 const t=resolveTarget(r.to,'/');
 check(t&&!t.bad&&fs.existsSync(t.file),'Broken redirect target '+r.from+' -> '+r.to);
 check(!redirects.some(x=>x.from===r.to),'Redirect chain '+r.from);
 if(t?.fragment&&docs.has(t.file))check(docs.get(t.file).includes(`id="${t.fragment}"`),'Missing redirect anchor '+r.to);
}
warnings.push(`${remote} of ${Object.keys(media).length} named images use remote sources unless media caching is run; offline checks cannot certify their availability.`);
warnings.push('Image reuse rights are not documented. Review THIRD_PARTY_NOTICES.md and docs/MEDIA_RIGHTS_CHECKLIST.csv before publication/monetization.');
warnings.push('Exact Google rejection notice was not available. Technical tests are not an AdSense approval decision.');
warnings.push(`${pendingRows} division finals pending; ${unscoredRows} confirmed podium without game scores. Do not invent missing values.`);
warnings.push('Self-check and browser editor restored. Desktop Vision and Windows binaries are absent until operator-supplied releases are registered. Browser encoding needs an additional engine download and production smoke test.');
const releaseState=JSON.parse(fs.readFileSync(path.join(ROOT,'test-results/build-manifest.json'))).desktopReleases||[];
const report={desktopPackagesAvailable:releaseState.filter(r=>r.available).length,desktopPackagesPending:releaseState.filter(r=>!r.available).length,version:site.version,editorialDate:site.editorialDate,technicalStatus:errors.length?'FAIL':'PASS',
 htmlFiles:htmls.length,sitemapUrls:sm.length,internalReferences:refs,jsonldBlocks:jsonld,
 guides:guides.length,products:products.length,players:players.length,mediaRecords:Object.keys(media).length,localMedia:local,remoteMedia:remote,
 eventRecords:results.length,confirmedResultRows:confirmedRows,pendingResultRows:pendingRows,confirmedPodiumsWithoutScores:unscoredRows,
 exactMigrationRedirects:redirects.length,adServing:false,errors,warnings};
fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'test-results','audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1;
