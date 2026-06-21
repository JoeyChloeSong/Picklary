/* =====================================================================
 * build.js — Picklary static site generator (zero runtime dependencies)
 *
 *   node build.js          # generate ./dist
 *
 * Reads the data files in /data and the UI catalogs in /i18n, then writes a
 * complete static site to /dist with one folder per locale. Article bodies are
 * baked into the HTML (good for SEO/AdSense); the data lives in one place.
 * ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

const config = require('./data/site.config.js');
const categories = require('./data/categories.js');
const posts = require('./data/posts.js');
const columns = require('./data/columns.js');
const levels = require('./data/levels.js');
const paddles = require('./data/paddles.js');
const players = require('./data/players.js');
let duprSnapshot = { updated: '', sourceUrl: 'https://www.dupr.com/rankings', ratings: {} };
try { duprSnapshot = require('./data/dupr-snapshot.js'); } catch (e) { duprSnapshot = { updated: '', sourceUrl: 'https://www.dupr.com/rankings', ratings: {} }; }
const highlightSeeds = require('./data/highlights.js');
const boards = require('./data/boards.js');
let autoUpdates = [];
try { autoUpdates = require('./data/auto-updates.js'); } catch (e) { autoUpdates = []; }
const BUILD_STAMP = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
let tourResults = [];
try { tourResults = require('./data/results.js'); } catch (e) { tourResults = []; }
let duprQuiz = [];
try { duprQuiz = require('./data/dupr-quiz.js'); } catch (e) { duprQuiz = []; }
let rankingsData = null;
try { rankingsData = require('./data/rankings.js'); } catch (e) { rankingsData = null; }
let automationSourceConfig = { sources: [] };
try { automationSourceConfig = require('./automation/sources.json'); } catch (e) { automationSourceConfig = { sources: [] }; }

// Optional human-reviewed localized content packs. These keep the default Korean
// site indexable with real Korean article bodies instead of fallback English.
try {
  const koContent = require('./data/ko.content.js');
  if (koContent && koContent.posts) {
    for (const post of posts) {
      if (koContent.posts[post.slug]) {
        post.translations = post.translations || {};
        post.translations.ko = Object.assign({}, post.translations.ko || {}, koContent.posts[post.slug]);
      }
    }
  }
  if (koContent && koContent.columns) {
    for (const column of columns) {
      if (koContent.columns[column.slug]) {
        column.translations = column.translations || {};
        column.translations.ko = Object.assign({}, column.translations.ko || {}, koContent.columns[column.slug]);
      }
    }
  }
} catch (e) { /* localized pack is optional */ }

// ---- The Brief: sample edition (replace via the ingestion pipeline) --------
// Items are summarised in our OWN words and link OUT to a primary source.
// Evergreen framing on purpose — no invented "this week" news.
const briefEditions = [
  {
    edition: 1,
    date: '2026-06-12',
    title: 'What to actually pay attention to right now',
    titleKo: '지금 피클볼 플레이어가 실제로 확인할 것',
    items: [
      { take: 'Raw carbon-fibre faces keep showing up across new releases. For a 2.0–3.5 player the practical effect is spin-friendly texture and a controlled feel — useful, but not a reason to replace a paddle you still play well with.', takeKo: '로 카본 계열 표면은 새 패들에서 계속 많이 보입니다. 2.0~3.5 플레이어에게는 스핀과 컨트롤에 도움이 될 수 있지만, 아직 잘 맞는 패들을 무리하게 바꿀 이유는 아닙니다.', sourceName: 'Picklary — paddle face materials', sourceNameKo: 'Picklary — 패들 표면 소재 비교', sourceUrl: '/ko/paddle-face-materials-compared/' },
      { take: 'If you compete, check the official approved-equipment list before buying, since tournament eligibility is decided there, not by marketing copy.', takeKo: '대회에 나갈 계획이라면 구매 전 승인 장비 목록을 확인하세요. 대회 사용 가능 여부는 마케팅 문구가 아니라 공식 승인 목록으로 판단됩니다.', sourceName: 'USA Pickleball', sourceNameKo: 'USA Pickleball', sourceUrl: 'https://usapickleball.org' },
      { take: "Confused about ratings? Read what a results-based system actually measures before you let the number bother you — it's feedback, not a verdict.", takeKo: '레이팅이 헷갈린다면 숫자를 평가가 아니라 피드백으로 읽으세요. 경기 결과 기반 시스템이 무엇을 측정하는지 먼저 이해하는 편이 좋습니다.', sourceName: 'DUPR', sourceNameKo: 'DUPR', sourceUrl: 'https://dupr.com' }
    ]
  }
];

const locales = config.locales;
const SOURCE = config.sourceLocale;
const DEFAULT = config.defaultLocale;
const isRTL = (loc) => config.rtlLocales.includes(loc);

// ---- i18n -----------------------------------------------------------------
const catalogs = {};
for (const loc of locales) {
  const p = path.join(ROOT, 'i18n', loc + '.json');
  catalogs[loc] = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
}
function tt(loc, key) {
  const get = (obj) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  const v = get(catalogs[loc]);
  if (v != null) return v;
  const fb = get(catalogs[SOURCE]);
  return fb != null ? fb : key;
}

// ---- helpers --------------------------------------------------------------
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => esc(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const stripTags = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function fmtDate(loc, iso) {
  try { return new Intl.DateTimeFormat(loc, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso)); }
  catch (e) { return iso; }
}

function localBriefTitle(ed, loc) {
  return loc === 'ko' && ed.titleKo ? ed.titleKo : ed.title;
}
function localBriefItem(it, loc) {
  return {
    take: loc === 'ko' && it.takeKo ? it.takeKo : it.take,
    sourceName: loc === 'ko' && it.sourceNameKo ? it.sourceNameKo : it.sourceName,
    sourceUrl: it.sourceUrl,
  };
}


// localise a record field via record.translations[loc][field]; track whether localized
function loc1(record, loc, field) {
  const tr = record.translations && record.translations[loc];
  if (tr && tr[field] != null) return tr[field];
  return record[field];
}
function isTranslated(record, loc) {
  return loc === SOURCE || !!(record.translations && record.translations[loc]);
}

const link = (loc, rel) => `/${loc}/${rel}`;
const catBySlug = {}; categories.forEach((c) => (catBySlug[c.id] = c));
const postBySlug = {}; posts.forEach((p) => (postBySlug[p.slug] = p));
const publishedPosts = posts.filter((p) => p.status === 'published');
const publishedColumns = columns.filter((c) => c.status === 'published');
const levelBySlug = {}; levels.forEach((l) => (levelBySlug[l.slug] = l));
const paddleBySlug = {}; paddles.forEach((p) => (paddleBySlug[p.slug] = p));
const playerBySlug = {}; players.forEach((p) => (playerBySlug[p.slug] = p));
const publishedAutoUpdates = (autoUpdates || []).filter((u) => u && u.status === 'published');
for (const pl of players) {
  const live = duprSnapshot.ratings && duprSnapshot.ratings[pl.name];
  if (live) pl.dupr = Object.assign({}, pl.dupr || {}, live, { snapshotUpdated: duprSnapshot.updated, sourceUrl: duprSnapshot.sourceUrl });
}

function categoryName(cat, loc) { return loc1(cat, loc, 'name'); }
function ownerName(loc) { const tr = config.owner.translations && config.owner.translations[loc]; return (tr && tr.name) || config.owner.name; }
function ownerBio(loc) { const tr = config.owner.translations && config.owner.translations[loc]; return (tr && tr.bio) || config.owner.bio; }
function editorialPrinciplesFor(loc) {
  if (loc === 'ko') return [
    '검색엔진보다 플레이어를 먼저 생각합니다. 모든 페이지는 레벨 선택, 스킬 학습, 패들 비교, 선수 분석, 피드백 중 하나에 실제 도움을 주어야 합니다.',
    '직접 경험한 내용과 공개 스펙을 바탕으로 비교한 내용을 구분해 적습니다.',
    '랭킹, 가격, 대회 일정, 규칙처럼 바뀌는 정보는 공식 출처 확인 경로를 함께 제공합니다.',
    '가짜 리뷰, 과장된 자격, 확인되지 않은 통계는 사용하지 않습니다.',
    '글에는 게시일과 수정일을 표시하고, 장비와 경기 환경이 바뀌면 업데이트합니다.'
  ];
  if (loc === 'es') return [
    'Escribimos para jugadores, no solo para buscadores.',
    'Separamos lo probado de lo comparado por especificaciones publicadas.',
    'Para rankings, precios, fechas y reglas enlazamos a fuentes oficiales.',
    'No publicamos reseñas, credenciales ni estadísticas inventadas.',
    'Las guías muestran fecha de actualización y se revisan con el tiempo.'
  ];
  return config.editorialPrinciples || [];
}
function trustLabel(loc, key) {
  const labels = {
    en: { editorial:'Editorial Policy', corrections:'Corrections Policy', cookies:'Cookie Policy', advertising:'Advertising Disclosure', community:'Community Guidelines' },
    ko: { editorial:'편집 정책', corrections:'정정 정책', cookies:'쿠키 정책', advertising:'광고·제휴 고지', community:'커뮤니티 가이드라인' },
    es: { editorial:'Política editorial', corrections:'Correcciones', cookies:'Política de cookies', advertising:'Divulgación publicitaria', community:'Normas comunitarias' }
  };
  return (labels[loc] && labels[loc][key]) || labels.en[key] || key;
}

// DUPR rail positioning
function levelToPct(level) {
  if (!level) return null;
  const m = String(level).match(/[0-9]+(\.[0-9]+)?/);
  if (!m) return null;
  let v = parseFloat(m[0]);
  v = Math.max(2, Math.min(5, v));
  return ((v - 2) / 3) * 100;
}

// ---- table of contents from <h2 id> --------------------------------------
function tocFromBody(body) {
  const out = [];
  const re = /<h2 id="([^"]+)">(.*?)<\/h2>/g;
  let m;
  while ((m = re.exec(body))) out.push({ id: m[1], text: stripTags(m[2]) });
  return out;
}

// ===========================================================================
//  LAYOUT
// ===========================================================================
function languageSelector(loc, rel) {
  const opts = locales.map((l) => {
    const name = config.languageNames[l] || l;
    const sel = l === loc ? ' selected' : '';
    return `<option value="/${l}/${rel}"${sel}>${esc(name)}</option>`;
  }).join('');
  return `<form class="lang" aria-label="${escAttr(tt(loc, 'lang.label'))}">
      <span class="lang__icon" aria-hidden="true">🌐</span>
      <label class="visually-hidden" for="lang-select">${esc(tt(loc, 'lang.choose'))}</label>
      <select id="lang-select" class="lang__select" data-language-switcher>${opts}</select>
    </form>`;
}

function header(loc, rel) {
  const cur = rel || '';
  const navItems = [
    ['level/', tt(loc, 'nav.levelPathway')],
    ['paddles/', tt(loc, 'nav.paddles')],
    ['players/', tt(loc, 'nav.players')],
    ['tournaments/', tournamentLabel(loc, 'nav')],
    ['updates/', updateLabel(loc, 'nav')],
    ['boards/', boardLabel(loc, 'nav')],
    ['highlights/', tt(loc, 'nav.highlights')],
    ['what-is-dupr/', tt(loc, 'nav.dupr')],
    ['categories/', tt(loc, 'nav.guides')],
  ].map(([r, label]) => {
    const active = r !== '' && (cur === r || cur.indexOf(r) === 0);
    return `<a href="${link(loc, r)}"${active ? ' class="is-active" aria-current="page"' : ''}>${esc(label)}</a>`;
  }).join('');
  return `<a class="skip-link" href="#main">${esc(tt(loc, 'site.skip'))}</a>
<header class="masthead">
  <div class="wrap masthead__inner">
    <a class="brand" href="${link(loc, '')}" aria-label="${escAttr(config.siteName)} — home">
      <span class="brand__mark" aria-hidden="true"></span>
      <span class="brand__name">${esc(config.siteName)}</span>
    </a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="primary-nav">${esc(tt(loc, 'nav.menu'))}</button>
    <nav id="primary-nav" class="nav" aria-label="Primary">${navItems}</nav>
    ${languageSelector(loc, rel)}
  </div>
</header>`;
}

function sideRail(loc) {
  const lvlLinks = levels.map((l) => `<a href="${link(loc, 'level/' + l.slug + '/')}">${esc(l.id)}</a>`).join('');
  const primary = [
    ['category/rules-and-getting-started/', tt(loc, 'side.rules')],
    ['category/skills-and-drills/', tt(loc, 'side.skills')],
    ['paddles/', tt(loc, 'side.paddles')],
    ['players/', tt(loc, 'side.players')],
    ['tournaments/', tournamentLabel(loc, 'nav')],
    ['updates/', updateLabel(loc, 'nav')],
    ['boards/dupr-faq/', boardLabel(loc, 'faqShort')],
    ['boards/qna/', boardLabel(loc, 'qnaShort')],
    ['highlights/', tt(loc, 'side.highlights')],
  ].map(([r, label]) => `<a href="${link(loc, r)}">${esc(label)}</a>`).join('');
  return `<nav class="side-rail" aria-label="${escAttr(tt(loc, 'side.label'))}">
    <span class="side-rail__title">${esc(tt(loc, 'side.title'))}</span>
    <div class="side-rail__levels">${lvlLinks}</div>
    <div class="side-rail__main">${primary}</div>
  </nav>`;
}

function footer(loc) {
  const owner = config.owner;
  const links = [
    ['about/', tt(loc, 'footer.about')],
    ['editorial-policy/', trustLabel(loc, 'editorial')],
    ['corrections-policy/', trustLabel(loc, 'corrections')],
    ['advertising-disclosure/', trustLabel(loc, 'advertising')],
    ['community-guidelines/', trustLabel(loc, 'community')],
    ['privacy/', tt(loc, 'footer.privacy')],
    ['cookie-policy/', trustLabel(loc, 'cookies')],
    ['terms/', tt(loc, 'footer.terms')],
    ['disclaimer/', tt(loc, 'footer.disclaimer')],
    ['contact/', tt(loc, 'footer.contact')],
    ['sitemap/', tt(loc, 'footer.sitemap')],
  ].map(([r, label]) => `<a href="${link(loc, r)}">${esc(label)}</a>`).join('');
  const year = new Date().getFullYear();
  return `<footer class="site-foot">
  <div class="wrap site-foot__inner">
    <div class="site-foot__brand">
      <span class="brand__name">${esc(config.siteName)}</span>
      <p>${esc(tt(loc, 'footer.built'))}</p>
      <p class="site-foot__editor">${esc(tt(loc, 'label.by'))}
        <a href="${link(loc, 'author/')}">${esc(ownerName(loc))}</a> ·
        <a href="mailto:${escAttr(config.email)}">${esc(config.email)}</a></p>
    </div>
    <nav class="site-foot__links" aria-label="Footer">${links}</nav>
  </div>
  <div class="wrap site-foot__legal">© ${year} ${esc(config.siteName)}. ${esc(tt(loc, 'footer.rights'))} <span class="site-foot__build" title="site build time">build ${esc(BUILD_STAMP)}</span></div>
</footer>`;
}

function breadcrumbs(loc, trail) {
  // trail: [{name, rel|null}]
  const items = trail.map((t, i) => {
    const last = i === trail.length - 1;
    if (last || !t.rel) return `<li aria-current="page">${esc(t.name)}</li>`;
    return `<li><a href="${link(loc, t.rel)}">${esc(t.name)}</a></li>`;
  }).join('');
  const ld = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, name: t.name,
      item: t.rel != null ? `${config.url}${link(loc, t.rel)}` : undefined,
    })),
  };
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol class="wrap">${items}</ol></nav>
  <script type="application/ld+json">${JSON.stringify(ld)}</script>`;
}

function layout(opts) {
  // opts: {loc, rel, title, description, bodyHtml, ogType, noindex, jsonld, bodyClass}
  const { loc, rel } = opts;
  const dir = isRTL(loc) ? 'rtl' : 'ltr';
  const canonical = `${config.url}${link(loc, rel)}`;
  const alternates = locales.map((l) =>
    `<link rel="alternate" hreflang="${l}" href="${config.url}${link(l, rel)}">`).join('\n  ');
  const xdefault = `<link rel="alternate" hreflang="x-default" href="${config.url}${link(DEFAULT, rel)}">`;
  const titleFull = opts.title ? `${opts.title} · ${config.siteName}` : config.siteName;
  const desc = opts.description || config.description;
  const jsonldTags = (opts.jsonld || []).map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n  ');
  const adsenseId = ((config.adsense && config.adsense.clientId) || '').trim();
  const adsenseTags = (adsenseId && !opts.noAds)
    ? `<meta name="google-adsense-account" content="${escAttr(adsenseId)}">\n  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseId)}" crossorigin="anonymous"></script>`
    : '';
  return `<!doctype html>
<!-- ${config.siteName} build: ${BUILD_STAMP} (brand=${config.siteName}) -->
<html lang="${loc}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(titleFull)}</title>
  <meta name="description" content="${escAttr(desc)}">
  ${opts.noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow">'}
  <link rel="canonical" href="${canonical}">
  ${alternates}
  ${xdefault}
  <meta property="og:site_name" content="${escAttr(config.siteName)}">
  <meta property="og:type" content="${opts.ogType || 'website'}">
  <meta property="og:title" content="${escAttr(opts.title || config.siteName)}">
  <meta property="og:description" content="${escAttr(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="${loc}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escAttr(opts.title || config.siteName)}">
  <meta name="twitter:description" content="${escAttr(desc)}">
  <meta name="theme-color" content="${config.colors.main}">
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/style.css">
  ${jsonldTags}
  ${adsenseTags}
</head>
<body class="${opts.bodyClass || ''}">
  ${header(loc, rel)}
  ${sideRail(loc)}
  <main id="main">
${opts.bodyHtml}
  </main>
  ${footer(loc)}
  <script src="/assets/js/site.js" defer></script>
</body>
</html>`;
}

// ===========================================================================
//  COMPONENTS
// ===========================================================================
function postCard(p, loc) {
  const cat = catBySlug[p.category];
  const title = loc1(p, loc, 'title');
  const summary = loc1(p, loc, 'summary');
  return `<article class="card">
    <a class="card__link" href="${link(loc, p.slug + '/')}">
      <span class="card__cat">${esc(categoryName(cat, loc))}</span>
      <h3 class="card__title">${esc(title)}</h3>
      <p class="card__summary">${esc(summary)}</p>
      <span class="card__meta">${esc(tt(loc, 'label.updated'))} ${esc(fmtDate(loc, p.updated))}${p.level ? ` · ${esc(tt(loc, 'label.level'))} ${esc(p.level)}` : ''}</span>
    </a>
  </article>`;
}

function columnCard(c, loc) {
  return `<article class="card card--column">
    <a class="card__link" href="${link(loc, 'columns/' + c.slug + '/')}">
      <span class="card__cat card__cat--column">${esc(tt(loc, 'label.column'))}</span>
      <h3 class="card__title">${esc(loc1(c, loc, 'title'))}</h3>
      <p class="card__summary">${esc(loc1(c, loc, 'subtitle'))}</p>
      <span class="card__meta">${esc(fmtDate(loc, c.updated))}</span>
    </a>
  </article>`;
}

function duprRail(loc, opts) {
  opts = opts || {};
  const anchors = ['2.0', '3.0', '4.0', '5.0'];
  const ticks = config.duprPathway.map((lbl) => {
    const pct = levelToPct(lbl);
    // in milestone mode the 4 anchor levels are drawn as interactive markers instead
    if (opts.milestones && anchors.indexOf(lbl) >= 0) return '';
    const linkedLevel = levels.find((l) => l.id === lbl);
    const labelHtml = linkedLevel
      ? `<a class="rail__tick-label rail__tick-link" href="${levelUrl(loc, linkedLevel)}" aria-label="${escAttr(tt(loc, 'label.level'))} ${escAttr(lbl)}">${esc(lbl)}</a>`
      : `<span class="rail__tick-label">${esc(lbl)}</span>`;
    return `<div class="rail__tick${opts.milestones ? ' rail__tick--minor' : ''}" style="left:${pct}%">${labelHtml}</div>`;
  }).join('');
  const skillPosts = publishedPosts.filter((p) => p.category === 'skills' && p.level);
  const pins = skillPosts.map((p) => {
    const pct = levelToPct(p.level);
    return `<a class="rail__pin" style="left:${pct}%" href="${link(loc, p.slug + '/')}" title="${escAttr(loc1(p, loc, 'title'))}">
      <span class="rail__pin-dot"></span><span class="rail__pin-label">${esc(loc1(p, loc, 'title'))}</span></a>`;
  }).join('');
  const here = opts.level != null ? `<div class="rail__here" style="left:${levelToPct(opts.level)}%" aria-hidden="true"></div>` : '';
  let milestones = '';
  if (opts.milestones) {
    milestones = anchors.map((id, i) => {
      const lv = levels.find((l) => l.id === id);
      if (!lv) return '';
      const pct = levelToPct(id);
      const title = loc1(lv, loc, 'title') || ('Level ' + id);
      const summary = loc1(lv, loc, 'summary') || '';
      const focusArr = loc1(lv, loc, 'focus');
      const focus = Array.isArray(focusArr) ? focusArr.slice(0, 4).join('||') : '';
      const href = levelUrl(loc, lv);
      const cta = loc === 'ko' ? (id + ' 단계 가이드 열기') : (loc === 'es' ? ('Abrir la guía ' + id) : ('Open the ' + id + ' guide'));
      return `<button type="button" class="rail__ms rail__ms--m${i}" style="left:${pct}%" data-ms data-ms-id="${escAttr(id)}" data-ms-title="${escAttr(title)}" data-ms-summary="${escAttr(summary)}" data-ms-focus="${escAttr(focus)}" data-ms-href="${escAttr(href)}" data-ms-cta="${escAttr(cta)}" aria-haspopup="dialog" aria-label="${escAttr(title)}"><span class="rail__ms-dot" aria-hidden="true"></span><span class="rail__ms-num">${esc(id)}</span></button>`;
    }).join('');
  }
  const roleAttr = opts.milestones
    ? `role="group" aria-label="${escAttr(tt(loc, 'pathway.label'))}"`
    : `role="img" aria-label="${escAttr(tt(loc, 'pathway.label'))}"`;
  return `<div class="rail${opts.milestones ? ' rail--interactive' : ''}" ${roleAttr}>
    <div class="rail__line"></div>
    ${ticks}
    ${here}
    ${opts.compact ? '' : pins}
    ${milestones}
  </div>`;
}

function authorBox(loc) {
  const o = config.owner;
  return `<aside class="editor-box">
    <span class="editor-box__avatar" aria-hidden="true">${esc((ownerName(loc) || 'P').trim().charAt(0))}</span>
    <div>
      <p class="editor-box__name"><a href="${link(loc, 'author/')}">${esc(ownerName(loc))}</a></p>
      <p class="editor-box__bio">${esc(ownerBio(loc))}</p>
    </div>
  </aside>`;
}

function fallbackNotice(loc) {
  return `<p class="notice notice--fallback">${esc(tt(loc, 'fallback.notice'))}</p>`;
}

function listBlock(titleKey, items, loc, cls) {
  if (!items || !items.length) return '';
  return `<section class="block ${cls || ''}">
    <h2>${esc(tt(loc, titleKey))}</h2>
    <ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
  </section>`;
}

function pills(items, cls) {
  if (!items || !items.length) return '';
  return `<div class="pills ${cls || ''}">${items.map((i) => `<span class="pill">${esc(i)}</span>`).join('')}</div>`;
}

