/* Optional operator tool: refresh DUPR public-ranking snapshot.
 * Run manually: node automation/update-dupr-snapshot.js
 * Notes: DUPR has no guaranteed public JSON API for this project. This script
 * fetches the public rankings page, extracts nearby name/rating text when possible,
 * and writes only a reviewable snapshot. Always verify before publishing.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const PLAYERS = require('../data/players.js').map(p => p.name);
const OUT = path.join(__dirname, '..', 'data', 'dupr-snapshot.js');
const URL = 'https://www.dupr.com/rankings';
function escapeRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
async function main(){
  const res = await fetch(URL, { headers: { 'user-agent': 'PickleLevelDUPRCheck/1.0' } });
  const html = await res.text();
  const plain = html.replace(/<[^>]+>/g, '\n').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
  const ratings = {};
  for (const name of PLAYERS) {
    const re = new RegExp(escapeRe(name) + '.{0,120}?Age:?\\s*([0-9—-]+)?.{0,80}?([0-9]\\.[0-9]{3})', 'i');
    const m = plain.match(re);
    if (m) ratings[name] = { doubles: Number(m[2]), note: 'Auto-extracted from public DUPR rankings page; verify manually before relying on it.' };
  }
  const body = `/* Auto-refreshable DUPR snapshot. Verify values against ${URL}. */\nmodule.exports = ${JSON.stringify({ updated: new Date().toISOString().slice(0,10), checked: new Date().toISOString().slice(0,10), sourceName:'DUPR rankings', sourceUrl:URL, ratings }, null, 2)};\n`;
  fs.writeFileSync(OUT, body);
  console.log('Wrote', OUT, Object.keys(ratings).length, 'players');
}
main().catch(err => { console.error(err); process.exit(1); });
