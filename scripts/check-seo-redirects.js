#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, '..', 'dist');
const redirectsFile = path.join(dist, '_redirects');
const sitemapFile = path.join(dist, 'sitemap.xml');
if (!fs.existsSync(redirectsFile) || !fs.existsSync(sitemapFile)) {
  console.error('[SEO AUDIT] Build output is missing _redirects or sitemap.xml.');
  process.exit(1);
}
const redirects = fs.readFileSync(redirectsFile, 'utf8').split(/\r?\n/)
  .map(line => line.trim()).filter(line => line && !line.startsWith('#'))
  .map(line => line.split(/\s+/)).filter(parts => parts.length >= 3)
  .map(([from, to, status]) => ({from, to, status: Number(String(status).replace('!',''))}))
  .filter(x => x.status >= 300 && x.status < 400 && !x.from.includes('*'));
const redirectSources = new Set(redirects.map(x => x.from));
const sitemap = fs.readFileSync(sitemapFile, 'utf8');
const sitemapPaths = [...sitemap.matchAll(/<loc>https:\/\/picklary\.com([^<]*)<\/loc>/g)].map(m => m[1] || '/');
const sitemapHits = sitemapPaths.filter(p => redirectSources.has(p));
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(ent => {
    const full = path.join(dir, ent.name);
    return ent.isDirectory() ? walk(full) : [full];
  });
}
const htmlFiles = walk(dist).filter(f => f.endsWith('.html'));
const internalHits = [];
const canonicalHits = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/href=["'](\/[^"'#?]*\/?)(?:[?#][^"']*)?["']/g)) {
    if (redirectSources.has(m[1])) internalHits.push(`${path.relative(dist,file)} -> ${m[1]}`);
  }
  for (const m of html.matchAll(/<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/picklary\.com([^"']*)["']/gi)) {
    const p = m[1] || '/';
    if (redirectSources.has(p)) canonicalHits.push(`${path.relative(dist,file)} -> ${p}`);
  }
}
if (sitemapHits.length || internalHits.length || canonicalHits.length) {
  console.error('[SEO AUDIT] Redirect-source URLs must not be presented as canonical/indexable URLs.');
  if (sitemapHits.length) console.error('  Sitemap:', [...new Set(sitemapHits)].join(', '));
  if (internalHits.length) console.error('  Internal links:', [...new Set(internalHits)].slice(0,20).join('\n    '));
  if (canonicalHits.length) console.error('  Canonicals:', [...new Set(canonicalHits)].slice(0,20).join('\n    '));
  process.exit(1);
}
const root = redirects.find(x => x.from === '/');
if (!root || root.to !== '/en/' || root.status !== 301) {
  console.error('[SEO AUDIT] Root must permanently redirect to /en/ with 301.');
  process.exit(1);
}
console.log(`[SEO AUDIT] PASS: ${sitemapPaths.length} sitemap URLs, ${htmlFiles.length} HTML files, no redirect-source canonicals or internal links.`);