const visuals = {
  court: { src: 'court-zones.svg', key: 'visual.court' },
  skills: { src: 'skill-shot-map.svg', key: 'visual.skills' },
  paddles: { src: 'paddle-shapes.svg', key: 'visual.paddles' },
  dupr: { src: 'dupr-ladder.svg', key: 'visual.dupr' },
  players: { src: 'pro-profile.svg', key: 'visual.players' },
  highlights: { src: 'highlight-battle.svg', key: 'visual.highlights' },
  boards: { src: 'community-board.svg', key: 'visual.boards' },
  ratings: { src: 'paddle-ratings.svg', key: 'paddles.intro' },
};
const categoryVisualKey = { rules: 'court', skills: 'skills', gear: 'paddles', compete: 'dupr', scene: 'players' };
function renderDuprCheck(loc) {
  const PRESETS = {
    youUp: [{ x: 90, y: 268 }, { x: 210, y: 268 }],
    youBase: [{ x: 90, y: 418 }, { x: 210, y: 418 }],
    youTrans: [{ x: 150, y: 338 }, { x: 214, y: 268 }],
    youWide: [{ x: 28, y: 286 }, { x: 182, y: 268 }],
    youErne: [{ x: 120, y: 268 }, { x: 250, y: 252 }],
    oppUp: [{ x: 90, y: 188 }, { x: 210, y: 188 }],
    oppBack: [{ x: 90, y: 78 }, { x: 210, y: 78 }],
    // keys used by the 30-scenario pool (data/dupr-quiz.js)
    ourUp: [{ x: 90, y: 268 }, { x: 210, y: 268 }],
    ourBaseline: [{ x: 90, y: 418 }, { x: 210, y: 418 }],
    ourTransition: [{ x: 150, y: 338 }, { x: 214, y: 268 }],
    ourWideL: [{ x: 28, y: 286 }, { x: 182, y: 268 }],
    ourWideR: [{ x: 272, y: 286 }, { x: 118, y: 268 }],
    ourScramble: [{ x: 120, y: 400 }, { x: 205, y: 414 }],
    ourReturn: [{ x: 206, y: 412 }, { x: 96, y: 284 }],
    oppOneBackR: [{ x: 90, y: 188 }, { x: 235, y: 92 }],
    oppStaggerL: [{ x: 60, y: 188 }, { x: 210, y: 120 }]
  };
  const coords = (k) => PRESETS[k] || PRESETS.youUp;
  const scenarios = duprQuiz.map((q) => ({
    id: q.id, diff: q.difficulty || q.diff || 2,
    prompt: loc === 'ko' && q.promptKo ? q.promptKo : q.prompt,
    incoming: loc === 'ko' && q.incomingKo ? q.incomingKo : q.incoming,
    explain: loc === 'ko' && q.explainKo ? q.explainKo : q.explain,
    you: coords(q.you), opp: coords(q.opp), ball: q.ball || null,
    shot: q.shot || {}, power: q.power || {}, zone: q.zone || {}
  }));
  const SHOTS = [['dink', 'Dink', '딩크'], ['drop', 'Drop', '드롭'], ['drive', 'Drive', '드라이브'], ['reset', 'Reset', '리셋'], ['block', 'Block', '블록'], ['smash', 'Smash', '스매시'], ['speedup', 'Speed-up', '스피드업'], ['lob', 'Lob', '로브']];
  const POWERS = [['soft', 'Soft', '약하게'], ['medium', 'Medium', '중간'], ['hard', 'Hard', '강하게']];
  const ZONES = { kL: ['Their kitchen — left', '상대 키친 · 왼쪽'], kM: ['Their kitchen — middle', '상대 키친 · 가운데'], kR: ['Their kitchen — right', '상대 키친 · 오른쪽'], bL: ['Their back — left', '상대 백코트 · 왼쪽'], bM: ['Their back — middle', '상대 백코트 · 가운데'], bR: ['Their back — right', '상대 백코트 · 오른쪽'] };
  const t = (en, ko) => (loc === 'ko' ? ko : en);
  const bands = [
    { max: 2.50, slug: '2-0', desc: t('Building the basics — keep the ball in play, learn the two-bounce rule, and get to the kitchen.', '기초 단계 — 공을 계속 살리고, 투바운스 규칙을 익히고, 키친으로 전진하세요.') },
    { max: 3.00, slug: '2-5', desc: t('You know the shots — build consistency and move up behind your return.', '샷은 압니다 — 일관성을 키우고 리턴 뒤 전진을 익히세요.') },
    { max: 3.50, slug: '3-0', desc: t('Solid fundamentals — sharpen your third-shot drop, resets, and patience in dinks.', '기본기가 탄탄 — 서드샷 드롭, 리셋, 딩크에서의 인내를 다듬으세요.') },
    { max: 4.00, slug: '3-5', desc: t('Strong shot selection — tighten decisions under pace and on big points.', '샷 선택이 좋음 — 빠른 공과 중요한 포인트의 판단을 정교하게 다듬으세요.') },
    { max: 9.99, slug: '4-0', desc: t('Advanced decision-making — refine patterns, hands battles, and avoiding low-percentage attacks.', '고급 의사결정 — 패턴, 핸즈 배틀, 저확률 공격 줄이기를 다듬으세요.') }
  ];
  const labels = {
    yourShot: t('Your shot', '사용할 샷'), power: t('Power', '강도'),
    target: t('Target', '보낼 곳'), tapZone: t('Tap a zone on the opponent’s court', '상대 코트에서 보낼 구역을 탭하세요'),
    chosen: t('Selected', '선택됨'), next: t('Next', '다음'), back: t('Back', '이전'), see: t('See result', '결과 보기'),
    you: t('You', '우리'), opp: t('Opponent', '상대'), incoming: t('Incoming ball', '들어오는 공'),
    incomingPower: t('Incoming power', '들어오는 강도'),
    of: t('of', '/'), retake: t('Retake', '다시 하기'),
    best: t('Higher-percentage play', '더 높은 확률의 선택'), yours: t('Your choice', '내 선택'),
    showAnswer: t('Show the higher-percentage play', '정답(고확률 선택) 보기'),
    score: t('Decision score', '의사결정 점수'), est: t('Estimated DUPR', '추정 DUPR'),
    guide: t('Open the matching level guide', '해당 레벨 가이드 열기'),
    reviewTitle: t('Question-by-question', '문항별 리뷰')
  };
  const data = JSON.stringify({ scenarios, total: 10, shots: SHOTS, powers: POWERS, zones: ZONES, bands, labels }).replace(/</g, '\\u003c');

  const zoneRect = (id, x, y, w, h) => `<rect class="court-zone" data-zone="${id}" x="${x}" y="${y}" width="${w}" height="${h}" rx="3"></rect>`;
  const courtSvg = `<svg class="court-svg" viewBox="0 0 300 460" role="application" aria-label="${escAttr(t('Court — tap a target zone', '코트 — 보낼 구역 선택'))}">
    <rect x="18" y="20" width="264" height="416" fill="#eaf3ef" stroke="#1E6F5C" stroke-width="2.5"/>
    <rect x="18" y="176" width="264" height="52" fill="#fbe9b0" opacity="0.55"/>
    <rect x="18" y="228" width="264" height="52" fill="#fbe9b0" opacity="0.55"/>
    <line x1="18" y1="228" x2="282" y2="228" stroke="#14513f" stroke-width="3" stroke-dasharray="7 5"/>
    <line x1="150" y1="20" x2="150" y2="176" stroke="#1E6F5C" stroke-width="1.5"/>
    <line x1="150" y1="280" x2="150" y2="436" stroke="#1E6F5C" stroke-width="1.5"/>
    <g class="court-zones">
      ${zoneRect('bL', 20, 22, 80, 152)}${zoneRect('bM', 100, 22, 100, 152)}${zoneRect('bR', 200, 22, 80, 152)}
      ${zoneRect('kL', 20, 176, 80, 50)}${zoneRect('kM', 100, 176, 100, 50)}${zoneRect('kR', 200, 176, 80, 50)}
    </g>
    <text x="150" y="14" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#5b665f">${esc(labels.opp)}</text>
    <text x="150" y="452" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#5b665f">${esc(labels.you)}</text>
    <g data-markers></g>
  </svg>`;

  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: t('DUPR self-check', 'DUPR 자가진단') }])}
<section class="page-head"><div class="wrap">
  <p class="page-head__eyebrow">${esc(tt(loc, 'pathway.label'))}</p>
  <h1>${esc(t('DUPR self-check: what would you do?', 'DUPR 자가진단: 당신이라면?'))}</h1>
  <p class="page-head__intro">${esc(t('Ten on-court situations. Pick your shot, power, and target — we estimate a level from your decisions.', '코트 위 10가지 상황. 샷·강도·방향을 선택하면, 당신의 판단을 바탕으로 레벨을 추정해 드립니다.'))}</p>
  <p class="notice">${esc(t('This is a quick self-assessment of shot selection — not an official DUPR rating. Real DUPR is calculated from logged match results at dupr.com.', '이것은 샷 선택에 대한 간단한 자가진단이며 공식 DUPR 점수가 아닙니다. 실제 DUPR은 dupr.com에서 실제 경기 기록으로 산출됩니다.'))}</p>
</div></section>
<section class="band"><div class="wrap">
  <div class="quiz" data-dupr-quiz>
    <div class="quiz__bar"><span class="quiz__count"><span data-q-num>1</span> ${esc(labels.of)} <span data-q-total>10</span></span><div class="quiz__progress"><span data-q-fill></span></div></div>
    <p class="quiz__prompt" data-q-prompt></p>
    <p class="quiz__incoming"><strong>${esc(labels.incoming)}:</strong> <span data-q-incoming></span> <span class="quiz__power-chip" data-q-power></span></p>
    <div class="quiz__layout">
      <div class="quiz__court">
        ${courtSvg}
        <ul class="court-legend"><li><span class="dot dot--you"></span>${esc(labels.you)}</li><li><span class="dot dot--opp"></span>${esc(labels.opp)}</li><li><span class="dot dot--ball"></span>${esc(labels.incoming)}</li></ul>
      </div>
      <div class="quiz__controls">
        <div class="quiz__group"><h3>${esc(labels.yourShot)}</h3><div class="opts" data-opts="shot">${SHOTS.map((s) => `<button type="button" class="opt" data-val="${s[0]}">${esc(loc === 'ko' ? s[2] : s[1])}</button>`).join('')}</div></div>
        <div class="quiz__group"><h3>${esc(labels.power)}</h3><div class="opts opts--power" data-opts="power">${POWERS.map((p) => `<button type="button" class="opt" data-val="${p[0]}">${esc(loc === 'ko' ? p[2] : p[1])}</button>`).join('')}</div></div>
        <div class="quiz__group"><h3>${esc(labels.target)}</h3><p class="quiz__hint">${esc(labels.tapZone)}</p><p class="quiz__zone-label" data-zone-label>—</p></div>
        <div class="quiz__nav"><button type="button" class="btn btn--ghost quiz__back" data-q-back hidden>${esc(labels.back)}</button><button type="button" class="btn btn--primary quiz__next" data-q-next disabled>${esc(labels.next)}</button></div>
      </div>
    </div>
  </div>
  <div class="quiz__result" data-q-result hidden></div>
  <script type="application/json" id="dupr-quiz-data">${data}</script>
</div></section>`;
  return layout({ loc, rel: 'dupr-self-check/', title: t('DUPR self-check', 'DUPR 자가진단'), description: t('A 10-question, court-based self-assessment that estimates your pickleball level from your shot decisions.', '샷 선택으로 피클볼 레벨을 추정하는 코트 기반 10문항 자가진단.'), bodyHtml: body, bodyClass: 'page-quiz' });
}

function visualFigure(loc, key, cls) {
  const v = visuals[key] || visuals.court;
  const caption = tt(loc, v.key);
  return `<figure class="visual-card ${cls || ''}"><img src="/assets/img/${escAttr(v.src)}" alt="${escAttr(caption)}" loading="lazy"><figcaption>${esc(caption)}</figcaption></figure>`;
}
function contentVisual(loc, categoryId) { return visualFigure(loc, categoryVisualKey[categoryId] || 'court', 'visual-card--article'); }

function sourcePanel(loc, categoryId) {
  const labels = loc === 'ko'
    ? { title: '출처 및 최신 확인 링크', intro: '규칙, 승인 장비, 랭킹, 가격처럼 바뀔 수 있는 정보는 아래 공식 출처에서 다시 확인하세요.' }
    : { title: 'Sources and live-check links', intro: 'For rules, approved equipment, rankings, prices, and other changing details, verify with these primary sources.' };
  const common = [
    { name: 'USA Pickleball', url: 'https://usapickleball.org' },
    { name: 'DUPR', url: 'https://dupr.com' },
  ];
  const byCat = {
    gear: [{ name: 'USA Pickleball Approved Equipment', url: 'https://equipment.usapickleball.org/paddle-list/' }],
    compete: [{ name: 'DUPR', url: 'https://dupr.com' }, { name: 'PPA Tour Rankings', url: 'https://ppatour.com/player-rankings/' }],
    scene: [{ name: 'PPA Tour Players', url: 'https://ppatour.com/athletes/' }, { name: 'Pickleball.com', url: 'https://pickleball.com' }],
    rules: [{ name: 'USA Pickleball Rules', url: 'https://usapickleball.org/what-is-pickleball/official-rules/' }],
    skills: [{ name: 'USA Pickleball', url: 'https://usapickleball.org' }],
  };
  const links = [...(byCat[categoryId] || []), ...common]
    .filter((x, i, arr) => arr.findIndex((y) => y.url === x.url) === i);
  return `<aside class="source-panel"><h2>${esc(labels.title)}</h2><p>${esc(labels.intro)}</p><ul>${links.map((x) => `<li><a href="${escAttr(x.url)}" rel="nofollow noopener" target="_blank">${esc(x.name)}</a></li>`).join('')}</ul></aside>`;
}


function localArray(record, loc, field) {
  const v = loc1(record, loc, field);
  return Array.isArray(v) ? v : [];
}
function levelUrl(loc, level) { return link(loc, 'level/' + level.slug + '/'); }
function levelCard(level, loc) {
  return `<article class="level-card">
    <a href="${levelUrl(loc, level)}" class="level-card__link">
      <span class="level-card__badge">${esc(level.id)}</span>
      <h3>${esc(loc1(level, loc, 'title'))}</h3>
      <p>${esc(loc1(level, loc, 'summary'))}</p>
      ${pills(localArray(level, loc, 'skills').slice(0, 3), 'pills--compact')}
    </a>
  </article>`;
}
function levelGrid(loc) { return `<div class="level-grid">${levels.map((l) => levelCard(l, loc)).join('')}</div>`; }

function levelQuickSelect(loc) {
  const label = loc === 'ko' ? 'DUPR 레벨 바로 선택' : (loc === 'es' ? 'Elegir nivel DUPR' : 'Choose a DUPR level');
  const hint = loc === 'ko'
    ? '2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0 중 원하는 레벨을 바로 열 수 있습니다.'
    : (loc === 'es'
      ? 'Abre directamente cualquier nivel de 2.0 a 5.0.'
      : 'Open any level from 2.0 through 5.0 directly.');
  return `<div class="level-quick-select" aria-label="${escAttr(label)}">
    <a class="level-quick-select__selfcheck" href="${link(loc, 'dupr-self-check/')}"><span aria-hidden="true">◎</span> ${esc(loc === 'ko' ? '내 레벨 자가진단 시작' : (loc === 'es' ? 'Autoevaluación DUPR' : 'Start the DUPR self-check'))}</a>
    <p class="level-quick-select__label">${esc(label)}</p>
    <div class="level-quick-select__buttons">${levels.map((l) => `<a class="level-chip level-chip--b${parseInt(l.id, 10)}" href="${levelUrl(loc, l)}">${esc(l.id)}</a>`).join('')}</div>
    <p class="level-quick-select__hint">${esc(hint)}</p>
  </div>`;
}

const styleLabels = {
  en: { control:'Control', power:'Power', spin:'Spin', 'all-court':'All-court', hands:'Hands-speed', value:'Value' },
  ko: { control:'컨트롤', power:'파워', spin:'스핀', 'all-court':'올라운드', hands:'빠른 손', value:'가성비' },
  es: { control:'Control', power:'Potencia', spin:'Efecto', 'all-court':'All-court', hands:'Manos rápidas', value:'Valor' }
};
const traitLabels = {
  en: { control:'Control', spin:'Spin', reach:'Reach', forgiveness:'Forgiveness', hands:'Quick hands', touch:'Touch', maneuverability:'Maneuverability', stability:'Stability', power:'Power', balance:'Balance', value:'Value', durability:'Durability', 'arm-comfort':'Arm comfort', pop:'Pop' },
  ko: { control:'컨트롤', spin:'스핀', reach:'리치', forgiveness:'관용성', hands:'빠른 손', touch:'터치', maneuverability:'조작성', stability:'안정성', power:'파워', balance:'밸런스', value:'가성비', durability:'내구성', 'arm-comfort':'팔 부담 완화', pop:'반발력' },
  es: { control:'Control', spin:'Efecto', reach:'Alcance', forgiveness:'Perdón', hands:'Manos rápidas', touch:'Toque', maneuverability:'Manejabilidad', stability:'Estabilidad', power:'Potencia', balance:'Balance', value:'Valor', durability:'Durabilidad', 'arm-comfort':'Comodidad brazo', pop:'Pop' }
};
function styleLabel(loc, style) { return (styleLabels[loc] && styleLabels[loc][style]) || styleLabels.en[style] || style; }
function traitLabel(loc, trait) { return (traitLabels[loc] && traitLabels[loc][trait]) || traitLabels.en[trait] || trait; }
const enrichLabels = {
  en: { exactPrice:'Reference price', priceSource:'Price note', officialProduct:'Official product page', ratings:'Play profile', biography:'Biography', hometown:'Hometown / base', age:'Age', height:'Height', turnedPro:'Turned pro', plays:'Plays', resides:'Resides', officialProfile:'Official profile', secondaryProfile:'More stats/profile', imageNote:'Image note', currentSources:'Live sources', sourceNote:'Prices, sponsors, rankings, DUPR, and product availability change. Verify on the linked official source before publishing buying advice.', profilePhoto:'Official photos / profile' },
  ko: { exactPrice:'대표 가격', priceSource:'가격 기준', officialProduct:'공식 제품 페이지', ratings:'성향 점수', biography:'약력', hometown:'출신/기반', age:'나이', height:'신장', turnedPro:'프로 전향', plays:'주손', resides:'거주/활동', officialProfile:'공식 프로필', secondaryProfile:'추가 선수 DB', imageNote:'이미지 안내', currentSources:'실시간 출처', sourceNote:'가격, 스폰서, 랭킹, DUPR, 재고는 변동됩니다. 구매 조언으로 게시하기 전 연결된 공식 출처에서 다시 확인하세요.', profilePhoto:'공식 사진/프로필' },
  es: { exactPrice:'Precio de referencia', priceSource:'Nota de precio', officialProduct:'Página oficial del producto', ratings:'Perfil de juego', biography:'Biografía', hometown:'Origen / base', age:'Edad', height:'Altura', turnedPro:'Profesional desde', plays:'Mano', resides:'Residencia', officialProfile:'Perfil oficial', secondaryProfile:'Más datos/perfil', imageNote:'Nota de imagen', currentSources:'Fuentes en vivo', sourceNote:'Precios, patrocinadores, rankings, DUPR y disponibilidad cambian. Verifica la fuente oficial antes de publicar consejos de compra.', profilePhoto:'Fotos / perfil oficial' }
};
function ui(loc, key) { return (enrichLabels[loc] && enrichLabels[loc][key]) || enrichLabels.en[key] || key; }
function paddleTitle(p) { return `${p.brand} ${p.model}`; }
function priceLabel(p) {
  if (typeof p.priceUsd === 'number') return '$' + p.priceUsd.toFixed(2);
  return p.priceBand || '—';
}
function assetImage(src, alt, cls) {
  if (!src) return '';
  return `<img class="${escAttr(cls || '')}" src="${escAttr(src)}" alt="${escAttr(alt || '')}" loading="lazy">`;
}
// Slug-matched stylised illustration (players/, paddles/). Falls back to assetImage.
function entityIllus(folder, slug, fallbackSrc, alt, note) {
  const relPath = 'assets/img/' + folder + '/' + slug + '.svg';
  let exists = false;
  try { exists = fs.existsSync(path.join(ROOT, relPath)); } catch (e) { exists = false; }
  const imgHtml = exists
    ? `<img class="entity-hero__img" src="/${relPath}" alt="${escAttr(alt || '')}" loading="lazy">`
    : assetImage(fallbackSrc, alt, 'entity-hero__img');
  if (!imgHtml) return '';
  return `<figure class="entity-hero">${imgHtml}<figcaption>${esc(note || alt || '')}</figcaption></figure>`;
}
function externalButton(label, url) {
  if (!url) return '';
  return `<a class="btn btn--ghost" href="${escAttr(url)}" rel="nofollow noopener" target="_blank">${esc(label)}</a>`;
}
function ratingBars(ratings, loc) {
  if (!ratings) return '';
  const labels = { en:{power:'Power',control:'Control',spin:'Spin',forgiveness:'Forgiveness',speed:'Hand speed'}, ko:{power:'파워',control:'컨트롤',spin:'스핀',forgiveness:'관용성',speed:'손속도'}, es:{power:'Potencia',control:'Control',spin:'Efecto',forgiveness:'Perdón',speed:'Velocidad'} };
  const order = ['power','control','spin','forgiveness','speed'];
  const l = labels[loc] || labels.en;
  return `<div class="rating-bars" aria-label="${escAttr(ui(loc, 'ratings'))}">${order.map((key) => {
    const val = Math.max(0, Math.min(10, Number(ratings[key] || 0)));
    return `<div class="rating-row"><span>${esc(l[key])}</span><b style="--score:${val * 10}%"><i></i></b><em>${esc(val.toFixed(1))}</em></div>`;
  }).join('')}</div>`;
}

function duprMini(player, loc) {
  const d = player.dupr || {};
  const bits = [];
  if (d.doubles) bits.push((loc === 'ko' ? '복식' : loc === 'es' ? 'Dobles' : 'Doubles') + ' ' + d.doubles);
  if (d.singles) bits.push((loc === 'ko' ? '싱글' : loc === 'es' ? 'Singles' : 'Singles') + ' ' + d.singles);
  if (!bits.length) return `<span class="dupr-chip dupr-chip--muted">${esc(loc === 'ko' ? 'DUPR 확인 필요' : loc === 'es' ? 'DUPR por verificar' : 'DUPR check')}</span>`;
  return `<span class="dupr-chip">DUPR ${esc(bits.join(' · '))}</span>`;
}
function duprPanel(player, loc) {
  const d = player.dupr || {};
  const hasNums = (d.doubles != null && d.doubles !== '') || (d.singles != null && d.singles !== '');
  const title = loc === 'ko' ? 'DUPR (공식 출처 확인)' : loc === 'es' ? 'DUPR (fuente oficial)' : 'DUPR (check official source)';
  const note = loc === 'ko'
    ? 'DUPR는 경기 결과가 반영될 때마다 바뀝니다. Picklary은 실시간 숫자를 그대로 옮겨 싣지 않고 공식 DUPR 랭킹으로 연결합니다. 최신 값은 아래 링크에서 확인하세요.'
    : loc === 'es'
      ? 'DUPR cambia cada vez que se procesan resultados. Picklary no reproduce el número en vivo; enlazamos a las clasificaciones oficiales. Consulta el valor actual en el enlace.'
      : 'DUPR changes every time match results are processed. Rather than reproduce a live number, Picklary links you to the official DUPR rankings — check the current value at the link below.';
  let table = '';
  if (hasNums) {
    const rows = [
      [loc === 'ko' ? '복식 DUPR (참고)' : loc === 'es' ? 'DUPR dobles (ref.)' : 'Doubles DUPR (ref.)', d.doubles],
      [loc === 'ko' ? '싱글 DUPR (참고)' : loc === 'es' ? 'DUPR singles (ref.)' : 'Singles DUPR (ref.)', d.singles]
    ].filter(function (r) { return r[1] != null && r[1] !== ''; });
    table = `<table class="spec-table"><tbody>${rows.map(([k, v]) => fieldRow(k, v)).join('')}</tbody></table>`;
  }
  return `<div class="spec-card dupr-panel"><h2>${esc(title)}</h2>${table}<div class="source-buttons"><a class="btn btn--primary" href="${escAttr(d.sourceUrl || 'https://www.dupr.com/rankings')}" rel="nofollow noopener" target="_blank">DUPR Rankings</a></div><p class="notice">${esc(note)}</p></div>`;
}
function reviewerRoundup(paddle, loc) {
  const items = paddle.reviewerScores || [];
  const title = loc === 'ko' ? '주요 리뷰어 리뷰 결과' : loc === 'es' ? 'Resultados de reviewers' : 'Reviewer roundup';
  const note = loc === 'ko'
    ? '외부 리뷰어 점수는 원문 기준이 서로 다를 수 있어 Picklary 내부 점수와 분리해 표시합니다. 구매 전 원문 리뷰와 최신 제품 버전을 확인하세요.'
    : loc === 'es'
      ? 'Las escalas externas pueden variar. Verifica la review original y la versión actual del producto.'
      : 'External reviewer scales can differ. Verify the original review and the current product version before buying.';
  if (!items.length) return `<div class="spec-card"><h2>${esc(title)}</h2><p class="notice">${esc(loc === 'ko' ? '아직 연결된 외부 리뷰어 스코어가 없습니다. 리뷰어 링크를 추가하면 이 영역에 자동 표시됩니다.' : 'No reviewer-score links are connected yet.')}</p></div>`;
  return `<div class="spec-card reviewer-roundup"><h2>${esc(title)}</h2>${items.map((r) => `<article class="reviewer-row"><div><strong>${esc(r.reviewer)}</strong><p>${esc(loc === 'ko' && r.noteKo ? r.noteKo : r.note || '')}</p></div><div class="reviewer-score"><span>${esc(r.score || 'source')}</span><a href="${escAttr(r.url || '#')}" rel="nofollow noopener" target="_blank">${esc(loc === 'ko' ? '원문' : loc === 'es' ? 'Fuente' : 'Source')}</a></div></article>`).join('')}<p class="notice">${esc(note)}</p></div>`;
}
function paddleEngagement(paddle, loc) {
  const labels = {
    ko: { title:'유저 반응', like:'좋아요', review:'후기 남기기', name:'닉네임', text:'후기', submit:'저장', note:'현재 데모는 브라우저 localStorage에만 저장됩니다. 공개 운영 전에는 로그인, 신고, 검수 기능이 필요합니다.' },
    en: { title:'User reaction', like:'Like', review:'Leave a review', name:'Name', text:'Review', submit:'Save', note:'This demo stores feedback only in this browser localStorage. Add login, reporting, and moderation before public UGC.' },
    es: { title:'Reacción de usuarios', like:'Me gusta', review:'Dejar reseña', name:'Nombre', text:'Reseña', submit:'Guardar', note:'Esta demo guarda feedback solo en localStorage del navegador. Para UGC público agrega login, reportes y moderación.' }
  };
  const l = labels[loc] || labels.en;
  return `<div class="spec-card paddle-engagement" data-paddle-engagement data-paddle-slug="${escAttr(paddle.slug)}" data-like-label="${escAttr(l.like)}">
    <h2>${esc(l.title)}</h2>
    <button class="btn btn--primary" type="button" data-paddle-like>♡ ${esc(l.like)} <span data-paddle-like-count>0</span></button>
    <form class="mini-form" data-paddle-review-form>
      <h3>${esc(l.review)}</h3>
      <label><span>${esc(l.name)}</span><input name="name" maxlength="40" placeholder="PicklePlayer"></label>
      <label><span>${esc(l.text)}</span><textarea name="text" maxlength="700" required></textarea></label>
      <button class="btn btn--ghost" type="submit">${esc(l.submit)}</button>
    </form>
    <div class="local-reviews" data-paddle-review-list></div>
    <p class="notice">${esc(l.note)}</p>
  </div>`;
}

function paddleCard(p, loc) {
  const img = assetImage(p.image, p.imageAlt || paddleTitle(p), 'entity-card__img');
  return `<article class="paddle-card" data-paddle-card data-brand="${escAttr(p.brand)}" data-style="${escAttr(p.style)}" data-levels="${escAttr((p.levels || []).join(' '))}">
    <a class="paddle-card__link" href="${link(loc, 'paddles/' + p.slug + '/')}">
      ${img ? `<div class="entity-card__media entity-card__media--paddle">${img}<span class="price-chip">${esc(priceLabel(p))}</span></div>` : ''}
      <span class="paddle-card__brand">${esc(p.brand)}</span>
      <h3>${esc(p.model)}</h3>
      <p class="paddle-card__meta">${esc(styleLabel(loc, p.style))} · ${esc(p.shape)} · ${esc(priceLabel(p))}</p>
      ${pills((p.traits || []).map((t) => traitLabel(loc, t)).slice(0, 4), 'pills--compact')}
      <p class="paddle-card__note">${esc(loc1(p, loc, 'reviewSignal'))}</p>
      <span class="card__meta">${esc(tt(loc, 'paddles.viewDetails'))}</span>
    </a>
  </article>`;
}
function playerCard(player, loc) {
  const img = assetImage(player.image, player.imageAlt || player.name, 'entity-card__img');
  const bio = loc1(player, loc, 'bio') || '';
  return `<article class="player-card">
    <a class="player-card__link" href="${link(loc, 'players/' + player.slug + '/')}">
      ${img ? `<div class="entity-card__media entity-card__media--player">${img}</div>` : ''}
      <span class="player-card__country">${esc(player.countryCode || player.country)}</span>
      ${duprMini(player, loc)}
      <h3>${esc(player.name)}</h3>
      <p>${esc(loc1(player, loc, 'style'))}</p>
      ${bio ? `<p class="player-card__bio">${esc(bio).slice(0, 165)}${bio.length > 165 ? '…' : ''}</p>` : ''}
      ${pills((player.skills || []).slice(0, 4), 'pills--compact')}
      <span class="card__meta">${esc(tt(loc, 'players.viewProfile'))}</span>
    </a>
  </article>`;
}
function fieldRow(label, value) {
  if (Array.isArray(value)) value = value.join(', ');
  return `<tr><th>${esc(label)}</th><td>${esc(value || '—')}</td></tr>`;
}

// ===========================================================================
//  PAGES
// ===========================================================================
function renderHome(loc) {
  const latest = [...publishedPosts].sort((a, b) => (b.updated > a.updated ? 1 : -1)).slice(0, 6);
  const featured = publishedPosts.filter((p) => p.featured).slice(0, 3);
  const topPaddles = paddles.slice(0, 6);
  const topPlayers = players.slice(0, 6);
  const topUpdates = [...updateCenterItems()].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 3);
  const topTournaments = [...tournamentItems('all')].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 3);
  const experienceIcons = {
    court: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="6" width="30" height="36" rx="3.5" stroke="currentColor" stroke-width="2.4"/><line x1="9" y1="24" x2="39" y2="24" stroke="currentColor" stroke-width="2.6"/><line x1="9" y1="17" x2="39" y2="17" stroke="currentColor" stroke-width="1.5" opacity=".55"/><line x1="9" y1="31" x2="39" y2="31" stroke="currentColor" stroke-width="1.5" opacity=".55"/><line x1="24" y1="6" x2="24" y2="17" stroke="currentColor" stroke-width="1.5" opacity=".55"/><line x1="24" y1="31" x2="24" y2="42" stroke="currentColor" stroke-width="1.5" opacity=".55"/></svg>',
    paddles: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="11" y="5" width="19" height="25" rx="9.5" stroke="currentColor" stroke-width="2.4"/><rect x="17.5" y="28" width="6" height="12" rx="3" fill="currentColor"/><circle cx="35" cy="33" r="6.2" stroke="currentColor" stroke-width="2.2"/><circle cx="33" cy="31" r="1" fill="currentColor"/><circle cx="37" cy="31.5" r="1" fill="currentColor"/><circle cx="34.6" cy="35" r="1" fill="currentColor"/></svg>',
    players: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="16" r="7.2" stroke="currentColor" stroke-width="2.4"/><path d="M10 41 C10 31 16 26.5 24 26.5 C32 26.5 38 31 38 41" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    highlights: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="7" y="11" width="34" height="26" rx="5" stroke="currentColor" stroke-width="2.4"/><path d="M20.5 19 L31.5 24 L20.5 29 Z" fill="currentColor"/></svg>',
  };
  const experienceCards = [
    { key: 'court', title: tt(loc, 'nav.rulesSkills'), body: loc === 'ko' ? '규칙, 키친, 서브, 딩크, 3구 드롭, 포지셔닝을 레벨별로 학습합니다.' : 'Learn rules, kitchen play, serve, dinks, third-shot drops, and positioning by level.', href: link(loc, 'category/rules-and-getting-started/') },
    { key: 'paddles', title: tt(loc, 'nav.paddles'), body: loc === 'ko' ? '브랜드별 인기 패들의 타입, 가격대, 특성, 사용 선수/라인, 리뷰 신호를 비교합니다.' : 'Compare popular paddles by brand, style, price band, traits, player line, and review signals.', href: link(loc, 'paddles/') },
    { key: 'players', title: tt(loc, 'nav.players'), body: loc === 'ko' ? '세계 프로 선수의 핵심 스킬, 종목, 패들 라인, DUPR/랭킹 확인 경로를 봅니다.' : 'Study pro skills, events, paddle lines, and live DUPR/ranking source links.', href: link(loc, 'players/') },
    { key: 'highlights', title: tt(loc, 'nav.highlights'), body: loc === 'ko' ? '내 하이라이트를 올리고 추천수와 피드백으로 주간 랭킹에 도전합니다.' : 'Upload clips, collect recommendations, and compete on weekly feedback leaderboards.', href: link(loc, 'highlights/') },
  ].map((x) => `<a class="experience" href="${x.href}">
      <span class="experience__icon experience__icon--${x.key}" aria-hidden="true">${experienceIcons[x.key] || ''}</span>
      <h3>${esc(x.title)}</h3><p>${esc(x.body)}</p>
    </a>`).join('');
  const briefPreview = briefEditions[0];
  const principles = editorialPrinciplesFor(loc);
  const body = `
