
import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
for(const l of ['en','ko']){
 test(l+': six visual feature destinations preserve original tools',()=>{
  const h=read('dist/'+l+'/index.html');
  assert.equal((h.match(/class="ux-feature-link"/g)||[]).length,6);
  for(const p of ['dupr-self-check/','vision-rating/','clip-lite/','tour/','gear/','learn/'])assert.ok(h.includes('href="/'+l+'/'+p+'" class="ux-feature-link"'));
  assert.match(h,/ux-mobile-dock/);assert.match(h,/icon|ux-icon/);
 });
 test(l+': each event division has a corresponding unique accessible tab panel',()=>{
  const h=read('dist/'+l+'/tour/index.html'),events=json('data/results.json');
  for(const e of events)for(const [i,r] of e.rows.entries()){
   assert.equal((h.match(new RegExp('id="card-'+e.slug+'-tab-'+i+'"','g'))||[]).length,1);
   assert.equal((h.match(new RegExp('id="card-'+e.slug+'-panel-'+i+'"','g'))||[]).length,1);
   assert.ok(h.includes('aria-controls="card-'+e.slug+'-panel-'+i+'"'));
   for(const n of r.winner)assert.ok(h.includes(n));
   for(const g of r.games)assert.ok(h.includes(g.join('–')));
  }
  assert.ok(h.includes('<noscript>'));assert.ok(!/\bdata-live\b/.test(h));
 });
 test(l+': brand controls derive from the exact product catalogue',()=>{
  const h=read('dist/'+l+'/gear/paddles/index.html'),products=json('data/products.json').filter(p=>p.category==='paddles');
  assert.equal((h.match(/\bdata-product data-brand=/g)||[]).length,products.length);
  assert.ok(h.includes('data-brand-chip=""'));
  for(const brand of new Set(products.map(p=>p.brand)))assert.ok(h.includes('data-brand-chip="'+brand+'"'));
 });
}
test('Original calculation, video engine, tool templates and editorial datasets are unchanged',()=>{
 const manifest=json('docs/V1_1_SOURCE_PRESERVATION.json');
 for(const [file,expected] of Object.entries(manifest.sha256)){
  const h=crypto.createHash('sha256').update(fs.readFileSync(new URL('../'+file,import.meta.url))).digest('hex');assert.equal(h,expected,file);
 }
});
test('Visual behavior parses and is independent from encoders and ratings',()=>{
 const js=read('public/assets/js/visual.js');new vm.Script(js);
 assert.doesNotMatch(js,/fetch\(|localStorage|FFmpeg|dupr\.history/);
 for(const k of ['ArrowLeft','ArrowRight','Home','End','aria-selected','aria-pressed'])assert.ok(js.includes(k));
});
