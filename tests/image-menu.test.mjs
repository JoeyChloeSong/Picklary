import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const art=JSON.parse(read('data/menu-art.json'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
test('Every committed illustration and responsive variant has a valid hash and source crop',()=>{
 for(const [key,m] of Object.entries(art)){
  assert.equal(m.kind,'navigation-illustration',key);
  assert.ok(m.crop[0]>=0&&m.crop[1]>=0&&m.crop[2]>m.crop[0]&&m.crop[3]>m.crop[1]);
  assert.equal(sha(fs.readFileSync(new URL('../design/menu-originals/'+m.source,import.meta.url))),m.sourceSha256,key);
  assert.deepEqual(m.variants.map(v=>v.width),[480,960]);
  for(const v of m.variants){
   const f=fs.readFileSync(new URL('../public'+v.path,import.meta.url));
   assert.equal(sha(f),v.sha256,v.path);assert.equal(f.length,v.bytes);
   assert.equal(f.toString('ascii',0,4),'RIFF');assert.equal(f.toString('ascii',8,12),'WEBP');
   assert.equal(sha(fs.readFileSync(new URL('../dist'+v.path,import.meta.url))),v.sha256);
  }
 }
});
test('Archived image pages with unverified badges are not shipped as public menu screenshots',()=>{
 assert.equal(fs.existsSync(new URL('../dist/assets/legacy-menu/',import.meta.url)),false);
 assert.ok(!Object.values(art).some(m=>m.source.includes('dupr-level-up-dashboard')));
 for(const locale of ['en','ko'])assert.doesNotMatch(read('dist/'+locale+'/index.html'),/Verified by DUPR|Expert tested|v0\.9|ux-legacy-shot|ux-menu-gallery/);
});
for(const l of ['ko','en']){
 test(l+': home image cards are real links with real localized headings',()=>{
  const h=read('dist/'+l+'/index.html');
  assert.equal((h.match(/class="ux-feature-link"/g)||[]).length,6);
  assert.ok(h.includes('id="choose-path"'));
  assert.match(h,/menu-bento/);assert.match(h,/menu-hero-scene/);
  assert.ok(h.includes('/'+l+'/media/#menu-art'));
  for(const key of [...h.matchAll(/data-navigation-art="([^"]+)"/g)].map(x=>x[1]))assert.ok(art[key]);
  assert.match(h,/srcset="\/assets\/menu\/v122\//);
 });
 test(l+': category illustration does not replace named product photographs',()=>{
  const h=read('dist/'+l+'/gear/index.html');
  for(const k of ['paddles','balls','shoes','apparel','accessories'])assert.ok(h.includes('data-navigation-art="'+k+'"'));
  const products=read('dist/'+l+'/gear/paddles/index.html');assert.match(products,/data-product data-brand=/);assert.match(products,/data-media="franklin-c45"/);
 });
 test(l+': active editors contain working templates, not marketing screenshots',()=>{
  const clip=read('dist/'+l+'/clip-lite/index.html'),q=read('dist/'+l+'/dupr-self-check/index.html');
  assert.match(clip,/id="videoInput"/);assert.match(clip,/id="exportBtn"/);
  assert.match(q,/id="dupr-quiz-data"/);assert.match(q,/data-dupr-quiz/);
  assert.ok(!clip.includes('menu-intro-art'));assert.ok(!q.includes('menu-intro-art'));
 });
}
test('Standalone browser editor package includes every referenced local CSS and JavaScript file',()=>{
 const data=fs.readFileSync(new URL('../dist/downloads/Picklary_Clip_Web_v1.2.0_Local.zip',import.meta.url));
 const entries=new Map();let p=0;
 while(p+30<=data.length&&data.readUInt32LE(p)===0x04034b50){
  const method=data.readUInt16LE(p+8),len=data.readUInt32LE(p+18),n=data.readUInt16LE(p+26),x=data.readUInt16LE(p+28),name=data.toString('utf8',p+30,p+30+n),start=p+30+n+x;
  assert.equal(method,0,'ZIP store contract');entries.set(name,data.subarray(start,start+len));p=start+len;
 }
 for(const l of ['en','ko']){
  const h=entries.get(l+'/index.html').toString('utf8');
  for(const m of h.matchAll(/(?:href|src)="(\/assets\/[^"#?]+)[^"]*"/g))assert.ok(entries.has(m[1].slice(1)),m[1]);
 }
 assert.ok([...entries.keys()].some(k=>/^assets\/css\/menu\./.test(k)));
});