<section class="hero hero--level">
  <div class="wrap hero__split">
    <div>
      <p class="hero__kicker">${esc(tt(loc, 'hero.kicker'))}</p>
      <h1 class="hero__title">${esc(tt(loc, 'hero.title'))}</h1>
      <p class="hero__lead">${esc(tt(loc, 'hero.lead'))}</p>
      <div class="hero__cta">
        <a class="btn btn--primary" href="${link(loc, 'level/')}">${esc(tt(loc, 'hero.ctaPrimary'))}</a>
        <a class="btn btn--ghost" href="${link(loc, 'paddles/')}">${esc(tt(loc, 'hero.ctaSecondary'))}</a>
        <a class="btn btn--ghost" href="${link(loc, 'highlights/')}">${esc(tt(loc, 'hero.ctaTertiary'))}</a>
      </div>
    </div>
    ${visualFigure(loc, 'dupr', 'hero-visual')}
  </div>
  <div class="wrap">
    <div class="hero__rail">
      <p class="hero__rail-label">${esc(tt(loc, 'pathway.label'))}</p>
      ${duprRail(loc, { milestones: true })}
      <p class="hero__rail-cta"><a class="btn btn--primary" href="${link(loc, 'dupr-self-check/')}">${esc(loc === 'ko' ? '내 레벨 자가진단 시작 →' : 'Try the DUPR self-check →')}</a></p>
      <p class="hero__rail-note">${esc(tt(loc, 'pathway.note'))} ${esc(loc === 'ko' ? '레일의 2.0·3.0·4.0·5.0 마커를 눌러 핵심 내용을 확인하세요.' : 'Tap the 2.0 · 3.0 · 4.0 · 5.0 markers on the rail for key points.')}</p>
      ${levelQuickSelect(loc)}
    </div>
  </div>
</section>

<section class="band band--alt">
  <div class="wrap">
    <h2 class="band__title">${esc(tt(loc, 'section.experiences'))}</h2>
    <div class="experiences">${experienceCards}</div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="section-head"><div><h2 class="band__title">${esc(tt(loc, 'section.levels'))}</h2><p class="band__intro">${esc(tt(loc, 'level.indexIntro'))}</p></div><a class="link-more" href="${link(loc, 'level/')}">${esc(tt(loc, 'level.back'))}</a></div>
    ${levelGrid(loc)}
  </div>
</section>

<section class="band band--split">
  <div class="wrap two-col two-col--wide">
    <div>
      <h2 class="band__title">${esc(tt(loc, 'section.paddleRankings'))}</h2>
      ${visualFigure(loc, 'paddles')}
      <div class="paddle-mini-grid">${topPaddles.map((p) => paddleCard(p, loc)).join('')}</div>
      <a class="btn btn--primary" href="${link(loc, 'paddles/')}">${esc(tt(loc, 'nav.paddles'))}</a>
    </div>
    <div>
      <h2 class="band__title">${esc(tt(loc, 'section.playerProfiles'))}</h2>
      ${visualFigure(loc, 'players')}
      <div class="cards cards--two">${topPlayers.slice(0, 4).map((pl) => playerCard(pl, loc)).join('')}</div>
      <a class="btn btn--primary" href="${link(loc, 'players/')}">${esc(tt(loc, 'nav.players'))}</a>
    </div>
  </div>
</section>

<section class="band band--alt">
  <div class="wrap two-col two-col--wide">
    <div>
      <h2 class="band__title">${esc(tt(loc, 'section.highlightBattle'))}</h2>
      <p class="band__intro">${esc(tt(loc, 'highlights.intro'))}</p>
      <a class="btn btn--primary" href="${link(loc, 'highlights/')}">${esc(tt(loc, 'hero.ctaTertiary'))}</a>
    </div>
    ${visualFigure(loc, 'highlights')}
  </div>
</section>

<section class="band">
  <div class="wrap two-col two-col--wide">
    <div>
      <h2 class="band__title">${esc(boardLabel(loc, 'homeTitle'))}</h2>
      <p class="band__intro">${esc(boardLabel(loc, 'homeIntro'))}</p>
      <div class="board-cta-row">
        <a class="btn btn--primary" href="${link(loc, 'boards/dupr-faq/')}">${esc(boardLabel(loc, 'faqShort'))}</a>
        <a class="btn btn--ghost" href="${link(loc, 'boards/qna/')}">${esc(boardLabel(loc, 'qnaShort'))}</a>
      </div>
    </div>
    ${visualFigure(loc, 'boards')}
  </div>
</section>

<section class="band band--alt">
  <div class="wrap">
    <div class="section-head"><div><h2 class="band__title">${esc(tournamentLabel(loc, 'title'))}</h2><p class="band__intro">${esc(tournamentLabel(loc, 'intro'))}</p></div><a class="link-more" href="${link(loc, 'tournaments/')}">${esc(tournamentLabel(loc, 'viewAll'))}</a></div>
    <div class="update-grid update-grid--home">${topTournaments.length ? topTournaments.map((u) => updateCard(u, loc)).join('') : `<p class="notice">${esc(tournamentLabel(loc, 'noItems'))}</p>`}</div>
  </div>
</section>

${tourResults.length ? `<section class="band">
  <div class="wrap">
    <div class="section-head"><div><h2 class="band__title">${esc(loc === 'ko' ? '최근 대회 결과 분석' : 'Recent results, analysed')}</h2><p class="band__intro">${esc(loc === 'ko' ? 'PPA·MLP·국제 대회의 주요 결과를 출처를 달아 우리 문장으로 정리했습니다.' : 'Key PPA, MLP, and international results, summarised in our own words with sources.')}</p></div><a class="link-more" href="${link(loc, 'tournaments/results/')}">${esc(loc === 'ko' ? '결과 전체 보기' : 'All results')}</a></div>
    <div class="recaps">${tourResults.filter((r) => r.status === 'published').slice(0, 2).map((r) => resultRecap(loc, r)).join('')}</div>
  </div>
</section>` : ''}

<section class="band">
  <div class="wrap">
    <div class="section-head"><div><h2 class="band__title">${esc(updateLabel(loc, 'title'))}</h2><p class="band__intro">${esc(updateLabel(loc, 'intro'))}</p></div><a class="link-more" href="${link(loc, 'updates/')}">${esc(updateLabel(loc, 'viewAll'))}</a></div>
    <div class="update-grid update-grid--home">${topUpdates.length ? topUpdates.map((u) => updateCard(u, loc)).join('') : `<p class="notice">${esc(updateLabel(loc, 'noItems'))}</p>`}</div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <h2 class="band__title">${esc(tt(loc, 'section.latest'))}</h2>
    <div class="cards">${latest.map((p) => postCard(p, loc)).join('')}</div>
  </div>
</section>

${featured.length ? `<section class="band band--alt">
  <div class="wrap">
    <h2 class="band__title">${esc(tt(loc, 'section.featured'))}</h2>
    <div class="cards">${featured.map((p) => postCard(p, loc)).join('')}</div>
  </div>
</section>` : ''}

<section class="band band--brief">
  <div class="wrap">
    <h2 class="band__title">${esc(tt(loc, 'section.brief'))}</h2>
    <p class="band__intro">${esc(tt(loc, 'brief.intro'))}</p>
    <ul class="brief-list">
      ${briefPreview.items.slice(0, 2).map((raw) => { const it = localBriefItem(raw, loc); return `<li><p>${esc(it.take)}</p>
        <a class="brief-list__src" href="${escAttr(it.sourceUrl)}"${/^https?:/.test(it.sourceUrl) ? ' rel="nofollow noopener" target="_blank"' : ''}>${esc(tt(loc, 'brief.source'))}: ${esc(it.sourceName)}</a></li>`; }).join('')}
    </ul>
    <a class="link-more" href="${link(loc, 'the-brief/')}">${esc(tt(loc, 'brief.title'))}</a>
  </div>
</section>

<section class="band band--editor">
  <div class="wrap two-col">
    <div>
      <h2 class="band__title">${esc(tt(loc, 'section.principles'))}</h2>
      <ul class="principles">${principles.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    </div>
    <div>
      <h2 class="band__title">${esc(tt(loc, 'section.editor'))}</h2>
      ${authorBox(loc)}
      <a class="btn btn--primary" href="${link(loc, 'contact/')}">${esc(tt(loc, 'section.contact'))}</a>
    </div>
  </div>
</section>`;
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'WebSite',
    name: config.siteName, url: config.url, description: config.description,
    inLanguage: loc,
  }];
  return layout({ loc, rel: '', title: '', description: tt(loc, 'hero.lead'), bodyHtml: body, jsonld, bodyClass: 'page-home' });
}

function renderLevelsIndex(loc) {
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'level.indexTitle') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(tt(loc, 'pathway.label'))}</p><h1>${esc(tt(loc, 'level.indexTitle'))}</h1><p class="page-head__intro">${esc(tt(loc, 'level.indexIntro'))}</p><p class="level-index-cta"><a class="btn btn--primary" href="${link(loc, 'dupr-self-check/')}">${esc(loc === 'ko' ? '내 레벨 자가진단 시작 →' : 'Try the DUPR self-check →')}</a></p></div>
  ${visualFigure(loc, 'dupr')}
</div></section>
<section class="band"><div class="wrap">${levelGrid(loc)}</div></section>
<section class="band band--alt"><div class="wrap two-col two-col--wide"><div><h2>DUPR</h2><p>${esc(loc === 'ko' ? 'DUPR가 무엇인지 먼저 이해하면 레벨 선택과 목표 설정이 훨씬 쉬워집니다.' : 'Understanding DUPR first makes level selection and goal setting easier.')}</p><a class="btn btn--primary" href="${link(loc, 'what-is-dupr/')}">${esc(tt(loc, 'nav.dupr'))}</a></div>${visualFigure(loc, 'court')}</div></section>`;
  return layout({ loc, rel: 'level/', title: tt(loc, 'level.indexTitle'), description: tt(loc, 'level.indexIntro'), bodyHtml: body });
}

function renderLevelPage(level, loc) {
  const related = (level.related || []).map((s) => postBySlug[s]).filter(Boolean);
  const idx = levels.findIndex((l) => l.slug === level.slug);
  const next = levels[idx + 1];
  const title = loc1(level, loc, 'title');
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'level.indexTitle'), rel: 'level/' }, { name: level.id }])}
<section class="page-head"><div class="wrap">
  <p class="page-head__eyebrow">${esc(tt(loc, 'pathway.label'))}</p>
  <h1>${esc(title)}</h1>
  <p class="page-head__intro">${esc(loc1(level, loc, 'subtitle'))}</p>
  <div class="post-rail"><p class="post-rail__label">${esc(tt(loc, 'label.level'))} ${esc(level.id)}</p>${duprRail(loc, { level: level.id, compact: true })}</div>
</div></section>
<section class="band"><div class="wrap two-col two-col--wide level-detail">
  <div class="prose">
    <h2>${esc(tt(loc, 'level.focus'))}</h2><ul>${localArray(level, loc, 'focus').map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2>${esc(tt(loc, 'level.skills'))}</h2>${pills(localArray(level, loc, 'skills'))}
    <h2>${esc(tt(loc, 'level.drills'))}</h2><ul>${localArray(level, loc, 'drills').map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2>${esc(tt(loc, 'level.paddle'))}</h2><p>${esc(loc1(level, loc, 'paddleProfile'))}</p>
    <div class="level-actions"><a class="btn btn--primary" href="${link(loc, 'dupr-self-check/')}">${esc(loc === 'ko' ? '내 레벨 자가진단 시작 →' : 'Try the DUPR self-check →')}</a><a class="btn btn--ghost" href="${link(loc, 'highlights/')}">${esc(tt(loc, 'hero.ctaTertiary'))}</a>${next ? `<a class="btn btn--ghost" href="${levelUrl(loc, next)}">${esc(tt(loc, 'level.next'))}: ${esc(next.id)}</a>` : ''}</div>
  </div>
  ${visualFigure(loc, idx < 2 ? 'court' : idx < 4 ? 'skills' : 'players')}
</div></section>
${related.length ? `<section class="band band--alt"><div class="wrap"><h2 class="band__title">${esc(tt(loc, 'level.related'))}</h2><div class="cards">${related.map((p) => postCard(p, loc)).join('')}</div></div></section>` : ''}`;
  return layout({ loc, rel: 'level/' + level.slug + '/', title, description: loc1(level, loc, 'summary'), noindex: true, bodyHtml: body });
}

function renderPaddlesIndex(loc) {
  const brands = [...new Set(paddles.map((p) => p.brand))].sort();
  const styles = [...new Set(paddles.map((p) => p.style))].sort();
  const brandOptions = [`<option value="">${esc(tt(loc, 'paddles.allBrands'))}</option>`].concat(brands.map((b) => `<option value="${escAttr(b)}">${esc(b)}</option>`)).join('');
  const styleOptions = [`<option value="">${esc(tt(loc, 'paddles.allStyles'))}</option>`].concat(styles.map((st) => `<option value="${escAttr(st)}">${esc(styleLabel(loc, st))}</option>`)).join('');
  const levelOptions = [`<option value="">${esc(tt(loc, 'paddles.allLevels'))}</option>`].concat(levels.map((l) => `<option value="${escAttr(l.id)}">${esc(l.id)}</option>`)).join('');
  const latestPaddleUpdates = paddleUpdateItems().sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 3);
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'paddles.title') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(tt(loc, 'nav.paddles'))}</p><h1>${esc(tt(loc, 'paddles.title'))}</h1><p class="page-head__intro">${esc(tt(loc, 'paddles.intro'))}</p><a class="btn btn--primary" href="${link(loc, 'tools/paddle-finder/')}">${esc(tt(loc, 'paddles.openFinder'))}</a></div>
  ${visualFigure(loc, 'ratings')}
</div></section>
<section class="band"><div class="wrap">
  <div class="filter-panel" data-paddle-filters>
    <strong>${esc(tt(loc, 'paddles.filters'))}</strong>
    <label><span>${esc(tt(loc, 'paddles.allBrands'))}</span><select data-filter-brand>${brandOptions}</select></label>
    <label><span>${esc(tt(loc, 'paddles.type'))}</span><select data-filter-style>${styleOptions}</select></label>
    <label><span>${esc(tt(loc, 'label.level'))}</span><select data-filter-level>${levelOptions}</select></label>
  </div>
  <p class="notice">${esc(tt(loc, 'paddles.approvalNote'))}</p>
  <div class="paddle-grid" data-paddle-list>${paddles.map((p) => paddleCard(p, loc)).join('')}</div>
</div></section>
<section class="band band--alt"><div class="wrap">
  <div class="section-head"><div><h2 class="band__title">${esc(paddleUpdatesLabel(loc, 'title'))}</h2><p class="band__intro">${esc(paddleUpdatesLabel(loc, 'intro'))}</p></div><a class="link-more" href="${link(loc, 'paddles/updates/')}">${esc(paddleUpdatesLabel(loc, 'viewAll'))}</a></div>
  <div class="update-grid update-grid--home">${latestPaddleUpdates.length ? latestPaddleUpdates.map((u) => updateCard(u, loc)).join('') : `<p class="notice">${esc(paddleUpdatesLabel(loc, 'noItems'))}</p>`}</div>
</div></section>`;
  return layout({ loc, rel: 'paddles/', title: tt(loc, 'paddles.title'), description: tt(loc, 'paddles.intro'), bodyHtml: body });
}

function renderPaddlePage(paddle, loc) {
  const same = paddles.filter((p) => p.slug !== paddle.slug && (p.brand === paddle.brand || p.style === paddle.style)).slice(0, 4);
  const title = paddleTitle(paddle);
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'paddles.title'), rel: 'paddles/' }, { name: title }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(paddle.brand)}</p><h1>${esc(title)}</h1>
  <p class="page-head__intro">${esc(loc1(paddle, loc, 'reviewSignal'))}</p>
  <p class="page-head__intro page-head__intro--small">${esc(loc1(paddle, loc, 'summary'))}</p></div>
  ${entityIllus('paddles', paddle.slug, paddle.image, (paddle.imageAlt || title) + ' — illustration', loc === 'ko' ? '양식화된 패들 일러스트' : 'Stylised paddle illustration')}
