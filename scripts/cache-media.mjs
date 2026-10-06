/**
 * Optional, network-enabled media packaging helper.
 * Does not grant or infer rights from public availability.
 * Usage: npm run media:cache -- --rights-reviewed
 * Afterward commit BOTH public/assets/media and data/media-cache.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
if(!process.argv.includes('--rights-reviewed')){
 console.error('Stop: review THIRD_PARTY_NOTICES.md and the media rights checklist first. Confirm operator review with --rights-reviewed.');
 process.exit(2);
}
const media=JSON.parse(fs.readFileSync(path.join(ROOT,'data/media.json'),'utf8'));
const file=path.join(ROOT,'data/media-cache.json');
const cache=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
const failures=[],log=[];
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const kind=b=>{
 if(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'png';
 if(b[0]===255&&b[1]===216&&b[2]===255)return 'jpg';
 if(b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP')return 'webp';
 if(b.toString('ascii',0,3)==='GIF')return 'gif';
 return null;
};
async function run(id,m){
 try{
  if(m.local&&fs.existsSync(path.join(ROOT,'public',m.local))){log.push({id,status:'existing-local'});return}
  if(!m.url||new URL(m.url).protocol!=='https:')throw new Error('Missing HTTPS source');
  const response=await fetch(m.url,{signal:AbortSignal.timeout(20000),redirect:'follow',
   headers:{'User-Agent':'PicklaryMediaCache/1.0 (source-attributed site assets)','Accept':'image/webp,image/png,image/jpeg,image/gif'}});
  if(!response.ok)throw new Error('HTTP '+response.status);
  if(!String(response.headers.get('content-type')).startsWith('image/'))throw new Error('Non-image response');
  const cap=8*1024*1024;
  if(Number(response.headers.get('content-length'))>cap)throw new Error('Image exceeds 8 MiB');
  const chunks=[];let count=0;
  for await(const chunk of response.body){count+=chunk.length;if(count>cap)throw new Error('Image exceeds 8 MiB');chunks.push(Buffer.from(chunk))}
  const bytes=Buffer.concat(chunks),ext=kind(bytes);
  if(!ext)throw new Error('Unsupported/invalid image bytes (HTML, SVG and unknown formats rejected)');
  const sum=digest(bytes),dest=`/assets/media/${id}.${sum.slice(0,12)}.${ext}`;
  fs.mkdirSync(path.dirname(path.join(ROOT,'public',dest)),{recursive:true});
  fs.writeFileSync(path.join(ROOT,'public',dest),bytes);
  cache[id]={path:dest,sha256:sum,bytes:bytes.length,sourceUrl:m.url,fetchedAt:new Date().toISOString(),
    rightsStatus:m.rights,rightsNote:'Caching does not grant a licence.'};
  log.push({id,status:'cached',bytes:count});
 }catch(e){failures.push({id,url:m.url,error:e.message});}
}
const queue=Object.entries(media);
await Promise.all(Array.from({length:3},async()=>{while(queue.length){const entry=queue.shift();await run(...entry)}}));
const temp=file+'.tmp';fs.writeFileSync(temp,JSON.stringify(cache,null,2)+'\n');fs.renameSync(temp,file);
fs.mkdirSync(path.join(ROOT,'test-results'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'test-results/media-cache-report.json'),JSON.stringify({log,failures},null,2)+'\n');
console.log(`${log.length} processed; ${failures.length} failed. Previously cached valid assets retained.`);
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exitCode=1;}
