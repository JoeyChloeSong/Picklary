#!/usr/bin/env node
/*
 * PickleLevel Update Agent
 * ---------------------------------------------------------------
 * Goal: keep news, tournament, paddle, rules, and domestic-source
 * update drafts flowing without turning the site into an unreviewed
 * scraper. This script creates editorial drafts, not final articles.
 *
 * Commands:
 *   node automation/picklelevel-agent.js --status
 *   node automation/picklelevel-agent.js --scan
 *   node automation/picklelevel-agent.js --scan --dry-run
 *   node automation/picklelevel-agent.js --approve data/agent/drafts/<file>.json
 *   node automation/picklelevel-agent.js --publish-approved
 *
 * Optional AI:
 *   Set OPENAI_API_KEY and OPENAI_MODEL to let the agent generate a
 *   Korean editorial draft in a strict JSON shape. Without a key, it
 *   creates a conservative fallback draft for human editing.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const SOURCES_FILE = path.join(__dirname, 'sources.json');
const DATA_DIR = path.join(ROOT, 'data', 'agent');
const DRAFT_DIR = path.join(DATA_DIR, 'drafts');
const APPROVED_DIR = path.join(DATA_DIR, 'approved');
const ARCHIVE_DIR = path.join(DATA_DIR, 'archive');
const STATE_FILE = path.join(DATA_DIR, 'source-state.json');
const AUTO_UPDATES_FILE = path.join(ROOT, 'data', 'auto-updates.js');

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const getArg = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : null;
};

function ensureDirs() {
  for (const d of [DATA_DIR, DRAFT_DIR, APPROVED_DIR, ARCHIVE_DIR]) fs.mkdirSync(d, { recursive: true });
}
function loadJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return fallback; }
}
function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}
function slug(s) {
  return String(s || 'update').toLowerCase().replace(/https?:\/\//g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'update';
}
function sha256(s) { return crypto.createHash('sha256').update(String(s || '')).digest('hex'); }
function nowIso() { return new Date().toISOString(); }
function today() { return new Date().toISOString().slice(0, 10); }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function stripTags(html) { return String(html || '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
function decodeEntities(s) {
  return String(s || '')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
}
function extractBetween(html, re) {
  const m = String(html || '').match(re);
  return m ? decodeEntities(m[1]).replace(/\s+/g, ' ').trim() : '';
}
function compactSnapshot(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, 7000);
}

async function fetchWithLimit(url, settings) {
  if (url.startsWith('manual://')) {
    return { ok: true, status: 200, contentType: 'text/plain', text: '[manual source] ' + url, finalUrl: url };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      headers: {
        'user-agent': settings.userAgent || 'PickleLevelUpdateAgent/1.0',
        'accept': 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5'
      },
      redirect: 'follow',
      signal: controller.signal
    });
    const ab = await res.arrayBuffer();
    const max = Number(settings.maxBytesPerSource || 240000);
    const slice = Buffer.from(ab).subarray(0, max);
    const text = slice.toString('utf8');
    return { ok: res.ok, status: res.status, contentType: res.headers.get('content-type') || '', text, finalUrl: res.url || url };
  } finally {
    clearTimeout(timeout);
  }
}

function parseRss(text) {
  const items = [];
  const blocks = String(text || '').match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi) || [];
  for (const block of blocks.slice(0, 20)) {
    const title = extractBetween(block, /<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title[^>]*>([\s\S]*?)<\/title>/i) || '';
    const linkMatch = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*>|<link[^>]*>([\s\S]*?)<\/link>/i);
    const link = linkMatch ? decodeEntities(linkMatch[1] || linkMatch[2] || '').trim() : '';
    const desc = extractBetween(block, /<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<summary[^>]*>([\s\S]*?)<\/summary>|<content[^>]*>([\s\S]*?)<\/content>|<description[^>]*>([\s\S]*?)<\/description>/i);
    const published = extractBetween(block, /<pubDate[^>]*>([\s\S]*?)<\/pubDate>|<updated[^>]*>([\s\S]*?)<\/updated>|<published[^>]*>([\s\S]*?)<\/published>/i);
    if (title || link) items.push({ title, link, description: stripTags(desc).slice(0, 500), published });
  }
  return items;
}

function parseHtml(text, source) {
  const title = extractBetween(text, /<title[^>]*>([\s\S]*?)<\/title>/i) || source.label;
  const description = extractBetween(text, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i)
    || extractBetween(text, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i)
    || stripTags(text).slice(0, 480);
  const h1 = extractBetween(text, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const plain = compactSnapshot(stripTags(text));
  return { title, description, h1, plain };
}

function sourceType(source, parsedTitle) {
  if (source.category === 'rules') return 'rules';
  if (source.category === 'paddles') return 'paddles';
  if (source.category === 'domestic') return 'domestic';
  if (source.category === 'results') return 'results';
  if (source.category === 'rankings') return 'rankings';
  if (source.category === 'tournaments') return 'tournaments';
  const t = String(parsedTitle || '').toLowerCase();
  if (/schedule|tournament|event|tour/.test(t)) return 'tournaments';
  if (/paddle|equipment|approved|ban|rule/.test(t)) return 'rules';
  return 'news';
}

function buildFallbackDraft(source, snapshot, previous) {
  const type = sourceType(source, snapshot.title);
  const change = previous ? 'change-detected' : 'first-scan-baseline';
  const titleKo = previous
    ? `[검수 필요] ${source.label} 변경 감지`
    : `[기준 저장] ${source.label} 모니터링 시작`;
  const title = previous
    ? `[Needs review] ${source.label} changed`
    : `[Baseline saved] ${source.label} monitoring started`;
  const summaryKo = previous
    ? `${source.label} 페이지의 내용 해시가 이전 확인 시점과 달라졌습니다. 원문에서 대회 일정, 경기 결과, 규정, 패들 승인 여부, 가격/출시 정보 중 실제 변경된 항목을 확인한 뒤 게시하세요.`
    : `${source.label} 페이지를 자동 업데이트 소스로 등록했습니다. 이후 페이지 변경이 감지되면 검수용 초안이 생성됩니다.`;
  const summary = previous
    ? `${source.label} has changed since the previous scan. Verify the original page before publishing any schedule, result, rule, paddle, price, or player update.`
    : `${source.label} has been registered as an automation source. Future changes will create review drafts.`;
  return {
    id: `${today()}-${slug(source.id)}-${sha256(source.url + snapshot.hash).slice(0, 8)}`,
    status: 'draft',
    type,
    priority: source.priority || 'medium',
    sourceId: source.id,
    sourceName: source.label,
    sourceUrl: source.url,
    fetchedAt: nowIso(),
    detectedAt: today(),
    change,
    title,
    titleKo,
    summary,
    summaryKo,
    action: 'Open the source, verify the exact facts, rewrite in your own words, then approve.',
    actionKo: '원문을 열어 정확한 사실을 확인하고, 직접 쓴 문장으로 수정한 뒤 승인하세요.',
    tags: source.monitorFor || [type],
    tagsKo: source.monitorFor || [type],
    verificationQuestions: [
      'What exactly changed compared with the previous scan?',
      'Is this an official source or a third-party listing?',
      'Does the update affect players immediately, or is it only an announcement?',
      'Do we need to update an existing PickleLevel page?'
    ],
    verificationQuestionsKo: [
      '이전 스캔과 비교해 실제로 무엇이 바뀌었나요?',
      '공식 출처인가요, 제3자 안내 페이지인가요?',
      '선수/대회 참가자에게 즉시 영향을 주는 변경인가요, 단순 공지인가요?',
      'PickleLevel의 기존 페이지를 수정해야 하나요?'
    ],
    rawSnapshot: {
      title: snapshot.title,
      h1: snapshot.h1,
      description: snapshot.description,
      hash: snapshot.hash,
      previousHash: previous && previous.hash ? previous.hash : null
    }
  };
}

async function buildOpenAiDraft(source, snapshot, previous) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return buildFallbackDraft(source, snapshot, previous);
  const model = process.env.OPENAI_MODEL || 'gpt-5.5';
  const type = sourceType(source, snapshot.title);
  const payload = {
    model,
    input: [
      {
        role: 'system',
        content: [
          { type: 'input_text', text: 'You are an editorial update agent for a Korean pickleball information site. Create a cautious, factual, own-words draft. Never invent scores, prices, participants, rankings, bans, or rule changes. If the provided snapshot is insufficient, say verification is required. Return JSON only.' }
        ]
      },
      {
        role: 'user',
        content: [
          { type: 'input_text', text: JSON.stringify({
            source,
            detectedType: type,
            previousKnownHash: previous && previous.hash ? previous.hash : null,
            current: {
              title: snapshot.title,
              h1: snapshot.h1,
              description: snapshot.description,
              plainTextExcerpt: snapshot.plain.slice(0, 2500),
              url: source.url
            },
            requiredJsonShape: {
              status: 'draft', type: 'news|tournaments|results|domestic|paddles|rules|rankings', priority: 'low|medium|high|critical',
              title: 'English title', titleKo: 'Korean title', summary: 'English summary, <=80 words', summaryKo: 'Korean summary, <=120 Korean words',
              action: 'English next action', actionKo: 'Korean next action', tags: ['short tags'], tagsKo: ['Korean short tags'],
              verificationQuestions: ['English questions'], verificationQuestionsKo: ['Korean questions'],
              suggestedPagesToUpdate: ['site page paths if applicable'],
              publishRisk: 'low|medium|high',
              doNotPublishReason: 'string if facts need more verification'
            }
          }) }
        ]
      }
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'picklelevel_update_draft',
        strict: false,
        schema: {
          type: 'object',
          additionalProperties: true,
          properties: {
            status: { type: 'string' },
            type: { type: 'string' },
            priority: { type: 'string' },
            title: { type: 'string' },
            titleKo: { type: 'string' },
            summary: { type: 'string' },
            summaryKo: { type: 'string' },
            action: { type: 'string' },
            actionKo: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            tagsKo: { type: 'array', items: { type: 'string' } },
            verificationQuestions: { type: 'array', items: { type: 'string' } },
            verificationQuestionsKo: { type: 'array', items: { type: 'string' } },
            suggestedPagesToUpdate: { type: 'array', items: { type: 'string' } },
            publishRisk: { type: 'string' },
            doNotPublishReason: { type: 'string' }
          }
        }
      }
    }
  };
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'authorization': `Bearer ${key}` },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('OpenAI draft failed:', res.status, data.error && data.error.message ? data.error.message : JSON.stringify(data).slice(0, 300));
    return buildFallbackDraft(source, snapshot, previous);
  }
  const text = data.output_text || (Array.isArray(data.output) ? data.output.map((x) => (x.content || []).map((c) => c.text || '').join('')).join('') : '');
  let draft;
  try { draft = JSON.parse(text); } catch (e) { draft = buildFallbackDraft(source, snapshot, previous); }
  return Object.assign(buildFallbackDraft(source, snapshot, previous), draft, {
    id: `${today()}-${slug(source.id)}-${sha256(source.url + snapshot.hash).slice(0, 8)}`,
    status: 'draft',
    type: draft.type || type,
    priority: draft.priority || source.priority || 'medium',
    sourceId: source.id,
    sourceName: source.label,
    sourceUrl: source.url,
    fetchedAt: nowIso(),
    detectedAt: today(),
    rawSnapshot: {
      title: snapshot.title,
      h1: snapshot.h1,
      description: snapshot.description,
      hash: snapshot.hash,
      previousHash: previous && previous.hash ? previous.hash : null
    }
  });
}

async function scan() {
  ensureDirs();
  const cfg = loadJson(SOURCES_FILE, { settings: {}, sources: [] });
  const state = loadJson(STATE_FILE, {});
  const enabled = (cfg.sources || []).filter((s) => s.enabled);
  const dry = has('--dry-run') || has('--dry');
  const maxDrafts = Number(cfg.settings && cfg.settings.maxDraftsPerRun || 12);
  let drafts = 0;

  console.log(`PickleLevel agent: ${enabled.length} enabled source(s).`);
  for (const source of enabled) {
    if (drafts >= maxDrafts) {
      console.log(`Max drafts per run reached (${maxDrafts}).`);
      break;
    }
    process.stdout.write(`- ${source.id}: `);
    let fetched;
    try { fetched = await fetchWithLimit(source.url, cfg.settings || {}); }
    catch (e) { console.log(`fetch failed (${e.message})`); continue; }
    if (!fetched.ok) { console.log(`HTTP ${fetched.status}`); continue; }

    let snapshot;
    if (/rss|xml/.test(fetched.contentType) || source.type === 'rss') {
      const items = parseRss(fetched.text);
      const joined = items.map((x) => `${x.title} ${x.link} ${x.description}`).join('\n');
      snapshot = { title: source.label, h1: '', description: `${items.length} feed item(s)`, plain: compactSnapshot(joined), hash: sha256(joined || fetched.text) };
    } else {
      const parsed = parseHtml(fetched.text, source);
      snapshot = Object.assign(parsed, { hash: sha256(parsed.title + '\n' + parsed.description + '\n' + parsed.plain) });
    }

    const previous = state[source.id];
    const changed = !previous || previous.hash !== snapshot.hash;
    state[source.id] = {
      hash: snapshot.hash,
      lastFetchedAt: nowIso(),
      lastChangedAt: changed ? nowIso() : previous.lastChangedAt,
      title: snapshot.title,
      description: snapshot.description,
      url: source.url
    };

    if (!changed) { console.log('no change'); }
    else {
      console.log(previous ? 'changed -> draft' : 'baseline -> draft');
      const draft = await buildOpenAiDraft(source, snapshot, previous);
      const draftFile = path.join(DRAFT_DIR, `${draft.id}.json`);
      if (!dry) writeJson(draftFile, draft);
      else console.log(JSON.stringify(draft, null, 2).slice(0, 2000));
      drafts += 1;
    }
    await sleep(Number(cfg.settings && cfg.settings.requestDelayMs || 1200));
  }
  if (!dry) writeJson(STATE_FILE, state);
  console.log(`Done. ${drafts} draft(s) ${dry ? 'previewed' : 'created'}.`);
}

function status() {
  ensureDirs();
  const cfg = loadJson(SOURCES_FILE, { sources: [] });
  const state = loadJson(STATE_FILE, {});
  const draftCount = fs.readdirSync(DRAFT_DIR).filter((f) => f.endsWith('.json')).length;
  const approvedCount = fs.readdirSync(APPROVED_DIR).filter((f) => f.endsWith('.json')).length;
  console.log(`Sources: ${(cfg.sources || []).length} total, ${(cfg.sources || []).filter((s) => s.enabled).length} enabled`);
  console.log(`Drafts: ${draftCount}`);
  console.log(`Approved: ${approvedCount}`);
  console.log(`Tracked source states: ${Object.keys(state).length}`);
  for (const s of (cfg.sources || []).filter((x) => x.enabled)) {
    const st = state[s.id];
    console.log(`- ${s.id} [${s.category}] ${st ? 'last fetched ' + st.lastFetchedAt : 'not fetched yet'}`);
  }
}

function approve(file) {
  ensureDirs();
  if (!file) throw new Error('Usage: node automation/picklelevel-agent.js --approve data/agent/drafts/file.json');
  const src = path.resolve(ROOT, file);
  if (!fs.existsSync(src)) throw new Error('Draft file not found: ' + src);
  const draft = loadJson(src, null);
  if (!draft) throw new Error('Invalid JSON: ' + src);
  draft.status = 'published';
  draft.approvedAt = nowIso();
  const dest = path.join(APPROVED_DIR, path.basename(src));
  writeJson(dest, draft);
  const archive = path.join(ARCHIVE_DIR, path.basename(src));
  fs.renameSync(src, archive);
  console.log('Approved:', path.relative(ROOT, dest));
}

function publishApproved() {
  ensureDirs();
  let base = [];
  try { base = require(AUTO_UPDATES_FILE); } catch (e) { base = []; }
  const byId = new Map();
  for (const item of base) if (item && item.id) byId.set(item.id, item);
  for (const file of fs.readdirSync(APPROVED_DIR).filter((f) => f.endsWith('.json'))) {
    const item = loadJson(path.join(APPROVED_DIR, file), null);
    if (!item || !item.id) continue;
    const clean = {
      id: item.id,
      status: 'published',
      type: item.type || 'news',
      priority: item.priority || 'medium',
      date: item.detectedAt || today(),
      title: item.title,
      titleKo: item.titleKo || item.title,
      summary: item.summary,
      summaryKo: item.summaryKo || item.summary,
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      tags: item.tags || [],
      tagsKo: item.tagsKo || item.tags || [],
      action: item.action || '',
      actionKo: item.actionKo || item.action || '',
      publishRisk: item.publishRisk || 'medium'
    };
    byId.set(clean.id, clean);
  }
  const arr = Array.from(byId.values()).sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(a.id).localeCompare(String(b.id)));
  const js = 'module.exports = ' + JSON.stringify(arr, null, 2) + ';\n';
  fs.writeFileSync(AUTO_UPDATES_FILE, js);
  console.log(`Wrote ${arr.length} update item(s) to data/auto-updates.js`);
}

async function main() {
  if (has('--status') || argv.length === 0) return status();
  if (has('--scan')) return scan();
  if (has('--approve')) return approve(getArg('--approve'));
  if (has('--publish-approved')) return publishApproved();
  console.log('Unknown command. Use --status, --scan, --approve <file>, or --publish-approved.');
}

main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