</div></section>
<section class="band"><div class="wrap two-col two-col--wide">
  <div class="spec-card"><table class="spec-table"><tbody>
    ${fieldRow(tt(loc, 'paddles.type'), styleLabel(loc, paddle.style))}
    ${fieldRow(tt(loc, 'paddles.shape'), paddle.shape)}
    ${fieldRow(tt(loc, 'paddles.core'), paddle.core)}
    ${fieldRow(tt(loc, 'paddles.face'), paddle.face)}
    ${fieldRow(ui(loc, 'exactPrice'), priceLabel(paddle))}
    ${fieldRow(ui(loc, 'priceSource'), paddle.priceSource)}
    ${fieldRow(tt(loc, 'label.level'), paddle.levels)}
    ${fieldRow(tt(loc, 'paddles.traits'), (paddle.traits || []).map((t) => traitLabel(loc, t)))}
    ${fieldRow(tt(loc, 'paddles.usedBy'), paddle.usedBy)}
  </tbody></table><div class="source-buttons">${externalButton(ui(loc, 'officialProduct'), paddle.sourceUrl)}</div><p class="notice">${esc(ui(loc, 'sourceNote'))}</p><p class="notice">${esc(tt(loc, 'paddles.approvalNote'))}</p></div>
  <div class="spec-card"><h2>${esc(ui(loc, 'ratings'))}</h2>${ratingBars(paddle.ratings, loc)}<p class="notice">${esc(loc === 'ko' ? '점수는 제품 설명과 일반 리뷰 신호를 바탕으로 한 편집용 비교 점수입니다. 실측 데이터가 아닙니다.' : 'Scores are editorial comparison notes based on product positioning and common review signals; they are not lab measurements.')}</p></div>
</div></section>
<section class="band band--alt"><div class="wrap two-col two-col--wide">${reviewerRoundup(paddle, loc)}${paddleEngagement(paddle, loc)}</div></section>
${same.length ? `<section class="band band--alt"><div class="wrap"><h2 class="band__title">${esc(loc === 'ko' ? '비슷한 패들' : 'Similar paddles')}</h2><div class="paddle-grid">${same.map((p) => paddleCard(p, loc)).join('')}</div></div></section>` : ''}`;
  return layout({ loc, rel: 'paddles/' + paddle.slug + '/', title, description: loc1(paddle, loc, 'reviewSignal'), noindex: true, bodyHtml: body });
}

function renderPlayersIndex(loc) {
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'players.title') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(tt(loc, 'nav.players'))}</p><h1>${esc(tt(loc, 'players.title'))}</h1><p class="page-head__intro">${esc(tt(loc, 'players.intro'))}</p></div>
  ${visualFigure(loc, 'players')}
</div></section>
<section class="band"><div class="wrap"><p class="notice">${esc(tt(loc, 'players.sourceNote'))}</p><div class="player-grid">${players.map((pl) => playerCard(pl, loc)).join('')}</div></div></section>`;
  return layout({ loc, rel: 'players/', title: tt(loc, 'players.title'), description: tt(loc, 'players.intro'), bodyHtml: body });
}

function renderPlayerPage(player, loc) {
  const q = encodeURIComponent(player.name + ' pickleball');
  const title = player.name;
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'players.title'), rel: 'players/' }, { name: title }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(player.country)}</p><h1>${esc(title)}</h1><p class="page-head__intro">${esc(loc1(player, loc, 'style'))}</p></div>
  ${entityIllus('players', player.slug, player.image, (player.imageAlt || player.name) + ' — illustration', loc === 'ko' ? '양식화된 일러스트 (실제 사진 아님)' : 'Stylised illustration (not a photo)')}
</div></section>
<section class="band"><div class="wrap two-col two-col--wide">
  <div class="prose">
    <h2>${esc(ui(loc, 'biography'))}</h2><p>${esc(loc1(player, loc, 'bio'))}</p>
    <h2>${esc(tt(loc, 'players.skills'))}</h2>${pills(player.skills)}
    <h2>${esc(tt(loc, 'players.achievements'))}</h2><ul>${(player.achievements || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2>${esc(tt(loc, 'players.events'))}</h2>${pills(player.events)}
    <h2>${esc(tt(loc, 'players.paddle'))}</h2><p>${esc(player.paddle)}</p>
    <h2>${esc(tt(loc, 'players.watch'))}</h2><p>${esc(loc1(player, loc, 'watch'))}</p>
    <h2>${esc(ui(loc, 'currentSources'))}</h2>
    <div class="source-buttons">
      ${externalButton(ui(loc, 'officialProfile'), player.officialProfile)}
      ${externalButton(ui(loc, 'secondaryProfile'), player.secondaryProfile)}
      <a class="btn btn--ghost" href="https://www.dupr.com/rankings" rel="nofollow noopener" target="_blank">DUPR</a>
      <a class="btn btn--ghost" href="https://www.ppatour.com/player-rankings/" rel="nofollow noopener" target="_blank">PPA Rankings</a>
      <a class="btn btn--ghost" href="https://news.google.com/search?q=${q}" rel="nofollow noopener" target="_blank">News</a>
    </div>
    <p class="notice">${esc(ui(loc, 'sourceNote'))}</p>
  </div>
  ${duprPanel(player, loc)}
  <div class="spec-card"><table class="spec-table"><tbody>
    ${fieldRow(ui(loc, 'hometown'), player.hometown)}
    ${fieldRow(ui(loc, 'age'), player.age)}
    ${fieldRow(ui(loc, 'height'), player.height)}
    ${fieldRow(ui(loc, 'turnedPro'), player.turnedPro)}
    ${fieldRow(ui(loc, 'plays'), player.plays)}
    ${fieldRow(ui(loc, 'resides'), player.resides)}
  </tbody></table><p class="notice">${esc(ui(loc, 'imageNote'))}: ${esc(player.photoNote || '')}</p></div>
</div></section>`;
  return layout({ loc, rel: 'players/' + player.slug + '/', title, description: loc1(player, loc, 'style'), noindex: true, bodyHtml: body });
}

function renderHighlights(loc) {
  const seedJson = JSON.stringify(highlightSeeds).replace(/</g, '\u003c');
  const levelOptions = levels.map((l) => `<option value="${escAttr(l.id)}">${esc(l.id)}</option>`).join('');
  const guide = loc === 'ko' ? {
    prepTitle: '좋은 피드백을 받는 클립 조건',
    prep: ['한 포인트 전체가 보이도록 10~45초로 자릅니다.', '본인의 DUPR 추정 레벨과 배우고 싶은 스킬을 함께 적습니다.', '실명, 전화번호, 위치 정보처럼 불필요한 개인정보가 보이지 않게 합니다.', '타인이 선명하게 보이는 영상은 공유 허락을 받은 뒤 사용합니다.'],
    feedbackTitle: '댓글 피드백 템플릿',
    feedback: ['좋았던 선택: 어떤 샷 선택이 좋았는지 한 문장으로 적기', '다음에 고칠 점: 타점, 위치, 공 높이 중 하나만 선택하기', '추천 드릴: 같은 상황을 반복 연습할 방법 제안하기'],
    mail: '운영자에게 하이라이트 검토 문의하기'
  } : {
    prepTitle: 'What makes a useful feedback clip',
    prep: ['Trim the clip to one complete point, ideally 10–45 seconds.', 'Add your estimated DUPR level and the skill you want feedback on.', 'Avoid showing unnecessary personal information.', 'Share clips with other visible players only when you have permission.'],
    feedbackTitle: 'Feedback comment template',
    feedback: ['Good choice: name one decision that helped the point.', 'Next fix: choose one issue — contact point, court position, or ball height.', 'Suggested drill: propose a repeatable practice for the same pattern.'],
    mail: 'Ask the editor about highlight review'
  };
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'highlights.title') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(tt(loc, 'nav.highlights'))}</p><h1>${esc(tt(loc, 'highlights.title'))}</h1><p class="page-head__intro">${esc(tt(loc, 'highlights.intro'))}</p></div>
  ${visualFigure(loc, 'highlights')}
</div></section>
<section class="band"><div class="wrap two-col two-col--wide highlight-demo" data-highlights-demo data-votes-label="${escAttr(tt(loc, 'highlights.votes'))}">
  <form class="upload-card" data-highlight-form>
    <h2>${esc(tt(loc, 'highlights.uploadTitle'))}</h2>
    <label>${esc(tt(loc, 'highlights.clipTitle'))}<input name="title" required placeholder="${escAttr(loc === 'ko' ? '예: 3.5 딩크 랠리 피드백' : 'Example: 3.5 dink rally feedback')}"></label>
    <label>${esc(tt(loc, 'highlights.level'))}<select name="level">${levelOptions}</select></label>
    <label>${esc(tt(loc, 'highlights.skill'))}<input name="skill" required placeholder="dink, reset, ATP, serve"></label>
    <label>${esc(tt(loc, 'highlights.file'))}<input name="file" type="file" accept="video/*"></label>
    <button class="btn btn--primary" type="submit">${esc(tt(loc, 'highlights.submit'))}</button>
    <p class="notice">${esc(tt(loc, 'highlights.moderation'))}</p>
    <p><a class="btn btn--ghost" href="mailto:${escAttr(config.email)}?subject=${encodeURIComponent('Picklary highlight review')}">${esc(guide.mail)}</a></p>
  </form>
  <div>
    <h2>${esc(tt(loc, 'highlights.leaderboard'))}</h2>
    <div class="leaderboard" data-highlight-board></div>
    <script type="application/json" id="highlight-seed">${seedJson}</script>
  </div>
</div></section>
<section class="band band--alt"><div class="wrap two-col two-col--wide">
  <div class="prose"><h2>${esc(guide.prepTitle)}</h2><ul>${guide.prep.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
  <div class="prose"><h2>${esc(guide.feedbackTitle)}</h2><ul>${guide.feedback.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
</div></section>`;
  return layout({ loc, rel: 'highlights/', title: tt(loc, 'highlights.title'), description: tt(loc, 'highlights.intro'), bodyHtml: body, noAds: true });
}

function boardText(value, loc) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[loc] || value.en || value.ko || '';
}

function updateLabel(loc, key) {
  const labels = {
    en: {
      nav: 'Update Center', title: 'Pickleball Update Center', intro: 'A curated source-based feed for pickleball news, PPA/UPA rule changes, paddle legality notes, and player news & trends. Tournament schedules, results, and rankings live in the Tournaments menu; paddle launch notes live inside the Paddles menu.',
      latest: 'Latest updates', sources: 'Primary sources to verify', viewAll: 'View updates', source: 'Source', verify: 'Verify at source',
      news: 'News', tournaments: 'World tournaments', results: 'Results', domestic: 'Korea tournaments', paddles: 'Paddle launches & reviews', rules: 'Rules & paddle legality', players: 'Player news & trends', rankings: 'Rankings', all: 'All updates',
      noItems: 'No editor-approved updates in this section yet.', risk: 'Review priority', action: 'Check before acting', lastChecked: 'Last checked'
    },
    ko: {
      nav: '업데이트센터', title: '피클볼 업데이트 센터', intro: '피클볼 뉴스, PPA/UPA 규정 변경, 패들 승인·ban, 선수 동향을 공식 출처 기준으로 확인·정리합니다. 대회 일정·결과·랭킹은 대회정보 메뉴에서, 신규 패들·리뷰 정보는 패들 메뉴에서 확인할 수 있습니다.',
      latest: '최근 업데이트', sources: '주요 확인 출처', viewAll: '업데이트 보기', source: '출처', verify: '원문에서 확인',
      news: '뉴스', tournaments: '미국 대회', international: '미국 외 대회', results: '경기 결과', domestic: '미국 외 대회', paddles: '신규 패들·리뷰', rules: '규정·패들 승인', players: '선수 동향', rankings: '랭킹', all: '전체 업데이트',
      noItems: '아직 에디터가 확인한 업데이트가 없습니다.', risk: '확인 우선도', action: '확인 포인트', lastChecked: '최종 확인일'
    },
    es: {
      nav: 'Centro de updates', title: 'Centro de actualizaciones de pickleball', intro: 'Noticias, cambios de reglas PPA/UPA, notas de legalidad de palas y movimientos de rankings verificados con fuentes principales. Torneos y lanzamientos de palas viven en sus propios menús.',
      latest: 'Actualizaciones recientes', sources: 'Fuentes principales', viewAll: 'Ver updates', source: 'Fuente', verify: 'Verificar en la fuente',
      news: 'Noticias', tournaments: 'Eventos en EE. UU.', international: 'Eventos fuera de EE. UU.', results: 'Resultados', domestic: 'Eventos fuera de EE. UU.', paddles: 'Lanzamientos y reviews', rules: 'Reglas y legalidad de palas', rankings: 'Rankings', all: 'Todos',
      noItems: 'Todavía no hay actualizaciones aprobadas en esta sección.', risk: 'Prioridad de revisión', action: 'Punto a verificar', lastChecked: 'Última revisión'
    }
  };
  return (labels[loc] && labels[loc][key]) || labels.en[key] || key;
}
function updateTypeLabel(loc, type) {
  const key = type || 'news';
  return updateLabel(loc, key) || key;
}
function updateRelForType(type) {
  if (type === 'paddles') return 'paddles/updates/';
  if (type === 'tournaments') return 'tournaments/us/';
  if (type === 'international') return 'tournaments/international/';
  if (type === 'results') return 'tournaments/results/';
  const allowed = new Set(['news','rules','players']);
  return allowed.has(type) ? 'updates/' + type + '/' : 'updates/';
}
function updateCenterItems() {
  const allowed = new Set(['news','rules','players']);
  return publishedAutoUpdates.filter((u) => allowed.has(u.type));
}
function tournamentItems(type) {
  const map = { usa: 'tournaments', us: 'tournaments', international: 'international', results: 'results' };
  const target = map[type] || type;
  const allowed = new Set(['tournaments','international','results']);
  return publishedAutoUpdates.filter((u) => allowed.has(u.type) && (!type || type === 'all' || u.type === target));
}
function paddleUpdateItems() {
  return publishedAutoUpdates.filter((u) => u.type === 'paddles');
}
function updateTitle(u, loc) { return loc === 'ko' && u.titleKo ? u.titleKo : u.title; }
function updateSummary(u, loc) { return loc === 'ko' && u.summaryKo ? u.summaryKo : u.summary; }
function updateAction(u, loc) { return loc === 'ko' && u.actionKo ? u.actionKo : (u.action || ''); }
function updateTags(u, loc) { return loc === 'ko' && u.tagsKo ? u.tagsKo : (u.tags || []); }
function updateCard(u, loc) {
  const title = updateTitle(u, loc);
  const summary = updateSummary(u, loc);
  const tags = updateTags(u, loc).slice(0, 4);
  const srcExternal = /^https?:/.test(u.sourceUrl || '');
  return `<article class="update-card update-card--${escAttr(u.type || 'news')}">
    <div class="update-card__top"><span class="update-chip update-chip--${escAttr(u.priority || 'medium')}">${esc(updateTypeLabel(loc, u.type))}</span><time datetime="${escAttr(u.date || '')}">${esc(fmtDate(loc, u.date || new Date().toISOString()))}</time></div>
    <h3>${esc(title)}</h3>
    <p>${esc(summary)}</p>
    ${tags.length ? `<div class="pills pills--compact">${tags.map((t) => `<span class="pill">${esc(t)}</span>`).join('')}</div>` : ''}
    ${updateAction(u, loc) ? `<p class="update-card__action"><strong>${esc(updateLabel(loc, 'action'))}:</strong> ${esc(updateAction(u, loc))}</p>` : ''}
    <a class="brief-list__src" href="${escAttr(u.sourceUrl || '#')}"${srcExternal ? ' rel="nofollow noopener" target="_blank"' : ''}>${esc(updateLabel(loc, 'verify'))}: ${esc(u.sourceName || updateLabel(loc, 'source'))}</a>
  </article>`;
}
function updateCategoryTabs(loc, active) {
  const items = [
    ['updates/', 'all'], ['updates/news/', 'news'], ['updates/rules/', 'rules'], ['updates/players/', 'players']
  ];
  return `<nav class="update-tabs" aria-label="${escAttr(updateLabel(loc, 'title'))}">${items.map(([rel, key]) => `<a class="${active === key ? 'is-active' : ''}" href="${link(loc, rel)}">${esc(updateLabel(loc, key))}</a>`).join('')}</nav>`;
}
function updateSourceCards(loc, category) {
  const categorySet = Array.isArray(category) ? new Set(category) : (category ? new Set([category]) : null);
  const sources = (automationSourceConfig.sources || []).filter((s) => !categorySet || categorySet.has(s.category));
  const shown = sources.slice(0, 12);
  if (!shown.length) return '';
  return `<div class="source-watch-grid">${shown.map((s) => `<article class="source-watch">
      <span class="source-watch__status">${esc(loc === 'ko' ? '확인 출처' : 'Reference source')}</span>
      <h3>${esc(s.label)}</h3>
      <p><strong>${esc(loc === 'ko' ? '확인 항목' : 'Checks')}:</strong> ${esc((s.monitorFor || []).slice(0, 4).join(' · '))}</p>
      ${String(s.url || '').startsWith('manual://') ? `<span class="muted">${esc(loc === 'ko' ? '에디터 입력 자료' : 'Editor-maintained input')}</span>` : `<a href="${escAttr(String(s.url || '#'))}"${/^https?:/.test(s.url || '') ? ' rel="nofollow noopener" target="_blank"' : ''}>${esc(updateLabel(loc, 'source'))}</a>`}
    </article>`).join('')}</div>`;
}
function boardLabel(loc, key) {
  const labels = {
    ko: {
      nav: '게시판', title: '피클볼 게시판', intro: 'DUPR 레벨별 FAQ와 상황별 Q&A를 통해 같은 레벨의 플레이어들이 더 빠르게 답을 찾도록 돕습니다.',
      faq: 'DUPR 레벨별 FAQ 게시판', faqShort: '레벨별 FAQ', faqIntro: '2.0부터 5.0까지 자주 막히는 질문을 레벨별로 정리했습니다. 각 답변은 입문자도 이해하기 쉽게 짧게 시작하고, 레벨이 올라갈수록 전술과 의사결정 중심으로 확장됩니다.',
      qna: '상황별 Q&A 게시판', qnaShort: '상황별 Q&A', qnaIntro: '“이 상황에서는 어떻게 해야 하나요?”를 묻고 답하는 게시판 데모입니다. 현재 정적 사이트 버전에서는 입력 내용이 본인 브라우저에만 저장되며, 실제 공개 운영 전에는 로그인·신고·검수·스팸 방지 기능이 필요합니다.',
      policyTitle: 'AdSense 승인 관점의 운영 판단', policyIntro: '게시판은 체류시간과 재방문을 늘리는 데 도움이 되지만, 검수되지 않은 UGC는 정책 리스크가 있습니다. 그래서 이 버전은 에디터가 선별한 FAQ와 샘플 Q&A를 먼저 노출하고, 사용자 입력은 로컬 데모로 제한했습니다.',
      chooseLevel: '레벨 선택', allLevels: '전체 레벨', askFaq: 'FAQ 제안하기', askQuestion: '질문 올리기', questionTitle: '질문 제목', situation: '상황 설명', tags: '태그', submit: '저장하기', localOnly: '현재 데모에서는 서버에 저장되지 않고 이 브라우저에만 표시됩니다. 공개 운영 시에는 검수 후 게시되도록 설계하세요.',
      answers: '답변', addAnswer: '답변 추가', answerPlaceholder: '상황, 추천 샷, 피해야 할 선택을 함께 적어 주세요.', votes: '추천', curated: '에디터 선별', suggested: '내 브라우저 저장', empty: '아직 표시할 질문이 없습니다.', homeTitle: 'FAQ와 Q&A로 막히는 상황 해결하기', homeIntro: '레벨별 FAQ로 빠르게 답을 찾고, 상황별 Q&A에서 딩크·리셋·포지셔닝 같은 실제 경기 고민을 정리할 수 있습니다.'
    },
    en: {
      nav: 'Boards', title: 'Pickleball Boards', intro: 'Level-based FAQ and situational Q&A help players find answers from people working on the same problems.',
      faq: 'DUPR Level FAQ Board', faqShort: 'Level FAQ', faqIntro: 'Common questions from 2.0 to 5.0, organized by level. Answers start simple and become more tactical as the level rises.',
      qna: 'Situational Q&A Board', qnaShort: 'Q&A Board', qnaIntro: 'A demo board for asking “what should I do in this situation?” In this static version, submissions are stored only in your browser. A live public board needs login, reporting, review, and spam controls before publishing.',
      policyTitle: 'AdSense-readiness judgment', policyIntro: 'Boards can improve engagement and return visits, but unreviewed UGC carries policy risk. This version uses curated FAQ and sample Q&A first, while user input remains a local demo.',
      chooseLevel: 'Choose level', allLevels: 'All levels', askFaq: 'Suggest an FAQ', askQuestion: 'Ask a question', questionTitle: 'Question title', situation: 'Situation', tags: 'Tags', submit: 'Save', localOnly: 'In this demo, content is not uploaded to a server and appears only in this browser. For a public launch, publish only after review.',
      answers: 'Answers', addAnswer: 'Add answer', answerPlaceholder: 'Include the situation, recommended shot, and what to avoid.', votes: 'votes', curated: 'Curated', suggested: 'Saved in browser', empty: 'No questions to show yet.', homeTitle: 'Solve stuck situations with FAQ and Q&A', homeIntro: 'Use level FAQ for fast answers and the Q&A board for match situations like dinks, resets, speed-ups, and positioning.'
    },
    es: {
      nav: 'Foros', title: 'Foros de pickleball', intro: 'FAQ por nivel DUPR y Q&A situacional para encontrar respuestas de jugadores con problemas similares.',
      faq: 'FAQ por nivel DUPR', faqShort: 'FAQ por nivel', faqIntro: 'Preguntas comunes de 2.0 a 5.0, organizadas por nivel. Las respuestas empiezan simples y se vuelven más tácticas al subir de nivel.',
      qna: 'Q&A situacional', qnaShort: 'Q&A', qnaIntro: 'Un tablero demo para preguntar “¿qué hago en esta situación?”. En esta versión estática, los envíos se guardan solo en tu navegador. Un foro público necesita login, reportes, revisión y controles anti-spam.',
      policyTitle: 'Criterio para AdSense', policyIntro: 'Los foros pueden mejorar engagement y retorno, pero UGC sin revisar aumenta el riesgo. Esta versión muestra FAQ curadas y Q&A de muestra; el input del usuario queda como demo local.',
      chooseLevel: 'Elegir nivel', allLevels: 'Todos los niveles', askFaq: 'Sugerir FAQ', askQuestion: 'Hacer pregunta', questionTitle: 'Título', situation: 'Situación', tags: 'Tags', submit: 'Guardar', localOnly: 'En esta demo no se sube nada al servidor y solo aparece en este navegador. Para lanzar público, publicar solo tras revisión.',
      answers: 'Respuestas', addAnswer: 'Añadir respuesta', answerPlaceholder: 'Incluye situación, golpe recomendado y qué evitar.', votes: 'votos', curated: 'Curado', suggested: 'Guardado en navegador', empty: 'Aún no hay preguntas.', homeTitle: 'Resuelve situaciones con FAQ y Q&A', homeIntro: 'Usa FAQ por nivel para respuestas rápidas y Q&A para situaciones reales como dinks, resets, speed-ups y posicionamiento.'
    }
  };
  return (labels[loc] && labels[loc][key]) || labels.en[key] || key;
}
function boardTagLabel(loc, tag) {
  const ko = { rules:'규칙', serve:'서브', positioning:'포지셔닝', consistency:'안정성', 'third-shot':'3구', kitchen:'키친', drop:'드롭', defense:'수비', dink:'딩크', transition:'전환구역', attack:'공격 판단', partners:'파트너', partner:'파트너', 'speed-up':'스피드업', patterns:'패턴', strategy:'전략', mixed:'혼합복식', tournament:'대회', scouting:'상대 분석', micro:'미세 조정', role:'영상 분석', lob:'로브', return:'리턴', middle:'미들', paddle:'패들', 'video-review':'영상 리뷰' };
  const en = { rules:'Rules', serve:'Serve', positioning:'Positioning', consistency:'Consistency', 'third-shot':'Third shot', kitchen:'Kitchen', drop:'Drop', defense:'Defense', dink:'Dink', transition:'Transition', attack:'Attack choice', partners:'Partners', partner:'Partner', 'speed-up':'Speed-up', patterns:'Patterns', strategy:'Strategy', mixed:'Mixed doubles', tournament:'Tournament', scouting:'Scouting', micro:'Micro-adjustment', role:'Video study', lob:'Lob', return:'Return', middle:'Middle', paddle:'Paddle', 'video-review':'Video review' };
  return (loc === 'ko' ? ko[tag] : en[tag]) || tag;
}
function boardCard(loc, href, title, intro, metric) {
  return `<a class="board-card" href="${href}"><span class="board-card__eyebrow">${esc(metric)}</span><h3>${esc(title)}</h3><p>${esc(intro)}</p></a>`;
}
function renderBoardsIndex(loc) {
  const faqCount = boards.faqItems.length;
  const qnaCount = boards.qnaSeeds.length;
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: boardLabel(loc, 'title') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(boardLabel(loc, 'nav'))}</p><h1>${esc(boardLabel(loc, 'title'))}</h1><p class="page-head__intro">${esc(boardLabel(loc, 'intro'))}</p></div>
  ${visualFigure(loc, 'boards')}
