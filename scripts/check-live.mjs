/** Explicit post-deploy check. Never writes to the website. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=new URL(process.argv[2]||'https://picklary.com');
if(!['https:','http:'].includes(base.protocol))throw new Error('Expected a website URL.');
const site=JSON.parse(fs.readFileSync(path.join(ROOT,'data/site.json'),'utf8'));
const versionTag=`name="picklary-version" content="${site.version}"`;
const media=JSON.parse(fs.readFileSync(path.join(ROOT,'data/media.json'),'utf8'));
const cachePath=path.join(ROOT,'data/media-cache.json');
const cache=fs.existsSync(cachePath)?JSON.parse(fs.readFileSync(cachePath,'utf8')):{};
const checks=[],tasks=[
 ['/',301,''],['/en/',200,versionTag],['/ko/',200,versionTag],
 ['/en/gear/',200,versionTag],['/en/tour/results/',200,versionTag],
 ['/en/tour/schedule/',200,versionTag],['/en/tour/players/',200,versionTag],
 ['/en/privacy/',200,versionTag],['/ads.txt',200,'pub-3524565373895748'],
 ['/robots.txt',200,'Sitemap:'],['/sitemap.xml',200,'urlset'],
 ['/this-page-must-not-exist-release-check/',404,'Page not found']
];
for(const [rel,status,needle] of tasks){
 try{
  const r=await fetch(new URL(rel,base),{redirect:'manual',signal:AbortSignal.timeout(15000)});
  const body=await r.text();checks.push({url:rel,status:r.status,expected:status,ok:r.status===status&&(!needle||body.includes(needle))});
 }catch(e){checks.push({url:rel,ok:false,error:e.message})}
}
if(process.argv.includes('--images')){
 const queue=Object.entries(media);
 await Promise.all(Array.from({length:3},async()=>{while(queue.length){
  const [id,m]=queue.shift();const src=cache[id]?.path||m.local||m.url;
  try{
   const r=await fetch(new URL(src,base),{signal:AbortSignal.timeout(15000),headers:{Accept:'image/*'}});
   checks.push({image:id,status:r.status,type:r.headers.get('content-type'),ok:r.ok&&String(r.headers.get('content-type')).startsWith('image/')});
   if(r.body)await r.body.cancel();
  }catch(e){checks.push({image:id,ok:false,error:e.message})}
 }}));
}
fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
const result={base:base.href,checkedAt:new Date().toISOString(),ok:checks.every(x=>x.ok),checks};
fs.writeFileSync(path.join(ROOT,'test-results/live-check.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));if(!result.ok)process.exitCode=1;
