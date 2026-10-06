import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {zipStore,crc32} from '../public/assets/tools/zip-store.js';
import {loadReleases} from '../scripts/restored-tools.mjs';
import {FFmpeg,fetchFile} from '../public/assets/tools/ffmpeg-engine.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const json=p=>JSON.parse(read(p));
const encode=s=>new TextEncoder().encode(s);
const temp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'picklary-test-'));
const clean=p=>fs.rmSync(p,{recursive:true,force:true});
for(const lang of ['en','ko']){
 const d=json('data/self-check-'+lang+'.json');
 test(lang+': all 32 scenarios are unique and localized',()=>{
  assert.equal(d.scenarios.length,32);assert.equal(new Set(d.scenarios.map(s=>s.id)).size,32);assert.equal(d.total,10);
  d.scenarios.forEach(s=>{assert.ok(s.prompt.length>10);assert.ok(s.explain.length>10);if(lang==='ko')assert.match(s.prompt,/[\uac00-\ud7af]/);});
 });
 test(lang+': quiz choices and coordinates are well-formed',()=>{
  const keys={shot:d.shots.map(x=>x[0]),power:d.powers.map(x=>x[0]),zone:Object.keys(d.zones),player:['p1','p2']};
  for(const s of d.scenarios){
   assert.ok([1,2,3].includes(s.diff));
   for(const k of ['shot','power','zone','player'])if(s[k]){assert.ok(Object.keys(s[k]).length>0);assert.equal(Math.max(...Object.values(s[k])),3);for(const [choice,score] of Object.entries(s[k])){assert.ok(keys[k].includes(choice));assert.ok(Number.isInteger(score)&&score>=0&&score<=3);}}
   for(const group of [s.you,s.opp]){assert.equal(group.length,2);for(const p of group){assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.ok(p.x>=0&&p.x<=300&&p.y>=0&&p.y<=460);}}
  }
 });
 test(lang+': core tool routes render real controls and disclosures',()=>{
  const q=read('dist/'+lang+'/dupr-self-check/index.html');assert.match(q,/data-dupr-quiz/);assert.match(q,/dupr-quiz-data/);assert.match(q,/data-save-assessment/);assert.match(q,/self-check\.[a-f0-9]+\.js/);
  const c=read('dist/'+lang+'/clip-lite/index.html');for(const id of ['workspace','video','videoInput','markIn','markOut','addDirect','exportBtn','cutsList'])assert.ok(c.includes('id="'+id+'"'),id);
  assert.ok(c.includes('clip-editor.'));assert.ok(c.includes('Picklary_Clip_Web_v1.2.0_Local.zip'));
  const v=read('dist/'+lang+'/vision-rating/index.html');assert.ok(v.includes('127.0.0.1:8865/'));assert.ok(v.includes('Picklary_Vision_v0.2.4_Docs_Only.zip'));
 });
}
test('EN/KO keep identical quiz scoring and scenario identities',()=>{
 const [a,b]=['en','ko'].map(l=>json('data/self-check-'+l+'.json'));
 assert.deepEqual(a.scenarios.map(s=>[s.id,s.diff,s.shot,s.power,s.zone,s.player]),b.scenarios.map(s=>[s.id,s.diff,s.shot,s.power,s.zone,s.player]));
});
test('Restored quiz is independent, opt-in and accessible',()=>{
 const q=read('public/assets/tools/self-check.js');assert.match(q,/PICKLARY ESTIMATE \(NOT OFFICIAL\)/);assert.match(q,/officialDupr:false/);assert.match(q,/data-save-assessment/);assert.match(q,/\.checked/);assert.match(q,/slice\(-20\)/);assert.match(q,/prefers-reduced-motion/);assert.match(q,/aria-pressed/);assert.doesNotMatch(q,/My DUPR/);
});
test('Old original URLs do not send users to the manual worksheet',()=>{
 const redirects=json('data/redirects.json');
 for(const r of redirects.filter(r=>/clip-lite|dupr-self-check|vision-rating|picklary-lite|\/download\//.test(r.from)))assert.doesNotMatch(r.to,/tools\/(review|self-check)/);
 for(const lang of ['en','ko'])for(const rel of ['clip-lite','dupr-self-check','vision-rating'])assert.ok(!redirects.some(r=>r.from===`/${lang}/${rel}/`));
});
test('Download buttons exist only for packaged bytes; missing native packages are not docs',()=>{
 const dist=read('dist/en/downloads/index.html');
 for(const row of json('data/app-releases.json'))if(!row.reviewed||!fs.existsSync(path.join(ROOT,'releases',row.file)))assert.ok(!dist.includes('href="/downloads/'+row.file+'"'));
 assert.ok(dist.includes('Picklary_Clip_Web_v1.2.0_Local.zip'));assert.ok(dist.includes('Picklary_Vision_v0.2.4_Docs_Only.zip'));
});
test('No ad-request scripts are present in the restored apps',()=>{
 for(const lang of ['en','ko'])for(const rel of ['clip-lite','dupr-self-check','vision-rating','downloads']){
  const s=read(`dist/${lang}/${rel}/index.html`);assert.doesNotMatch(s,/<script[^>]*src=["'][^"']*adsbygoogle/i);
 }
});
test('All restored browser JavaScript parses',()=>{
 for(const name of ['clip-editor.js','self-check.js','ffmpeg-engine.js','ffmpeg-worker.js','zip-store.js']){const r=spawnSync(process.execPath,['--check',path.join(ROOT,'public/assets/tools',name)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);}
});
test('CRC32 standard check vector and empty input',()=>{assert.equal(crc32(encode('123456789')),0xcbf43926);assert.equal(crc32(new Uint8Array()),0);});
test('ZIP directory, UTF8 filenames, sizes and per-entry CRC32',()=>{
 const entries={'clip_01.mp4':encode('contract fixture, not video'),'\ud55c\uae00.txt':encode('hello'),'empty.txt':new Uint8Array()};
 const bytes=Buffer.from(zipStore(entries));assert.equal(bytes.readUInt32LE(0),0x04034b50);
 const e=bytes.length-22;assert.equal(bytes.readUInt32LE(e),0x06054b50);assert.equal(bytes.readUInt16LE(e+10),3);let c=bytes.readUInt32LE(e+16);
 for(const [name,data] of Object.entries(entries)){
  assert.equal(bytes.readUInt32LE(c),0x02014b50);const l=bytes.readUInt16LE(c+28),p=bytes.readUInt32LE(c+42);
  assert.equal(bytes.subarray(c+46,c+46+l).toString(),name);assert.equal(bytes.readUInt32LE(c+16),crc32(data));assert.equal(bytes.readUInt32LE(c+24),data.length);
  const h=30+bytes.readUInt16LE(p+26);assert.deepEqual(bytes.subarray(p+h,p+h+data.length),Buffer.from(data));c+=46+l;
 }
});
test('ZIP rejects unsafe output entry paths',()=>{for(const n of ['../oops','a/../../oops','/root',''])assert.throws(()=>zipStore({[n]:encode('x')}));});
test('Download SHA256 values match the delivered bytes',()=>{
 for(const line of read('dist/downloads/checksums.txt').trim().split('\n')){const [hash,name]=line.split(/\s+/);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'dist/downloads',name))).digest('hex'),hash);}
});
test('Release loader requires explicit operator review and an exact digest',()=>{
 const p=temp();try{fs.mkdirSync(path.join(p,'data'));fs.mkdirSync(path.join(p,'releases'));const data=Buffer.from(zipStore({'main.py':encode('pass'),'START.bat':encode('@echo off')}));fs.writeFileSync(path.join(p,'releases','example.zip'),data);
 let rows=[{id:'windows-editor',kind:'windows-editor',language:'both',file:'example.zip',reviewed:false,sha256:null}];
 const save=()=>fs.writeFileSync(path.join(p,'data/app-releases.json'),JSON.stringify(rows));save();assert.equal(loadReleases(p,path.join(p,'out'))[0].available,false);
 rows[0].reviewed=true;save();assert.throws(()=>loadReleases(p,path.join(p,'out')),/checksum/);
 rows[0].sha256=crypto.createHash('sha256').update(data).digest('hex');save();assert.equal(loadReleases(p,path.join(p,'out'))[0].available,true);assert.ok(fs.existsSync(path.join(p,'out/downloads/example.zip')));
 }finally{clean(p);}
});
function registerFixture(entries,args=[]){const p=temp();fs.mkdirSync(path.join(p,'scripts'));fs.mkdirSync(path.join(p,'data'));fs.copyFileSync(path.join(ROOT,'scripts/register-release.mjs'),path.join(p,'scripts/register-release.mjs'));fs.copyFileSync(path.join(ROOT,'data/app-releases.json'),path.join(p,'data/app-releases.json'));fs.writeFileSync(path.join(p,'fixture.zip'),zipStore(entries));const result=spawnSync(process.execPath,[path.join(p,'scripts/register-release.mjs'),'--id','vision-ko','--file',path.join(p,'fixture.zip'),'--version','test-fixture',...args],{encoding:'utf8'});return {p,result};}
test('Registration rejects documentation-only ZIPs',()=>{const {p,result}=registerFixture({'README.txt':encode('Docs only')},['--reviewed']);try{assert.notEqual(result.status,0);assert.match(result.stderr,/documentation/);}finally{clean(p);}});
test('Registration requires operator attestation',()=>{const {p,result}=registerFixture({'vision/main.py':encode('pass'),'START.bat':encode('@echo off')});try{assert.notEqual(result.status,0);assert.match(result.stderr,/reviewed/);}finally{clean(p);}});
test('Registration accepts structurally valid app sources without executing them',()=>{
 const {p,result}=registerFixture({'vision/main.py':encode('raise Exception("must not execute")'),'START.bat':encode('@echo off')},['--reviewed']);try{assert.equal(result.status,0,result.stderr);const row=JSON.parse(fs.readFileSync(path.join(p,'data/app-releases.json')))[0];assert.equal(row.version,'test-fixture');assert.equal(row.reviewed,true);assert.match(row.sha256,/^[a-f0-9]{64}$/);}finally{clean(p);}
});
test('Worker contract reads a copy rather than detaching the core filesystem',async()=>{
 const messages=[],memory=new Uint8Array([1,2,3]),ops=[];
 const core={FS:{readFile:()=>memory,writeFile:(n,b)=>ops.push(['write',n,Array.from(b)]),unlink:n=>ops.push(['delete',n])},setLogger(){},setProgress(){},setTimeout(){},exec(...args){ops.push(['exec',args]);this.ret=0;},reset(){ops.push(['reset']);},ret:0};
 const sandbox={Uint8Array,Array,URL,btoa:s=>Buffer.from(s).toString('base64'),importScripts(){},fetch:async()=>({ok:false}),self:{location:{href:'https://picklary.example/assets/tools/ffmpeg-worker.js'},postMessage:(m,transfer)=>messages.push({m,transfer}),createFFmpegCore:async()=>core}};
 vm.runInNewContext(read('public/assets/tools/ffmpeg-worker.js'),sandbox);
 const send=(id,type,data={})=>sandbox.self.onmessage({data:{id,type,data}});
 await send(1,'load');await send(2,'write',{name:'input.mp4',bytes:new Uint8Array([8])});await send(3,'exec',{args:['-i','input.mp4','clip.mp4']});await send(4,'read',{name:'clip.mp4'});
 const response=messages.find(x=>x.m.id===4);assert.deepEqual(Array.from(response.m.data),[1,2,3]);assert.notEqual(response.m.data.buffer,memory.buffer);assert.equal(memory.byteLength,3);assert.ok(ops.some(x=>x[0]==='reset'));
 await send(5,'exec',{args:[1]});assert.match(messages.find(x=>x.m.id===5).m.error,/Invalid/);
});
test('Adapter terminates pending work and uses a same-origin worker',async()=>{
 const Original=globalThis.Worker;const workers=[];
 class FakeWorker{constructor(src){this.src=src;this.dead=false;workers.push(this);}postMessage(m){if(m.type==='load')queueMicrotask(()=>this.onmessage({data:{id:m.id,data:true}}));}terminate(){this.dead=true;}}
 globalThis.Worker=FakeWorker;
 try{const ff=new FFmpeg();await ff.load();assert.equal(workers[0].src,'/assets/tools/ffmpeg-worker.js');const promise=ff.exec(['-version']);const rejection=assert.rejects(promise,e=>e.name==='AbortError');ff.terminate();await rejection;assert.equal(workers[0].dead,true);assert.equal(ff.pending.size,0);}
 finally{globalThis.Worker=Original;}
});
test('fetchFile reads a local File-like object without a network request',async()=>{assert.deepEqual(Array.from(await fetchFile(new Blob(['abc']))),[97,98,99]);});
test('Browser export is guarded against cancellation, double starts and memory-heavy inputs',()=>{
 const s=read('public/assets/tools/clip-editor.js');assert.match(s,/cancelRequested/);assert.match(s,/750\*1024\*1024/);assert.match(s,/assertActive\(\)/);assert.match(s,/saving=true;cancelBtn.hidden=true/);assert.match(s,/setBusy\(true\)/);assert.match(s,/source has not been uploaded or returned as a finished edit/);
 assert.ok(s.includes("import('/assets/tools/ffmpeg-engine.js')"));assert.ok(s.includes("import('/assets/tools/zip-store.js')"));
});