</div></section>
<section class="band"><div class="wrap">
  <div class="board-grid">
    ${boardCard(loc, link(loc, 'boards/dupr-faq/'), boardLabel(loc, 'faq'), boardLabel(loc, 'faqIntro'), faqCount + ' FAQ')}
    ${boardCard(loc, link(loc, 'boards/qna/'), boardLabel(loc, 'qna'), boardLabel(loc, 'qnaIntro'), qnaCount + ' Q&A')}
  </div>
</div></section>
<section class="band band--alt"><div class="wrap narrow prose">
  <h2>${esc(boardLabel(loc, 'policyTitle'))}</h2>
  <p>${esc(boardLabel(loc, 'policyIntro'))}</p>
  <p><a href="${link(loc, 'community-guidelines/')}">${esc(trustLabel(loc, 'community'))}</a> · <a href="${link(loc, 'advertising-disclosure/')}">${esc(trustLabel(loc, 'advertising'))}</a></p>
</div></section>`;
  return layout({ loc, rel: 'boards/', title: boardLabel(loc, 'title'), description: boardLabel(loc, 'intro'), bodyHtml: body, noAds: true });
}
function renderDuprFaqBoard(loc) {
  const levelButtons = [`<button type="button" class="level-chip is-active" data-faq-level="">${esc(boardLabel(loc, 'allLevels'))}</button>`].concat(levels.map((l) => `<button type="button" class="level-chip" data-faq-level="${escAttr(l.id)}">${esc(l.id)}</button>`)).join('');
  const faqHtml = levels.map((level) => {
    const items = boards.faqItems.filter((it) => it.level === level.id);
    if (!items.length) return '';
    return `<section class="board-level" data-faq-section data-level="${escAttr(level.id)}"><div class="section-head"><div><h2>DUPR ${esc(level.id)}</h2><p>${esc(loc1(level, loc, 'summary'))}</p></div><a class="btn btn--ghost" href="${levelUrl(loc, level)}">${esc(tt(loc, 'label.readMore'))}</a></div>
      <div class="faq-list">${items.map((it) => `<details class="faq-row" data-level="${escAttr(it.level)}"><summary><span class="pill">${esc(boardTagLabel(loc, it.tag))}</span>${esc(boardText(it.q, loc))}</summary><p>${esc(boardText(it.a, loc))}</p></details>`).join('')}</div></section>`;
  }).join('');
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: boards.faqItems.map((it) => ({ '@type': 'Question', name: boardText(it.q, loc), acceptedAnswer: { '@type': 'Answer', text: boardText(it.a, loc) } }))
  };
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: boardLabel(loc, 'title'), rel: 'boards/' }, { name: boardLabel(loc, 'faq') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(boardLabel(loc, 'faqShort'))}</p><h1>${esc(boardLabel(loc, 'faq'))}</h1><p class="page-head__intro">${esc(boardLabel(loc, 'faqIntro'))}</p></div>
  ${visualFigure(loc, 'dupr')}
</div></section>
<section class="band"><div class="wrap">
  <div class="level-quick-select board-filter"><a class="level-quick-select__selfcheck" href="${link(loc, 'dupr-self-check/')}"><span aria-hidden="true">◎</span> ${esc(loc === 'ko' ? '내 레벨 자가진단 시작' : 'Start the DUPR self-check')}</a><p class="level-quick-select__label">${esc(boardLabel(loc, 'chooseLevel'))}</p><div class="level-quick-select__buttons">${levelButtons}</div></div>
  ${faqHtml}
</div></section>
<section class="band band--alt"><div class="wrap two-col two-col--wide">
  <form class="upload-card" data-faq-suggest>
    <h2>${esc(boardLabel(loc, 'askFaq'))}</h2>
    <label>${esc(boardLabel(loc, 'chooseLevel'))}<select name="level">${levels.map((l) => `<option value="${escAttr(l.id)}">${esc(l.id)}</option>`).join('')}</select></label>
    <label>${esc(boardLabel(loc, 'questionTitle'))}<input name="title" required></label>
    <label>${esc(boardLabel(loc, 'situation'))}<textarea name="body" rows="4" required></textarea></label>
    <button class="btn btn--primary" type="submit">${esc(boardLabel(loc, 'submit'))}</button>
    <p class="notice">${esc(boardLabel(loc, 'localOnly'))}</p>
  </form>
  <div class="spec-card"><h2>${esc(boardLabel(loc, 'policyTitle'))}</h2><p>${esc(boardLabel(loc, 'policyIntro'))}</p><p><a href="${link(loc, 'boards/qna/')}">${esc(boardLabel(loc, 'qna'))}</a></p><div class="local-suggestion-list" data-faq-suggestions></div></div>
</div></section>`;
  return layout({ loc, rel: 'boards/dupr-faq/', title: boardLabel(loc, 'faq'), description: boardLabel(loc, 'faqIntro'), bodyHtml: body, jsonld: [faqSchema], noAds: true });
}
function qnaStaticCard(it, loc) {
  const answers = Array.isArray(it.answers) ? it.answers : [];
  return `<article class="qna-item">
    <div class="qna-item__head"><div><h3>${esc(boardText(it.title, loc))}</h3><div class="qna-item__meta"><span class="pill">${esc(it.level || '')}</span><span class="pill">${esc(boardTagLabel(loc, it.tag || ''))}</span><span class="qna-item__status">${esc(boardLabel(loc, 'curated'))}</span></div></div><span class="btn btn--ghost highlight-item__vote">▲ ${esc(it.votes || 0)} ${esc(boardLabel(loc, 'votes'))}</span></div>
    <p class="qna-item__question">${esc(boardText(it.question, loc))}</p>
    <strong>${esc(boardLabel(loc, 'answers'))}</strong>
    <div class="qna-answers">${answers.map((ans) => `<div class="qna-answer"><p class="qna-answer__by">${esc(ans.name || 'Player')}${ans.votes ? ` · ▲ ${esc(ans.votes)} ${esc(boardLabel(loc, 'votes'))}` : ''}</p><p>${esc(boardText(ans.body, loc))}</p></div>`).join('')}</div>
  </article>`;
}
function renderQnaBoard(loc) {
  const seedJson = JSON.stringify(boards.qnaSeeds).replace(/</g, '\\u003c');
  const levelOptions = levels.map((l) => `<option value="${escAttr(l.id)}">${esc(l.id)}</option>`).join('');
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: boardLabel(loc, 'title'), rel: 'boards/' }, { name: boardLabel(loc, 'qna') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(boardLabel(loc, 'qnaShort'))}</p><h1>${esc(boardLabel(loc, 'qna'))}</h1><p class="page-head__intro">${esc(boardLabel(loc, 'qnaIntro'))}</p></div>
  ${visualFigure(loc, 'boards')}
</div></section>
<section class="band"><div class="wrap two-col two-col--wide board-demo" data-qna-demo
  data-votes-label="${escAttr(boardLabel(loc, 'votes'))}" data-answers-label="${escAttr(boardLabel(loc, 'answers'))}" data-add-answer="${escAttr(boardLabel(loc, 'addAnswer'))}" data-answer-placeholder="${escAttr(boardLabel(loc, 'answerPlaceholder'))}" data-curated="${escAttr(boardLabel(loc, 'curated'))}" data-suggested="${escAttr(boardLabel(loc, 'suggested'))}" data-empty="${escAttr(boardLabel(loc, 'empty'))}">
  <form class="upload-card" data-qna-form>
    <h2>${esc(boardLabel(loc, 'askQuestion'))}</h2>
    <label>${esc(boardLabel(loc, 'questionTitle'))}<input name="title" required placeholder="${escAttr(loc === 'ko' ? '예: 로브를 계속 당할 때 대응' : 'Example: Handling repeated lobs')}"></label>
    <label>${esc(boardLabel(loc, 'chooseLevel'))}<select name="level">${levelOptions}</select></label>
    <label>${esc(boardLabel(loc, 'tags'))}<input name="tag" placeholder="dink, reset, defense"></label>
    <label>${esc(boardLabel(loc, 'situation'))}<textarea name="question" rows="6" required></textarea></label>
    <button class="btn btn--primary" type="submit">${esc(boardLabel(loc, 'submit'))}</button>
    <p class="notice">${esc(boardLabel(loc, 'localOnly'))}</p>
    <p class="notice"><a href="${link(loc, 'community-guidelines/')}">${esc(trustLabel(loc, 'community'))}</a></p>
  </form>
  <div>
    <div class="filter-panel board-qna-filter"><strong>${esc(boardLabel(loc, 'chooseLevel'))}</strong><label><span>${esc(boardLabel(loc, 'chooseLevel'))}</span><select data-qna-level><option value="">${esc(boardLabel(loc, 'allLevels'))}</option>${levelOptions}</select></label></div>
    <div class="qna-board" data-qna-board>${boards.qnaSeeds.map((it) => qnaStaticCard(it, loc)).join('')}</div>
    <script type="application/json" id="qna-seed">${seedJson}</script>
  </div>
</div></section>`;
  return layout({ loc, rel: 'boards/qna/', title: boardLabel(loc, 'qna'), description: boardLabel(loc, 'qnaIntro'), bodyHtml: body, noAds: true });
}

function renderCategoriesIndex(loc) {
  const categoryIcons = {
    rules: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 13c-4-3-11-3-15-1v25c4-2 11-2 15 1" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 13c4-3 11-3 15-1v25c-4-2-11-2-15 1" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><line x1="24" y1="13" x2="24" y2="38" stroke="currentColor" stroke-width="2.4"/></svg>',
    skills: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="15" stroke="currentColor" stroke-width="2.4"/><circle cx="24" cy="24" r="8.5" stroke="currentColor" stroke-width="2.2"/><circle cx="24" cy="24" r="3" fill="currentColor"/></svg>',
    gear: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="13" y="6" width="18" height="23" rx="9" stroke="currentColor" stroke-width="2.4"/><rect x="19" y="27" width="6" height="13" rx="3" fill="currentColor"/><circle cx="34.5" cy="33" r="5.5" stroke="currentColor" stroke-width="2.2"/></svg>',
    compete: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 9h16v9a8 8 0 0 1-16 0Z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M16 12h-4a4 4 0 0 0 4 7" stroke="currentColor" stroke-width="2.2"/><path d="M32 12h4a4 4 0 0 1-4 7" stroke="currentColor" stroke-width="2.2"/><line x1="24" y1="26" x2="24" y2="32" stroke="currentColor" stroke-width="2.4"/><rect x="17.5" y="32" width="13" height="4.5" rx="1.6" fill="currentColor"/></svg>',
    scene: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="15" stroke="currentColor" stroke-width="2.4"/><ellipse cx="24" cy="24" rx="6.5" ry="15" stroke="currentColor" stroke-width="2.2"/><line x1="9" y1="24" x2="39" y2="24" stroke="currentColor" stroke-width="2.2"/><path d="M12.5 16h23M12.5 32h23" stroke="currentColor" stroke-width="2.2"/></svg>',
  };
  const cards = categories.map((c) => {
    const count = publishedPosts.filter((p) => p.category === c.id).length;
    return `<a class="topic topic--${c.id}" href="${link(loc, 'category/' + c.slug + '/')}">
      <span class="topic__icon" aria-hidden="true">${categoryIcons[c.id] || ''}</span>
      <h3>${esc(categoryName(c, loc))}</h3>
      <p>${esc(loc1(c, loc, 'blurb'))}</p>
      <span class="topic__count">${count} ${esc(tt(loc, 'nav.guides').toLowerCase())}</span>
    </a>`;
  }).join('');
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'categories.title') }])}
<section class="page-head"><div class="wrap">
  <h1>${esc(tt(loc, 'categories.title'))}</h1>
  <p class="page-head__intro">${esc(tt(loc, 'categories.intro'))}</p>
</div></section>
<section class="band"><div class="wrap"><div class="topics">${cards}</div></div></section>`;
  return layout({ loc, rel: 'categories/', title: tt(loc, 'categories.title'), description: tt(loc, 'categories.intro'), bodyHtml: body });
}

function renderCategory(cat, loc) {
  const items = publishedPosts.filter((p) => p.category === cat.id)
    .sort((a, b) => (b.updated > a.updated ? 1 : -1));
  const name = categoryName(cat, loc);
  const intro = loc1(cat, loc, 'intro');
  const rel = 'category/' + cat.slug + '/';
  const body = `${breadcrumbs(loc, [
    { name: tt(loc, 'breadcrumb.home'), rel: '' },
    { name: tt(loc, 'categories.title'), rel: 'categories/' },
    { name },
  ])}
<section class="page-head"><div class="wrap">
  <p class="page-head__eyebrow">${esc(tt(loc, 'nav.guides'))}</p>
  <h1>${esc(name)}</h1>
  <p class="page-head__intro">${esc(intro)}</p>
</div></section>
<section class="band"><div class="wrap">
  <div class="cards">${items.map((p) => postCard(p, loc)).join('')}</div>
</div></section>`;
  return layout({ loc, rel, title: name, description: loc1(cat, loc, 'blurb'), bodyHtml: body });
}

function renderPost(p, loc) {
  const cat = catBySlug[p.category];
  const translated = isTranslated(p, loc);
  const title = loc1(p, loc, 'title');
  const subtitle = loc1(p, loc, 'subtitle');
  const summary = loc1(p, loc, 'summary');
  const body = loc1(p, loc, 'body');
  const takeaways = loc1(p, loc, 'keyTakeaways');
  const mistakes = loc1(p, loc, 'commonMistakes');
  const checklist = loc1(p, loc, 'checklist');
  const faq = loc1(p, loc, 'faq') || [];
  const toc = tocFromBody(body);
  const related = (p.related || []).map((s) => postBySlug[s]).filter(Boolean);
  const rel = p.slug + '/';

  const tocHtml = toc.length ? `<nav class="toc" aria-label="${escAttr(tt(loc, 'label.toc'))}">
    <p class="toc__title">${esc(tt(loc, 'label.toc'))}</p>
    <ol>${toc.map((t) => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ol></nav>` : '';

  const faqHtml = faq.length ? `<section class="block faq">
    <h2>${esc(tt(loc, 'label.faq'))}</h2>
    ${faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}
  </section>` : '';

  const railHtml = (p.category === 'skills' && p.level)
    ? `<div class="post-rail"><p class="post-rail__label">${esc(tt(loc, 'pathway.label'))} · ${esc(tt(loc, 'label.level'))} ${esc(p.level)}</p>${duprRail(loc, { level: p.level, compact: true })}</div>` : '';

  const visualHtml = contentVisual(loc, p.category);

  const relatedHtml = related.length ? `<section class="block related">
    <h2>${esc(tt(loc, 'label.related'))}</h2>
    <div class="cards cards--two">${related.map((r) => postCard(r, loc)).join('')}</div>
  </section>` : '';

  const articleBody = `
<article class="post">
  <header class="post__head wrap">
    <p class="post__cat"><a href="${link(loc, 'category/' + cat.slug + '/')}">${esc(categoryName(cat, loc))}</a>${p.featured ? ` · <span class="tag">${esc(tt(loc, 'label.featured'))}</span>` : ''}</p>
    <h1 class="post__title">${esc(title)}</h1>
    <p class="post__subtitle">${esc(subtitle)}</p>
    <p class="post__byline">${esc(tt(loc, 'label.by'))} <a href="${link(loc, 'author/')}">${esc(ownerName(loc))}</a>
      · ${esc(tt(loc, 'label.published'))} ${esc(fmtDate(loc, p.date))}
      · ${esc(tt(loc, 'label.updated'))} ${esc(fmtDate(loc, p.updated))}</p>
  </header>
  <div class="wrap post__grid">
    <div class="post__main">
      ${!translated ? fallbackNotice(loc) : ''}
      ${railHtml}
      ${takeaways && takeaways.length ? `<aside class="takeaways"><h2>${esc(tt(loc, 'label.takeaways'))}</h2><ul>${takeaways.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></aside>` : ''}
      ${visualHtml}
      <div class="prose">${body}</div>
      ${sourcePanel(loc, p.category)}
      ${listBlock('label.mistakes', mistakes, loc, 'mistakes')}
      ${listBlock('label.checklist', checklist, loc, 'checklist')}
      ${faqHtml}
      ${authorBox(loc)}
      ${relatedHtml}
    </div>
    <aside class="post__aside">${tocHtml}</aside>
  </div>
</article>`;

  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'Article',
    headline: title, description: summary, inLanguage: loc,
    datePublished: p.date, dateModified: p.updated,
    author: { '@type': 'Person', name: ownerName(loc) },
    publisher: { '@type': 'Organization', name: config.siteName },
    mainEntityOfPage: `${config.url}${link(loc, rel)}`,
  }];
  if (faq.length) jsonld.push({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  });

  return layout({
    loc, rel, title, description: summary, ogType: 'article',
    noindex: !translated, jsonld, bodyHtml: articleBody, bodyClass: 'page-post',
  });
}

function renderColumnsIndex(loc) {
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'nav.columns') }])}
<section class="page-head"><div class="wrap">
  <p class="page-head__eyebrow">${esc(tt(loc, 'label.column'))}</p>
  <h1>${esc(tt(loc, 'author.columnsTitle'))}</h1>
  <p class="page-head__intro">${esc(tt(loc, 'author.visitorIntro'))}</p>
</div></section>
<section class="band"><div class="wrap"><div class="cards">${publishedColumns.map((c) => columnCard(c, loc)).join('')}</div></div></section>`;
  return layout({ loc, rel: 'columns/', title: tt(loc, 'author.columnsTitle'), description: tt(loc, 'author.visitorIntro'), bodyHtml: body });
}

function renderColumn(c, loc) {
  const translated = isTranslated(c, loc);
  const title = loc1(c, loc, 'title');
  const body = loc1(c, loc, 'body');
  const takeaways = loc1(c, loc, 'keyTakeaways');
  const related = (c.related || []).map((s) => postBySlug[s]).filter(Boolean);
  const rel = 'columns/' + c.slug + '/';
  const articleBody = `
<article class="post post--column">
  <header class="post__head wrap">
    <p class="post__cat"><span class="tag tag--column">${esc(tt(loc, 'label.column'))}</span></p>
    <h1 class="post__title">${esc(title)}</h1>
    <p class="post__subtitle">${esc(loc1(c, loc, 'subtitle'))}</p>
    <p class="post__byline">${esc(tt(loc, 'label.by'))} <a href="${link(loc, 'author/')}">${esc(ownerName(loc))}</a>
      · ${esc(tt(loc, 'label.updated'))} ${esc(fmtDate(loc, c.updated))}</p>
  </header>
  <div class="wrap post__grid">
    <div class="post__main">
      ${!translated ? fallbackNotice(loc) : ''}
      ${takeaways && takeaways.length ? `<aside class="takeaways"><h2>${esc(tt(loc, 'label.takeaways'))}</h2><ul>${takeaways.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></aside>` : ''}
      <div class="prose">${body}</div>
      ${authorBox(loc)}
      ${related.length ? `<section class="block related"><h2>${esc(tt(loc, 'label.related'))}</h2><div class="cards cards--two">${related.map((r) => postCard(r, loc)).join('')}</div></section>` : ''}
    </div>
  </div>
</article>`;
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'OpinionNewsArticle',
    headline: title, inLanguage: loc, datePublished: c.date, dateModified: c.updated,
    author: { '@type': 'Person', name: ownerName(loc) },
    publisher: { '@type': 'Organization', name: config.siteName },
  }];
  return layout({ loc, rel, title, description: loc1(c, loc, 'summary'), ogType: 'article', noindex: !translated, jsonld, bodyHtml: articleBody, bodyClass: 'page-post' });
}


function renderUpdatesIndex(loc) {
  const latest = [...updateCenterItems()].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 12);
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: updateLabel(loc, 'title') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(updateLabel(loc, 'nav'))}</p><h1>${esc(updateLabel(loc, 'title'))}</h1><p class="page-head__intro">${esc(updateLabel(loc, 'intro'))}</p></div>
  ${visualFigure(loc, 'dupr')}
</div></section>
<section class="band"><div class="wrap">
  ${updateCategoryTabs(loc, 'all')}
  <h2 class="band__title">${esc(updateLabel(loc, 'latest'))}</h2>
  <div class="update-grid">${latest.length ? latest.map((u) => updateCard(u, loc)).join('') : `<p class="notice">${esc(updateLabel(loc, 'noItems'))}</p>`}</div>
</div></section>
<section class="band"><div class="wrap"><div class="cross-note">
  <h2 class="band__title">${esc(loc === 'ko' ? '대회 일정·결과·랭킹을 찾으세요?' : 'Looking for tournament schedules, results, or rankings?')}</h2>
  <p>${esc(loc === 'ko' ? '대회 관련 내용은 모두 대회정보 메뉴에 모았습니다. 업데이트 센터는 규정 변경, 선수 동향, 대회 외 피클볼 뉴스에 집중합니다.' : 'All tournament coverage lives in the Tournaments menu. The Update Center focuses on rule changes, player news, and non-tournament pickleball news.')}</p>
  <p><a class="btn btn--primary" href="${link(loc, 'tournaments/')}">${esc(loc === 'ko' ? '대회정보로 가기' : 'Go to Tournaments')} →</a></p>
</div></div></section>
<section class="band band--alt"><div class="wrap"><h2 class="band__title">${esc(updateLabel(loc, 'sources'))}</h2>${updateSourceCards(loc, ['news','rules','players'])}</div></section>`;
  return layout({ loc, rel: 'updates/', title: updateLabel(loc, 'title'), description: updateLabel(loc, 'intro'), noindex: true, bodyHtml: body });
}

function playerAvatar(person, loc) {
  const name = person.name;
  const slug = person.slug;
  let hasSvg = false;
  if (slug) { try { hasSvg = fs.existsSync(path.join(ROOT, 'assets/img/players/' + slug + '.svg')); } catch (e) { hasSvg = false; } }
  const initials = (name || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const inner = hasSvg
    ? `<img class="rank-avatar__img" src="/assets/img/players/${escAttr(slug)}.svg" alt="${escAttr(name)} — illustration" loading="lazy">`
    : `<span class="rank-avatar__ini" aria-hidden="true">${esc(initials)}</span>`;
  const label = `<span class="rank-name">${esc(name)}</span>`;
  if (slug && hasSvg) return `<a class="rank-person" href="${link(loc, 'players/' + slug + '/')}"><span class="rank-avatar">${inner}</span>${label}</a>`;
  if (slug) return `<a class="rank-person" href="${link(loc, 'players/' + slug + '/')}"><span class="rank-avatar rank-avatar--ini">${inner}</span>${label}</a>`;
  return `<span class="rank-person"><span class="rank-avatar rank-avatar--ini">${inner}</span>${label}</span>`;
}
function rankingsBoard(loc) {
  if (!rankingsData) return '';
  const R = rankingsData;
  const note = (loc === 'ko' && R.noteKo) ? R.noteKo : R.note;
  const cards = R.disciplines.map((d) => {
    const dk = (loc === 'ko' && d.keyKo) ? d.keyKo : d.key;
    const dnote = (loc === 'ko' && d.noteKo) ? d.noteKo : d.note;
    const leaders = [d.leader, d.leader2].filter(Boolean).map((p) => playerAvatar(p, loc)).join('<span class="rank-amp">&amp;</span>');
    const chasers = (d.chasers || []).map((c) => c.slug ? `<a href="${link(loc, 'players/' + c.slug + '/')}">${esc(c.name)}</a>` : `<span>${esc(c.name)}</span>`).join('<span class="rank-sep">·</span>');
    return `<article class="rank-card">
      <h3 class="rank-card__disc">${esc(dk)}</h3>
      <div class="rank-card__leaders">${leaders}</div>
      ${chasers ? `<p class="rank-card__chasers"><span class="rank-card__chasers-label">${esc(loc === 'ko' ? '추격' : 'Chasing')}:</span> ${chasers}</p>` : ''}
      ${dnote ? `<p class="rank-card__note">${esc(dnote)}</p>` : ''}
    </article>`;
  }).join('');
  const updated = loc === 'ko' ? ('기준일 ' + esc(R.updated)) : ('As of ' + esc(R.updated));
  return `<div class="rankings-board">
    <p class="rankings-board__note">${esc(note)} <span class="muted">(${updated})</span></p>
    <div class="rank-grid">${cards}</div>
    <div class="source-buttons">
      <a class="btn btn--primary" href="${escAttr(R.sourceUrl)}" rel="nofollow noopener" target="_blank">${esc(R.sourceName)}</a>
      <a class="btn btn--ghost" href="${escAttr(R.duprUrl)}" rel="nofollow noopener" target="_blank">DUPR Rankings</a>
    </div>
  </div>`;
}

function renderUpdatesCategory(loc, type) {
  const title = updateTypeLabel(loc, type);
  const items = [...updateCenterItems()].filter((u) => u.type === type).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  const introMap = {
    ko: {
      news: '대회 외 피클볼 소식과 공식 발표를 짧게 정리합니다. 대회 일정·결과·랭킹은 대회정보 메뉴에서 확인하세요.',
      rules: 'USA Pickleball, UPA-A 등 공식 규정과 패들 승인/ban 변경처럼 경기 참가에 영향을 주는 내용을 확인합니다.',
      players: '선수들의 랭킹·레이팅 변화, 이적·팀 구성, 복귀·부상 등 선수 동향을 공식 출처 기준으로 확인합니다.'
    },
    en: {
      news: 'Short notes on non-tournament pickleball news and official announcements. For schedules, results, and rankings, see the Tournaments menu.',
      rules: 'Official rules, paddle approval, and ban-related updates that can affect tournament play.',
      players: 'Player ratings, ranking moves, roster or team changes, and returns or injuries — verified at the source.'
    }
  };
  const intro = (introMap[loc] && introMap[loc][type]) || (introMap.en[type] || updateLabel(loc, 'intro'));
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: updateLabel(loc, 'title'), rel: 'updates/' }, { name: title }])}
<section class="page-head"><div class="wrap"><p class="page-head__eyebrow">${esc(updateLabel(loc, 'nav'))}</p><h1>${esc(title)}</h1><p class="page-head__intro">${esc(intro)}</p></div></section>
<section class="band"><div class="wrap">${updateCategoryTabs(loc, type)}<div class="update-grid">${items.length ? items.map((u) => updateCard(u, loc)).join('') : `<p class="notice">${esc(updateLabel(loc, 'noItems'))}</p>`}</div></div></section>
<section class="band band--alt"><div class="wrap"><h2 class="band__title">${esc(updateLabel(loc, 'sources'))}</h2>${updateSourceCards(loc, type)}</div></section>`;
  return layout({ loc, rel: 'updates/' + type + '/', title: title + ' · ' + updateLabel(loc, 'title'), description: intro, noindex: true, bodyHtml: body, noAds: type === 'rules' });
}


function tournamentLabel(loc, key) {
  const labels = {
    ko: {
      nav: '대회정보', title: '피클볼 대회정보', intro: '미국 주요 대회와 미국 외 국제 대회 일정, 경기 결과, 참가 요강, 주요 참가선수 확인 경로를 한곳에서 정리합니다. 접수 마감, 참가 명단, 장소 변경은 반드시 원문 공식 페이지에서 최종 확인하세요.',
      all: '전체 대회정보', usa: '미국 대회', international: '미국 외 대회', results: '경기 결과', domestic: '미국 외 대회', sources: '대회 확인 출처', latest: '최근 대회정보', viewAll: '대회정보 전체 보기', noItems: '아직 확인된 대회정보가 없습니다.'
    },
    en: {
      nav: 'Tournaments', title: 'Pickleball Tournament Information', intro: 'U.S. and non-U.S. event schedules, results, entry notes, and player-field source links in one place. Always verify registration deadlines, draws, locations, and player fields at the official source.',
      all: 'All tournament info', usa: 'U.S. events', international: 'Non-U.S. events', results: 'Results', domestic: 'Non-U.S. events', sources: 'Tournament sources', latest: 'Latest tournament information', viewAll: 'View tournaments', noItems: 'No tournament information has been approved yet.'
    },
    es: {
      nav: 'Torneos', title: 'Información de torneos de pickleball', intro: 'Calendarios de eventos en EE. UU. y fuera de EE. UU., resultados, notas de inscripción y enlaces a fuentes de jugadores participantes. Verifica siempre fechas, draws, sedes y fields en la fuente oficial.',
      all: 'Toda la información', usa: 'Eventos en EE. UU.', international: 'Eventos fuera de EE. UU.', results: 'Resultados', domestic: 'Eventos fuera de EE. UU.', sources: 'Fuentes de torneos', latest: 'Información reciente', viewAll: 'Ver torneos', noItems: 'Todavía no hay información de torneos aprobada.'
    }
  };
  return (labels[loc] && labels[loc][key]) || labels.en[key] || key;
}
function tournamentTabs(loc, active) {
  const items = [
    ['tournaments/', 'all'], ['tournaments/us/', 'usa'], ['tournaments/international/', 'international'], ['tournaments/results/', 'results']
  ];
  return `<nav class="update-tabs" aria-label="${escAttr(tournamentLabel(loc, 'title'))}">${items.map(([rel, key]) => `<a class="${active === key ? 'is-active' : ''}" href="${link(loc, rel)}">${esc(tournamentLabel(loc, key))}</a>`).join('')}</nav>`;
}
function renderTournamentsIndex(loc) {
  const items = [...tournamentItems('all')].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 12);
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tournamentLabel(loc, 'title') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(tournamentLabel(loc, 'nav'))}</p><h1>${esc(tournamentLabel(loc, 'title'))}</h1><p class="page-head__intro">${esc(tournamentLabel(loc, 'intro'))}</p></div>
  ${visualFigure(loc, 'court')}
</div></section>
<section class="band"><div class="wrap">
  ${tournamentTabs(loc, 'all')}
  <h2 class="band__title">${esc(tournamentLabel(loc, 'latest'))}</h2>
  <div class="update-grid">${items.length ? items.map((u) => updateCard(u, loc)).join('') : `<p class="notice">${esc(tournamentLabel(loc, 'noItems'))}</p>`}</div>
</div></section>
${tourResults.length ? `<section class="band band--alt"><div class="wrap">
  <h2 class="band__title">${esc(loc === 'ko' ? '최근 대회 결과' : 'Recent results')}</h2>
  <div class="recaps">${resultRecap(loc, tourResults[0])}</div>
  <p><a class="btn btn--ghost" href="${link(loc, 'tournaments/results/')}">${esc(loc === 'ko' ? '전체 대회 결과 보기' : 'See all results')} →</a></p>
</div></section>` : ''}
<section class="band"><div class="wrap"><div class="cross-note">
  <h2 class="band__title">${esc(loc === 'ko' ? '규정 변경·선수 동향이 궁금하세요?' : 'Looking for rule changes or player news?')}</h2>
  <p>${esc(loc === 'ko' ? '규정 변경, 선수 동향, 대회 외 피클볼 뉴스는 업데이트 센터에서 정리합니다.' : 'Rule changes, player news, and non-tournament pickleball news are curated in the Update Center.')}</p>
  <p><a class="btn btn--ghost" href="${link(loc, 'updates/')}">${esc(loc === 'ko' ? '업데이트 센터로 가기' : 'Go to the Update Center')} →</a></p>
</div></div></section>
<section class="band band--alt"><div class="wrap"><h2 class="band__title">${esc(tournamentLabel(loc, 'sources'))}</h2>${updateSourceCards(loc, ['tournaments','international','results'])}</div></section>`;
  return layout({ loc, rel: 'tournaments/', title: tournamentLabel(loc, 'title'), description: tournamentLabel(loc, 'intro'), bodyHtml: body });
}
function resultRecap(loc, r) {
  const pick = (b) => (loc === 'ko' && r[b + 'Ko']) ? r[b + 'Ko'] : r[b];
  const winners = (r.winners || []).map((w) => {
    const div = (loc === 'ko' && w.divisionKo) ? w.divisionKo : w.division;
    return `<li><span class="recap-win__div">${esc(div)}</span><span class="recap-win__champ">${esc(w.champ)}</span></li>`;
  }).join('');
  const champLabel = (loc === 'ko' && r.winnersLabelKo) ? r.winnersLabelKo : (r.winnersLabel || (loc === 'ko' ? '종목별 우승' : 'Champions by division'));
  const verifyNote = loc === 'ko'
    ? `결과는 ${esc(r.checked)} 확인 기준이며 사후 정정될 수 있습니다. 전체 브래킷·스코어는 공식 출처에서 확인하세요.`
    : `Results as of ${esc(r.checked)} and may be amended — see the official source for full brackets and scores.`;
  return `<article class="recap">
    <header class="recap__head">
      <p class="recap__tier">${esc(pick('tier') || '')}</p>
      <h2 class="recap__title">${esc(pick('event'))}</h2>
      <p class="recap__meta">${esc(pick('dates'))} · ${esc(pick('location'))}</p>
    </header>
    <p class="recap__summary">${esc(pick('summary'))}</p>
    <div class="recap__winners"><h3>${esc(champLabel)}</h3><ul class="recap-win">${winners}</ul></div>
    <div class="recap__story"><h3>${esc(pick('storylineTitle') || '')}</h3><p>${esc(pick('storyline'))}</p></div>
    <div class="source-buttons"><a class="btn btn--ghost" href="${escAttr(r.sourceUrl)}" rel="nofollow noopener" target="_blank">${esc(r.sourceName)}</a></div>
    <p class="notice">${esc(verifyNote)}</p>
  </article>`;
}

function renderTournamentsCategory(loc, type) {
  const key = type === 'tournaments' ? 'usa' : (type === 'international' ? 'international' : 'results');
  const title = tournamentLabel(loc, key);
  const items = tournamentItems(type).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  const introMap = {
    ko: {
      tournaments: 'PPA, PPA Challenger, MLP 등 미국 주요 대회의 일정·장소·참가 요강 확인 경로를 정리합니다.',
      international: '미국 외 국제 대회와 글로벌 확장 관련 일정·참가 요강 확인 경로를 정리합니다.',
      results: '올해 실제 개최된 주요 대회의 경기 결과, 메달리스트, 브래킷 확인 경로와 현재 종목별 선두 현황을 정리합니다.'
    },
    en: {
      tournaments: 'U.S. event schedules, locations, entry notes, and event-page source links.',
      international: 'Non-U.S. event schedules, international expansion notes, and official source links.',
      results: 'Completed-event results, medalists, brackets, official result source links, and the current discipline leaders.'
    },
    es: {
      tournaments: 'Calendarios, sedes, notas de inscripción y enlaces oficiales de eventos en EE. UU.',
      international: 'Eventos fuera de EE. UU., expansión internacional y enlaces oficiales.',
      results: 'Resultados de eventos completados, medallistas, brackets y enlaces oficiales.'
    }
  };
  const relMap = { tournaments: 'tournaments/us/', international: 'tournaments/international/', results: 'tournaments/results/' };
  const intro = (introMap[loc] && introMap[loc][type]) || introMap.en[type];
  const isResults = type === 'results';
  const recapsHtml = isResults
    ? (tourResults.filter((r) => r.status === 'published').map((r) => resultRecap(loc, r)).join('') || `<p class="notice">${esc(tournamentLabel(loc, 'noItems'))}</p>`)
    : '';
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tournamentLabel(loc, 'title'), rel: 'tournaments/' }, { name: title }])}
<section class="page-head"><div class="wrap"><p class="page-head__eyebrow">${esc(tournamentLabel(loc, 'nav'))}</p><h1>${esc(title)}</h1><p class="page-head__intro">${esc(intro)}</p></div></section>
<section class="band"><div class="wrap">${tournamentTabs(loc, key)}${isResults ? `<h2 class="band__title">${esc(loc === 'ko' ? '현재 종목별 선두' : 'Current discipline leaders')}</h2>${rankingsBoard(loc)}<h2 class="band__title">${esc(loc === 'ko' ? '최근 대회 결과' : 'Recent results')}</h2><div class="recaps">${recapsHtml}</div>` : `<div class="update-grid">${items.length ? items.map((u) => updateCard(u, loc)).join('') : `<p class="notice">${esc(tournamentLabel(loc, 'noItems'))}</p>`}</div>`}</div></section>
<section class="band band--alt"><div class="wrap"><h2 class="band__title">${esc(tournamentLabel(loc, 'sources'))}</h2>${updateSourceCards(loc, type)}</div></section>`;
  return layout({ loc, rel: relMap[type], title: title + ' · ' + tournamentLabel(loc, 'title'), description: intro, bodyHtml: body });
}
function paddleUpdatesLabel(loc, key) {
  const labels = {
    ko: { title: '패들 출시·리뷰 업데이트', intro: '신규 패들 출시, 가격 변화, 시장 반응, 리뷰어 평가를 패들 정보와 함께 확인합니다. 가격·승인 여부·리뷰 점수는 반드시 원문에서 최종 확인하세요.', sources: '패들 확인 출처', latest: '최근 패들 업데이트', noItems: '아직 확인된 패들 업데이트가 없습니다.', viewAll: '패들 업데이트 보기' },
    en: { title: 'Paddle launch & review updates', intro: 'New paddle launches, price changes, market reaction, and reviewer-score notes inside the paddle section. Always verify price, legality, and review sources before buying.', sources: 'Paddle sources', latest: 'Latest paddle updates', noItems: 'No paddle updates have been approved yet.', viewAll: 'View paddle updates' },
    es: { title: 'Lanzamientos y reviews de palas', intro: 'Nuevas palas, cambios de precio, reacción del mercado y notas de reviewers dentro de la sección de palas. Verifica precio, legalidad y reviews antes de comprar.', sources: 'Fuentes de palas', latest: 'Updates recientes de palas', noItems: 'Todavía no hay updates de palas aprobados.', viewAll: 'Ver updates de palas' }
  };
  return (labels[loc] && labels[loc][key]) || labels.en[key] || key;
}
function renderPaddleUpdatesPage(loc) {
  const items = paddleUpdateItems().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'paddles.title'), rel: 'paddles/' }, { name: paddleUpdatesLabel(loc, 'title') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(tt(loc, 'nav.paddles'))}</p><h1>${esc(paddleUpdatesLabel(loc, 'title'))}</h1><p class="page-head__intro">${esc(paddleUpdatesLabel(loc, 'intro'))}</p></div>
  ${visualFigure(loc, 'paddles')}
</div></section>
<section class="band"><div class="wrap"><h2 class="band__title">${esc(paddleUpdatesLabel(loc, 'latest'))}</h2><div class="update-grid">${items.length ? items.map((u) => updateCard(u, loc)).join('') : `<p class="notice">${esc(paddleUpdatesLabel(loc, 'noItems'))}</p>`}</div></div></section>
<section class="band band--alt"><div class="wrap"><h2 class="band__title">${esc(paddleUpdatesLabel(loc, 'sources'))}</h2>${updateSourceCards(loc, 'paddles')}</div></section>`;
  return layout({ loc, rel: 'paddles/updates/', title: paddleUpdatesLabel(loc, 'title'), description: paddleUpdatesLabel(loc, 'intro'), noindex: true, bodyHtml: body });
}

function renderBrief(loc) {
  const translated = loc === SOURCE || loc === 'ko'; // Korean edition is manually localised for AdSense readiness
  const editions = briefEditions.map((ed) => `<section class="edition">
    <h2 class="edition__title">${esc(tt(loc, 'brief.edition'))} ${ed.edition} · <span>${esc(fmtDate(loc, ed.date))}</span></h2>
    <p class="edition__lede">${esc(localBriefTitle(ed, loc))}</p>
    <ul class="brief-list">
      ${ed.items.map((raw) => { const it = localBriefItem(raw, loc); return `<li><p>${esc(it.take)}</p>
        <a class="brief-list__src" href="${escAttr(it.sourceUrl)}"${/^https?:/.test(it.sourceUrl) ? ' rel="nofollow noopener" target="_blank"' : ''}>${esc(tt(loc, 'brief.source'))}: ${esc(it.sourceName)}</a></li>`; }).join('')}
    </ul>
  </section>`).join('');
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'brief.title') }])}
<section class="page-head"><div class="wrap">
  <h1>${esc(tt(loc, 'brief.title'))}</h1>
  <p class="page-head__intro">${esc(tt(loc, 'brief.intro'))}</p>
</div></section>
<section class="band"><div class="wrap narrow">
  ${!translated ? fallbackNotice(loc) : ''}
  ${editions}
  <p class="notice">${esc(tt(loc, 'brief.disclaimer'))}</p>
</div></section>`;
  return layout({ loc, rel: 'the-brief/', title: tt(loc, 'brief.title'), description: tt(loc, 'brief.intro'), noindex: !translated, bodyHtml: body });
}

// ---- trust / static pages (English source; localized chrome) --------------
function simplePage(loc, rel, titleText, introText, htmlBody, opts) {
  opts = opts || {};
  const translated = opts.translated != null ? opts.translated : (loc === SOURCE);
  const noindex = opts.noindex != null ? opts.noindex : !translated;
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: titleText }])}
<section class="page-head"><div class="wrap">
  <h1>${esc(titleText)}</h1>
  ${introText ? `<p class="page-head__intro">${esc(introText)}</p>` : ''}
</div></section>
<section class="band"><div class="wrap narrow prose">
  ${!translated && opts.showFallback !== false ? fallbackNotice(loc) : ''}
  ${htmlBody}
</div></section>`;
  return layout({ loc, rel, title: titleText, description: introText || titleText, noindex, bodyHtml: body });
}

function renderAbout(loc) {
  const principles = editorialPrinciplesFor(loc).map((p) => `<li>${esc(p)}</li>`).join('');
  const html = loc === 'ko' ? `
<p>${esc(config.siteName)}은 피클볼 플레이어가 자신의 레벨에 맞는 규칙, 스킬, 패들, 프로 선수 정보를 쉽게 찾도록 만든 독립 정보 사이트입니다. 특정 브랜드나 단체의 공식 사이트가 아니며, 독자가 더 나은 결정을 내릴 수 있도록 공식 출처 확인 경로를 함께 제공합니다.</p>
<h2>무엇을 다루나요</h2>
<p>핵심 주제는 네 가지입니다. 첫째, 2.0부터 5.0까지의 레벨별 규칙과 스킬 학습. 둘째, 브랜드별 인기 패들의 가격, 형태, 성향 비교. 셋째, 세계 유명 선수의 플레이 스타일과 공식 프로필 연결. 넷째, 영상 피드백과 하이라이트를 통한 커뮤니티 학습입니다.</p>
<h2>콘텐츠 작성 기준</h2>
<ul class="principles">${principles}</ul>
<h2>누가 운영하나요</h2>
<p>${esc(ownerBio(loc))} 문의, 오류 제보, 제휴 문의는 <a href="mailto:${escAttr(config.email)}">${esc(config.email)}</a>로 보내주세요. 글 작성 기준은 <a href="${link(loc, 'editorial-policy/')}">편집 정책</a>과 <a href="${link(loc, 'corrections-policy/')}">정정 정책</a>에서 확인할 수 있습니다.</p>` : `
<p>${esc(config.siteName)} is an independent information site about pickleball, written for players who want to choose gear sensibly and steadily improve. It is not a news aggregator, bookmaker, or marketplace — it is a curated hub of practical guides.</p>
<h2>What we cover</h2>
<p>Four core experiences: level-based rules and skills from 2.0 to 5.0, paddle research by brand and play style, pro player profile research, and highlight/video feedback education.</p>
<h2>How we work</h2>
<ul class="principles">${principles}</ul>
<h2>Who runs it</h2>
<p>${esc(ownerBio(loc))} You can reach the site by email at <a href="mailto:${escAttr(config.email)}">${esc(config.email)}</a>. Read more in the <a href="${link(loc, 'editorial-policy/')}">Editorial Policy</a> and <a href="${link(loc, 'corrections-policy/')}">Corrections Policy</a>.</p>`;
  return simplePage(loc, 'about/', tt(loc, 'nav.about'), config.tagline, html, { translated: loc === 'ko' || loc === SOURCE, noindex: false });
}

function renderContact(loc) {
  const html = loc === 'ko' ? `
<p>Picklary에 대한 문의, 오류 제보, 선수·패들 정보 업데이트 요청, 제휴 문의를 이메일로 보내실 수 있습니다. 정정 제보에는 확인 가능한 공식 링크나 사진 출처를 함께 보내주시면 검토가 더 빠릅니다.</p>
<p class="contact-email"><strong>이메일:</strong> <a href="mailto:${escAttr(config.email)}">${esc(config.email)}</a></p>
<form class="contact-form" data-contact-form data-email="${escAttr(config.email)}">
  <label>이름<input type="text" name="name" autocomplete="name"></label>
  <label>답장 받을 이메일<input type="email" name="from" autocomplete="email"></label>
  <label>문의 내용<textarea name="message" rows="5"></textarea></label>
  <button type="submit" class="btn btn--primary">이메일 앱으로 보내기</button>
</form>
<p class="notice">이 양식은 서버에 내용을 저장하지 않고 사용자의 이메일 앱을 여는 방식으로 작동합니다. 실제 애드센스 신청 전에는 위 이메일 주소가 수신 가능한 실제 주소인지 확인하세요.</p>` : `
<p>${esc(tt(loc, 'contact.intro'))}</p>
<p class="contact-email"><strong>${esc(tt(loc, 'contact.emailLabel'))}:</strong> <a href="mailto:${escAttr(config.email)}">${esc(config.email)}</a></p>
<form class="contact-form" data-contact-form data-email="${escAttr(config.email)}">
  <label>${esc(tt(loc, 'contact.formName'))}<input type="text" name="name" autocomplete="name"></label>
  <label>${esc(tt(loc, 'contact.formEmail'))}<input type="email" name="from" autocomplete="email"></label>
  <label>${esc(tt(loc, 'contact.formMessage'))}<textarea name="message" rows="5"></textarea></label>
  <button type="submit" class="btn btn--primary">${esc(tt(loc, 'contact.formSend'))}</button>
</form>
<p class="notice">${esc(tt(loc, 'contact.note'))}</p>`;
  return simplePage(loc, 'contact/', tt(loc, 'contact.title'), tt(loc, 'contact.intro'), html, { translated: loc === 'ko' || loc === SOURCE, noindex: false });
}



function renderAuthor(loc) {
  const o = config.owner;
  const principles = editorialPrinciplesFor(loc).map((p) => `<li>${esc(p)}</li>`).join('');
  const cols = publishedColumns.map((c) => columnCard(c, loc)).join('');
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'author.title') }])}
<section class="page-head"><div class="wrap">
  <h1>${esc(tt(loc, 'author.title'))}</h1>
</div></section>
<section class="band"><div class="wrap narrow">
  ${authorBox(loc)}
  <p class="author-visitor" data-author-visitor>${esc(tt(loc, 'author.visitorIntro'))}</p>

  <h2>${esc(tt(loc, 'author.principlesTitle'))}</h2>
  <ul class="principles">${principles}</ul>

  <h2>${esc(tt(loc, 'author.columnsTitle'))}</h2>
  <div class="cards">${cols}</div>
</div></section>`;
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'ProfilePage', mainEntity: { '@type': 'Person', name: ownerName(loc), description: ownerBio(loc) } }];
  return layout({ loc, rel: 'author/', title: tt(loc, 'author.title'), description: ownerBio(loc), jsonld, bodyHtml: body });
}

function renderTool(loc) {
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'tool.title') }])}
<section class="page-head"><div class="wrap">
  <h1>${esc(tt(loc, 'tool.title'))}</h1>
  <p class="page-head__intro">${esc(tt(loc, 'tool.intro'))}</p>
</div></section>
<section class="band"><div class="wrap narrow">
  <div class="finder" data-paddle-finder
    data-q1="${escAttr(tt(loc, 'tool.q1'))}" data-q1a="${escAttr(tt(loc, 'tool.q1a'))}" data-q1b="${escAttr(tt(loc, 'tool.q1b'))}" data-q1c="${escAttr(tt(loc, 'tool.q1c'))}"
    data-q2="${escAttr(tt(loc, 'tool.q2'))}" data-q2a="${escAttr(tt(loc, 'tool.q2a'))}" data-q2b="${escAttr(tt(loc, 'tool.q2b'))}"
    data-q3="${escAttr(tt(loc, 'tool.q3'))}" data-q3a="${escAttr(tt(loc, 'tool.q3a'))}" data-q3b="${escAttr(tt(loc, 'tool.q3b'))}"
    data-result="${escAttr(tt(loc, 'tool.result'))}" data-restart="${escAttr(tt(loc, 'tool.restart'))}" data-next="${escAttr(tt(loc, 'tool.next'))}"
    data-profile-intro="${escAttr(tt(loc, 'tool.profileIntro'))}" data-note="${escAttr(tt(loc, 'tool.note'))}"
    data-rec-control="${escAttr(tt(loc, 'tool.recControl'))}" data-rec-spin="${escAttr(tt(loc, 'tool.recSpin'))}" data-rec-power="${escAttr(tt(loc, 'tool.recPower'))}"
    data-rec-hands="${escAttr(tt(loc, 'tool.recHands'))}" data-rec-stability="${escAttr(tt(loc, 'tool.recStability'))}" data-rec-gentle="${escAttr(tt(loc, 'tool.recGentle'))}"></div>
  <p class="notice"><a href="${link(loc, 'paddles/')}">${esc(tt(loc, 'paddles.title'))}</a> · <a href="${link(loc, 'how-to-choose-your-first-pickleball-paddle/')}">${esc(tt(loc, 'label.readMore'))}: ${esc(loc1(postBySlug['how-to-choose-your-first-pickleball-paddle'], loc, 'title'))}</a></p>
</div></section>`;
  return layout({ loc, rel: 'tools/paddle-finder/', title: tt(loc, 'tool.title'), description: tt(loc, 'tool.intro'), noindex: true, bodyHtml: body });
}

function renderSitemapPage(loc) {
  const section = (heading, links) => `<h2>${esc(heading)}</h2><ul class="sitemap-list">${links.map((l) => `<li><a href="${l.href}">${esc(l.name)}</a></li>`).join('')}</ul>`;
  const main = section(tt(loc, 'nav.home'), [
    { name: tt(loc, 'nav.home'), href: link(loc, '') },
    { name: tt(loc, 'level.indexTitle'), href: link(loc, 'level/') },
    { name: tt(loc, 'paddles.title'), href: link(loc, 'paddles/') },
    { name: paddleUpdatesLabel(loc, 'title'), href: link(loc, 'paddles/updates/') },
    { name: tt(loc, 'players.title'), href: link(loc, 'players/') },
    { name: tournamentLabel(loc, 'title'), href: link(loc, 'tournaments/') },
    { name: updateLabel(loc, 'title'), href: link(loc, 'updates/') },
    { name: boardLabel(loc, 'title'), href: link(loc, 'boards/') },
    { name: boardLabel(loc, 'faq'), href: link(loc, 'boards/dupr-faq/') },
    { name: boardLabel(loc, 'qna'), href: link(loc, 'boards/qna/') },
    { name: tt(loc, 'highlights.title'), href: link(loc, 'highlights/') },
    { name: tt(loc, 'categories.title'), href: link(loc, 'categories/') },
    { name: tt(loc, 'nav.columns'), href: link(loc, 'columns/') },
    { name: tt(loc, 'brief.title'), href: link(loc, 'the-brief/') },
    { name: tt(loc, 'tool.title'), href: link(loc, 'tools/paddle-finder/') },
    { name: tt(loc, 'nav.about'), href: link(loc, 'about/') },
    { name: trustLabel(loc, 'editorial'), href: link(loc, 'editorial-policy/') },
    { name: trustLabel(loc, 'corrections'), href: link(loc, 'corrections-policy/') },
    { name: trustLabel(loc, 'cookies'), href: link(loc, 'cookie-policy/') },
    { name: trustLabel(loc, 'advertising'), href: link(loc, 'advertising-disclosure/') },
    { name: trustLabel(loc, 'community'), href: link(loc, 'community-guidelines/') },
    { name: tt(loc, 'author.title'), href: link(loc, 'author/') },
    { name: tt(loc, 'nav.contact'), href: link(loc, 'contact/') },
  ]);
  const cats = categories.map((c) => `<div class="sitemap-cat"><h3><a href="${link(loc, 'category/' + c.slug + '/')}">${esc(categoryName(c, loc))}</a></h3><ul class="sitemap-list">${publishedPosts.filter((p) => p.category === c.id).map((p) => `<li><a href="${link(loc, p.slug + '/')}">${esc(loc1(p, loc, 'title'))}</a></li>`).join('')}</ul></div>`).join('');
  const legal = section(loc === 'ko' ? '신뢰·정책 페이지' : 'Trust and policy pages', [
    { name: tt(loc, 'footer.privacy'), href: link(loc, 'privacy/') },
    { name: trustLabel(loc, 'cookies'), href: link(loc, 'cookie-policy/') },
    { name: tt(loc, 'footer.terms'), href: link(loc, 'terms/') },
    { name: tt(loc, 'footer.disclaimer'), href: link(loc, 'disclaimer/') },
    { name: trustLabel(loc, 'editorial'), href: link(loc, 'editorial-policy/') },
    { name: trustLabel(loc, 'corrections'), href: link(loc, 'corrections-policy/') },
    { name: trustLabel(loc, 'advertising'), href: link(loc, 'advertising-disclosure/') },
    { name: trustLabel(loc, 'community'), href: link(loc, 'community-guidelines/') },
  ]);
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'sitemap.title') }])}
<section class="page-head"><div class="wrap"><h1>${esc(tt(loc, 'sitemap.title'))}</h1><p class="page-head__intro">${esc(tt(loc, 'sitemap.intro'))}</p></div></section>
<section class="band"><div class="wrap narrow sitemap">
  ${main}
  <h2>${esc(tt(loc, 'categories.title'))}</h2>
  ${cats}
  ${legal}
</div></section>`;
  return layout({ loc, rel: 'sitemap/', title: tt(loc, 'sitemap.title'), description: tt(loc, 'sitemap.intro'), bodyHtml: body });
}

// Legal and trust page bodies. Korean is the default-locale source for approval review;
// English is kept for the international version. Replace the email and business details
// with your real operator details before submitting to AdSense.
function legalBodies(loc) {
  const site = config.siteName, email = config.email;
  const date = fmtDate(loc === 'ko' ? 'ko' : SOURCE, new Date().toISOString());
  if (loc === 'ko') return {
    privacy: `
<p>이 개인정보처리방침은 ${esc(site)} 방문 시 어떤 정보가 처리될 수 있는지 설명합니다. ${esc(site)}은 계정 가입 없이 읽을 수 있는 정적 정보 사이트를 기본으로 하며, 필요한 정보만 최소한으로 처리하는 것을 원칙으로 합니다.</p>
<h2>수집하는 정보</h2>
<p>사이트를 읽는 것만으로 이름, 이메일, 전화번호를 직접 요구하지 않습니다. 문의를 위해 이메일을 보내는 경우, 사용자가 이메일에 적은 이름, 주소, 문의 내용이 수신됩니다. 문의 처리를 위해 필요한 범위에서만 사용합니다.</p>
<h2>브라우저 저장소</h2>
<p>언어 선택, 로컬 하이라이트 리더보드 같은 기능은 사용자의 브라우저 localStorage를 사용할 수 있습니다. 이 정보는 사이트 서버로 전송되지 않으며, 사용자는 브라우저 설정에서 언제든 삭제할 수 있습니다.</p>
<h2>언어 자동 설정</h2>
<p>첫 방문 시 루트 페이지는 사용자의 대략적인 접속 국가를 확인해 한국은 한국어, 중남미 국가는 스페인어, 그 외 국가는 영어 페이지로 안내할 수 있습니다. 정적 호스팅 환경에서는 같은 도메인의 Cloudflare 국가 정보 또는 공개 GeoIP JSON 응답을 사용할 수 있으며, 이 과정에서 IP 기반 국가 코드가 처리될 수 있습니다. 사용자가 언어 선택 메뉴에서 직접 선택한 값은 브라우저 localStorage에 저장되어 이후 선택을 우선합니다.</p>
<h2>광고와 제3자 쿠키</h2>
<p>${esc(site)}은 Google AdSense를 통한 광고 게재를 목표로 합니다. 광고가 활성화되면 Google을 포함한 제3자 공급업체는 쿠키를 사용해 사용자의 이전 방문 정보에 기반한 광고를 제공할 수 있습니다. 사용자는 <a href="https://www.google.com/settings/ads" rel="nofollow noopener" target="_blank">Google 광고 설정</a>에서 맞춤 광고를 관리할 수 있고, Google의 광고 쿠키 설명은 <a href="https://policies.google.com/technologies/ads" rel="nofollow noopener" target="_blank">Google 광고 기술 정책</a>에서 확인할 수 있습니다.</p>
<h2>분석 도구</h2>
<p>사이트 개선을 위해 분석 도구를 사용하는 경우, 어떤 가이드가 도움이 되는지 파악하기 위한 집계 정보 중심으로 사용하며 불필요한 개인정보 수집을 피합니다.</p>
<h2>사용자의 선택</h2>
<p>브라우저에서 쿠키와 localStorage를 삭제할 수 있으며, 맞춤 광고 설정을 변경할 수 있습니다. 문의 내용 삭제나 정정을 요청하려면 아래 이메일로 연락해 주세요.</p>
<h2>문의</h2>
<p>개인정보 관련 문의는 <a href="mailto:${escAttr(email)}">${esc(email)}</a>로 보내주세요.</p>
<p class="muted">최종 수정일: ${esc(date)}</p>`,
    terms: `
<p>${esc(site)}을 이용하면 본 약관에 동의하는 것으로 간주됩니다. 본 약관은 사이트 이용 기준을 설명하기 위한 것이며 법률 자문이 아닙니다.</p>
<h2>콘텐츠 이용</h2>
<p>사이트의 글, 이미지, 자체 제작 SVG, 데이터 정리는 일반 정보 제공을 목적으로 합니다. 링크 공유는 가능하지만, 글 전체를 무단 복제하거나 재게시할 수 없습니다.</p>
<h2>정확성</h2>
<p>패들 가격, 승인 장비 여부, 선수 스폰서, 랭킹, DUPR, 대회 일정은 변동될 수 있습니다. ${esc(site)}은 가능한 한 공식 출처를 연결하지만, 사용자는 구매·대회 신청·규칙 확인 전 원 출처를 다시 확인해야 합니다.</p>
<h2>외부 링크</h2>
<p>공식 제품 페이지, 선수 프로필, 협회 페이지 등 외부 사이트로 연결될 수 있습니다. 외부 사이트의 콘텐츠, 정책, 가격, 재고에 대해서는 ${esc(site)}이 책임지지 않습니다.</p>
<h2>서비스 변경</h2>
<p>사이트 구조, 메뉴, 콘텐츠, 기능은 개선을 위해 변경될 수 있습니다. 공개 업로드, 커뮤니티, 광고 기능은 관련 법령과 플랫폼 정책에 맞추어 운영됩니다.</p>
<h2>문의</h2>
<p>약관 관련 문의는 <a href="mailto:${escAttr(email)}">${esc(email)}</a>로 보내주세요.</p>
<p class="muted">최종 수정일: ${esc(date)}</p>`,
    disclaimer: `
<p>${esc(site)}의 모든 콘텐츠는 피클볼 이해와 장비 선택, 스킬 학습을 돕기 위한 일반 정보입니다. 개인에게 맞는 전문 코칭, 의료, 법률, 재정 조언이 아닙니다.</p>
<h2>훈련과 부상</h2>
<p>운동 중 통증이나 부상이 있다면 새로운 훈련을 시작하기 전에 전문가와 상담하세요. 사이트의 드릴과 팁은 일반적인 학습 자료이며 개인의 몸 상태를 대신 판단하지 않습니다.</p>
<h2>장비와 리뷰</h2>
<p>패들 정보는 공개 스펙, 공식 제품 페이지, 시장에서 알려진 특성을 바탕으로 정리합니다. 직접 테스트한 내용과 공개 정보 기반 비교는 구분해 표시하려고 노력합니다. 실제 타구감은 개인마다 다르므로 가능하면 직접 시타하세요.</p>
<h2>제휴 링크</h2>
<p>일부 외부 링크는 향후 제휴 링크가 될 수 있습니다. 이 경우 구매자는 추가 비용을 부담하지 않으며, 사이트는 소정의 수수료를 받을 수 있습니다. 제휴 여부는 추천 기준을 바꾸지 않으며, 표시가 필요한 위치에 고지합니다.</p>
<h2>최신성</h2>
<p>랭킹, DUPR, 대회 결과, 가격, 승인 장비 목록은 수시로 바뀝니다. 중요한 결정 전에는 연결된 공식 출처를 확인하세요.</p>
<p class="muted">최종 수정일: ${esc(date)}</p>`,
    editorial: `
<p>${esc(site)}은 피클볼 플레이어에게 실제로 도움이 되는 정보만 게시하는 것을 목표로 합니다. 검색 유입을 위한 얕은 글보다, 독자가 레벨·스킬·패들·선수 정보를 더 잘 이해하도록 돕는 글을 우선합니다.</p>
<h2>작성 원칙</h2>
<ul class="principles">${editorialPrinciplesFor(loc).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<h2>출처 기준</h2>
<p>공식 규칙, 승인 장비, 선수 프로필, 대회 결과, DUPR, 가격처럼 시간이 지나며 바뀌는 내용은 가능한 한 공식 출처 또는 제조사·투어·협회 페이지를 연결합니다. 비공식 리뷰는 참고 자료로만 사용하며 사실처럼 단정하지 않습니다.</p>
<h2>이미지 기준</h2>
<p>선수 실사 사진과 브랜드 제품 사진은 저작권과 초상권 문제가 있을 수 있어, 허가 없는 이미지는 포함하지 않습니다. 현재 사이트의 선수·패들 이미지는 자체 제작 일러스트 카드이며, 공식 사진은 연결된 공식 프로필에서 확인하도록 안내합니다.</p>
<h2>업데이트</h2>
<p>각 글에는 게시일과 수정일을 표시합니다. 오류가 확인되면 정정 정책에 따라 수정합니다.</p>`,
    corrections: `
<p>${esc(site)}은 오류 제보를 환영합니다. 피클볼 장비, 선수, 랭킹, 가격 정보는 변동이 잦기 때문에 독자 제보가 사이트 품질 개선에 도움이 됩니다.</p>
<h2>제보 방법</h2>
<p><a href="mailto:${escAttr(email)}">${esc(email)}</a>로 오류가 있는 페이지 주소, 문제가 되는 문장, 확인 가능한 공식 출처를 보내주세요. 제품 가격이나 선수 기록의 경우 날짜가 중요하므로 확인한 날짜도 함께 알려주시면 좋습니다.</p>
<h2>검토 방식</h2>
<p>제보 내용은 공식 출처, 제조사 페이지, 투어·협회 페이지, 원문 발표 자료를 우선해 확인합니다. 단순 의견 차이와 사실 오류를 구분해 처리합니다.</p>
<h2>수정 표시</h2>
<p>중요한 사실 오류를 수정한 경우 글의 수정일을 업데이트합니다. 문장 다듬기, 오탈자, 디자인 수정처럼 의미가 바뀌지 않는 변경은 별도 고지하지 않을 수 있습니다.</p>`,
    cookies: `
<p>${esc(site)}은 기능 제공과 향후 광고 게재를 위해 쿠키 또는 브라우저 저장소를 사용할 수 있습니다.</p>
<h2>필수·기능 저장소</h2>
<p>언어 선택과 로컬 기능은 브라우저 localStorage를 사용할 수 있습니다. 이는 사용자의 기기 안에 저장되며, 브라우저 설정에서 삭제할 수 있습니다.</p>
<h2>지역 기반 언어 안내</h2>
<p>접속 국가에 따른 언어 안내 기능은 국가 코드만 사용해 /ko/, /es/, /en/ 중 하나로 이동하도록 설계되어 있습니다. 실제 위치 판단은 완벽하지 않을 수 있으며, 사용자는 언제든 상단 언어 선택 메뉴로 변경할 수 있습니다.</p>
<h2>광고 쿠키</h2>
<p>Google AdSense가 활성화되면 Google과 파트너가 광고 쿠키를 사용할 수 있습니다. 지역에 따라 필요한 경우 동의 관리 도구를 적용해야 합니다. 맞춤 광고 관리는 <a href="https://www.google.com/settings/ads" rel="nofollow noopener" target="_blank">Google 광고 설정</a>에서 할 수 있습니다.</p>
<h2>관리 방법</h2>
<p>사용자는 브라우저 설정에서 쿠키 차단, 삭제, 사이트별 저장소 삭제를 선택할 수 있습니다. 단, 일부 기능은 저장소를 삭제하면 다시 설정해야 할 수 있습니다.</p>`,
    advertising: `
<p>${esc(site)}은 Google AdSense 승인 후 광고를 게재할 수 있으며, 향후 일부 장비 링크는 제휴 링크가 될 수 있습니다.</p>
<h2>광고 배치 원칙</h2>
<p>광고는 콘텐츠와 구분되도록 배치하며, 사용자의 실수 클릭을 유도하지 않습니다. 광고 클릭을 요청하거나 보상을 제공하거나 이미지·버튼으로 광고를 강조하지 않습니다.</p>
<h2>제휴 링크</h2>
<p>제휴 링크가 사용되는 경우 독자에게 추가 비용이 발생하지 않을 수 있으며, 사이트는 수수료를 받을 수 있습니다. 제휴 여부는 리뷰 결론이나 추천 순서를 조작하는 이유가 되지 않습니다.</p>
<h2>편집 독립성</h2>
<p>패들 비교와 선수 정보는 독자에게 도움이 되는지, 공개 스펙과 공식 출처로 확인 가능한지, 레벨별 사용성이 어떤지를 기준으로 작성합니다.</p>`,
    community: `
<p>하이라이트와 피드백 기능은 피클볼 실력 향상을 위한 건설적인 참여를 목표로 합니다. 영상 공유 전에는 저작권, 초상권, 개인정보 보호를 먼저 확인해야 합니다.</p>
<h2>허용되는 참여</h2>
<ul><li>본인이 촬영했거나 공유 권한이 있는 피클볼 클립</li><li>상대방을 존중하는 기술 피드백</li><li>레벨, 스킬 태그, 상황 설명을 포함한 학습 목적의 게시물</li></ul>
<h2>허용되지 않는 참여</h2>
<ul><li>타인의 영상을 허락 없이 올리는 행위</li><li>욕설, 비방, 차별, 개인정보 노출</li><li>추천수 조작, 자동화 도구, 스팸성 홍보</li></ul>
<h2>신고</h2>
<p>문제가 있는 콘텐츠나 댓글은 <a href="mailto:${escAttr(email)}">${esc(email)}</a>로 신고할 수 있습니다. 공개 커뮤니티 운영 시에는 신고 접수, 임시 숨김, 검토, 반복 위반 제한 절차를 적용해야 합니다.</p>`
  };
  if (loc === 'es') return {
    privacy: `
<p>Esta Política de privacidad explica cómo ${esc(site)} puede tratar información cuando visitas el sitio. La regla general es recopilar lo mínimo necesario para que el sitio funcione.</p>
<h2>Información que tratamos</h2>
<p>${esc(site)} es principalmente un sitio estático de información. No necesitas crear una cuenta para leer las guías. Si nos escribes por correo, recibimos los datos que decidas incluir en ese mensaje.</p>
<h2>Almacenamiento local</h2>
<p>El sitio puede guardar tu idioma elegido y algunas preferencias locales en el navegador mediante localStorage. Estas preferencias no se usan para seguirte en otros sitios.</p>
<h2>Enrutamiento automático de idioma</h2>
<p>En la página raíz, ${esc(site)} puede usar un código de país aproximado para enviar visitantes de Corea a la versión coreana, visitantes de Latinoamérica a la versión en español y otros visitantes a la versión en inglés. En hosting estático, ese código puede venir de la capa de hosting del mismo dominio o de un endpoint público GeoIP JSON. Si eliges un idioma manualmente, esa preferencia se guarda en tu navegador y tiene prioridad.</p>
<h2>Publicidad y proveedores externos</h2>
<p>El sitio planea usar Google AdSense. Cuando la publicidad esté activa, Google y otros proveedores pueden usar cookies publicitarias. Puedes gestionar anuncios personalizados en <a href="https://www.google.com/settings/ads" rel="nofollow noopener" target="_blank">Google Ads Settings</a>.</p>
<h2>Contacto</h2>
<p>Las preguntas pueden enviarse a <a href="mailto:${escAttr(email)}">${esc(email)}</a>.</p>
<p class="muted">Última actualización: ${esc(date)}</p>`,
    terms: `
<p>Al usar ${esc(site)} aceptas estas condiciones. Están escritas en lenguaje sencillo y no sustituyen asesoría legal.</p>
<h2>Uso del contenido</h2><p>Las guías, comparaciones e ilustraciones originales no pueden republicarse completas sin permiso.</p>
<h2>Exactitud</h2><p>Los precios, rankings, reglas, listas de palas aprobadas y calendarios cambian. Verifica las fuentes oficiales antes de comprar, inscribirte o competir.</p>
<h2>Enlaces externos</h2><p>Enlazamos fuentes externas para referencia, pero no controlamos su contenido, precios, políticas o disponibilidad.</p>
<h2>Contacto</h2><p>Escríbenos a <a href="mailto:${escAttr(email)}">${esc(email)}</a>.</p>
<p class="muted">Última actualización: ${esc(date)}</p>`,
    disclaimer: `
<p>${esc(site)} publica información general sobre pickleball. No es asesoría profesional de entrenamiento, médica, legal ni financiera.</p>
<h2>Entrenamiento</h2><p>Si tienes dolor, lesión o una condición médica, consulta a un profesional antes de cambiar tu entrenamiento.</p>
<h2>Equipo</h2><p>Cuando comentamos equipo que no hemos probado directamente, lo indicamos y comparamos especificaciones publicadas. La sensación de una pala es personal, así que conviene probarla si es posible.</p>
<h2>Enlaces de afiliado</h2><p>Algunos enlaces podrían convertirse en enlaces de afiliado. Eso no cambia nuestros criterios editoriales.</p>
<p class="muted">Última actualización: ${esc(date)}</p>`,
    editorial: `
<p>${esc(site)} publica guías prácticas para jugadores y prioriza fuentes oficiales, comparaciones claras y actualizaciones cuando cambian reglas, precios o rankings.</p>
<ul class="principles">${editorialPrinciplesFor(loc).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
<h2>Imágenes</h2><p>No copiamos fotos de jugadores ni fotos de producto sin licencia. Usamos tarjetas ilustradas originales salvo que exista permiso para usar fotos oficiales.</p>`,
    corrections: `<p>Envía correcciones a <a href="mailto:${escAttr(email)}">${esc(email)}</a> con la URL, la frase que debe revisarse y una fuente confiable. Verificamos datos contra fuentes oficiales cuando es posible.</p>`,
    cookies: `<p>${esc(site)} puede usar cookies o almacenamiento del navegador para preferencias de idioma y, tras la aprobación, publicidad. La página raíz también puede usar un código de país aproximado para elegir el idioma inicial. Puedes borrar cookies y localStorage en el navegador y cambiar el idioma manualmente en cualquier momento.</p>`,
    advertising: `<p>${esc(site)} puede mostrar anuncios de Google AdSense tras la aprobación y puede usar enlaces de afiliado en contenido de equipo. Los anuncios se mantienen separados del contenido editorial y no pedimos a los usuarios que hagan clic en anuncios.</p>`,
    community: `<p>Las áreas de highlights, FAQ y Q&A son para aprendizaje constructivo. Comparte solo contenido propio o con permiso, evita datos personales y mantén el feedback respetuoso. El acoso, spam, desinformación, subidas no autorizadas y manipulación de votos no están permitidos.</p>`
  };

  return {
    privacy: `
<p>This Privacy Policy explains how ${esc(site)} handles information when you visit. We aim to collect as little as possible.</p>
<h2>Information we collect</h2>
<p>${esc(site)} is a static information site. We do not ask you to create an account. If you email us, we receive the information you choose to include in that email.</p>
<h2>Cookies and local storage</h2>
<p>The site may store your chosen language and local feature preferences in your browser. These preferences are not used to track you across other sites.</p>
<h2>Automatic language routing</h2>
<p>On the root page, ${esc(site)} may use an approximate country code to route visitors to Korean for Korea, Spanish for Latin America, and English for other regions. In static hosting, the country code may come from the same-domain hosting layer or from a public GeoIP JSON endpoint. If you manually choose a language, that preference is stored in browser localStorage and takes priority.</p>
<h2>Advertising and third-party vendors</h2>
<p>We intend to display ads through Google AdSense. Third-party vendors, including Google, may use cookies to serve ads based on prior visits. You can manage personalised advertising at <a href="https://www.google.com/settings/ads" rel="nofollow noopener" target="_blank">Google Ads Settings</a> and learn more at <a href="https://policies.google.com/technologies/ads" rel="nofollow noopener" target="_blank">Google's advertising technologies policy</a>.</p>
<h2>Contact</h2>
<p>Questions can be sent to <a href="mailto:${escAttr(email)}">${esc(email)}</a>.</p>
<p class="muted">Last updated: ${esc(date)}</p>`,
    terms: `
<p>By using ${esc(site)} you agree to these terms. They are written in plain language and are not legal advice.</p>
<h2>Use of content</h2><p>Guides and original illustrations may not be republished wholesale without permission.</p>
<h2>No warranty</h2><p>Gear, rules, rankings, prices, and the competitive scene change. Verify official sources before decisions that require current facts.</p>
<h2>External links</h2><p>We link to external sites for reference and are not responsible for their content or policies.</p>
<h2>Contact</h2><p>Questions can be sent to <a href="mailto:${escAttr(email)}">${esc(email)}</a>.</p>
<p class="muted">Last updated: ${esc(date)}</p>`,
    disclaimer: `
<p>${esc(site)} publishes general pickleball information. It is not professional coaching, medical, legal, or financial advice.</p>
<h2>Training</h2><p>Consult a qualified professional if you have injury or health concerns before changing your training.</p>
<h2>Gear</h2><p>When we discuss equipment not personally tested, we compare it by published specifications and say so. Feel is personal, so try gear when possible.</p>
<h2>Affiliate disclosure</h2><p>Some outbound links may become affiliate links. Such links do not change editorial recommendations.</p>
<p class="muted">Last updated: ${esc(date)}</p>`,
    editorial: `
<p>${esc(site)} publishes practical guides for players, with a preference for official sources and clearly labelled comparisons.</p><ul class="principles">${editorialPrinciplesFor(loc).map((x) => `<li>${esc(x)}</li>`).join('')}</ul><h2>Images</h2><p>Unlicensed player and product photos are not copied into the site. Original illustrative cards are used unless licensed photos are available.</p>`,
    corrections: `<p>Send corrections to <a href="mailto:${escAttr(email)}">${esc(email)}</a> with the page URL, the statement in question, and a reliable source. We verify factual claims against official sources where possible and update modified pages.</p>`,
    cookies: `<p>${esc(site)} may use cookies or browser storage for language preferences and, after approval, advertising. The root page may also use an approximate country code to choose the initial language version. You can clear cookies and local storage in your browser settings, and you can change the language manually at any time. Personalised ads can be managed in Google Ads Settings.</p>`,
    advertising: `<p>${esc(site)} may display Google AdSense ads after approval and may use affiliate links in gear content. Ads are kept visually separate from editorial content and we do not ask users to click ads.</p>`,
    community: `<p>The highlight, FAQ, and Q&A areas are for constructive pickleball learning. Share only content you own or have permission to use, avoid personal data, and keep feedback respectful. Harassment, hate, unauthorized uploads, spam, misinformation, and vote manipulation are not allowed. Public user posts should be reviewed before they are published or monetized.</p>`
  };
}

function renderTrustPage(loc, key, rel) {
  const bodies = legalBodies(loc);
  const titles = {
    privacy: tt(loc, 'footer.privacy'), terms: tt(loc, 'footer.terms'), disclaimer: tt(loc, 'footer.disclaimer'),
    editorial: trustLabel(loc, 'editorial'), corrections: trustLabel(loc, 'corrections'), cookies: trustLabel(loc, 'cookies'), advertising: trustLabel(loc, 'advertising'), community: trustLabel(loc, 'community')
  };
  const intros = {
    privacy: loc === 'ko' ? '개인정보, 광고 쿠키, 브라우저 저장소 사용 방식을 설명합니다.' : 'How privacy, advertising cookies, and browser storage are handled.',
    terms: loc === 'ko' ? '사이트 이용 기준과 콘텐츠 사용 조건입니다.' : 'Terms for using the site and its content.',
    disclaimer: loc === 'ko' ? '장비, 훈련, 제휴 링크에 대한 책임 범위 고지입니다.' : 'Important notes about gear, training, and affiliate links.',
    editorial: loc === 'ko' ? 'Picklary의 작성 기준, 출처 기준, 이미지 사용 원칙입니다.' : 'How Picklary writes, sources, and updates content.',
    corrections: loc === 'ko' ? '오류 제보와 수정 반영 절차입니다.' : 'How to report and correct factual errors.',
    cookies: loc === 'ko' ? '쿠키와 브라우저 저장소 사용 안내입니다.' : 'Cookie and browser storage information.',
    advertising: loc === 'ko' ? '광고와 제휴 링크 운영 기준입니다.' : 'Advertising and affiliate disclosure.',
    community: loc === 'ko' ? '하이라이트와 피드백 참여를 위한 커뮤니티 기준입니다.' : 'Community standards for highlights and feedback.'
  };
  return simplePage(loc, rel, titles[key], intros[key], bodies[key], { translated: loc === 'ko' || loc === SOURCE, noindex: false, showFallback: false });
}


function render404() {
  const loc = DEFAULT;
  const body = `<section class="page-head"><div class="wrap">
  <h1>${esc(tt(loc, 'notFound.title'))}</h1>
  <p class="page-head__intro">${esc(tt(loc, 'notFound.body'))}</p>
  <p><a class="btn btn--primary" href="${link(loc, '')}">${esc(tt(loc, 'notFound.cta'))}</a></p>
</div></section>`;
  return layout({ loc, rel: '', title: tt(loc, 'notFound.title'), description: tt(loc, 'notFound.body'), noindex: true, bodyHtml: body });
}


function renderRootRedirectIndex() {
  const det = config.languageDetection || {};
  const fallback = (det.fallbackLocale && locales.includes(det.fallbackLocale)) ? det.fallbackLocale : DEFAULT;
  const countryLocaleMap = det.countryLocaleMap || { ko: ['KR'], es: [] };
  const geoEndpoints = det.geoEndpoints || [];
  const timeoutMs = Number(det.timeoutMs || 1600);
  const script = `(function(){
  "use strict";
  var SUPPORTED=${JSON.stringify(locales)};
  var FALLBACK=${JSON.stringify(fallback)};
  var MANUAL_KEY="picklelevel.lang";
  var DETECTED_KEY="picklelevel.lang.detected";
  var COUNTRY_LOCALE_MAP=${JSON.stringify(countryLocaleMap)};
  var GEO_ENDPOINTS=${JSON.stringify(geoEndpoints)};
  var TIMEOUT_MS=${JSON.stringify(timeoutMs)};
  var redirected=false;
  function supported(locale){return SUPPORTED.indexOf(locale)>=0;}
  function normalLocale(locale){locale=String(locale||"").toLowerCase();return supported(locale)?locale:FALLBACK;}
  function readStorage(key){try{return localStorage.getItem(key);}catch(e){return null;}}
  function writeDetected(data){try{localStorage.setItem(DETECTED_KEY,JSON.stringify(data));}catch(e){}}
  function redirect(locale, source, country){
    if(redirected) return;
    locale=normalLocale(locale);
    redirected=true;
    writeDetected({locale:locale,source:source||"unknown",country:country||"",at:new Date().toISOString()});
    window.location.replace("/"+locale+"/");
  }
  function localeFromCountry(country){
    country=String(country||"").toUpperCase();
    if(!country) return "";
    for(var locale in COUNTRY_LOCALE_MAP){
      if(Object.prototype.hasOwnProperty.call(COUNTRY_LOCALE_MAP, locale)){
        var list=COUNTRY_LOCALE_MAP[locale]||[];
        if(list.indexOf(country)>=0 && supported(locale)) return locale;
      }
    }
    return FALLBACK;
  }
  function localeFromBrowser(){
    var langs=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||navigator.userLanguage||""];
    for(var i=0;i<langs.length;i++){
      var primary=String(langs[i]||"").split("-")[0].toLowerCase();
      if(supported(primary)) return primary;
    }
    return FALLBACK;
  }
  function fetchWithTimeout(url, options, ms){
    options=options||{};
    if(typeof AbortController==="undefined") return fetch(url, options);
    var controller=new AbortController();
    var id=setTimeout(function(){try{controller.abort();}catch(e){}}, ms||TIMEOUT_MS);
    options.signal=controller.signal;
    return fetch(url, options).finally(function(){clearTimeout(id);});
  }
  function parseTrace(text){
    var m=String(text||"").match(/(?:^|\\n)loc=([A-Za-z]{2})/);
    return m?m[1].toUpperCase():"";
  }
  function pickCountryFromJson(json, fields){
    fields=fields&&fields.length?fields:["country_code","country","countryCode"];
    for(var i=0;i<fields.length;i++){
      var v=json&&json[fields[i]];
      if(v) return String(v).toUpperCase();
    }
    return "";
  }
  async function countryFromEndpoint(ep){
    if(!ep||!ep.url) return "";
    var res=await fetchWithTimeout(ep.url,{cache:"no-store",credentials:"omit"},TIMEOUT_MS);
    if(!res||!res.ok) return "";
    if(ep.type==="cloudflareTrace") return parseTrace(await res.text());
    if(ep.type==="json") return pickCountryFromJson(await res.json(),ep.countryFields);
    return "";
  }
  async function detectCountry(){
    for(var i=0;i<GEO_ENDPOINTS.length;i++){
      try{
        var cc=await countryFromEndpoint(GEO_ENDPOINTS[i]);
        if(cc) return cc;
      }catch(e){}
    }
    return "";
  }
  var manual=readStorage(MANUAL_KEY);
  if(supported(manual)) return redirect(manual,"manual","");
  setTimeout(function(){redirect(FALLBACK,"timeout","");}, Math.max(2500, TIMEOUT_MS*2+400));
  detectCountry().then(function(country){
    if(country) redirect(localeFromCountry(country),"ip",country);
    else redirect(localeFromBrowser(),"browser","");
  }).catch(function(){redirect(localeFromBrowser(),"fallback","");});
})();`;
  const labels = {
    ko: '한국어', en: 'English', es: 'Español'
  };
  const links = locales.map((l) => `<a href="/${l}/">${esc(labels[l] || config.languageNames[l] || l)}</a>`).join(' · ');
  return `<!doctype html>
<html lang="${fallback}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(config.siteName)} language redirect</title>
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${config.url}/${fallback}/">
  <noscript><meta http-equiv="refresh" content="0; url=/${fallback}/"></noscript>
  <script>${script.replace(/<\/script/gi, '<\\/script')}</script>
  <style>body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;margin:0;background:#f7faf8;color:#16332b}.box{max-width:720px;margin:12vh auto;padding:32px;border-radius:24px;background:white;box-shadow:0 14px 40px rgba(0,0,0,.08)}a{color:#1E6F5C;font-weight:700}</style>
</head>
<body>
  <main class="box">
    <h1>${esc(config.siteName)}</h1>
    <p>We are choosing the best language version for you. 사용자의 지역에 맞는 언어 페이지로 이동합니다.</p>
    <p>${links}</p>
  </main>
</body>
</html>`;
}

// ===========================================================================
//  WRITE
// ===========================================================================
function writeFile(rel, content) {
  const full = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}
function writePage(loc, rel, html) { writeFile(path.join(loc, rel, 'index.html'), html); }

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name), d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function buildSitemapXml() {
  const urls = [];
  const add = (rel, changefreq, priority) => {
    const alts = locales.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${config.url}${link(l, rel)}"/>`).join('\n');
    for (const loc of locales) {
      urls.push(`  <url>\n    <loc>${config.url}${link(loc, rel)}</loc>\n${alts}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${config.url}${link(DEFAULT, rel)}"/>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`);
    }
  };
  add('', 'weekly', '1.0');
  add('level/', 'weekly', '0.9');
  add('dupr-self-check/', 'weekly', '0.8');
  add('paddles/', 'weekly', '0.9');
  add('players/', 'weekly', '0.8');
  add('tournaments/', 'daily', '0.84');
  ['us','international','results'].forEach((type) => add('tournaments/' + type + '/', 'daily', '0.72'));
  add('boards/', 'weekly', '0.8');
  add('boards/dupr-faq/', 'weekly', '0.8');
  add('boards/qna/', 'weekly', '0.7');
  add('highlights/', 'weekly', '0.8');
  add('categories/', 'weekly', '0.7');
  add('columns/', 'weekly', '0.6');
  add('the-brief/', 'weekly', '0.6');
  add('about/', 'monthly', '0.5');
  add('author/', 'monthly', '0.5');
  add('contact/', 'monthly', '0.4');
  add('privacy/', 'yearly', '0.35');
  add('cookie-policy/', 'yearly', '0.35');
  add('terms/', 'yearly', '0.35');
  add('disclaimer/', 'yearly', '0.35');
  add('editorial-policy/', 'yearly', '0.35');
  add('corrections-policy/', 'yearly', '0.35');
  add('advertising-disclosure/', 'yearly', '0.35');
  add('community-guidelines/', 'yearly', '0.35');
  add('sitemap/', 'monthly', '0.3');
  categories.forEach((c) => add('category/' + c.slug + '/', 'weekly', '0.7'));
  publishedPosts.forEach((p) => add(p.slug + '/', 'monthly', '0.8'));
  publishedColumns.forEach((c) => add('columns/' + c.slug + '/', 'monthly', '0.6'));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
}

function build() {
  // clean
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  for (const loc of locales) {
    writePage(loc, '', renderHome(loc));
    writePage(loc, 'level', renderLevelsIndex(loc));
    levels.forEach((l) => writePage(loc, 'level/' + l.slug, renderLevelPage(l, loc)));
    writePage(loc, 'dupr-self-check', renderDuprCheck(loc));
    writePage(loc, 'paddles', renderPaddlesIndex(loc));
    writePage(loc, 'paddles/updates', renderPaddleUpdatesPage(loc));
    paddles.forEach((p) => writePage(loc, 'paddles/' + p.slug, renderPaddlePage(p, loc)));
    writePage(loc, 'players', renderPlayersIndex(loc));
    players.forEach((p) => writePage(loc, 'players/' + p.slug, renderPlayerPage(p, loc)));
    writePage(loc, 'tournaments', renderTournamentsIndex(loc));
    writePage(loc, 'tournaments/us', renderTournamentsCategory(loc, 'tournaments'));
    writePage(loc, 'tournaments/international', renderTournamentsCategory(loc, 'international'));
    writePage(loc, 'tournaments/results', renderTournamentsCategory(loc, 'results'));
    writePage(loc, 'updates', renderUpdatesIndex(loc));
    ['news','rules','players'].forEach((type) => writePage(loc, 'updates/' + type, renderUpdatesCategory(loc, type)));
    writePage(loc, 'boards', renderBoardsIndex(loc));
    writePage(loc, 'boards/dupr-faq', renderDuprFaqBoard(loc));
    writePage(loc, 'boards/qna', renderQnaBoard(loc));
    writePage(loc, 'highlights', renderHighlights(loc));
    writePage(loc, 'categories', renderCategoriesIndex(loc));
    categories.forEach((c) => writePage(loc, 'category/' + c.slug, renderCategory(c, loc)));
    publishedPosts.forEach((p) => writePage(loc, p.slug, renderPost(p, loc)));
    writePage(loc, 'columns', renderColumnsIndex(loc));
    publishedColumns.forEach((c) => writePage(loc, 'columns/' + c.slug, renderColumn(c, loc)));
    writePage(loc, 'the-brief', renderBrief(loc));
    writePage(loc, 'about', renderAbout(loc));
    writePage(loc, 'author', renderAuthor(loc));
    writePage(loc, 'contact', renderContact(loc));
    writePage(loc, 'tools/paddle-finder', renderTool(loc));
    writePage(loc, 'sitemap', renderSitemapPage(loc));
    writePage(loc, 'privacy', renderTrustPage(loc, 'privacy', 'privacy/'));
    writePage(loc, 'cookie-policy', renderTrustPage(loc, 'cookies', 'cookie-policy/'));
    writePage(loc, 'terms', renderTrustPage(loc, 'terms', 'terms/'));
    writePage(loc, 'disclaimer', renderTrustPage(loc, 'disclaimer', 'disclaimer/'));
    writePage(loc, 'editorial-policy', renderTrustPage(loc, 'editorial', 'editorial-policy/'));
    writePage(loc, 'corrections-policy', renderTrustPage(loc, 'corrections', 'corrections-policy/'));
    writePage(loc, 'advertising-disclosure', renderTrustPage(loc, 'advertising', 'advertising-disclosure/'));
    writePage(loc, 'community-guidelines', renderTrustPage(loc, 'community', 'community-guidelines/')); 
  }

  // Public assets only. The source package still contains /admin and /data for editing,
  // but the AdSense-ready public build does not expose demo/admin JSON endpoints.
  copyDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));

  // root files
  writeFile('404.html', render404());
  writeFile('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /data/\nDisallow: /i18n/\n\nSitemap: ${config.url}/sitemap.xml\n`);
  const adsensePubId = (((config.adsense && config.adsense.clientId) || '').trim()).replace(/^ca-/, '');
  writeFile('ads.txt', adsensePubId
    ? `google.com, ${adsensePubId}, DIRECT, f08c47fec0942fa0\n`
    : `# Set adsense.clientId in data/site.config.js to auto-generate this line, e.g.:\n# google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0\n`);
  writeFile('sitemap.xml', buildSitemapXml());
  // root index -> IP/country-aware language redirect
  writeFile('index.html', renderRootRedirectIndex());

  // counts
  const pages = locales.length * (11 + categories.length + publishedPosts.length + publishedColumns.length + 3);
  console.log(`✓ Built ${config.siteName}`);
  console.log(`  locales: ${locales.join(', ')}`);
  console.log(`  ~${pages} localized pages, ${publishedPosts.length} posts, ${publishedColumns.length} columns, ${categories.length} categories`);
  console.log(`  output: ${DIST}`);
}

build();
