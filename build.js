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
let rulesLegality; try { rulesLegality = require('./data/rules-legality.js'); } catch (e) { rulesLegality = { paddleStatus: [], ruleChanges: [] }; }
let levelShotsData; try { levelShotsData = require('./data/level-shots.js'); } catch (e) { levelShotsData = {}; }
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

function brandMark(stem, hole) {
  hole = hole || '#155446';
  const rr = 8, hr = 2.16; // ball r=16 -> hole ring r=8, hole r≈2.16
  let dots = `<circle cx="37.5" cy="25.5" r="${hr}" fill="${hole}"/>`;
  for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (i * 60); dots += `<circle cx="${(37.5 + Math.cos(a) * rr).toFixed(2)}" cy="${(25.5 + Math.sin(a) * rr).toFixed(2)}" r="${hr}" fill="${hole}"/>`; }
  return `<svg class="brand__logo" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="15" y="11" width="11" height="42" rx="5.5" fill="${stem}"/><circle cx="37.5" cy="25.5" r="16" fill="#F4B400"/>${dots}</svg>`;
}

function header(loc, rel) {
  const cur = rel || '';
  const groupedNav = [
    { href: '', label: tt(loc, 'nav.home'), home: true },
    { href: 'level/', label: tt(loc, 'nav.levelUp'), match: ['level/', 'dupr-self-check/', 'what-is-dupr/', 'category/rules-and-getting-started/', 'category/skills-and-drills/'] },
    { href: 'gear/', label: tt(loc, 'nav.gearLab'), match: ['gear/', 'paddles/', 'tools/paddle-finder/', 'category/paddles-and-gear/'] },
    { href: 'pro-scene/', label: tt(loc, 'nav.proScene'), match: ['pro-scene/', 'players/', 'tournaments/', 'updates/players/', 'updates/rules/', 'highlights/', 'category/players-and-global-scene/', 'category/tournaments-and-leagues/'] },
    { href: 'boards/', label: tt(loc, 'nav.playHub'), match: ['boards/'] },
    { href: 'categories/', label: tt(loc, 'nav.insights'), match: ['categories/', 'columns/', 'the-brief/', 'blogs/'] },
  ];
  const navItems = groupedNav.map((item) => {
    let active = item.home ? cur === '' : item.match.some((m) => cur === m || cur.indexOf(m) === 0);
    if (cur === 'pro-scene/rules/' && item.href === 'pro-scene/') active = false;
    if (cur === 'pro-scene/rules/' && item.href === 'categories/') active = true;
    return `<a href="${link(loc, item.href)}"${active ? ' class="is-active" aria-current="page"' : ''}>${esc(item.label)}</a>`;
  }).join('');
  return `<a class="skip-link" href="#main">${esc(tt(loc, 'site.skip'))}</a>
<header class="masthead">
  <div class="wrap masthead__inner">
    <a class="brand" href="${link(loc, '')}" aria-label="${escAttr(config.siteName)} — home">
      <span class="brand__mark" aria-hidden="true">${brandMark('#1E6F5C')}</span>
      <span class="brand__name">${esc(config.siteName)}</span>
    </a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="primary-nav">${esc(tt(loc, 'nav.menu'))}</button>
    <nav id="primary-nav" class="nav" aria-label="Primary">${navItems}</nav>
    ${languageSelector(loc, rel)}
  </div>
</header>`;
}

function sideRail(loc, rel) {
  const group = (title, items) => items.length ? `<div class="side-rail__group"><span class="side-rail__group-title">${esc(title)}</span>${items.map(([r, label]) => `<a href="${link(loc, r)}">${esc(label)}</a>`).join('')}</div>` : '';
  const lvlLinks = levels.map((l) => `<a href="${link(loc, 'level/' + l.slug + '/')}">${esc(l.id)}</a>`).join('');
  const activeTheme = themeForRel(rel);
  const start = [
    ['dupr-self-check/', tt(loc, 'side.selfCheck')],
    ['what-is-dupr/', tt(loc, 'side.dupr')],
  ];
  const play = [
    ['boards/friends/', communityLabel(loc, 'friendsShort')],
    ['boards/partners/', communityLabel(loc, 'partnersShort')],
    ['boards/tournaments/', communityLabel(loc, 'tournamentsShort')],
    ['boards/coaches/', communityLabel(loc, 'coachesShort')],
  ];
  const explore = [
    ['gear/', tt(loc, 'side.gearLab'), 'gear'],
    ['pro-scene/', tt(loc, 'side.proScene'), 'players'],
    ['categories/', tt(loc, 'side.insights'), 'guides'],
  ].filter(([, , theme]) => theme !== activeTheme).map(([r, label]) => [r, label]);
  return `<nav class="side-rail" aria-label="${escAttr(tt(loc, 'side.label'))}">
    <span class="side-rail__title">${esc(tt(loc, 'side.title'))}</span>
    <div class="side-rail__group side-rail__group--levels"><span class="side-rail__group-title">${esc(tt(loc, 'side.levels'))}</span><div class="side-rail__levels">${lvlLinks}</div></div>
    ${group(tt(loc, 'side.start'), start)}
    ${group(tt(loc, 'side.play'), play)}
    ${group(tt(loc, 'side.explore'), explore)}
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
      <span class="site-foot__lockup"><span class="brand__mark" aria-hidden="true">${brandMark('#f4f7f6')}</span><span class="brand__name">${esc(config.siteName)}</span></span>
      <p>${esc(tt(loc, 'footer.built'))}</p>
      <p class="site-foot__editor">${esc(tt(loc, 'label.by'))}
        <a href="${link(loc, 'author/')}">${esc(ownerName(loc))}</a> ·
        <a href="mailto:${escAttr(config.email)}">${esc(config.email)}</a></p>
      <p class="site-foot__blogs">${esc(loc === 'ko' ? '다른 블로그' : 'More blogs')}:
        <a href="https://picklary.blogspot.com" rel="me noopener" target="_blank">Blogspot</a> ·
        <a href="https://blog.naver.com/arctic" rel="me noopener" target="_blank">Naver</a></p>
    </div>
    <nav class="site-foot__links" aria-label="Footer">${links}</nav>
  </div>
  <div class="wrap site-foot__legal">© ${year} ${esc(config.siteName)}. ${esc(tt(loc, 'footer.rights'))} <span class="site-foot__build" title="site build time">build ${esc(BUILD_STAMP)}</span></div>
</footer>`;
}

function breadcrumbs(loc, trail) {
  // Breadcrumb data is kept for search engines, but the visible current-location bar is not rendered.
  const ld = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, name: t.name,
      item: t.rel != null ? `${config.url}${link(loc, t.rel)}` : undefined,
    })),
  };
  return `<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
}

function themeForRel(rel) {
  rel = rel || '';
  if (rel === '') return 'home';
  const seg = rel.split('/')[0];
  if (seg === 'level' || rel.indexOf('what-is-dupr') === 0 || rel.indexOf('dupr-self-check') === 0) return 'levels';
  if (seg === 'gear' || seg === 'paddles' || rel.indexOf('tools/paddle-finder') === 0) return 'gear';
  if (seg === 'players' || seg === 'pro-scene') return 'players';
  if (seg === 'tournaments') return 'compete';
  if (seg === 'highlights') return 'highlights';
  if (seg === 'categories' || seg === 'columns' || rel.indexOf('the-brief') === 0 || seg === 'updates' || seg === 'boards' || seg === 'sitemap') return 'guides';
  return 'home';
}
function themeForCategory(cat) {
  return ({ rules: 'rules', skills: 'skills', gear: 'gear', compete: 'compete', scene: 'scene' })[cat] || 'home';
}

function layout(opts) {
  // opts: {loc, rel, title, description, bodyHtml, ogType, noindex, jsonld, bodyClass}
  const { loc, rel } = opts;
  const theme = opts.theme || themeForRel(rel);
  const dir = isRTL(loc) ? 'rtl' : 'ltr';
  const canonical = `${config.url}${link(loc, rel)}`;
  const alternates = locales.map((l) =>
    `<link rel="alternate" hreflang="${l}" href="${config.url}${link(l, rel)}">`).join('\n  ');
  const xdefault = `<link rel="alternate" hreflang="x-default" href="${config.url}${link(DEFAULT, rel)}">`;
  const titleFull = opts.title ? `${opts.title} · ${config.siteName}` : config.siteName;
  const desc = clampDesc(opts.description || config.description, 160);
  const jsonldTags = (opts.jsonld || []).map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n  ');
  const adsenseId = ((config.adsense && config.adsense.clientId) || '').trim();
  const adsenseTags = (adsenseId && !opts.noAds)
    ? `<meta name="google-adsense-account" content="${escAttr(adsenseId)}">\n  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseId)}" crossorigin="anonymous"></script>`
    : '';
  return `<!doctype html>
<!-- ${config.siteName} build: ${BUILD_STAMP} (brand=${config.siteName}) -->
<html lang="${loc}" dir="${dir}" data-theme="${theme}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(titleFull)}</title>
  <meta name="description" content="${escAttr(desc)}">
  ${opts.noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow">'}
  <link rel="canonical" href="${canonical}">
  ${alternates}
  ${xdefault}
  <link rel="alternate" type="application/rss+xml" title="${escAttr(config.siteName)}" href="${config.url}/${loc}/feed.xml">
  <meta property="og:site_name" content="${escAttr(config.siteName)}">
  <meta property="og:type" content="${opts.ogType || 'website'}">
  <meta property="og:title" content="${escAttr(opts.title || config.siteName)}">
  <meta property="og:description" content="${escAttr(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="${loc}">
  <meta property="og:image" content="${config.url}${opts.ogImage || '/assets/icons/og-default.png'}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escAttr(opts.title || config.siteName)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escAttr(opts.title || config.siteName)}">
  <meta name="twitter:description" content="${escAttr(desc)}">
  <meta name="twitter:image" content="${config.url}${opts.ogImage || '/assets/icons/og-default.png'}">
  <meta name="theme-color" content="${config.colors.main}">
  ${config.googleSiteVerification ? `<meta name="google-site-verification" content="${escAttr(config.googleSiteVerification)}">` : ''}
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="mask-icon" href="/assets/icons/favicon.svg" color="${config.colors.main}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/style.css?v=skill-review-board-mvp-20260703">
  ${jsonldTags}
  ${adsenseTags}
</head>
<body class="${opts.bodyClass || ''}">
  ${header(loc, rel)}
  ${sideRail(loc, rel)}
  <main id="main">
${opts.bodyHtml}
  </main>
  ${footer(loc)}
  <script src="/assets/js/site.js?v=skill-review-board-mvp-20260703" defer></script>
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
  return `<article class="card card--${escAttr(p.category)}">
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
  const anchors = ['2.0', '3.0', '4.0', '4.5', '5.0'];
  const ticks = config.duprPathway.map((lbl) => {
    const pct = levelToPct(lbl);
    // in milestone mode the 4 anchor levels are drawn as interactive markers instead
    if (opts.milestones && anchors.indexOf(lbl) >= 0) return '';
    const linkedLevel = levels.find((l) => l.id === lbl);
    const labelInner = `<span class="rail__tick-icon" aria-hidden="true"></span><span class="rail__tick-text">${esc(lbl)}</span>`;
    const labelHtml = linkedLevel
      ? `<a class="rail__tick-label rail__tick-link" href="${levelUrl(loc, linkedLevel)}" aria-label="${escAttr(tt(loc, 'label.level'))} ${escAttr(lbl)}">${labelInner}</a>`
      : `<span class="rail__tick-label">${labelInner}</span>`;
    const lc = levelColors(lbl);
    return `<div class="rail__tick${opts.milestones ? ' rail__tick--minor' : ''} rail__tick--lv-${escAttr(lbl.replace('.', '-'))}" style="left:${pct}%;--lvl:${lc.c};--lvl-tint:${lc.t};">${labelHtml}</div>`;
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
      const lc = levelColors(id);
      return `<button type="button" class="rail__ms rail__ms--m${i}" style="left:${pct}%;--lvl:${lc.c};--lvl-on:${lc.on};--lvl-tint:${lc.t};" data-ms data-ms-id="${escAttr(id)}" data-ms-title="${escAttr(title)}" data-ms-summary="${escAttr(summary)}" data-ms-focus="${escAttr(focus)}" data-ms-href="${escAttr(href)}" data-ms-cta="${escAttr(cta)}" aria-haspopup="dialog" aria-label="${escAttr(title)}"><span class="rail__ms-badge">${esc(id)}</span></button>`;
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


function duprTeaser(loc) {
  const copy = loc === 'ko'
    ? {
        eyebrow: '왜 해볼 만할까요?',
        title: '10개 코트 상황으로 내 판단 습관을 확인합니다.',
        body: '공식 점수는 아니지만, 3D 코트 상황에서 어떤 샷을 고르는지 보고 다음 연습 포인트를 바로 잡을 수 있습니다.',
        chips: ['10문항', '3D 코트', '연습 포인트']
      }
    : (loc === 'es'
      ? {
          eyebrow: '¿Por qué probarlo?',
          title: '10 situaciones de cancha muestran tus hábitos de decisión.',
          body: 'No es una calificación oficial, pero ayuda a ver qué tiros eliges y qué practicar después.',
          chips: ['10 preguntas', 'Cancha 3D', 'Foco de práctica']
        }
      : {
          eyebrow: 'Why try it?',
          title: '10 court scenarios reveal your shot-decision habits.',
          body: 'It is not an official rating, but it shows what you tend to choose under pressure and what to practice next.',
          chips: ['10 scenarios', '3D court', 'Practice focus']
        });
  return `<div class="dupr-teaser" aria-label="${escAttr(copy.eyebrow)}">
    <div class="dupr-teaser__icon" aria-hidden="true">◎</div>
    <div>
      <p class="dupr-teaser__eyebrow">${esc(copy.eyebrow)}</p>
      <h3>${esc(copy.title)}</h3>
      <p>${esc(copy.body)}</p>
      <p class="dupr-teaser__chips">${copy.chips.map((x) => `<span>${esc(x)}</span>`).join('')}</p>
    </div>
  </div>`;
}

function authorBox(loc) {
  const o = config.owner;
  const role = (o.translations && o.translations[loc] && o.translations[loc].role) || o.role || '';
  return `<aside class="editor-box">
    <span class="editor-box__avatar" aria-hidden="true">${esc((ownerName(loc) || 'P').trim().charAt(0))}</span>
    <div>
      <p class="editor-box__name"><a href="${link(loc, 'author/')}">${esc(ownerName(loc))}</a></p>
      ${role ? `<p class="editor-box__role">${esc(role)}</p>` : ''}
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
  dupr: { src: 'dupr-level-up-dashboard.webp', key: 'visual.dupr', width: 1448, height: 1086 },
  duprSimple: { src: 'level-up-ladder-simple.webp', key: 'visual.dupr', width: 1581, height: 966 },
  duprDashboard: { src: 'dupr-level-up-dashboard.webp', key: 'visual.dupr', width: 1448, height: 1086 },
  players: { src: 'pro-scene-dashboard-design.webp', key: 'visual.players', width: 1400, height: 1050 },
  majorResults: { src: 'pro-scene-major-results-dashboard.webp', key: 'visual.players', width: 1400, height: 1050 },
  insights: { src: 'insights-dashboard-design.webp', key: 'categories.title', width: 1400, height: 1050 },
  highlights: { src: 'highlight-battle.svg', key: 'visual.highlights' },
  boards: { src: 'play-hub-dashboard-design.webp', key: 'visual.boards', width: 1400, height: 1050 },
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
    oppStaggerL: [{ x: 60, y: 188 }, { x: 210, y: 120 }],
    ourP1Wide: [{ x: 26, y: 302 }, { x: 150, y: 268 }]
  };
  const coords = (k) => PRESETS[k] || PRESETS.youUp;
  const scenarios = duprQuiz.map((q) => ({
    id: q.id, diff: q.difficulty || q.diff || 2,
    prompt: loc === 'ko' && q.promptKo ? q.promptKo : q.prompt,
    incoming: loc === 'ko' && q.incomingKo ? q.incomingKo : q.incoming,
    explain: loc === 'ko' && q.explainKo ? q.explainKo : q.explain,
    you: coords(q.you), opp: coords(q.opp), ball: q.ball || null,
    shot: q.shot || {}, power: q.power || {}, zone: q.zone || {}, player: q.player || null
  }));
  const SHOTS = [['dink', 'Dink', '딩크'], ['drop', 'Drop', '드롭'], ['drive', 'Drive', '드라이브'], ['reset', 'Reset', '리셋'], ['roll', 'Roll', '롤'], ['flick', 'Flick', '플릭'], ['block', 'Block', '블록'], ['smash', 'Smash', '스매시'], ['speedup', 'Speed-up', '스피드업'], ['lob', 'Lob', '로브']];
  const POWERS = [['soft', 'Soft', '약하게'], ['medium', 'Medium', '중간'], ['hard', 'Hard', '강하게']];
  const ZONES = {
    kL: ['Their kitchen — left', '상대 키친 · 왼쪽'], kM: ['Their kitchen — middle', '상대 키친 · 가운데'], kR: ['Their kitchen — right', '상대 키친 · 오른쪽'],
    nL: ['Their court — short left', '상대 백코트 가까운 쪽 · 왼쪽'], nM: ['Their court — short middle', '상대 백코트 가까운 쪽 · 가운데'], nR: ['Their court — short right', '상대 백코트 가까운 쪽 · 오른쪽'],
    mL: ['Their court — mid left', '상대 미드코트 · 왼쪽'], mM: ['Their court — mid middle', '상대 미드코트 · 가운데'], mR: ['Their court — mid right', '상대 미드코트 · 오른쪽'],
    dL: ['Their court — deep left', '상대 백코트 먼쪽 · 왼쪽'], dM: ['Their court — deep middle', '상대 백코트 먼쪽 · 가운데'], dR: ['Their court — deep right', '상대 백코트 먼쪽 · 오른쪽']
  };
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
    chosen: t('Selected', '선택됨'), next: t('Next', '다음'), back: t('Back', '이전'), see: t('See result', '결과 보기'), done10: t('Finish 10 →', '10문항 완료 →'), choiceTitle: t('Nice — 10 questions done!', '좋아요 — 10문항 완료!'), choiceIntro: t('See your estimate now, or answer 10 more for a more accurate read.', '지금 결과를 보거나, 10문항을 더 풀어 더 정확하게 측정할 수 있어요.'), seeResultBtn: t('See my result', '측정 결과 보기'), more10Btn: t('Answer 10 more for accuracy', '10문항 더 풀어 정확도 높이기'), moreHint: t('The more you answer, the more reliable the estimate.', '더 많이 답할수록 추정이 더 믿을 만해집니다.'),
    me: t('You', '나'), partner: t('Partner', '파트너'), you: t('Us', '우리'), opp: t('Opponent', '상대'), incoming: t('Incoming ball', '들어오는 공'),
    player1: t('You (Player 1)', '나 (1번)'), player2: t('Partner (Player 2)', '파트너 (2번)'), whoPlays: t('Who should play it — you or your partner?', '누가 칠까요 — 나 vs 파트너?'), youArePos: t('You are Player 1 — the dot marked 1. Choose your shot.', '당신은 코트에 1로 표시된 1번 선수입니다. 칠 샷을 고르세요.'), youArePosChoice: t('You are Player 1 — the dot marked 1. Player 2 is your partner. If the question asks who should take the ball, choose 1 or 2 first and then choose the shot.', '당신은 코트에 1로 표시된 1번 선수이고, 2번은 파트너입니다. 누가 칠지 묻는 문항은 먼저 1번/2번을 고른 뒤 샷을 선택하세요.'),
    isoView: t('Switch to 3D view', '입체(3D)로 보기'), flatView: t('Switch to 2D view', '평면(2D)으로 보기'), isoHint: t('Tip: switch between 2D and 3D court views.', '팁: 2D·3D 코트 보기를 전환할 수 있어요.'),
    moving: t('Moving', '이동 중'),
    histTitle: t('Your self-check history', '내 자가진단 기록'),
    histIntro: t('Re-take it every few weeks and watch your estimate move.', '몇 주마다 다시 해보며 추정치 변화를 확인하세요.'),
    histClear: t('Clear history', '기록 지우기'),
    histNote: t('Saved only in this browser (localStorage). See the Privacy Policy.', '이 브라우저(localStorage)에만 저장됩니다. 개인정보처리방침 참고.'),
    histConfirm: t('Clear all saved self-check records?', '저장된 자가진단 기록을 모두 지울까요?'),
    histEst: t('Estimate', '추정'),
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
    <g class="court-flat" style="display:none">
    <rect x="18" y="20" width="264" height="416" fill="#eaf3ef" stroke="#1E6F5C" stroke-width="2.5"/>
    <rect x="18" y="176" width="264" height="52" fill="#fbe9b0" opacity="0.55"/>
    <rect x="18" y="228" width="264" height="52" fill="#fbe9b0" opacity="0.55"/>
    <line x1="18" y1="228" x2="282" y2="228" stroke="#14513f" stroke-width="3" stroke-dasharray="7 5"/>
    <line x1="150" y1="20" x2="150" y2="176" stroke="#1E6F5C" stroke-width="1.5"/>
    <line x1="150" y1="280" x2="150" y2="436" stroke="#1E6F5C" stroke-width="1.5"/>
    <g class="court-zones">
      ${zoneRect('dL', 20, 22, 80, 50)}${zoneRect('dM', 100, 22, 100, 50)}${zoneRect('dR', 200, 22, 80, 50)}
      ${zoneRect('mL', 20, 73, 80, 50)}${zoneRect('mM', 100, 73, 100, 50)}${zoneRect('mR', 200, 73, 80, 50)}
      ${zoneRect('nL', 20, 124, 80, 50)}${zoneRect('nM', 100, 124, 100, 50)}${zoneRect('nR', 200, 124, 80, 50)}
      ${zoneRect('kL', 20, 176, 80, 50)}${zoneRect('kM', 100, 176, 100, 50)}${zoneRect('kR', 200, 176, 80, 50)}
    </g>
    <text x="150" y="14" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#5b665f">${esc(labels.opp)}</text>
    <text x="150" y="452" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#5b665f">${esc(labels.you)}</text>
    </g>
    <g class="court-iso"></g>
    <g data-markers></g>
  </svg>`;

  const lp = (slug) => link(loc, 'level/' + slug + '/');
  const faqs = [
    { q: t('Is this an official DUPR rating?','이게 공식 DUPR 점수인가요?'), a: t('No. The self-check estimates a level from the shots you choose in ten situations. A real DUPR rating is calculated from your logged match results at dupr.com.','아니요. 자가진단은 10가지 상황에서 고른 샷으로 레벨을 추정합니다. 실제 DUPR 점수는 dupr.com에 기록된 경기 결과로 산출됩니다.') },
    { q: t('How accurate is it?','얼마나 정확한가요?'), a: t('It reflects decision-making, not match results, so treat it as a friendly starting point rather than a precise number.','경기 결과가 아니라 의사결정을 반영하므로, 정확한 숫자라기보다 친근한 출발점으로 여기세요.') },
    { q: t('How many questions are there?','문항은 몇 개인가요?'), a: t('Ten court situations each time, drawn at random from a larger pool, with the difficulty adapting to your answers.','매번 더 큰 풀에서 무작위로 뽑힌 10가지 코트 상황이며, 답에 따라 난이도가 조정됩니다.') },
    { q: t('Will my result change if I retake it?','다시 하면 결과가 바뀌나요?'), a: t('It can. Scenarios are drawn randomly and adapt, so retaking may shift the estimate a little.','바뀔 수 있습니다. 상황이 무작위로 뽑히고 적응형이라, 다시 하면 추정치가 조금 달라질 수 있습니다.') },
    { q: t('What level should a beginner expect?','초보자는 어느 레벨이 나오나요?'), a: t('New players often land around 2.0 to 2.5. The description of the band matters more than the exact number.','초보자는 보통 2.0~2.5 부근입니다. 정확한 숫자보다 그 구간의 설명이 더 중요합니다.') },
    { q: t('How do I move up a level?','레벨을 올리려면?'), a: t('Train the skills for your band. The level pages and guides like dinking and the third-shot drop show what to work on next.','자기 구간의 기술을 훈련하세요. 레벨 페이지와 딩크·세 번째 샷 드롭 같은 가이드가 다음에 무엇을 연습할지 알려줍니다.') },
    { q: t('Does a higher number mean I am better?','숫자가 높으면 더 잘하는 건가요?'), a: t('It reflects your shot selection in these scenarios. Real improvement shows up in matches over time.','이 상황들에서의 샷 선택을 반영합니다. 진짜 향상은 시간이 지나며 경기에서 드러납니다.') }
  ];
  const faqJsonld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
  const explainer = `
<section class="band"><div class="wrap narrow">
  <h2>${esc(t('What the DUPR self-check is','DUPR 자가진단이란?'))}</h2>
  <p>${esc(t('The DUPR self-check is a quick, court-based quiz. In ten situations you choose a shot, a power level, and a target, and we estimate the pickleball level your decisions point to. It takes a couple of minutes and needs no account.','DUPR 자가진단은 코트 기반의 간단한 퀴즈입니다. 10가지 상황에서 샷·강도·방향을 고르면, 당신의 판단이 가리키는 피클볼 레벨을 추정해 드립니다. 몇 분이면 끝나고 계정도 필요 없습니다.'))}</p>
  <p>${esc(t('It is built to test shot selection — the choices that separate levels — rather than how hard you can hit. There are no trick questions; pick what you would actually do on court.','강하게 칠 수 있는지가 아니라, 레벨을 가르는 선택인 샷 셀렉션을 테스트하도록 만들었습니다. 함정 문제는 없으니 코트에서 실제로 할 행동을 고르세요.'))}</p>

  <h2>${esc(t('Official DUPR vs the Picklary self-check','공식 DUPR과 Picklary 자가진단의 차이'))}</h2>
  <ul>
    <li>${esc(t('Official DUPR is calculated from the scores of real matches you log, on one scale for all players. It is the number used to seed tournaments and build fair games.','공식 DUPR은 당신이 기록한 실제 경기 점수로, 모든 선수를 하나의 척도에 올려 산출됩니다. 대회 시드와 공정한 매칭에 쓰이는 숫자입니다.'))}</li>
    <li>${esc(t('The Picklary self-check is only an estimate from your shot choices. It does not log matches and is not affiliated with DUPR; use it to find a starting point while you learn the system.','Picklary 자가진단은 샷 선택에 기반한 추정일 뿐입니다. 경기를 기록하지 않고 DUPR과 제휴 관계도 아닙니다. 시스템을 익히는 동안 출발점을 찾는 용도로 쓰세요.'))}</li>
  </ul>
  <p>${esc(t('New to the rating itself? Read ','레이팅 자체가 처음이라면 '))}<a href="${link(loc, 'what-is-dupr/')}">${esc(t('what DUPR is','DUPR란 무엇인가'))}</a>${esc(t('.','를 읽어 보세요.'))}</p>

  <h2>${esc(t('What each level feels like','레벨별 특징'))}</h2>
  <p>${esc(t('These are general skill descriptions, not official cut-offs. The self-check points you to the band that best matches your decisions.','아래는 공식 기준이 아니라 일반적인 실력 설명입니다. 자가진단은 당신의 판단에 가장 잘 맞는 구간을 알려 줍니다.'))}</p>
  <ul>
    <li><a href="${lp('2-5')}">${esc(t('Level 2.5','레벨 2.5'))}</a> — ${esc(t('developing consistency: you can sustain short rallies and are learning the kitchen, serve, and return.','일관성 형성기: 짧은 랠리를 이어갈 수 있고 키친·서브·리턴을 배우는 단계.'))}</li>
    <li><a href="${lp('3-0')}">${esc(t('Level 3.0','레벨 3.0'))}</a> — ${esc(t('reliable rallies: dependable serve and return, beginning to use the third-shot drop and to dink with some control.','안정적 랠리: 서브·리턴이 믿을 만하고, 세 번째 샷 드롭과 어느 정도 통제된 딩크를 쓰기 시작.'))}</li>
    <li><a href="${lp('3-5')}">${esc(t('Level 3.5','레벨 3.5'))}</a> — ${esc(t('shot selection under pressure: steadier drops, dinks, and resets, better court position, and fewer unforced errors.','압박 속 샷 선택: 드롭·딩크·리셋이 더 안정되고 코트 위치가 좋아지며 범실이 줄어듦.'))}</li>
    <li><a href="${lp('4-0')}">${esc(t('Level 4.0','레벨 4.0'))}</a> — ${esc(t('advanced strategy: you control pace, mix drives and drops, stay patient at the kitchen, and target deliberately.','고급 전략: 템포를 조절하고 드라이브와 드롭을 섞으며, 키친에서 인내심 있게 의도적으로 공략.'))}</li>
  </ul>

  <h2>${esc(t('How to use your result','결과 활용법'))}</h2>
  <p>${esc(t('Use the estimate to decide what to practise next, not to label yourself. If the quiz nudged you toward soft shots or resets, that is your cue.','결과는 자신을 규정하는 라벨이 아니라 다음에 무엇을 연습할지 정하는 데 쓰세요. 퀴즈가 소프트 샷이나 리셋을 권했다면 그게 신호입니다.'))}</p>
  <ul>
    <li>${esc(t('Open your ','당신의 '))}<a href="${link(loc, 'level/')}">${esc(t('level pathway','레벨 로드맵'))}</a>${esc(t(' and read the band just above yours.',' 을 열어 바로 윗 구간을 읽어 보세요.'))}</li>
    <li>${esc(t('Drill the fundamentals: ','기본기를 연습하세요: '))}<a href="${link(loc, 'dinking-fundamentals/')}">${esc(t('dinking','딩크'))}</a>${esc(t(' and the ',' 와 '))}<a href="${link(loc, 'the-third-shot-drop-explained/')}">${esc(t('third-shot drop','세 번째 샷 드롭'))}</a>.</li>
    <li>${esc(t('Then log real matches to build an actual DUPR rating.','그다음 실제 경기를 기록해 진짜 DUPR 점수를 쌓으세요.'))}</li>
  </ul>

  <h2>${esc(t('Frequently asked questions','자주 묻는 질문'))}</h2>
  ${faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('\n  ')}

  <p class="notice">${esc(t('Reminder: this is an estimate of shot selection, not an official DUPR rating. Real DUPR comes from logged matches at dupr.com.','참고: 이것은 샷 선택에 대한 추정이며 공식 DUPR 점수가 아닙니다. 실제 DUPR은 dupr.com의 기록된 경기에서 나옵니다.'))}</p>
</div></section>`;
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
    <p class="quiz__youpos" data-q-youpos>${esc(labels.youArePos)}</p>
    <p class="quiz__incoming"><strong>${esc(labels.incoming)}:</strong> <span data-q-incoming></span> <span class="quiz__power-chip" data-q-power></span></p>
    <div class="quiz__layout">
      <div class="quiz__court">
        <div class="court-view-toolbar"><button type="button" class="court-view-toggle" data-court-toggle aria-pressed="true">${esc(labels.flatView)}</button></div>
        ${courtSvg}
        <ul class="court-legend"><li><span class="dot dot--me"></span>${esc(labels.player1)}</li><li><span class="dot dot--you"></span>${esc(labels.player2)}</li><li><span class="dot dot--opp"></span>${esc(labels.opp)}</li><li><span class="dot dot--ball"></span>${esc(labels.incoming)}</li><li><span class="leg-arrow" aria-hidden="true">⇢</span>${esc(labels.moving)}</li></ul>
        <p class="court-view-hint">${esc(labels.isoHint)}</p>
      </div>
      <div class="quiz__controls">
        <div class="quiz__group" data-player-group hidden><h3>${esc(labels.whoPlays)}</h3><div class="opts opts--player" data-opts="player"><button type="button" class="opt" data-val="p1">${esc(labels.player1)}</button><button type="button" class="opt" data-val="p2">${esc(labels.player2)}</button></div></div>
        <div class="quiz__group"><h3>${esc(labels.yourShot)}</h3><div class="opts" data-opts="shot">${SHOTS.map((s) => `<button type="button" class="opt" data-val="${s[0]}">${esc(loc === 'ko' ? s[2] : s[1])}</button>`).join('')}</div></div>
        <div class="quiz__group"><h3>${esc(labels.power)}</h3><div class="opts opts--power" data-opts="power">${POWERS.map((p) => `<button type="button" class="opt" data-val="${p[0]}">${esc(loc === 'ko' ? p[2] : p[1])}</button>`).join('')}</div></div>
        <div class="quiz__group"><h3>${esc(labels.target)}</h3><p class="quiz__hint">${esc(labels.tapZone)}</p><p class="quiz__zone-label" data-zone-label>—</p></div>
        <div class="quiz__nav"><button type="button" class="btn btn--ghost quiz__back" data-q-back hidden>${esc(labels.back)}</button><button type="button" class="btn btn--primary quiz__next" data-q-next disabled>${esc(labels.next)}</button></div>
      </div>
    </div>
  </div>
  <div class="quiz__choice" data-q-choice hidden>
    <h2>${esc(labels.choiceTitle)}</h2>
    <p>${esc(labels.choiceIntro)}</p>
    <div class="quiz__choice-actions">
      <button type="button" class="btn btn--primary" data-q-see>${esc(labels.seeResultBtn)}</button>
      <button type="button" class="btn btn--ghost" data-q-more>${esc(labels.more10Btn)}</button>
    </div>
    <p class="quiz__choice-hint">${esc(labels.moreHint)}</p>
  </div>
  <div class="quiz__result" data-q-result hidden></div>
  <div class="quiz-history" data-quiz-history hidden></div>
  <script type="application/json" id="dupr-quiz-data">${data}</script>
</div></section>
${explainer}`;
  return layout({ loc, rel: 'dupr-self-check/', title: t('DUPR self-check', 'DUPR 자가진단'), description: t('A 10-question, court-based self-assessment that estimates your pickleball level from your shot decisions.', '샷 선택으로 피클볼 레벨을 추정하는 코트 기반 10문항 자가진단.'), bodyHtml: body, bodyClass: 'page-quiz', jsonld: [faqJsonld] });
}

function visualFigure(loc, key, cls) {
  const v = visuals[key] || visuals.court;
  const caption = key === 'majorResults'
    ? (loc === 'ko' ? 'PPA · MLP 주요 결과 대시보드' : (loc === 'es' ? 'Panel de resultados PPA · MLP' : 'PPA · MLP major results dashboard'))
    : key === 'duprDashboard'
      ? (loc === 'ko' ? 'DUPR 레벨 업 대시보드' : (loc === 'es' ? 'Panel de progreso DUPR' : 'DUPR level-up dashboard'))
      : tt(loc, v.key);
  const dims = svgDims(v.src) || (v.width && v.height ? ` width="${v.width}" height="${v.height}"` : '');
  return `<figure class="visual-card ${cls || ''}"><img src="/assets/img/${escAttr(v.src)}"${dims} alt="${escAttr(caption)}" loading="lazy"><figcaption>${esc(caption)}</figcaption></figure>`;
}
function contentVisual(loc, categoryId) { return visualFigure(loc, categoryVisualKey[categoryId] || 'court', 'visual-card--article'); }
function levelVisual(loc, level) {
  const isLevel45 = level.slug === '4-5';
  const src = isLevel45 ? 'skill-level-4-5.webp' : 'skill-level-' + level.slug + '.svg';
  const dims = isLevel45 ? ' width="1672" height="941"' : svgDims(src);
  const sk = localArray(level, loc, 'skills').slice(0, 3).join(', ');
  const caption = (loc === 'ko' ? '레벨 ' + level.id + ' 핵심 스킬' : 'Level ' + level.id + ' — key skills') + (sk ? ': ' + sk : '');
  return `<figure class="visual-card visual-card--article"><img src="/assets/img/${escAttr(src)}"${dims} alt="${escAttr(caption)}" loading="lazy"><figcaption>${esc(caption)}</figcaption></figure>`;
}
const skillPostImg = {
  'first-30-days-practice-routine': '2-0', 'serve-and-return-basics': '2-5', 'what-does-a-dupr-2-5-player-look-like': '2-5',
  'the-third-shot-drop-explained': '3-0', 'dinking-fundamentals': '3-0', 'pickleball-3-0-to-3-5-improvement-plan': '3-5',
  'doubles-positioning-basics': '4-0', 'pickleball-3-5-to-4-0-habits-to-fix': '4-0'
};
function postVisual(loc, p) {
  if (p.slug === 'what-is-dupr') {
    const src = 'dupr-level-up-dashboard-cropped.webp';
    const cap = loc === 'ko' ? 'DUPR 레벨 업 대시보드' : (loc === 'es' ? 'Panel de progreso DUPR' : 'DUPR level-up dashboard');
    const btn = loc === 'ko' ? 'DUPR 자가진단 시작 →' : (loc === 'es' ? 'Iniciar autoevaluación DUPR →' : 'Start DUPR Self-Check →');
    return `<figure class="visual-card visual-card--article visual-card--dupr-live"><img src="/assets/img/${escAttr(src)}" width="1448" height="980" alt="${escAttr(cap)}" loading="lazy" decoding="async"><figcaption>${esc(cap)}</figcaption><p class="visual-card__live-cta"><a class="btn btn--dupr btn--dupr-wide" href="${link(loc, 'dupr-self-check/')}">${esc(btn)}</a></p></figure>`;
  }
  if (p.heroImage) {
    const src = String(p.heroImage).replace(/^\/+/, '').replace(/^assets\/img\//, '');
    const alt = loc1(p, loc, 'heroImageAlt') || loc1(p, loc, 'title');
    const cap = loc1(p, loc, 'heroImageCaption') || alt;
    const w = Number(p.heroImageWidth || 1200);
    const h = Number(p.heroImageHeight || 900);
    return `<figure class="visual-card visual-card--article visual-card--post-hero"><img src="/assets/img/${escAttr(src)}" width="${w}" height="${h}" alt="${escAttr(alt)}" loading="lazy" decoding="async"><figcaption>${esc(cap)}</figcaption></figure>`;
  }
  const lv = skillPostImg[p.slug];
  if (lv) {
    const src = 'skill-level-' + lv + '.svg', id = lv.replace('-', '.');
    const cap = loc === 'ko' ? '레벨 ' + id + ' 핵심 스킬 시각화' : 'Level ' + id + ' — key skills';
    return `<figure class="visual-card visual-card--article"><img src="/assets/img/${escAttr(src)}"${svgDims(src)} alt="${escAttr(cap)}" loading="lazy"><figcaption>${esc(cap)}</figcaption></figure>`;
  }
  return contentVisual(loc, p.category);
}

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
const LEVEL_COLORS = {
  '2-0': { c: '#1E6F5C', on: '#ffffff', t: '#e8f1ee' },
  '2-5': { c: '#2E9E8C', on: '#ffffff', t: '#e4f4f0' },
  '3-0': { c: '#F4B400', on: '#1d2421', t: '#fdf3d4' },
  '3-5': { c: '#E0822E', on: '#ffffff', t: '#fcefe2' },
  '4-0': { c: '#0ea5e9', on: '#ffffff', t: '#e0f2fe' },
  '4-5': { c: '#2563eb', on: '#ffffff', t: '#dbeafe' },
  '5-0': { c: '#7c3aed', on: '#ffffff', t: '#ede9fe' }
};
function levelColors(id) { return LEVEL_COLORS[String(id).replace('.', '-')] || LEVEL_COLORS['2-0']; }
function levelCard(level, loc) {
  const lc = LEVEL_COLORS[level.slug] || { c: '#1E6F5C', on: '#ffffff', t: '#e8f1ee' };
  return `<article class="level-card" style="--lvl:${lc.c};--lvl-on:${lc.on};--lvl-tint:${lc.t || '#e8f1ee'};">
    <a href="${levelUrl(loc, level)}" class="level-card__link">
      <span class="level-card__badge">${esc(level.id)}</span>
      <h3>${esc(loc1(level, loc, 'title'))}</h3>
      <p>${esc(loc1(level, loc, 'summary'))}</p>
      ${pills(localArray(level, loc, 'skills').slice(0, 3), 'pills--compact')}
    </a>
  </article>`;
}
function levelGrid(loc) { return `<div class="level-grid">${levels.map((l) => levelCard(l, loc)).join('')}</div>`; }
function heroLevels(loc) {
  const label = loc === 'ko' ? '레벨 한눈에 보기' : 'Levels at a glance';
  const foot = loc === 'ko' ? '입문 2.0 → 고급 5.0' : 'Beginner 2.0 → Advanced 5.0';
  const items = levels.map((l) => {
    const c = levelColors(l.id);
    const name = (loc1(l, loc, 'title') || ('Level ' + l.id)).replace(/^Level\s+[\d.]+:\s*/i, '').replace(/^레벨\s*[\d.]+:\s*/, '');
    return `<li class="hero-levels__row" style="--lvl:${c.c};--lvl-on:${c.on};"><a class="hero-levels__link" href="${levelUrl(loc, l)}"><span class="hero-levels__num">${esc(l.id)}</span><span class="hero-levels__name">${esc(name)}</span></a></li>`;
  }).join('');
  return `<aside class="hero-levels" aria-label="${escAttr(label)}">
    <p class="hero-levels__label">${esc(label)}</p>
    <ul class="hero-levels__list">${items}</ul>
    <p class="hero-levels__foot">${esc(foot)}</p>
  </aside>`;
}

function levelQuickSelect(loc, currentLevel, opts) {
  opts = opts || {};
  const label = opts.label || (loc === 'ko' ? 'DUPR 레벨 바로 선택' : (loc === 'es' ? 'Elegir nivel DUPR' : 'Choose a DUPR level'));
  const hint = opts.hint || (loc === 'ko'
    ? '2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0 중 원하는 레벨을 바로 열 수 있습니다.'
    : (loc === 'es'
      ? 'Abre directamente cualquier nivel de 2.0 a 5.0.'
      : 'Open any level from 2.0 through 5.0 directly.'));
  const lead = opts.lead || '';
  const detail = !!opts.detail;
  const buttons = levels.map((l) => {
    const band = parseInt(l.id, 10);
    const isCurrent = currentLevel && String(currentLevel) === String(l.id);
    const action = isCurrent
      ? (loc === 'ko' ? '현재' : (loc === 'es' ? 'Ahora' : 'Viewing'))
      : (loc === 'ko' ? '열기' : (loc === 'es' ? 'Abrir' : 'Open'));
    return `<a class="level-chip level-chip--b${band}${isCurrent ? ' is-current' : ''}" href="${levelUrl(loc, l)}"${isCurrent ? ' aria-current="page"' : ''}>
      <span class="level-chip__num">${esc(l.id)}</span>${detail ? `<span class="level-chip__cta">${esc(action)}</span>` : ''}
    </a>`;
  }).join('');
  return `<div class="level-quick-select${detail ? ' level-quick-select--detail' : ''}" aria-label="${escAttr(label)}">
    <p class="level-quick-select__label">${esc(label)}</p>
    ${lead ? `<p class="level-quick-select__lead">${esc(lead)}</p>` : ''}
    <div class="level-quick-select__buttons">${buttons}</div>
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
function shapeLabel(loc, shape) {
  if (!shape) return shape || '';
  if (loc !== 'ko') return shape;
  return String(shape)
    .replace(/elongated/ig, '엘롱게이티드')
    .replace(/widebody/ig, '와이드바디')
    .replace(/traditional/ig, '트래디셔널')
    .replace(/hybrid/ig, '하이브리드')
    .replace(/invicta|invikta/ig, '인빅타')
    .replace(/quad/ig, '쿼드')
    .replace(/impact shape/ig, '임팩트형')
    .replace(/options/ig, '옵션');
}
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
const _svgDimCache = {};
function svgDims(src) {
  if (!src) return '';
  const rel = String(src).replace(/^\/+/, '').replace(/^assets\/img\//, '');
  if (rel in _svgDimCache) return _svgDimCache[rel];
  let out = '';
  try {
    const s = fs.readFileSync(path.join(ROOT, 'assets/img', rel), 'utf8');
    const m = s.match(/viewBox\s*=\s*"\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)/);
    if (m) out = ` width="${Math.round(parseFloat(m[1]))}" height="${Math.round(parseFloat(m[2]))}"`;
  } catch (e) { out = ''; }
  _svgDimCache[rel] = out;
  return out;
}
function enrichDesc(base, loc, ko, en) {
  base = base || '';
  return base.length < 70 ? (base + (loc === 'ko' ? ko : en)).trim() : base;
}


// ---- Editorial depth blocks --------------------------------------
function richTextSection(loc, key, data) {
  const d = (data[loc] || data.en);
  if (!d) return '';
  const bullets = (d.bullets || []).length ? `<ul>${d.bullets.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
  const links = (d.links || []).length ? `<div class="source-buttons">${d.links.map((x) => `<a class="btn btn--ghost" href="${escAttr(x.href)}">${esc(x.label)}</a>`).join('')}</div>` : '';
  const quality = loc === 'ko'
    ? `<h2>편집 품질 메모</h2><p>${esc(d.title)} 페이지는 방문자가 다음 행동을 바로 정할 수 있도록 구성했습니다. 단순히 외부 정보를 모아 놓는 대신, 어떤 순서로 읽고 무엇을 확인해야 하는지 설명합니다. 바뀔 수 있는 사실은 공식 출처 확인을 권하고, Picklary 내부 문단은 레벨업, 장비 선택, 경기 이해에 도움이 되는 해석과 적용 방법에 집중합니다.</p><p>이 문단은 페이지의 목적을 분명히 하기 위한 보강입니다. 짧은 링크 목록처럼 보이지 않도록 운영 기준, 검수 기준, 저작권 주의, 사용자 안전, 관련 도구 안내를 함께 설명합니다. 이후 실제 글이 늘어나면 이 영역은 최신 내부 글과 도구를 연결하는 안내문으로 계속 업데이트할 수 있습니다.</p><p>또한 같은 내용을 여러 페이지에 무의미하게 반복하지 않고, 각 페이지가 맡은 역할에 맞추어 설명을 확장합니다. 독자가 이 페이지에서 멈추지 않고 관련 도구, 상세 가이드, 공식 확인 링크로 이동하도록 연결하는 것이 목표입니다. 필요할 때는 관련 글 읽기, 도구 사용, 공식 출처 확인, 다음 방문 때 새 예시 확인 중 하나로 바로 이어지도록 구성합니다.</p>`
    : `<h2>Editorial quality note</h2><p>This page is structured to help a reader decide what to do next. Instead of only collecting external information, it explains the reading order, what to verify, and how the topic connects to player improvement, gear choice, or match understanding. Facts that can change are supported with source links, while Picklary adds plain-language interpretation and practical use.</p><p>This section also clarifies the page purpose so it does not look like a thin link list. It documents editorial standards, review expectations, copyright caution, user safety, and links to related tools or guides. As the site grows, this area can keep pointing readers to the most useful internal pages.</p><p>The goal is not to repeat the same text across the site, but to explain the role of each page and connect it to the right tool, guide, or verification link. A reader should be able to move from this overview to a specific action, such as reading a related guide, trying a tool, checking a primary source, or returning later when new examples are published.</p>`
  return `<section class="band ${key && key.indexOf('alt') >= 0 ? 'band--alt' : ''}"><div class="wrap narrow prose adsense-depth">
    <h2>${esc(d.title)}</h2>
    ${(d.paras || []).map((x) => `<p>${esc(x)}</p>`).join('')}
    ${bullets}${links}${quality}
  </div></section>`;
}
function adsenseDepthBlock(loc, key) {
  const blocks = {
    categories: {
      ko: { title:'Picklary 가이드 사용법', paras:[
        '이 페이지는 단순한 글 목록이 아니라 피클볼을 처음 배우는 사람부터 클럽 경기와 토너먼트까지 준비하는 플레이어가 필요한 정보를 순서대로 찾도록 만든 출발점입니다. 규칙, 기본기, 패들, 선수, 대회 흐름을 한 번에 모아 두면 방문자가 검색 결과에서 들어온 뒤 다음 글로 자연스럽게 이동할 수 있습니다.',
        '처음 방문했다면 먼저 레벨과 DUPR 자가진단을 확인하고, 그 다음 본인의 약점에 맞는 스킬 가이드를 읽는 방식이 좋습니다. 패들 구매를 고민하는 독자는 장비 카테고리에서 소재와 형태를 비교한 뒤 패들 파인더를 사용하면 됩니다. 프로 선수와 대회 페이지는 실제 경기 패턴을 공부하는 확장 콘텐츠입니다.',
        'Picklary는 공식 규정이나 랭킹을 그대로 복제하지 않습니다. 바뀔 수 있는 정보는 공식 출처 링크를 함께 제공하고, 사이트 내부에서는 동호인이 이해하기 쉬운 설명과 실제 적용 방법을 중심으로 정리합니다.' ], bullets:['내 레벨을 모르면 DUPR 자가진단부터 시작하세요.','특정 샷이 어렵다면 스킬·드릴 카테고리로 이동하세요.','구매 전에는 공식 제품 페이지와 승인 장비 목록을 다시 확인하세요.','프로 선수 페이지는 따라 할 패턴과 따라 하지 말아야 할 선택을 구분해 읽으세요.'] },
      en: { title:'How to use Picklary guides', paras:[
        'This is more than a list of articles. It is the starting map for players who want to learn pickleball in a practical order: rules first, then skills, gear, ratings, players, and the competitive scene.',
        'If you are new, begin with the level pathway and the DUPR self-check. If you already play, open the skill category that matches your biggest mistake. If you are shopping for gear, compare materials and shapes before using the paddle finder. Player and pro-tour pages are meant for studying patterns from higher-level games.',
        'Picklary does not copy official rule books or live rankings as a substitute for the source. We link to the source where facts can change and add plain-language explanations, examples, and player-focused takeaways.' ], bullets:['Start with your level if you are unsure where you fit.','Use the skills section for one fix at a time.','Verify current prices, legality, and rankings at the linked official sources.','Read player pages as pattern study, not celebrity news.'] },
      es: { title:'Cómo usar las guías de Picklary', paras:[
        'Esta página no es solo una lista de artículos. Es un mapa inicial para aprender pickleball con orden: reglas, habilidades, equipo, ratings, jugadores y escena competitiva.',
        'Si eres nuevo, empieza por el camino de niveles y la autoevaluación DUPR. Si ya juegas, abre la categoría que coincide con tu error más repetido. Para comprar equipo, compara materiales y formas antes de usar el buscador de palas.',
        'Picklary enlaza fuentes oficiales cuando los datos pueden cambiar y añade explicaciones prácticas para jugadores.' ], bullets:['Empieza por tu nivel si no estás seguro.','Trabaja una habilidad a la vez.','Verifica precios, legalidad y rankings en las fuentes enlazadas.'] }
    },
    columns: {
      ko: { title:'칼럼의 역할', paras:[
        '칼럼은 검색용 요약문이 아니라 운영자가 실제 플레이, 클럽 문화, 장비 선택, 학습 과정에서 느낀 판단 기준을 정리하는 공간입니다. 같은 규칙 설명이라도 초보자에게는 무엇이 헷갈리는지, 중급자에게는 어떤 선택이 경기력을 바꾸는지 관점이 다릅니다.',
        '칼럼은 Picklary의 독창성을 보여 주는 중요한 축입니다. 단순 정보 페이지가 반복되는 대신 운영자의 경험과 해석이 들어간 글을 통해 실제 편집 기준을 가진 콘텐츠 허브라는 점을 보여 줍니다.',
        '새 칼럼은 피클볼 입문자의 시행착오, 레벨업 과정에서 바뀌는 습관, 패들 선택의 후회 포인트, 복식 파트너십, 클럽 매너와 같은 주제를 중심으로 확장할 예정입니다.' ], bullets:['개인 경험과 관찰을 분명히 표시합니다.','공식 정보와 의견을 구분합니다.','장비나 레벨 판단은 과장하지 않고 한계를 함께 설명합니다.'] },
      en: { title:'What columns add to the site', paras:[
        'Columns are where Picklary adds perspective rather than simply listing facts. A rule explanation, a paddle comparison, or a level note can be correct and still miss what beginners actually struggle with. These essays explain the judgment behind the recommendation.',
        'Columns help show that the site is not a thin database or scraped feed. They provide original commentary, personal observation, and clear editorial choices around what matters to everyday players.',
        'Future columns will focus on beginner mistakes, habits that change when players move from 3.0 to 3.5, paddle-buying regrets, doubles partnership, court etiquette, and how to watch pro matches for learning.' ], bullets:['We separate opinion from current facts.','We explain what was personally observed and what comes from published specifications.','We avoid claiming that one paddle, rating, or tactic works for every player.'] },
      es: { title:'Qué aportan las columnas', paras:['Las columnas añaden perspectiva y criterio editorial, no solo datos.', 'Ayudan a explicar experiencias de aprendizaje, errores comunes y decisiones prácticas para jugadores de club.'], bullets:['Separar opinión y datos actuales.','Explicar límites y contexto.'] }
    },
    brief: {
      ko: { title:'더 브리프 읽는 법', paras:[
        '더 브리프는 매일 모든 뉴스를 긁어오는 자동 뉴스 페이지가 아닙니다. 피클볼 플레이어가 실제로 행동을 바꿀 만한 변화만 골라 짧게 정리하는 편집형 브리핑입니다. 예를 들어 패들 규정, 대회 일정, 선수 이동, DUPR 관련 변화처럼 시간이 지나면 확인이 필요한 주제를 중심으로 다룹니다.',
        '각 항목은 원문을 그대로 복제하지 않고 Picklary 관점에서 해석한 요약과 확인 링크를 제공합니다. 독자는 여기서 큰 흐름을 잡고, 세부 사항은 공식 출처 또는 관련 내부 가이드에서 다시 확인하는 방식으로 사용하는 것이 좋습니다.',
        '초기 운영 단계에서는 브리핑이 충분히 누적되지 않았을 수 있으므로, 이 페이지는 짧은 뉴스 모음이 아니라 업데이트 운영 원칙과 출처 확인 흐름을 함께 설명하도록 구성했습니다.' ], bullets:['중요한 변화만 선별합니다.','확정되지 않은 소문은 단정하지 않습니다.','대회 결과와 규정은 공식 링크에서 재확인하도록 안내합니다.'] },
      en: { title:'How to read The Brief', paras:[
        'The Brief is not an automated scrape of every pickleball headline. It is an editor-curated note for changes that may actually affect how players practise, buy gear, follow tournaments, or understand ratings.',
        'Each item is summarised in Picklary’s own words and links out to a source or an internal guide. Readers should use it to spot the issue, then verify details on the linked source before making a decision that depends on current facts.',
        'During early site growth, this page also explains the editorial process so it does not look like a thin placeholder. It is designed to become a recurring, useful update habit rather than a copied news feed.' ], bullets:['We select meaningful changes, not every headline.','We avoid presenting rumours as fact.','We send readers to official or primary links for current details.'] },
      es: { title:'Cómo leer The Brief', paras:['The Brief es una nota curada, no un scraper automático.', 'Cada punto resume en palabras propias y enlaza fuentes para verificar detalles actuales.'], bullets:['Seleccionar cambios útiles.','No tratar rumores como hechos.'] }
    },
    boards: {
      ko: { title:'게시판을 안전하게 운영하는 방식', paras:[
        '피클볼 게시판은 방문자가 다시 찾아올 이유를 만드는 좋은 기능이지만, 공개 사용자 콘텐츠는 운영 정책과 안전 기준에서 가장 조심해야 하는 영역입니다. 그래서 현재 버전은 에디터가 미리 정리한 자주 묻는 질문과 샘플 질의응답을 중심으로 노출하고, 사용자가 입력한 내용은 서버에 공개 저장하지 않는 로컬 데모로 제한합니다.',
        '공개 게시판으로 전환할 때는 로그인, 스팸 방지, 신고 기능, 사전 검수, 개인정보 자동 차단, 저작권 확인 절차가 필요합니다. 특히 영상이나 이미지가 포함되는 경우에는 본인 소유 콘텐츠인지, 함께 나온 사람이 공유에 동의했는지 확인하는 절차가 있어야 합니다.',
        '이 페이지의 목적은 무제한 자유 게시판이 아니라 레벨별로 반복되는 질문을 정리하고, 같은 상황에서 어떤 샷과 위치 선택이 좋은지 학습하는 데 있습니다.' ], bullets:['현재 사용자 입력은 브라우저에만 저장됩니다.','공개 게시 전 검수 체계를 전제로 설계합니다.','개인정보, 혐오, 스팸, 무단 업로드는 허용하지 않습니다.'] },
      en: { title:'How the boards are kept safe', paras:[
        'Community boards can bring repeat visits, but public user-generated content is also one of the highest-risk areas for policy compliance. This version therefore prioritizes editor-curated FAQ and sample Q&A. Anything a visitor types in the demo stays in that browser and is not published to the site.',
        'Before a live board is monetized, it should have login, spam prevention, reporting, review, personal-data controls, and copyright checks. Video and image submissions require extra care because other people may appear in the clip.',
        'The purpose is not an unmoderated forum. The boards are meant to turn repeated level questions into useful answers and to help players make better shot, target, and positioning decisions.' ], bullets:['Demo input is local only.','Public posts should be reviewed before publication.','Spam, harassment, personal data, and unauthorized uploads are not allowed.'] },
      es: { title:'Cómo mantener seguros los foros', paras:['Los foros ayudan a volver al sitio, pero el UGC público requiere moderación.', 'Esta versión usa FAQ curadas y demos locales antes de publicar contenido de usuarios.'], bullets:['Input local solamente.','Revisión antes de publicar.'] }
    },
    highlights: {
      ko: { title:'하이라이트 페이지 운영 원칙', paras:[
        '하이라이트 기능은 단순히 재미있는 영상을 올리는 공간이 아니라, 플레이어가 자신의 판단을 되돌아보고 다른 사람의 피드백을 받는 학습 도구입니다. 좋은 클립은 화려한 한 방보다 포인트 전체의 흐름, 위치 이동, 선택한 샷, 다음에 고칠 한 가지를 보여 주는 영상입니다.',
        '현재 정적 사이트 버전에서는 업로드가 실제 서버에 저장되지 않습니다. 이는 무단 영상, 개인정보, 저작권 문제가 있는 콘텐츠가 공개 페이지에 쌓이는 것을 막기 위한 안전 장치입니다. 공개 운영을 시작할 때는 업로드 검수, 삭제 요청, 신고, 저작권 확인, 미성년자 개인정보 보호 절차를 추가해야 합니다.',
        '방문자는 이 페이지의 템플릿을 참고해 자신의 영상을 어떻게 자르고 설명할지 배울 수 있습니다. 같은 영상이라도 레벨, 배우고 싶은 스킬, 당시 점수 상황을 함께 적으면 훨씬 좋은 피드백을 받을 수 있습니다.' ], bullets:['10~45초의 한 포인트 클립을 권장합니다.','본인 레벨과 질문을 함께 적습니다.','타인이 나온 영상은 허락을 받은 뒤 공유해야 합니다.'] },
      en: { title:'Highlight page operating principles', paras:[
        'The highlight area is designed as a learning tool, not just a place to show exciting clips. A useful clip shows the full point, movement, shot choice, and one fix the player wants to understand.',
        'In this static version, uploads are not stored on a server. That is intentional: it prevents unreviewed video, personal data, and copyrighted material from becoming public content. A live launch should add review, reporting, deletion requests, copyright checks, and privacy safeguards.',
        'Visitors can use this page as a template for preparing feedback clips. Add the estimated level, the skill you want help with, and the score or match situation to get more specific advice.' ], bullets:['Use one complete point, ideally 10–45 seconds.','State your level and the exact question.','Share clips with visible players only when you have permission.'] },
      es: { title:'Principios para highlights', paras:['El área de highlights es una herramienta de aprendizaje, no solo entretenimiento.', 'La versión estática no publica videos de usuarios para evitar riesgos antes de revisión.'], bullets:['Un punto completo.','Nivel y pregunta claros.','Permiso si aparecen otras personas.'] }
    },
    blogs: {
      ko: { title:'외부 블로그 연결 기준', paras:[
        '이 페이지는 외부 링크를 단순히 나열하는 목적이 아닙니다. Picklary 본 사이트는 도구와 정리된 가이드에 집중하고, 블로그 채널은 더 긴 경험담, 업데이트 후기, 실험적인 글을 담는 보조 공간으로 활용합니다. 이렇게 역할을 나누면 방문자는 필요한 정보의 성격에 따라 적절한 채널을 선택할 수 있습니다.',
        '외부 블로그 링크가 단순한 이탈 경로로 보이지 않도록, Picklary 내부의 핵심 도구와 가이드로 자연스럽게 이어지는 안내도 함께 설계했습니다. 블로그 글에는 관련 레벨 페이지, 패들 파인더, DUPR 자가진단으로 돌아오는 링크를 넣는 방식이 좋습니다.',
        '외부 블로그의 글을 Picklary에 그대로 복사하지 않고, 같은 주제를 다루더라도 본 사이트에는 요약, 비교표, 도구, 업데이트된 설명을 더해 별도 가치가 생기도록 운영하는 것이 안전합니다.' ], bullets:['블로그는 경험담과 업데이트 기록에 사용합니다.','Picklary는 구조화된 가이드와 도구에 집중합니다.','동일 글을 그대로 복제하지 않고 역할을 나눕니다.'] },
      en: { title:'How external blogs fit the site', paras:[
        'This page is not meant to be a simple exit list. Picklary focuses on structured tools and guides, while companion blogs can hold longer stories, update notes, and experiments that do not fit the main navigation.',
        'The page should also explain why those links exist and how readers can continue to the most relevant Picklary tool or guide. Blog posts should point back to level pages, the paddle finder, the DUPR self-check, or a related guide when the reader needs a tool.',
        'The same article should not simply be copied between platforms. When a topic appears in more than one place, the main site should add structure, comparisons, tools, or updated explanation so it has independent value.' ], bullets:['Blogs carry stories and update notes.','Picklary carries structured guides and tools.','Avoid duplicate publishing without added value.'] },
      es: { title:'Cómo encajan los blogs externos', paras:['Los blogs externos complementan Picklary, no sustituyen las guías principales.', 'El contenido no debe copiarse sin añadir valor o estructura nueva.'], bullets:['Blogs para historias.','Picklary para herramientas.'] }
    }
  };
  return richTextSection(loc, 'adsense-' + key, blocks[key] || {});
}
function categoryDepthBlock(cat, loc) {
  const name = categoryName(cat, loc);
  const count = publishedPosts.filter((p) => p.category === cat.id).length;
  const samples = publishedPosts.filter((p) => p.category === cat.id).slice(0, 3).map((p) => loc1(p, loc, 'title')).join(', ');
  const data = loc === 'ko' ? {
    title: name + ' 카테고리 읽는 순서',
    paras: [
      `${name} 카테고리에는 현재 ${count}개의 관련 가이드가 정리되어 있습니다. 이 묶음은 검색 유입을 위한 얕은 링크 모음이 아니라, 같은 주제를 단계적으로 읽을 수 있도록 만든 학습 경로입니다.`,
      samples ? `처음 읽을 글을 고르기 어렵다면 ${samples} 같은 글부터 시작해 보세요. 핵심 개념을 이해한 뒤 관련 글로 이동하면 같은 시간을 써도 훨씬 빠르게 경기 선택이 정리됩니다.` : '새 글이 추가될 때마다 이 카테고리는 레벨, 규칙, 장비, 대회 흐름과 연결되는 방식으로 업데이트됩니다.',
      '각 글은 가능한 한 실제 플레이어가 바로 적용할 수 있는 질문으로 시작합니다. 규칙이나 장비처럼 바뀌는 정보는 공식 출처를 확인하도록 안내하고, Picklary 내부에서는 이해와 적용에 필요한 설명을 더합니다.'
    ], bullets:['먼저 개념을 읽고, 다음에 체크리스트를 따라 해 보세요.','레벨이 맞지 않는 글은 한 단계 낮은 글부터 읽는 편이 좋습니다.','최신 규정과 가격은 각 글의 공식 링크에서 다시 확인하세요.']
  } : {
    title: 'How to read the ' + name + ' category',
    paras: [
      `This category currently groups ${count} related guides. It is meant to work as a learning path, not just a list of links for search traffic.`,
      samples ? `If you are unsure where to begin, start with articles such as ${samples}. Read the core idea first, then move to the related guide that matches your level or problem.` : 'As new articles are added, this category will connect the topic to levels, rules, gear choices, and the competitive scene.',
      'Each guide starts from a practical player question. When a fact can change, Picklary links to the official or primary source and uses the article to explain how to apply the information on court.'
    ], bullets:['Read the concept first, then use the checklist.','If an article feels too advanced, step down one level.','Verify current rules, prices, and rankings at linked sources.']
  };
  return richTextSection(loc, 'category-depth', { ko: data, en: data, es: data });
}
function playerDeepTakeaways(player, loc) {
  const skills = (player.skills || []).slice(0, 4);
  const s1 = skills[0] || (loc === 'ko' ? '샷 선택' : 'shot selection');
  const s2 = skills[1] || (loc === 'ko' ? '위치 선정' : 'positioning');
  const s3 = skills[2] || (loc === 'ko' ? '압박 관리' : 'pressure management');
  if (loc === 'ko') return `<h2>3.0–4.0 동호인에게 주는 힌트</h2>
<p>${esc(player.name)} 페이지는 단순한 선수 소개가 아니라 내 경기에서 무엇을 관찰할지 정하는 학습 노트입니다. 프로 선수의 스피드나 피지컬을 그대로 따라 하기는 어렵지만, 공을 언제 낮추고 언제 속도를 올리는지, 파트너와 어느 간격을 유지하는지는 클럽 경기에도 바로 적용할 수 있습니다.</p>
<p>먼저 ${esc(s1)}을 보세요. 공격 가능한 공과 기다려야 하는 공을 구분하는 방식이 레벨업의 핵심입니다. 다음으로 ${esc(s2)}을 확인하세요. 좋은 선수는 멋진 샷을 치기 전에 이미 다음 공을 받기 좋은 위치에 있습니다.</p>
<p>마지막으로 ${esc(s3)}을 관찰하세요. 점수가 중요한 순간에도 무리한 위너보다 확률 높은 코스로 압박을 유지하는 선택이 많습니다. 이 관점으로 영상을 보면 선수 프로필이 단순한 읽을거리에서 실제 훈련 아이디어로 바뀝니다.</p>
<ul><li>따라 할 것: 준비 자세, 코트 간격, 낮은 리셋 선택.</li><li>조심할 것: 프로 수준의 강한 공격을 낮은 성공률로 흉내 내는 것.</li><li>연습 연결: 한 가지 패턴을 골라 파트너와 10분 반복합니다.</li></ul>`;
  return `<h2>Takeaways for 3.0–4.0 club players</h2>
<p>This profile is not only a biography. It is a study note for deciding what to watch in ${esc(player.name)}'s game. Most club players cannot copy pro speed or athleticism, but they can copy the timing, spacing, and risk choices behind the point.</p>
<p>Start with ${esc(s1)}. Level improvement often begins with knowing which ball can be attacked and which ball should be kept low. Then watch ${esc(s2)}. Good players usually win the next shot before it arrives because their court position is already prepared.</p>
<p>Finally, study ${esc(s3)}. In pressure points, elite players often choose repeatable pressure over low-percentage winners. Read the profile with that lens and it becomes a practical training guide rather than just a player page.</p>
<ul><li>Copy: ready position, court spacing, low resets.</li><li>Avoid copying: pro-level attacks that your current consistency cannot support.</li><li>Practice link: choose one pattern and repeat it with a partner for ten minutes.</li></ul>`;
}
function tournamentDepthBlock(loc, type) {
  const isInternational = type === 'international';
  const data = loc === 'ko' ? {
    title: isInternational ? '국제 대회를 볼 때 확인할 점' : '미국 프로투어 정보를 활용하는 법',
    paras: [
      isInternational ? '국제 대회 페이지는 미국 외 지역에서 피클볼이 어떻게 확장되는지 확인하기 위한 참고 페이지입니다. 대회 이름과 장소만 보는 것보다 어떤 단체가 운영하는지, 선수 등록 방식은 무엇인지, 결과가 DUPR이나 공식 랭킹에 어떤 방식으로 연결되는지를 함께 확인하는 것이 좋습니다.' : '미국 프로투어 페이지는 단순 일정표가 아니라 경기 관전과 학습을 연결하는 페이지입니다. 어느 도시에서 열리는지만 보는 것보다 어떤 종목이 열리는지, 상위 선수가 어떤 조합으로 출전하는지, 결과가 랭킹과 팀 리그 흐름에 어떤 영향을 주는지를 함께 보면 더 유용합니다.',
      'Picklary는 실시간 스코어를 자체적으로 확정 발표하지 않습니다. 대회 일정, 브래킷, 참가자, 결과는 사후 변경될 수 있으므로 공식 대회 페이지와 랭킹 페이지를 다시 확인하도록 안내합니다.',
      '동호인에게 가장 유용한 사용법은 결과를 보고 끝내는 것이 아니라, 우승 조합의 패턴을 자신의 복식 경기로 가져오는 것입니다. 리턴 후 전진 타이밍, 3구 선택, 중앙 수비, 파트너 간 역할 분담을 중심으로 보면 프로 경기가 훨씬 실용적인 자료가 됩니다.'
    ], bullets:['일정과 결과는 공식 출처에서 재확인합니다.','대회 결과는 선수 페이지와 연결해 학습합니다.','관전 포인트는 화려한 샷보다 반복되는 패턴입니다.']
  } : {
    title: isInternational ? 'How to read international events' : 'How to use U.S. pro-tour information',
    paras: [
      isInternational ? 'International event pages help track how pickleball is expanding outside the United States. Instead of reading only the event name and location, check who runs the event, how entries work, and whether results connect to ratings or rankings.' : 'The U.S. pro-tour page is more than a schedule. Read it as a link between match watching and player learning: event format, player pairings, rankings movement, and patterns you can apply in club doubles.',
      'Picklary does not present live scores as final. Event dates, brackets, entries, and results can change, so the official event and ranking pages remain the verification source.',
      'For club players, the best use is to study repeated patterns after results are posted: return-and-advance timing, third-shot choice, middle coverage, and partner roles.'
    ], bullets:['Verify schedules and results at official links.','Connect results back to player pages.','Watch repeated patterns more than highlight shots.']
  };
  return richTextSection(loc, 'tournament-depth', { ko: data, en: data, es: data });
}
function contactDepthHtml(loc) {
  if (loc === 'ko') return `<h2>어떤 문의를 보내면 좋나요?</h2><p>오류 제보는 가장 환영하는 문의입니다. 잘못된 규정 설명, 바뀐 공식 링크, 더 이상 판매되지 않는 패들, 선수 프로필 변경, DUPR 또는 랭킹 페이지 연결 오류를 발견하면 페이지 주소와 함께 알려 주세요. 가능하면 공식 출처 링크를 같이 보내 주시면 확인이 빠릅니다.</p><h2>제휴와 광고 문의</h2><p>Picklary는 독립적인 피클볼 정보 사이트로 운영됩니다. 장비 브랜드, 코치, 클럽, 대회와 협업할 수 있지만, 협찬 여부가 콘텐츠 판단을 바꾸지 않도록 광고와 편집 콘텐츠를 분리합니다. 제품 제공이나 제휴 제안은 광고·제휴 고지 원칙에 따라 표시됩니다.</p><h2>개인정보 안내</h2><p>연락 시 사용자가 직접 이메일에 적은 정보만 확인합니다. 주민등록번호, 결제 정보, 상세 주소처럼 불필요한 민감 정보는 보내지 마세요. 영상 피드백 문의를 보낼 때도 타인의 얼굴이나 연락처가 보이지 않도록 편집하는 것을 권장합니다.</p><h2>응답과 업데이트 방식</h2><p>모든 문의에 즉시 답변할 수는 없지만, 사이트 오류나 정책상 중요한 제보는 우선적으로 확인합니다. 실제로 수정한 내용은 해당 페이지의 업데이트 날짜, 정정 정책, 또는 관련 글의 안내 문구에 반영할 수 있습니다. 패들 가격, 대회 일정, 선수 랭킹처럼 시간이 지나면서 바뀌는 내용은 단정적으로 고정하지 않고 공식 확인 경로를 강화하는 방식으로 처리합니다.</p><h2>보내지 말아야 할 내용</h2><p>광고 클릭 요청, 스팸성 제휴 제안, 무단 복제 이미지 제공, 타인의 개인정보가 포함된 영상, 확인되지 않은 비방성 주장은 검토하지 않을 수 있습니다. Picklary는 장기적으로 안전한 피클볼 학습 사이트를 목표로 하므로, 문의 내용도 독자에게 도움이 되는 정보와 신뢰 가능한 출처 중심으로 보내 주시면 좋습니다.</p><p>문의 페이지는 방문자가 실제 운영자와 연락할 수 있다는 신뢰 신호이기도 합니다. AdSense 신청 전에는 이메일 주소가 실제로 수신 가능한지, 푸터와 정책 페이지의 연락처가 같은지, 개인정보처리방침의 문의 방법과 모순되지 않는지 확인해 두는 것이 좋습니다.</p>`;
  return `<h2>What should you contact us about?</h2><p>Corrections are welcome. Send the page URL if you find a broken official link, outdated paddle information, a player-profile change, a ranking source issue, or a rule explanation that should be reviewed. A reliable source link helps us verify faster.</p><h2>Partnership and advertising inquiries</h2><p>Picklary is operated as an independent pickleball information site. Gear brands, coaches, clubs, and events may contact us, but sponsorship does not control editorial conclusions. Product samples or affiliate relationships should be disclosed under the advertising policy.</p><h2>Privacy reminder</h2><p>When you email us, we receive only the information you choose to send. Do not include sensitive details such as payment information, government identifiers, or unnecessary addresses. If you share a clip for feedback, remove visible personal information and get permission from anyone clearly shown.</p><h2>How updates are handled</h2><p>We may not be able to reply to every message immediately, but site errors and policy-sensitive reports are prioritized. When a correction is made, it may be reflected in the page update date, the corrections policy, or the note attached to the relevant article. Changing information such as paddle prices, event schedules, and player rankings is handled by strengthening source links rather than pretending a static page is permanently current.</p><h2>What not to send</h2><p>Please do not send ad-click requests, spam partnership offers, unlicensed images, videos containing another person’s private information, or unsupported personal accusations. Picklary is intended to be a safe long-term learning site, so useful messages should focus on verifiable sources and reader value.</p><p>The contact page is also a trust signal showing that readers can reach a real operator. The contact email should stay current, match the footer and policy pages, and align with the contact method described in the privacy policy.</p>`;
}
function policyDepthHtml(loc, key) {
  const commonKo = `<h2>왜 이 페이지가 필요한가요?</h2><p>이 정책 페이지는 단순한 형식 문서가 아니라 Picklary가 어떤 기준으로 콘텐츠를 만들고, 광고를 배치하고, 사용자 입력을 제한하며, 오류를 수정하는지 설명하기 위한 문서입니다. AdSense와 같은 광고 프로그램을 사용할 때는 사이트 운영 방식, 개인정보 처리, 저작권, 커뮤니티 검수 기준이 명확해야 방문자와 광고주 모두에게 안전합니다.</p><p>Picklary는 피클볼 정보 사이트로서 규칙, 패들, 선수, 대회, DUPR처럼 바뀔 수 있는 주제를 다룹니다. 그래서 정책 문서에는 현재 정보의 한계, 외부 링크 확인 필요성, 광고와 편집의 분리, 사용자 입력의 검수 원칙을 함께 적어 둡니다. 이 기준은 방문자가 사이트를 더 신뢰할 수 있게 만들고, 운영자가 새 기능을 추가할 때 지켜야 할 체크리스트 역할을 합니다.</p><p>특히 공개 게시판, 하이라이트 영상, 패들 리뷰 같은 영역은 저작권과 개인정보 문제가 생기기 쉽습니다. 현재 버전은 서버에 사용자 글을 자동 게시하지 않으며, 공개 운영 전에는 신고, 삭제 요청, 스팸 방지, 사전 검수 절차를 마련한다는 원칙을 명확히 했습니다.</p><p>이 페이지들은 푸터에서 항상 접근할 수 있도록 배치되어 있습니다. 방문자는 광고, 개인정보, 문의, 정정 요청, 커뮤니티 참여 기준을 필요할 때 쉽게 확인할 수 있고, 운영자는 새 페이지나 기능을 추가할 때 이 기준과 충돌하지 않는지 먼저 점검할 수 있습니다.</p><p>개인정보, 쿠키, 광고, 정정, 커뮤니티 기준은 서로 연결되어 있으므로 새 기능을 추가할 때 함께 확인합니다.</p>`
  const commonEn = `<h2>Why this page matters</h2><p>This policy page is not just a formality. It explains how Picklary creates content, separates ads from editorial work, limits user submissions, and corrects errors. Clear privacy, copyright, advertising, and moderation standards make the site safer for readers and advertisers.</p><p>Picklary covers topics that can change, including rules, paddles, players, events, and DUPR-related links. For that reason, these policy pages also explain the limits of current information, the need to verify external sources, the separation of advertising and editorial work, and the review standards for user input. They act as a public trust layer and an internal checklist for future features.</p><p>Community boards, highlight videos, and gear reviews can raise copyright, privacy, and moderation issues. This version does not automatically publish user posts to a public server, and a public launch should include reporting, removal requests, spam prevention, and pre-publication review.</p><p>These pages are kept in the footer so readers can find them at any time. They also serve as a checklist when new tools, articles, ads, or community features are added: the new feature should not conflict with the stated privacy, advertising, correction, or moderation standards.</p><p>Readers should use these policies together, because privacy, cookies, advertising, corrections, and community moderation affect one another when interactive tools are added. This is especially important for a site that combines articles, tools, external links, and future community features.</p>`;
  const byKeyKo = {
    privacy: '<h2>광고와 저장소에 대한 추가 설명</h2><p>광고가 활성화되면 Google 또는 제3자 광고 파트너가 쿠키를 사용해 광고를 제공할 수 있습니다. Picklary 자체 기능은 언어 선택, DUPR 자가진단 기록, 로컬 데모 입력처럼 사용자의 브라우저 안에서 동작하는 정보를 중심으로 설계되어 있습니다. 사용자는 브라우저 설정에서 쿠키와 localStorage를 삭제할 수 있습니다.</p>',
    cookies: '<h2>사용자가 제어할 수 있는 항목</h2><p>언어 선택과 일부 도구 기록은 편의를 위해 저장됩니다. 이 정보는 다른 사이트를 추적하기 위한 목적이 아니며, 브라우저에서 삭제할 수 있습니다. 광고 쿠키는 광고 제공자가 관리할 수 있으므로 사용자는 Google 광고 설정 또는 브라우저 개인정보 설정에서 맞춤 광고와 쿠키 사용을 조정할 수 있습니다.</p>',
    advertising: '<h2>광고 배치 원칙</h2><p>광고가 승인되더라도 버튼, 다운로드, 메뉴, 다음 글 링크와 혼동되는 방식으로 배치하지 않습니다. 광고 클릭을 요청하거나 보상을 제공하지 않으며, 어린 방문자나 초보자가 광고를 사이트 기능으로 오해하지 않도록 충분한 간격과 표시를 유지합니다.</p>',
    corrections: '<h2>수정 처리 방식</h2><p>오류 제보가 들어오면 페이지 주소, 문제 문장, 확인 가능한 출처를 기준으로 검토합니다. 단순 의견 차이는 별도로 표시하고, 사실 오류나 끊어진 링크는 수정 후 페이지의 업데이트 날짜에 반영합니다. 규정, 가격, 랭킹처럼 시간이 지나 바뀌는 정보는 단정 표현보다 확인 경로를 제공하는 방식으로 관리합니다.</p>',
    community: '<h2>공개 커뮤니티 전환 전 조건</h2><p>현재 게시판과 하이라이트 입력은 공개 서버에 자동 게시되지 않습니다. 공개 운영을 시작하려면 신고, 삭제 요청, 사전 검수, 스팸 차단, 반복 위반자 제한, 저작권 확인, 개인정보 차단 절차가 필요합니다. 이 기준이 준비되기 전에는 광고가 표시되는 공개 UGC 영역을 만들지 않는 것이 안전합니다.</p>',
    editorial: '<h2>편집 독립성</h2><p>Picklary는 공식 출처와 공개 스펙을 확인하되, 독자가 실제로 이해하고 적용할 수 있도록 자체 설명을 더합니다. 협찬이나 제휴 가능성이 있는 장비 주제도 장점과 한계를 함께 적고, 가격·승인 여부·랭킹처럼 변동되는 내용은 최신 확인 링크를 제공합니다.</p>',
    terms: '<h2>사용자의 책임</h2><p>Picklary의 콘텐츠는 일반 정보와 학습 목적입니다. 대회 참가, 장비 구매, 부상 관련 훈련 결정처럼 결과가 중요한 선택은 공식 규정, 제품 제조사, 코치 또는 전문가의 조언을 함께 확인해야 합니다.</p>',
    disclaimer: '<h2>정보의 한계</h2><p>피클볼 장비와 레벨 판단은 개인의 신체 조건, 경기 환경, 파트너, 상대 수준에 따라 달라집니다. Picklary는 방향을 제시하지만 모든 사용자에게 같은 결과를 보장하지 않습니다.</p>'
  };
  const byKeyEn = {
    privacy: '<h2>More about ads and storage</h2><p>When ads are active, Google or third-party advertising partners may use cookies to serve ads. Picklary features are designed around browser-side storage for language choice, DUPR self-check history, and local demos. Users can clear cookies and localStorage in browser settings.</p>',
    cookies: '<h2>What users can control</h2><p>Language choice and some tool history are stored for convenience, not to track users across other sites. Advertising cookies may be controlled through Google Ads Settings and browser privacy settings.</p>',
    advertising: '<h2>Ad placement principles</h2><p>Approved ads should not be placed where they look like navigation, downloads, buttons, or next-article links. Picklary does not ask users to click ads or offer rewards for ad interaction.</p>',
    corrections: '<h2>How corrections are handled</h2><p>We review the page URL, the sentence in question, and the source provided. Factual errors and broken official links are corrected, while changing facts such as prices, rankings, and rules are handled with verification links and update dates.</p>',
    community: '<h2>Before public community launch</h2><p>Current board and highlight inputs are not automatically published to a public server. A public launch should include reporting, deletion requests, review, spam controls, repeat-violator limits, copyright checks, and personal-data safeguards.</p>',
    editorial: '<h2>Editorial independence</h2><p>Picklary checks official sources and published specifications, then adds explanation for practical use. Sponsored or affiliate topics should still include limitations, source links, and clear disclosure.</p>',
    terms: '<h2>User responsibility</h2><p>Picklary content is general information for learning. Tournament entry, gear purchases, injury-related training choices, and other important decisions should be verified with official sources or qualified professionals.</p>',
    disclaimer: '<h2>Limits of information</h2><p>Gear fit and level estimates depend on the player, court, partner, and opponents. Picklary provides guidance but cannot guarantee identical results for every user.</p>'
  };
  return (loc === 'ko' ? commonKo + (byKeyKo[key] || '') : commonEn + (byKeyEn[key] || ''));
}
function clampDesc(s, max) {
  s = (s || '').trim();
  if (s.length <= max) return s;
  let cut = s.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  if (sp > max * 0.6) cut = cut.slice(0, sp);
  return cut.replace(/[\s,;:.!?\-]+$/, '') + '…';
}
function assetImage(src, alt, cls) {
  if (!src) return '';
  return `<img class="${escAttr(cls || '')}" src="${escAttr(src)}"${svgDims(src)} alt="${escAttr(alt || '')}" loading="lazy">`;
}
// Slug-matched stylised illustration (players/, paddles/). Falls back to assetImage.
function entityIllus(folder, slug, fallbackSrc, alt, note) {
  const relPath = 'assets/img/' + folder + '/' + slug + '.svg';
  let exists = false;
  try { exists = fs.existsSync(path.join(ROOT, relPath)); } catch (e) { exists = false; }
  const imgHtml = exists
    ? `<img class="entity-hero__img" src="/${relPath}"${svgDims(relPath)} alt="${escAttr(alt || '')}" loading="lazy">`
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
  // pickleball.com player profiles show the athlete's live DUPR + PPA rankings, so link there per-player when available.
  const cand = [player.officialProfile, player.secondaryProfile].filter(Boolean);
  const perPlayer = cand.find((u) => /pickleball\.com\/players\//.test(u)) || '';
  const note = perPlayer
    ? (loc === 'ko'
      ? `DUPR는 경기 결과가 반영될 때마다 바뀝니다. Picklary은 숫자를 고정해 싣지 않고, ${player.name} 선수의 현재 DUPR·랭킹을 보여주는 공식 프로필로 바로 연결합니다.`
      : loc === 'es'
        ? `DUPR cambia con cada resultado. En vez de fijar un número, enlazamos al perfil con el DUPR y los rankings actuales de ${player.name}.`
        : `DUPR changes every time results are processed. Instead of pinning a number, Picklary links straight to ${player.name}’s profile with their current DUPR and rankings.`)
    : (loc === 'ko'
      ? 'DUPR는 경기 결과가 반영될 때마다 바뀝니다. Picklary은 실시간 숫자를 그대로 옮겨 싣지 않고 공식 DUPR 랭킹으로 연결합니다. 최신 값은 아래 링크에서 확인하세요.'
      : loc === 'es'
        ? 'DUPR cambia cada vez que se procesan resultados. Picklary no reproduce el número en vivo; enlazamos a las clasificaciones oficiales. Consulta el valor actual en el enlace.'
        : 'DUPR changes every time match results are processed. Rather than reproduce a live number, Picklary links you to the official DUPR rankings — check the current value at the link below.');
  let table = '';
  if (hasNums) {
    const rows = [
      [loc === 'ko' ? '복식 DUPR (참고)' : loc === 'es' ? 'DUPR dobles (ref.)' : 'Doubles DUPR (ref.)', d.doubles],
      [loc === 'ko' ? '싱글 DUPR (참고)' : loc === 'es' ? 'DUPR singles (ref.)' : 'Singles DUPR (ref.)', d.singles]
    ].filter(function (r) { return r[1] != null && r[1] !== ''; });
    table = `<table class="spec-table"><tbody>${rows.map(([k, v]) => fieldRow(k, v)).join('')}</tbody></table>`;
  }
  const primaryBtn = perPlayer
    ? `<a class="btn btn--primary" href="${escAttr(perPlayer)}" rel="nofollow noopener" target="_blank">${esc(loc === 'ko' ? player.name + ' 최신 DUPR·랭킹' : loc === 'es' ? 'DUPR y rankings de ' + player.name : player.name + ' — live DUPR & rankings')} →</a>`
    : `<a class="btn btn--primary" href="${escAttr(d.sourceUrl || 'https://www.dupr.com/rankings')}" rel="nofollow noopener" target="_blank">DUPR Rankings</a>`;
  const secondaryBtn = `<a class="btn btn--ghost" href="https://www.dupr.com/rankings" rel="nofollow noopener" target="_blank">${esc(loc === 'ko' ? 'DUPR 전체 랭킹' : loc === 'es' ? 'Rankings DUPR' : 'DUPR rankings')}</a>`;
  return `<div class="spec-card dupr-panel"><h2>${esc(title)}</h2>${table}<div class="source-buttons">${primaryBtn}${secondaryBtn}</div><p class="notice">${esc(note)}</p></div>`;
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
      <p class="paddle-card__meta">${esc(styleLabel(loc, p.style))} · ${esc(shapeLabel(loc, p.shape))} · ${esc(priceLabel(p))}</p>
      ${pills((p.traits || []).map((t) => traitLabel(loc, t)).slice(0, 4), 'pills--compact')}
      <p class="paddle-card__note">${esc(loc1(p, loc, 'reviewSignal'))}</p>
      <span class="card__meta">${esc(tt(loc, 'paddles.viewDetails'))}</span>
    </a>
  </article>`;
}

function playerSkillLabel(loc, skill) {
  if (loc !== 'ko') return skill;
  const map = {
    'Third-shot variety':'3구 선택지 다양성', 'Dink patience':'딩크 인내심', 'Counter timing':'카운터 타이밍', 'Pattern play':'패턴 플레이',
    'Fast hands':'빠른 손', 'Speed-ups':'스피드업', 'Court coverage':'코트 커버', 'Mixed doubles pressure':'혼합복식 압박',
    'Singles movement':'단식 움직임', 'Drive patterns':'드라이브 패턴', 'Serve pressure':'서브 압박', 'Transition attacks':'전환 공격',
    'Counter blocks':'카운터 블록', 'Soft resets':'부드러운 리셋', 'Two-handed backhand':'투핸드 백핸드', 'Doubles spacing':'복식 간격',
    'Consistency':'안정성', 'Dinks under pressure':'압박 속 딩크', 'Singles construction':'단식 포인트 구성', 'Mixed patterns':'혼합복식 패턴',
    'Kitchen speed':'키친 반응 속도', 'Hand speed':'빠른 손', 'Anticipation':'예측력', 'Attack timing':'공격 타이밍', 'Reset quality':'리셋 품질',
    'Serve-plus-one':'서브 후 다음 샷', 'Left-side patterns':'왼쪽 코트 패턴', 'Right-side pressure':'오른쪽 코트 압박'
  };
  return map[skill] || skill;
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
      ${pills((player.skills || []).slice(0, 4).map((x) => playerSkillLabel(loc, x)), 'pills--compact')}
      <span class="card__meta">${esc(tt(loc, 'players.viewProfile'))}</span>
    </a>
  </article>`;
}
function fieldRow(label, value) {
  if (Array.isArray(value)) value = value.join(', ');
  return `<tr><th>${esc(label)}</th><td>${esc(value || '—')}</td></tr>`;
}

function toolsFeature(loc) {
  const L = (en, ko) => (loc === 'ko' ? ko : en);
  const guideIcon = '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8.5h15.5c4.7 0 8.5 3.8 8.5 8.5v22.5H20.5c-4.7 0-8.5-3.8-8.5-8.5V8.5Z" stroke="currentColor" stroke-width="2.5"/><path d="M18 17h12M18 23h13M18 29h8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M35.5 14.5 39 11l3.5 3.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/></svg>';
  const lvIcon = '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="2.6"/><circle cx="24" cy="24" r="10.5" stroke="currentColor" stroke-width="2.2"/><circle cx="24" cy="24" r="3.4" fill="currentColor"/></svg>';
  const pdIcon = '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="13" y="5" width="22" height="27" rx="11" stroke="currentColor" stroke-width="2.6"/><rect x="20" y="31" width="8" height="13" rx="4" fill="currentColor"/><path d="M19 13 C 24 10, 24 10, 29 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".7"/></svg>';
  const checks = [
    L('10 situational questions', '상황형 질문 10개'),
    L('Instant level estimate', '즉시 레벨 추정'),
    L('Save and compare progress', '저장 후 변화 비교')
  ];
  return `<section class="band">
  <div class="wrap">
    <p class="section-eyebrow">${esc(L('Start here', '처음이라면 여기부터'))}</p>
    <h2 class="band__title">${esc(L('Start, check your level, then choose gear', '초보 가이드 → 레벨 확인 → 장비 선택'))}</h2>
    <p class="band__intro">${esc(L('A simple path for first-time visitors: learn the basics, estimate your level, then compare paddles only after you know your needs.', '처음 온 방문자가 헤매지 않도록 기본기부터 레벨 확인, 장비 비교까지 이어지는 시작 동선입니다.'))}</p>
    <div class="tools-feature">
      <a class="tool-feature tool-feature--beginner" href="${link(loc, 'pickleball-complete-beginner-guide/')}">
        <span class="tool-feature__badge">${esc(L('Start here', '초보 시작점'))}</span>
        <span class="tool-feature__icon" aria-hidden="true">${guideIcon}</span>
        <h3 class="tool-feature__title">${esc(L('Beginner Guide', '초보 가이드'))}</h3>
        <p class="tool-feature__desc">${esc(L('Follow the rules, first shots, level path, and first-paddle checklist in order — built as the best entry point for new players.', '규칙, 첫 샷, 레벨 경로, 첫 패들 기준을 순서대로 따라가는 신규 방문자용 시작 페이지입니다.'))}</p>
        <span class="tool-feature__go">${esc(L('Start the guide', '초보 가이드 보기'))} <span aria-hidden="true">→</span></span>
      </a>
      <a class="tool-feature tool-feature--level" href="${link(loc, 'dupr-self-check/')}">
        <span class="tool-feature__badge">${esc(L('Main tool', '주력 도구'))}</span>
        <span class="tool-feature__icon" aria-hidden="true">${lvIcon}</span>
        <h3 class="tool-feature__title">${esc(L('DUPR self-check', 'DUPR 레벨 자가진단'))}</h3>
        <p class="tool-feature__desc">${esc(L('Answer ten on-court situations to estimate your level, pinpoint what usually breaks down in matches, and save the result to track improvement over time.', '코트 위 10가지 상황에 답하면 현재 레벨을 가늠하고, 경기에서 자주 막히는 구간을 확인한 뒤 결과를 저장해 성장 과정을 추적할 수 있습니다.'))}</p>
        <ul class="tool-feature__highlights">${checks.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
        <span class="tool-feature__go">${esc(L('Start the self-check', '자가진단 시작'))} <span aria-hidden="true">→</span></span>
      </a>
      <a class="tool-feature tool-feature--paddle" href="${link(loc, 'tools/paddle-finder/')}">
        <span class="tool-feature__icon" aria-hidden="true">${pdIcon}</span>
        <h3 class="tool-feature__title">${esc(L('Paddle Finder', '패들 파인더'))}</h3>
        <p class="tool-feature__desc">${esc(L('Eight questions rank your top three from 24 real paddles — each with the reason it fits your style, level, and budget.', '8개 질문으로 24개 실제 패들 중 나에게 맞는 1·2·3위를 추천 이유와 함께 알려 줍니다.'))}</p>
        <span class="tool-feature__go">${esc(L('Find my paddle', '패들 찾기 시작'))} <span aria-hidden="true">→</span></span>
      </a>
    </div>
  </div>
</section>`;
}


function growthLoopSection(loc) {
  const L = (ko, en) => (loc === 'ko' ? ko : en);
  const items = [
    { key: 'level', href: link(loc, 'dupr-self-check/'), tag: L('이번 주 체크', 'Weekly check'), title: L('DUPR 자가진단 다시 해보기', 'Retake the DUPR self-check'), body: L('지난주와 다른 선택이 나오는지 저장해 두면 성장 흐름을 다시 확인할 수 있습니다.', 'Save the result and compare whether your choices changed since the last visit.') },
    { key: 'skill', href: link(loc, 'boards/skill-review/'), tag: L('영상 피드백', 'Feedback loop'), title: L('짧은 랠리 하나를 리뷰하기', 'Review one short rally'), body: L('하이라이트보다 평범한 실수 한 장면이 다음 연습 주제를 더 빨리 알려 줍니다.', 'One ordinary mistake often reveals the next practice topic faster than a highlight.') },
    { key: 'gear', href: link(loc, 'tools/paddle-finder/'), tag: L('장비 점검', 'Gear check'), title: L('내 패들 후보 다시 확인', 'Re-check paddle candidates'), body: L('레벨과 플레이 스타일이 바뀌면 추천 기준도 달라집니다. 결과를 기준 모델과 비교하세요.', 'When your level or style changes, your gear fit may change too. Compare against benchmark models.') },
    { key: 'brief', href: link(loc, 'the-brief/'), tag: L('업데이트', 'Updates'), title: L('더 브리프에서 변화 확인', 'Check The Brief'), body: L('규정·패들·프로투어 변화처럼 다시 확인해야 할 변화를 짧게 훑어보세요.', 'Scan the short update habit for rules, gear, and pro-scene changes worth verifying.') }
  ];
  return `<section class="band band--return-loop"><div class="wrap">
    <div class="section-head"><div><p class="section-eyebrow">${esc(L('재방문 루프', 'Return loop'))}</p><h2 class="band__title">${esc(L('다음 방문 때 다시 확인할 4가지', 'Four reasons to come back'))}</h2><p class="band__intro">${esc(L('Picklary는 한 번 읽고 끝나는 글 목록보다, 레벨 체크·영상 리뷰·장비 비교·업데이트 확인을 반복하는 학습 루프로 설계했습니다.', 'Picklary is designed as a repeatable learning loop: level check, video review, gear comparison, and update scanning.'))}</p></div></div>
    <div class="return-loop-grid">${items.map((x) => `<a class="return-loop-card return-loop-card--${escAttr(x.key)}" href="${x.href}"><span>${esc(x.tag)}</span><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p><strong>${esc(L('열기', 'Open'))} →</strong></a>`).join('')}</div>
  </div></section>`;
}

function blogReturnSection(loc) {
  const L = (ko, en) => (loc === 'ko' ? ko : en);
  const picklaryBase = config.url + link(loc, '');
  const blogIdeas = [
    { title: L('자세한 이야기는 블로그에서', 'Deeper stories on the blogs'), body: L('클럽 게임 후기, 연습 기록, 패들 사용감처럼 천천히 읽기 좋은 글을 블로그에서 확인할 수 있습니다.', 'Read longer club notes, practice reflections, and gear impressions on the blogs.') },
    { title: L('실전 도구는 Picklary에서', 'Practical tools on Picklary'), body: L('자가진단, 레벨 페이지, 패들 파인더, 스킬 리뷰를 통해 읽은 내용을 바로 내 플레이에 적용해 보세요.', 'Use the self-check, level pages, Paddle Finder, and Skill Review to turn what you read into action.') },
    { title: L('새 업데이트도 함께 확인', 'Follow new updates together'), body: L('새 글, 이미지, 경기 결과 요약이 올라오면 블로그와 Picklary에서 함께 확인할 수 있습니다.', 'Follow new guides, visuals, and result summaries across both the blogs and Picklary.') }
  ];
  return `<section class="band band--blog-return"><div class="wrap two-col two-col--wide">
    <div><p class="section-eyebrow">${esc(L('Picklary 더 활용하기', 'Explore more with Picklary'))}</p><h2 class="band__title">${esc(L('블로그와 Picklary를 함께 둘러보기', 'Explore the blogs and Picklary together'))}</h2><p class="band__intro">${esc(L('블로그에서는 피클볼 실력 향상 팁, 장비 리뷰, 최신 업데이트를 자세히 소개하고 있습니다. Picklary에서는 내 실력을 점검하고, 레벨에 맞는 가이드와 도구를 바로 활용할 수 있습니다.', 'The blogs offer deeper pickleball tips, gear notes, and updates. Picklary gives you practical tools, level guides, and comparisons you can use right away.'))}</p><div class="source-buttons"><a class="btn btn--primary" href="${link(loc, 'blogs/')}">${esc(L('피클볼 글 더 보기', 'Read more pickleball posts'))}</a><a class="btn btn--ghost" href="${link(loc, 'dupr-self-check/')}">${esc(L('내 DUPR 레벨 자가진단하기', 'Check my DUPR level'))}</a></div><p class="notice">${esc(L('추천 문구: “내 현재 레벨이 궁금하다면 Picklary DUPR 자가진단으로 간단히 확인해 보세요.”', 'Suggested line: “Curious about your current level? Try the Picklary DUPR self-check.”'))}</p></div>
    <div class="blog-return-list">${blogIdeas.map((x) => `<article><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></article>`).join('')}</div>
  </div></section>`;
}

function nextStepSection(loc, context, data) {
  const L = (ko, en) => (loc === 'ko' ? ko : en);
  data = data || {};
  const base = [
    { href: link(loc, 'pickleball-complete-beginner-guide/'), tag: L('시작점', 'Start here'), title: L('초보 가이드로 돌아가기', 'Open the Beginner Guide'), body: L('처음 온 방문자나 기본기를 다시 잡는 독자가 규칙·레벨·샷·장비 순서로 이동하게 합니다.', 'Give first-time readers a single path through rules, level, shots, and gear.') },
    { href: link(loc, 'dupr-self-check/'), tag: L('레벨', 'Level'), title: L('내 레벨 다시 확인', 'Check your level'), body: L('읽은 내용을 내 경기 상황에 대입해 자가진단 결과와 비교하세요.', 'Turn this page into action by comparing it with your self-check result.') },
    { href: link(loc, 'boards/skill-review/'), tag: L('커뮤니티', 'Community'), title: L('영상으로 피드백 받기', 'Get video feedback'), body: L('짧은 랠리 영상 URL로 샷 선택과 포지셔닝을 점검하세요.', 'Use a short rally video link to check shot choice and positioning.') }
  ];
  if (data.slug === 'pickleball-complete-beginner-guide') base[0] = { href: link(loc, 'tools/paddle-finder/'), tag: L('장비', 'Gear'), title: L('패들 후보 비교', 'Compare paddle fits'), body: L('기본기를 확인했다면 현재 스타일과 레벨에 맞는 패들 후보를 비교하세요.', 'After the starter path, compare paddle candidates matched to your style and level.') };
  if (context === 'level' && data.next) base[1] = { href: levelUrl(loc, data.next), tag: L('다음 레벨', 'Next level'), title: L(`${data.next.id}로 올라가기`, `Move toward ${data.next.id}`), body: L('바로 위 레벨의 기준을 읽고 현재 부족한 기술을 하나만 고르세요.', 'Read the next level and choose one gap to practise first.') };
  if (context === 'gear') base[0] = { href: link(loc, 'how-to-choose-your-first-pickleball-paddle/'), tag: L('가이드', 'Guide'), title: L('패들 선택 기준 읽기', 'Read the paddle selection guide'), body: L('추천 결과를 보기 전에 소재, 두께, 모양, 그립 기준을 먼저 잡으세요.', 'Before choosing a model, understand material, thickness, shape, and grip.') };
  if (context === 'pro') base[0] = { href: link(loc, 'tournaments/results/'), tag: L('결과', 'Results'), title: L('최근 결과로 패턴 보기', 'Study recent results'), body: L('프로 경기 결과를 선수 스타일과 규정 변화까지 함께 연결해 읽으세요.', 'Connect pro results with player style and rule changes.') };
  if (context === 'rules') base[0] = { href: link(loc, 'updates/rules/'), tag: L('규정', 'Rules'), title: L('규정·패들 합법성 확인', 'Check rules and legality'), body: L('대회 전에는 항상 공식 규정과 승인 장비 상태를 다시 확인하세요.', 'Always re-check official rules and approved-equipment status before competing.') };
  const cards = base.map((x) => `<a class="next-step-card" href="${x.href}"><span>${esc(x.tag)}</span><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p><strong>${esc(L('계속 보기', 'Continue'))} →</strong></a>`).join('');
  return `<section class="block next-steps next-steps--${escAttr(context || 'default')}"><h2>${esc(L('다음에 볼 것', 'What to do next'))}</h2><p>${esc(L('이 페이지에서 멈추지 않고 다음 도구·가이드·피드백으로 자연스럽게 이어지도록 설계했습니다.', 'Do not stop on this page — move into the next tool, guide, or feedback step.'))}</p><div class="next-step-grid">${cards}</div></section>`;
}

function gearSeoBridge(loc) {
  const L = (ko, en) => (loc === 'ko' ? ko : en);
  return `<section class="band band--gear-seo"><div class="wrap narrow prose"><h2>${esc(L('장비는 구매가 아니라 문제 해결 순서로 고르세요', 'Choose gear as a problem-solving sequence'))}</h2><p>${esc(L('피클볼 장비는 비싼 제품을 먼저 찾기보다, 현재 경기에서 가장 자주 생기는 문제를 기준으로 좁혀 가는 편이 좋습니다. 미끄러짐은 신발, 패들이 손에서 돌아가는 문제는 그립, 리셋과 딩크가 자주 뜨는 문제는 패들 두께와 스윙 웨이트, 땀 때문에 집중이 깨지는 문제는 의류와 액세서리부터 확인하세요.', 'Pickleball gear decisions work best when they start with the on-court problem. Slipping points to shoes, a twisting paddle points to grip, popped resets and dinks point to core thickness and swing weight, and sweat-related focus issues point to apparel and accessories.'))}</p><p>${esc(L('Picklary의 장비 허브는 제품을 바로 사게 만드는 쇼핑 페이지가 아니라, 독자가 자기 레벨·코트 환경·예산에 맞춰 확인할 기준을 제공하는 편집형 가이드입니다. 패들 파인더 결과도 최종 구매 지시가 아니라 비교 출발점으로 사용하세요.', 'The Gear Lab is not a shopping page designed to push one product. It is an editorial guide that helps readers test choices against level, court conditions, and budget. Treat Paddle Finder results as a comparison starting point, not a purchase command.'))}</p></div></section>`;
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
    { key: 'paddles', title: tt(loc, 'nav.paddles'), body: loc === 'ko' ? '브랜드별 인기 패들의 타입, 가격대, 특성, 사용 선수/라인, 리뷰 신호를 비교합니다.' : 'Compare popular paddles by brand, style, price band, traits, player line, and review signals.', href: link(loc, 'gear/') },
    { key: 'players', title: tt(loc, 'nav.players'), body: loc === 'ko' ? '프로 선수, 메이저 결과, PPA·MLP 규정을 한 곳에서 봅니다.' : 'Browse players, major results, and PPA/MLP rules in one place.', href: link(loc, 'pro-scene/') },
    { key: 'highlights', title: loc === 'ko' ? '스킬 리뷰' : 'Skill Review', body: loc === 'ko' ? '영상 링크를 기준으로 샷 선택, 포지셔닝, 반복 실수에 대한 피드백을 받습니다.' : 'Share a video link and get feedback on shot choice, positioning, and repeatable mistakes.', href: link(loc, 'boards/skill-review/') },
  ].map((x) => `<a class="experience experience--${x.key}" href="${x.href}">
      <span class="experience__icon experience__icon--${x.key}" aria-hidden="true">${experienceIcons[x.key] || ''}</span>
      <h3>${esc(x.title)}</h3><p>${esc(x.body)}</p>
      <span class="experience__go">${esc(loc === 'ko' ? '바로 보기' : 'Explore')} <span aria-hidden="true">→</span></span>
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
        <a class="btn btn--beginner" href="${link(loc, 'pickleball-complete-beginner-guide/')}">${esc(loc === 'ko' ? '초보 가이드 보기' : 'Beginner Guide')}</a>
        <a class="btn btn--primary" href="${link(loc, 'level/')}">${esc(tt(loc, 'hero.ctaPrimary'))}</a>
        <a class="btn btn--ghost" href="${link(loc, 'gear/')}">${esc(tt(loc, 'hero.ctaSecondary'))}</a>
        <a class="btn btn--ghost" href="${link(loc, 'boards/')}">${esc(tt(loc, 'hero.ctaTertiary'))}</a>
      </div>
    </div>
    ${heroLevels(loc)}
  </div>
  <div class="wrap">
    <div class="hero__rail">
      <p class="hero__rail-label">${esc(tt(loc, 'pathway.label'))}</p>
      ${duprRail(loc, { milestones: true })}
      <p class="hero__rail-cta"><a class="btn btn--dupr" href="${link(loc, 'dupr-self-check/')}">${esc(loc === 'ko' ? 'DUPR 자가진단 →' : 'DUPR self-check →')}</a></p>
      ${duprTeaser(loc)}
      <p class="hero__rail-note">${esc(tt(loc, 'pathway.note'))} ${esc(loc === 'ko' ? '레일의 숫자와 아이콘을 눌러 각 레벨의 핵심 내용을 확인하세요.' : 'Tap the numbers and icons on the rail to see the key points for each level.')}</p>
      ${levelQuickSelect(loc)}
    </div>
  </div>
</section>

${toolsFeature(loc)}
${growthLoopSection(loc)}

<section class="band band--alt">
  <div class="wrap">
    <h2 class="band__title">${esc(tt(loc, 'section.experiences'))}</h2>
    <div class="experiences">${experienceCards}</div>
  </div>
</section>



<section class="band band--court">
  <div class="wrap two-col two-col--wide">
    <div>
      <h2 class="band__title">${esc(tt(loc, 'section.highlightBattle'))}</h2>
      <p class="band__intro">${esc(tt(loc, 'highlights.intro'))}</p>
      <a class="btn btn--primary" href="${link(loc, 'boards/skill-review/')}">${esc(loc === 'ko' ? '스킬 리뷰 열기' : 'Open Skill Review')}</a>
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




<section class="band">
  <div class="wrap">
    <h2 class="band__title">${esc(tt(loc, 'section.latest'))}</h2>
    <div class="cards">${latest.map((p) => postCard(p, loc)).join('')}</div>
  </div>
</section>

${blogReturnSection(loc)}

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
    name: config.siteName, url: config.url, description: loc === 'ko' ? tt(loc, 'hero.lead') : config.description,
    inLanguage: loc,
    publisher: { '@type': 'Organization', name: config.siteName, url: config.url },
  }, {
    '@context': 'https://schema.org', '@type': 'Organization',
    name: config.siteName, url: config.url,
    logo: config.url + '/assets/icons/apple-touch-icon.png',
    email: config.email,
    sameAs: ((config.owner && config.owner.social) || []).map((s) => s.url),
    founder: { '@type': 'Person', name: (config.owner && config.owner.name) || config.siteName },
  }];
  return layout({ loc, rel: '', title: (loc === 'ko' ? '피클볼 레벨·DUPR·패들·프로 선수 가이드' : 'Pickleball levels, DUPR, paddles & players'), description: tt(loc, 'hero.lead'), bodyHtml: body, jsonld, bodyClass: 'page-home' });
}

function renderLevelsIndex(loc) {
  const L = (en, ko) => (loc === 'ko' ? ko : en);
  const explainer = `
<section class="band"><div class="wrap narrow">
  <h2>${esc(L('Pickleball levels 2.0 to 5.0: an overview', '피클볼 2.0~5.0 레벨 개요'))}</h2>
  <p>${esc(L('Levels are a useful shorthand for skill, but they are general descriptions, not official cut-offs. The real, portable rating is DUPR, calculated from your logged matches. Use the bands below to orient yourself, then confirm with a self-check and real matches.', '레벨은 실력을 가리키는 유용한 약칭이지만, 공식 기준이 아니라 일반적 설명입니다. 진짜이자 이동 가능한 레이팅은 기록된 경기로 산출되는 DUPR입니다. 아래 구간으로 방향을 잡은 뒤 자가진단과 실제 경기로 확인하세요.'))} <a href="${link(loc, 'what-is-dupr/')}">${esc(L('What is DUPR?', 'DUPR란?'))}</a></p>
  <ul>
    <li>${esc(L('2.0\u20132.5 (beginner): learning the rules, serve, return, and kitchen; rallies are short and consistency is the main gap.', '2.0~2.5 (입문): 규칙·서브·리턴·키친을 배우는 단계; 랠리가 짧고 일관성이 주된 과제.'))}</li>
    <li>${esc(L('3.0 (advanced beginner): dependable serve and return, medium rallies, and getting to the kitchen, but the third-shot drop and dinks are inconsistent under pressure.', '3.0 (고급 입문): 서브·리턴이 믿을 만하고 중간 랠리를 이어가며 키친에 도달하지만, 세 번째 샷 드롭과 딩크가 압박 속에서 들쭉날쭉.'))}</li>
    <li>${esc(L('3.5 (intermediate): a reliable drop, low dinks under pressure, resets, better positioning, and noticeably fewer unforced errors.', '3.5 (중급): 믿을 만한 드롭, 압박 속 낮은 딩크, 리셋, 더 나은 포지셔닝, 눈에 띄게 적은 범실.'))}</li>
    <li>${esc(L('4.0 (advanced): controls pace, mixes drives and drops, stays patient at the kitchen, and targets deliberately.', '4.0 (상급): 템포를 조절하고 드라이브와 드롭을 섞으며, 키친에서 인내하고 의도적으로 공략.'))}</li>
    <li>${esc(L('4.5\u20135.0 (highly skilled): precise, strategic, and consistent under real pressure, with few weaknesses to exploit.', '4.5~5.0 (고숙련): 정밀하고 전략적이며 실전 압박 속에서도 일관되고, 파고들 약점이 거의 없음.'))}</li>
  </ul>

  <h2>${esc(L('3.0 vs 3.5: the difference', '3.0과 3.5의 차이'))}</h2>
  <p>${esc(L('The jump is not about hitting harder; it is about doing the right thing more often. A 3.5 player keeps dinks low under pressure, has a dependable third-shot drop, resets fast balls instead of popping them up, and simply misses less.', '도약은 더 세게 치는 게 아니라 옳은 선택을 더 자주 하는 것입니다. 3.5는 압박 속에서도 딩크를 낮게 유지하고, 믿을 만한 세 번째 샷 드롭을 갖고, 빠른 공을 띄우지 않고 리셋하며, 단지 덜 실수합니다.'))} <a href="${link(loc, 'what-does-a-dupr-3-0-player-look-like/')}">${esc(L('What a 3.0 player looks like', '3.0은 어떤 모습일까'))}</a> · <a href="${link(loc, 'pickleball-3-0-to-3-5-improvement-plan/')}">${esc(L('3.0 to 3.5 plan', '3.0→3.5 플랜'))}</a></p>

  <h2>${esc(L('3.5 vs 4.0: the difference', '3.5와 4.0의 차이'))}</h2>
  <p>${esc(L('At 4.0 the shots are already there; what changes is patience, reliable resets, deliberate targeting, a drop-and-drive mix, and a team plan. The 3.5-to-4.0 jump is mostly about unlearning a few habits.', '4.0에선 샷은 이미 갖춰져 있고, 바뀌는 것은 인내·믿을 만한 리셋·의도적 타깃팅·드롭과 드라이브 혼합·팀 계획입니다. 3.5→4.0 도약은 대부분 몇 가지 습관을 버리는 것입니다.'))} <a href="${link(loc, 'pickleball-3-5-to-4-0-habits-to-fix/')}">${esc(L('3.5 to 4.0: habits to fix', '3.5→4.0: 고쳐야 할 습관'))}</a></p>

  <h2>${esc(L('Common mistakes by level', '레벨별 자주 하는 실수'))}</h2>
  <ul>
    <li>${esc(L('2.5: missing too many serves and returns, and letting rallies end as soon as the ball slows.', '2.5: 서브·리턴을 너무 많이 놓치고, 공이 느려지는 순간 랠리를 끝냄.'))}</li>
    <li>${esc(L('3.0: driving every third shot and hoping, and speeding up balls too early.', '3.0: 모든 세 번째 샷을 드라이브하고 운에 맡기며, 너무 일찍 공을 빠르게 침.'))}</li>
    <li>${esc(L('3.5: popping resets up and hitting predictable, aimless dinks and returns.', '3.5: 리셋을 띄우고, 예측 가능하고 목적 없는 딩크·리턴을 침.'))}</li>
    <li>${esc(L('4.0: freelancing without a team plan and attacking balls that are not truly attackable.', '4.0: 팀 계획 없이 즉흥적으로 하고, 진짜 공격할 수 없는 공을 공격함.'))}</li>
  </ul>

  <h2>${esc(L('Recommended practice by level', '레벨별 추천 연습'))}</h2>
  <ul>
    <li>${esc(L('2.5: groove a dependable serve and return, and a simple routine.', '2.5: 믿을 만한 서브·리턴과 단순한 루틴을 몸에 붙이기.'))} <a href="${link(loc, 'serve-and-return-basics/')}">${esc(L('Serve & return', '서브와 리턴'))}</a> · <a href="${link(loc, 'first-30-days-practice-routine/')}">${esc(L('First 30 days', '첫 30일'))}</a></li>
    <li>${esc(L('3.0: build the third-shot drop and patient dinking.', '3.0: 세 번째 샷 드롭과 인내심 있는 딩크 쌓기.'))} <a href="${link(loc, 'the-third-shot-drop-explained/')}">${esc(L('Third-shot drop', '세 번째 샷 드롭'))}</a> · <a href="${link(loc, 'dinking-fundamentals/')}">${esc(L('Dinking', '딩크'))}</a></li>
    <li>${esc(L('3.5: drill resets under pressure and pair positioning.', '3.5: 압박 속 리셋과 한 쌍 포지셔닝 드릴.'))} <a href="${link(loc, 'doubles-positioning-basics/')}">${esc(L('Doubles positioning', '복식 포지셔닝'))}</a></li>
    <li>${esc(L('4.0: refine targeting, shot selection, and team strategy.', '4.0: 타깃팅·샷 선택·팀 전략 다듬기.'))}</li>
  </ul>

  <p class="level-index-cta"><a class="btn btn--dupr" href="${link(loc, 'dupr-self-check/')}">${esc(L('Not sure where you fit? DUPR self-check →', '내 레벨이 헷갈리나요? DUPR 자가진단 →'))}</a></p>
</div></section>`;
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'level.indexTitle') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(tt(loc, 'pathway.label'))}</p><h1>${esc(tt(loc, 'level.indexTitle'))}</h1><p class="page-head__intro">${esc(tt(loc, 'level.indexIntro'))}</p><p class="level-index-cta"><a class="btn btn--dupr" href="${link(loc, 'dupr-self-check/')}">${esc(loc === 'ko' ? 'DUPR 자가진단 →' : 'DUPR self-check →')}</a></p>${duprTeaser(loc)}</div>
  ${visualFigure(loc, 'duprSimple')}
</div></section>
<section class="band"><div class="wrap">${levelGrid(loc)}</div></section>
<section class="band band--alt"><div class="wrap two-col two-col--wide"><div><h2>DUPR</h2><p>${esc(loc === 'ko' ? 'DUPR가 무엇인지 먼저 이해하면 레벨 선택과 목표 설정이 훨씬 쉬워집니다.' : 'Understanding DUPR first makes level selection and goal setting easier.')}</p><a class="btn btn--dupr btn--dupr-wide" href="${link(loc, 'what-is-dupr/')}">${esc(tt(loc, 'nav.dupr'))}</a></div>${visualFigure(loc, 'duprDashboard')}</div></section>
${explainer}`;
  return layout({ loc, rel: 'level/', title: tt(loc, 'level.indexTitle'), description: tt(loc, 'level.indexIntro'), bodyHtml: body });
}

function levelFaqs(level, loc) {
  const La = (en, ko) => (loc === 'ko' ? ko : en);
  const id = level.id;
  const idx = levels.findIndex((l) => l.slug === level.slug);
  const next = levels[idx + 1];
  const summary = loc1(level, loc, 'summary');
  const skills = localArray(level, loc, 'skills');
  const focus = localArray(level, loc, 'focus');
  const drills = localArray(level, loc, 'drills');
  const n = parseFloat(id);
  const band = n <= 2.5 ? La('a beginner', '입문~초급') : (n <= 3.5 ? La('an intermediate', '중급') : La('an advanced', '고급'));
  const faqs = [];
  faqs.push([
    La(`What does a ${id} pickleball player look like?`, `피클볼 ${id} 레벨은 어느 정도인가요?`),
    `${summary} ` + La(`Typical skills at this level: ${skills.slice(0, 3).join(', ')}.`, `이 레벨의 대표 기술: ${skills.slice(0, 3).join(', ')}.`),
  ]);
  if (next) {
    faqs.push([
      La(`How do I move from ${id} to ${next.id}?`, `${id}에서 ${next.id}로 올라가려면 무엇을 해야 하나요?`),
      La(`To reach ${next.id}, work on: ${focus.slice(0, 2).join('; ')}. A good drill is ${drills[0]}.`, `${next.id}로 올라가려면: ${focus.slice(0, 2).join('; ')}. 추천 드릴: ${drills[0]}.`),
    ]);
  } else {
    faqs.push([
      La(`What separates ${id} from a touring pro?`, `${id}와 프로 선수의 차이는 무엇인가요?`),
      La(`At ${id} the fundamentals are complete; the gap to touring pros is mostly consistency under pressure, hand speed, and shot selection at full pace.`, `${id}에서는 기본기가 완성됩니다. 프로와의 차이는 주로 압박 속 일관성, 손 속도, 풀 스피드에서의 샷 선택입니다.`),
    ]);
  }
  faqs.push([
    La(`Is ${id} a beginner or advanced level?`, `${id}는 초급인가요, 고급인가요?`),
    La(`${id} is generally considered ${band} level on the 2.0–5.0 scale. Note this is a self-assessment guide, not an official DUPR rating.`, `${id}는 2.0~5.0 척도에서 일반적으로 ${band} 수준으로 봅니다. 이는 자가진단 가이드이며 공식 DUPR 등급이 아닙니다.`),
  ]);
  return faqs;
}

const SHOT_ANIM = {
  serve:   { start: [100, 272], path: 'M100,272 Q104,165 80,46',  power: 'medium' },
  return:  { start: [150, 270], path: 'M150,270 Q120,165 100,46', power: 'medium' },
  drive:   { start: [100, 258], path: 'M100,258 Q100,160 100,62', power: 'hard' },
  drop:    { start: [100, 272], path: 'M100,272 Q72,150 100,120', power: 'soft' },
  dink:    { start: [90, 192],  path: 'M90,192 Q100,150 112,120', power: 'soft' },
  reset:   { start: [100, 228], path: 'M100,228 Q96,152 100,128', power: 'soft' },
  volley:  { start: [100, 168], path: 'M100,168 Q104,150 112,134', power: 'medium' },
  putaway: { start: [100, 182], path: 'M100,182 Q112,140 122,96', power: 'hard' },
  speedup: { start: [95, 188],  path: 'M95,188 Q110,150 122,138', power: 'hard' },
  counter: { start: [100, 166], path: 'M100,166 Q104,150 116,138', power: 'hard' },
  roll:    { start: [92, 188],  path: 'M92,188 Q112,150 116,118', power: 'medium' },
  lob:     { start: [95, 188],  path: 'M95,188 Q66,150 106,44',  power: 'soft' },
  erne:    { start: [42, 166],  path: 'M42,166 Q84,138 122,120', power: 'medium' },
  atp:     { start: [34, 256],  path: 'M34,256 Q8,150 64,60',    power: 'medium' }
};
const SHOT_POWER = { soft: { c: '#2f7dd1', dur: '2.4s' }, medium: { c: '#F4B400', dur: '1.7s' }, hard: { c: '#e0552e', dur: '1s' } };
function shotAnimSvg(anim, uid, loc) {
  const a = SHOT_ANIM[anim] || SHOT_ANIM.drive;
  const pw = SHOT_POWER[a.power] || SHOT_POWER.medium;
  const pid = 'shotpath-' + uid;
  const end = a.path.trim().split(/[ ,]+/).slice(-2);
  const ex = end[0], ey = end[1];
  const title = loc === 'ko' ? '공이 움직이는 코트 다이어그램' : 'Animated court diagram of the ball path';
  return `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-label="${escAttr(title)}" class="shot-court">
    <rect x="20" y="20" width="160" height="260" rx="6" fill="#eef5f1" stroke="#1E6F5C" stroke-width="2.5"/>
    <line x1="20" y1="150" x2="180" y2="150" stroke="#14513f" stroke-width="3" stroke-dasharray="7 5"/>
    <line x1="20" y1="110" x2="180" y2="110" stroke="#1E6F5C" stroke-width="1" opacity="0.6"/>
    <line x1="20" y1="190" x2="180" y2="190" stroke="#1E6F5C" stroke-width="1" opacity="0.6"/>
    <line x1="100" y1="20" x2="100" y2="110" stroke="#1E6F5C" stroke-width="1" opacity="0.5"/>
    <line x1="100" y1="190" x2="100" y2="280" stroke="#1E6F5C" stroke-width="1" opacity="0.5"/>
    <path id="${pid}" d="${a.path}" fill="none" stroke="${pw.c}" stroke-width="2.2" stroke-dasharray="4 5" opacity="0.7"/>
    <circle cx="${ex}" cy="${ey}" r="9" fill="none" stroke="${pw.c}" stroke-width="2" opacity="0.8"/>
    <circle cx="${a.start[0]}" cy="${a.start[1]}" r="7" fill="#1E6F5C"/>
    <circle r="5.5" fill="${pw.c}" stroke="#fff" stroke-width="1.5">
      <animateMotion dur="${pw.dur}" repeatCount="indefinite" rotate="0" keyTimes="0;0.82;1" keyPoints="0;1;1" calcMode="linear"><mpath xlink:href="#${pid}"/></animateMotion>
    </circle>
  </svg>`;
}
function levelShots(level, loc) {
  const data = (levelShotsData && levelShotsData[level.slug]) || [];
  if (!data.length) return '';
  const heading = loc === 'ko' ? `레벨 ${level.id} 마스터 샷 4가지` : `Four shots to master at Level ${level.id}`;
  const intro = loc === 'ko'
    ? '샷을 골라 보세요. 오리지널 코트 다이어그램에서 공이 어떻게 움직이는지 보고, 구사법과 효과를 확인할 수 있어요.'
    : 'Pick a shot to see how the ball moves in an original court diagram, plus how to hit it and what it does.';
  const chips = data.map((s, i) => `<button type="button" class="shot-chip${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0 ? 'true' : 'false'}" aria-controls="sp-${level.slug}-${i}" id="sc-${level.slug}-${i}" data-shot-idx="${i}">${esc(loc === 'ko' ? s.nameKo : s.name)}</button>`).join('');
  const panels = data.map((s, i) => {
    const how = loc === 'ko' ? s.howKo : s.how;
    const why = loc === 'ko' ? s.whyKo : s.why;
    const name = loc === 'ko' ? s.nameKo : s.name;
    return `<div class="shot-panel${i === 0 ? '' : ' is-hidden'}" id="sp-${level.slug}-${i}" role="tabpanel" aria-labelledby="sc-${level.slug}-${i}"${i === 0 ? '' : ' hidden'}>
      <div class="shot-anim">${shotAnimSvg(s.anim, level.slug + '-' + i, loc)}</div>
      <div class="shot-text">
        <h3>${esc(name)}</h3>
        <p><strong>${esc(loc === 'ko' ? '구사법' : 'How to hit it')}:</strong> ${esc(how)}</p>
        <p><strong>${esc(loc === 'ko' ? '효과' : 'What it does')}:</strong> ${esc(why)}</p>
      </div>
    </div>`;
  }).join('');
  return `<section class="band band--alt"><div class="wrap">
  <div class="section-head"><div><h2 class="band__title">${esc(heading)}</h2><p class="band__intro">${esc(intro)}</p></div></div>
  <div class="shot-explorer" data-shot-explorer>
    <div class="shot-chips" role="tablist" aria-label="${escAttr(heading)}">${chips}</div>
    <div class="shot-panels">${panels}</div>
  </div>
</div></section>`;
}
function renderLevelPage(level, loc) {
  const related = (level.related || []).map((s) => postBySlug[s]).filter(Boolean);
  const idx = levels.findIndex((l) => l.slug === level.slug);
  const next = levels[idx + 1];
  const title = loc1(level, loc, 'title');
  const faqs = levelFaqs(level, loc);
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'level.indexTitle'), rel: 'level/' }, { name: level.id }])}
<section class="page-head"><div class="wrap">
  <p class="page-head__eyebrow">${esc(tt(loc, 'pathway.label'))}</p>
  <h1>${esc(title)}</h1>
  <p class="page-head__intro">${esc(loc1(level, loc, 'subtitle'))}</p>
  <div class="post-rail"><p class="post-rail__label">${esc(tt(loc, 'label.level'))} ${esc(level.id)}</p>${duprRail(loc, { level: level.id, compact: true })}</div>
  ${levelQuickSelect(loc, level.id, {
    detail: true,
    label: loc === 'ko' ? '다른 레벨도 눌러 보세요' : (loc === 'es' ? 'Explora otros niveles' : 'Compare other levels'),
    lead: loc === 'ko' ? '현재 레벨만 보지 말고 위아래 레벨도 함께 비교해 보세요.' : (loc === 'es' ? 'Compara este nivel con los de arriba y abajo.' : 'Compare this page with the level just below or above it.'),
    hint: loc === 'ko' ? '숫자 버튼을 누르면 해당 레벨 가이드로 바로 이동합니다.' : (loc === 'es' ? 'Toca un botón para abrir esa guía de nivel.' : 'Tap any button to open that level guide.')
  })}
</div></section>
<section class="band"><div class="wrap two-col two-col--wide level-detail">
  <div class="prose">
    <p class="level-lead">${esc(loc1(level, loc, 'summary'))}</p>
    <h2>${esc(tt(loc, 'level.focus'))}</h2><ul>${localArray(level, loc, 'focus').map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2>${esc(tt(loc, 'level.skills'))}</h2>${pills(localArray(level, loc, 'skills'))}
    <h2>${esc(tt(loc, 'level.drills'))}</h2><ul>${localArray(level, loc, 'drills').map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2>${esc(tt(loc, 'level.paddle'))}</h2><p>${esc(loc1(level, loc, 'paddleProfile'))}</p>
    <div class="level-actions"><a class="btn btn--dupr" href="${link(loc, 'dupr-self-check/')}">${esc(loc === 'ko' ? 'DUPR 자가진단 →' : 'DUPR self-check →')}</a><a class="btn btn--ghost" href="${link(loc, 'boards/')}">${esc(tt(loc, 'hero.ctaTertiary'))}</a>${next ? `<a class="btn btn--ghost" href="${levelUrl(loc, next)}">${esc(tt(loc, 'level.next'))}: ${esc(next.id)}</a>` : ''}</div>
    ${duprTeaser(loc)}
  </div>
  ${levelVisual(loc, level)}
</div></section>
${levelShots(level, loc)}
${related.length ? `<section class="band band--alt"><div class="wrap"><h2 class="band__title">${esc(tt(loc, 'level.related'))}</h2><div class="cards">${related.map((p) => postCard(p, loc)).join('')}</div></div></section>` : ''}
<section class="band"><div class="wrap">${nextStepSection(loc, 'level', { next })}</div></section>
<section class="band"><div class="wrap narrow"><div class="prose">
  <h2>${esc(loc === 'ko' ? '자주 묻는 질문' : 'Frequently asked questions')}</h2>
  ${faqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}
</div></div></section>`;
  const seoTitle = title + (loc === 'ko' ? ' — 피클볼 실력 레벨 가이드' : ' — Pickleball skill level guide');
  const canonical = config.url + link(loc, 'level/' + level.slug + '/');
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'Article',
    headline: title, description: loc1(level, loc, 'summary'),
    inLanguage: loc, mainEntityOfPage: canonical,
    author: { '@type': 'Person', name: ownerName(loc) },
    publisher: { '@type': 'Organization', name: config.siteName, logo: { '@type': 'ImageObject', url: config.url + '/assets/icons/apple-touch-icon.png' } },
  }, {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }];
  return layout({ loc, rel: 'level/' + level.slug + '/', title: seoTitle, description: enrichDesc(loc1(level, loc, 'summary'), loc, ' 핵심 스킬, 드릴, 다음 레벨로 올라가는 법을 안내합니다.', ' Key skills, drills, and how to reach the next level.'), jsonld, bodyHtml: body });
}


function gearLabel(loc, key) {
  const dict = {
    ko: {
      nav: '패들/장비',
      hubTitle: '패들/장비 가이드',
      hubIntro: '패들, 신발, 의류, 액세서리를 한눈에 비교하는 Picklary 장비 가이드입니다. 제품을 바로 사게 만드는 페이지가 아니라, 내 레벨·코트 환경·몸 상태에 맞춰 무엇을 확인해야 하는지 정리합니다.',
      hubCta: '패들 기준부터 보기',
      policyNote: 'Picklary의 장비 페이지는 쇼핑몰이 아니라 선택 기준을 정리한 가이드입니다. 가격, 재고, 승인 장비 여부는 바뀔 수 있으므로 제조사·공식 판매처·승인 장비 목록에서 다시 확인하세요.',
      paddles: '패들', balls: '공', shoes: '신발', apparel: '의류', accessories: '액세서리',
      paddlesDesc: '파워보다 먼저 컨트롤, 스위트스폿, 손목 부담을 비교합니다.',
      ballsDesc: '실내·실외 공, Franklin X-40, Dura Fast 40, Selkirk Pro S1, 클럽용 공을 비교합니다.',
      shoesDesc: '미끄러짐, 옆 움직임, 발볼, 쿠션 균형을 먼저 확인합니다.',
      apparelDesc: '땀, 온도, 움직임, 장시간 대기 상황까지 고려합니다.',
      accessoriesDesc: '그립, 리드테이프, 밴드, 클리너처럼 체감이 큰 작은 장비를 봅니다.',
      ballsTitle: '피클볼 공 가이드: 실내·실외와 대표 모델',
      ballsIntro: '공은 랠리 속도, 바운스, 내구성, 소음, 클럽 적응에 바로 영향을 줍니다. 실외용과 실내용 차이, Franklin X-40, Dura Fast 40, Selkirk Pro S1, ONIX Fuse Indoor, 라이프타임 같은 클럽 환경에서 확인할 점을 정리합니다.',
      chooseTitle: '무엇부터 바꾸면 좋을까요?',
      chooseIntro: '장비는 비싼 것부터 사는 것보다, 지금 코트에서 반복되는 문제를 먼저 해결하는 순서가 좋습니다. 미끄러지면 신발, 패들이 돌아가면 그립, 공이 밀리면 패들 밸런스부터 확인하세요.',
      adsenseTitle: '편집 기준',
      adsenseText: 'Picklary의 장비 콘텐츠는 상품 나열보다 선택 기준을 우선합니다. 향후 제휴 링크가 생기더라도 편집 설명, 광고 고지, 공식 확인 안내를 분리해 유지합니다.',
      shoesTitle: '피클볼 신발 고르는 법',
      shoesIntro: '피클볼은 전후좌우 방향 전환이 잦아서 러닝화만으로는 옆 움직임을 충분히 지지하지 못할 수 있습니다. 신발 페이지는 특정 브랜드 추천보다 코트 표면, 발볼, 접지력, 쿠션, 발목 안정성, 내구성을 어떻게 확인할지 설명합니다.',
      apparelTitle: '피클볼 의류 가이드',
      apparelIntro: '의류는 멋보다 움직임과 온도 조절이 먼저입니다. 실내 클럽, 야외 여름 코트, 토너먼트 대기 시간처럼 환경이 달라지면 필요한 원단, 핏, 레이어링도 달라집니다.',
      accessoriesTitle: '피클볼 액세서리 가이드',
      accessoriesIntro: '작은 액세서리는 경기 감각을 크게 바꿀 수 있습니다. 리드테이프는 밸런스와 스윙웨이트, 그립은 손목 부담과 컨트롤, 클리너는 패들 표면 관리에 영향을 줍니다.',
      checklist: '확인 체크리스트',
      nextLinks: '관련 장비 페이지'
    },
    en: {
      nav: 'Gear Lab',
      hubTitle: 'Gear Lab',
      hubIntro: 'A smarter way to choose pickleball gear. Compare paddles, shoes, apparel, and accessories by fit, court conditions, level, and real on-court needs—not by hype alone.',
      hubCta: 'Start with paddle criteria',
      policyNote: 'Picklary is not a store. These pages explain selection criteria. Prices, stock, and approved-equipment status can change, so verify manufacturer pages, official retailers, and approved-equipment lists before buying or competing.',
      paddles: 'Paddles', balls: 'Balls', shoes: 'Shoes', apparel: 'Apparel', accessories: 'Accessories',
      paddlesDesc: 'Compare control, sweet spot, arm comfort, spin, and power fit.',
      ballsDesc: 'Compare indoor/outdoor balls, Franklin X-40, Dura Fast 40, Selkirk Pro S1, and club-use balls.',
      shoesDesc: 'Check traction, lateral support, width, cushioning, and durability.',
      apparelDesc: 'Plan for sweat, movement, heat, indoor courts, and tournament waits.',
      accessoriesDesc: 'Dial in feel with grips, lead tape, bands, cleaners, and small extras.',
      ballsTitle: 'Pickleball ball guide: indoor, outdoor, and popular models',
      ballsIntro: 'The ball changes rally speed, bounce, durability, noise, and how well practice transfers to club play. Compare outdoor and indoor balls, Franklin X-40, Dura Fast 40, Selkirk Pro S1, ONIX Fuse Indoor, and what to check at clubs such as Life Time.',
      chooseTitle: 'What should you change first?',
      chooseIntro: 'Start with the problem you actually feel on court. If you slip, look at shoes. If the paddle twists, check grip. If shots float or feel unstable, review paddle balance before chasing a new purchase.',
      adsenseTitle: 'Editorial standard',
      adsenseText: 'Picklary keeps gear pages educational: criteria first, product claims second. If commercial links are added later, editorial guidance, ad disclosure, and official verification will stay clearly separated.',
      shoesTitle: 'How to choose pickleball shoes',
      shoesIntro: 'Pickleball asks for quick lateral movement, starts, stops, and split steps. This page explains court traction, lateral support, cushioning, width, outsole durability, and when a running shoe is not enough.',
      apparelTitle: 'Pickleball apparel guide',
      apparelIntro: 'Apparel should support movement and temperature control before style. Indoor clubs, outdoor summer courts, and long tournament days require different fabric, fit, and layering choices.',
      accessoriesTitle: 'Pickleball accessories guide',
      accessoriesIntro: 'Small accessories can change feel and comfort. Lead tape affects balance and swing weight, overgrips affect control and arm comfort, and cleaners help maintain paddle surfaces.',
      checklist: 'Fit-check checklist',
      nextLinks: 'Related gear pages'
    },
    es: {
      nav: 'Gear Lab', hubTitle: 'Gear Lab', hubIntro: 'Una guía práctica para palas, zapatillas, ropa y accesorios de pickleball.', hubCta: 'Comparar palas', policyNote: 'Picklary no es una tienda. Verifica fuentes oficiales antes de comprar.', paddles: 'Palas', balls: 'Pelotas', shoes: 'Zapatillas', apparel: 'Ropa', accessories: 'Accesorios', paddlesDesc: 'Compara material, forma y control.', ballsDesc: 'Compara pelotas indoor/outdoor y modelos populares.', shoesDesc: 'Tracción, soporte lateral y comodidad.', apparelDesc: 'Movimiento, calor y capas.', accessoriesDesc: 'Cinta de plomo, grips, bandas y limpiadores.', ballsTitle: 'Guía de pelotas de pickleball', ballsIntro: 'Compara pelotas indoor/outdoor y modelos populares antes de comprar.', chooseTitle: 'Qué elegir primero', chooseIntro: 'Primero seguridad y ajuste; después rendimiento.', adsenseTitle: 'Criterio editorial', adsenseText: 'Estas páginas explican criterios, no son una tienda.', shoesTitle: 'Cómo elegir zapatillas de pickleball', shoesIntro: 'Evalúa tracción, soporte lateral, amortiguación y durabilidad.', apparelTitle: 'Guía de ropa para pickleball', apparelIntro: 'La ropa debe ayudar al movimiento y al control de temperatura.', accessoriesTitle: 'Guía de accesorios de pickleball', accessoriesIntro: 'Los accesorios pequeños cambian el tacto, la comodidad y el mantenimiento.', checklist: 'Lista antes de comprar', nextLinks: 'Páginas relacionadas'
    }
  };
  return (dict[loc] || dict.en)[key] || key;
}

const GEAR_ITEMS = [
  { key: 'paddles', href: 'paddles/' },
  { key: 'balls', href: 'gear/balls/' },
  { key: 'shoes', href: 'gear/shoes/' },
  { key: 'apparel', href: 'gear/apparel/' },
  { key: 'accessories', href: 'gear/accessories/' },
];
function gearIcon(key) {
  const icons = {
    paddles: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M15 6c6-4 16 6 13 13L16 42c-1 2-4 1-5-1s-1-4 1-5l13-21c1-3-5-9-8-7L7 14c-2 1-4-1-3-3z" fill="currentColor" opacity=".92"/><circle cx="34" cy="13" r="6" fill="none" stroke="currentColor" stroke-width="3"/></svg>',
    balls: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="17" fill="currentColor" opacity=".94"/><circle cx="16" cy="18" r="2.2" fill="#fff" opacity=".86"/><circle cx="25" cy="14" r="2" fill="#fff" opacity=".72"/><circle cx="33" cy="21" r="2.2" fill="#fff" opacity=".82"/><circle cx="19" cy="29" r="2" fill="#fff" opacity=".78"/><circle cx="29" cy="32" r="2.1" fill="#fff" opacity=".8"/></svg>',
    shoes: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 30c5 1 10-1 14-6l5-7c3 4 7 8 13 10 3 1 5 4 4 8H7c-2 0-3-3-1-5z" fill="currentColor" opacity=".94"/><path d="M11 34h29M25 25l6 3M21 29l6 3" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".82"/></svg>',
    apparel: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M17 7l7 4 7-4 10 7-6 8-3-2v21H16V20l-3 2-6-8z" fill="currentColor" opacity=".94"/><path d="M18 8c1 5 11 5 12 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".75"/></svg>',
    accessories: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="10" width="32" height="9" rx="4.5" fill="currentColor" opacity=".92"/><rect x="13" y="24" width="22" height="14" rx="5" fill="currentColor" opacity=".72"/><path d="M16 31h16M20 16h8" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".82"/></svg>'
  };
  return icons[key] || icons.paddles;
}
function gearItemDesc(loc, key) { return gearLabel(loc, key + 'Desc'); }
function gearVisualFigure(loc, topic) {
  const srcMap = { paddles: 'paddle-ratings.svg', balls: 'gear-balls.svg', shoes: 'gear-shoes.svg', apparel: 'gear-apparel.svg', accessories: 'gear-accessories.svg', lab: 'gear-lab-dashboard-design.webp' };
  const src = srcMap[topic] || srcMap.lab;
  const title = topic === 'lab' ? gearLabel(loc, 'hubTitle') : gearLabel(loc, topic);
  const caption = loc === 'ko'
    ? `${title} 선택 기준 시각화`
    : `${title} selection criteria visual`;
  const dims = svgDims(src) || (topic === 'lab' ? ' width="1200" height="900"' : '');
  return `<figure class="visual-card visual-card--article gear-visual gear-visual--${escAttr(topic)}"><img src="/assets/img/${escAttr(src)}"${dims} alt="${escAttr(caption)}" loading="lazy"><figcaption>${esc(caption)}</figcaption></figure>`;
}
function gearCards(loc, opts) {
  opts = opts || {};
  const exclude = opts.exclude || '';
  const compact = !!opts.compact;
  const items = GEAR_ITEMS.filter((x) => x.key !== exclude);
  const open = loc === 'ko' ? '자세히 보기' : loc === 'es' ? 'Ver más' : 'Open guide';
  return items.map((c) => `<article class="card gear-card gear-card--${escAttr(c.key)}${compact ? ' gear-card--compact' : ''}">
    <div class="gear-card__icon gear-card__icon--${escAttr(c.key)}">${gearIcon(c.key)}</div>
    <h2 class="card__title"><a href="${link(loc, c.href)}">${esc(gearLabel(loc, c.key))}</a></h2>
    <p>${esc(gearItemDesc(loc, c.key))}</p>
    <p><a class="link-more" href="${link(loc, c.href)}">${esc(open)} →</a></p>
  </article>`).join('');
}
function gearRelatedNav(loc, currentKey) {
  const label = loc === 'ko' ? '다른 장비 가이드' : loc === 'es' ? 'Otras guías' : 'Other gear guides';
  const note = loc === 'ko'
    ? '현재 페이지를 먼저 읽고, 필요한 항목만 옆에서 빠르게 이동하세요.'
    : 'Read this page first, then jump to the related gear guide you need.';
  const links = GEAR_ITEMS.filter((x) => x.key !== currentKey).map((x) => `<a class="gear-related__link gear-related__link--${escAttr(x.key)}" href="${link(loc, x.href)}"><span class="gear-related__icon">${gearIcon(x.key)}</span><span><strong>${esc(gearLabel(loc, x.key))}</strong><small>${esc(gearItemDesc(loc, x.key))}</small></span></a>`).join('');
  return `<aside class="gear-related" aria-label="${escAttr(label)}"><h2>${esc(label)}</h2><p>${esc(note)}</p><div class="gear-related__links">${links}</div></aside>`;
}



function gearRealExamples(loc, topic) {
  const L = (ko, en) => (loc === 'ko' ? ko : en);
  const examples = {
    balls: [
      {
        name: 'Franklin X-40',
        tag: L('대표 실외공', 'Outdoor benchmark'),
        body: L('야외 오픈플레이와 대회 준비에서 가장 자주 비교되는 공입니다. 속도·바운스 기준을 잡기 좋습니다.', 'A common outdoor benchmark for open play and event preparation. Useful for learning the speed and bounce many players expect.')
      },
      {
        name: 'Dura Fast 40',
        tag: L('빠른 실외공', 'Fast outdoor feel'),
        body: L('더 단단하고 빠른 느낌을 선호하는 경쟁 플레이어가 비교할 만합니다. 초보자에게는 빠르게 느껴질 수 있습니다.', 'A firmer, faster outdoor comparison point. It can feel quick for beginners, but it is useful for competitive-speed practice.')
      },
      {
        name: 'Selkirk Pro S1',
        tag: L('프리미엄 실외공', 'Premium outdoor candidate'),
        body: L('내구성·일관성·38홀 설계로 알려진 후보입니다. 가격과 현재 승인 상태는 구매 전 확인하세요.', 'A premium outdoor candidate associated with durability, consistency, and a 38-hole design. Verify current price and eligibility before buying.')
      },
      {
        name: 'ONIX Fuse Indoor',
        tag: L('실내용 후보', 'Indoor candidate'),
        body: L('실내 체육관·스포츠코트에서 부드러운 바운스와 컨트롤을 비교할 때 확인할 만한 공입니다.', 'A useful indoor candidate when comparing softer bounce and controlled feel on gym or sport-court surfaces.')
      },
      {
        name: L('클럽 제공 공', 'Club-provided ball'),
        tag: L('라이프타임·로컬클럽', 'Life Time / local clubs'),
        body: L('클럽 지점마다 제공 공이 다를 수 있습니다. 자주 치는 장소에서 실제 쓰는 공을 확인하고 같은 공으로 연습하세요.', 'Club locations can vary. Check the exact ball your location uses and practise with that model when possible.')
      }
    ],
    shoes: [
      {
        name: 'Wilson Pickle Pro',
        tag: L('피클볼 전용 후보', 'Pickleball-specific candidate'),
        body: L('측면 지지력과 코트 움직임을 기준으로 비교할 만한 피클볼화 후보입니다.', 'A pickleball-specific option to compare for lateral support and court movement.')
      },
      {
        name: 'Babolat Jet Mach 4',
        tag: L('빠른 움직임', 'Fast movement'),
        body: L('가벼운 코트 움직임과 반응성을 중요하게 보는 플레이어가 비교할 만합니다.', 'A court-shoe candidate for players who value lighter movement and responsiveness.')
      },
      {
        name: 'ASICS Solution Speed FF',
        tag: L('테니스화 기반', 'Tennis-court base'),
        body: L('테니스화 기반의 빠른 방향 전환과 접지력을 비교할 때 참고하기 좋습니다.', 'A tennis-court reference point for quick cuts and traction.')
      },
      {
        name: 'ON Roger Clubhouse Pro',
        tag: L('클럽용 편안함', 'Club comfort'),
        body: L('긴 클럽 세션에서 편안함과 코트 안정성을 함께 확인할 후보입니다.', 'A candidate to compare when comfort across long club sessions matters.')
      }
    ],
    apparel: [
      { name: L('땀 배출 셔츠', 'Moisture-wicking shirt'), tag: L('기본', 'Core'), body: L('면 티셔츠보다 땀이 빨리 마르는 소재가 후반 집중력에 유리합니다.', 'Fabric that dries faster than cotton helps maintain comfort and focus late in play.') },
      { name: L('주머니 있는 쇼츠·스커트', 'Shorts or skirt with pockets'), tag: L('실전 편의', 'Practical'), body: L('공을 보관하거나 교대 중 빠르게 움직일 수 있어 오픈플레이에서 편합니다.', 'Useful for holding balls and moving quickly during open play.') },
      { name: L('UPF 긴팔·모자·바이저', 'UPF layer, hat, or visor'), tag: L('야외', 'Outdoor'), body: L('야외 코트에서는 자외선, 눈부심, 열 관리를 장비처럼 생각하세요.', 'For outdoor courts, treat sun, glare, and heat management as part of your gear system.') },
      { name: L('여벌 양말·셔츠', 'Extra socks and shirts'), tag: L('대회·장시간', 'Tournament / long session'), body: L('젖은 옷으로 오래 대기하면 몸이 식고 집중력이 떨어질 수 있습니다.', 'Waiting in wet clothing can cool you down and hurt concentration.') }
    ],
    accessories: [
      { name: L('오버그립', 'Overgrips'), tag: L('가성비 체감', 'High-value feel'), body: L('땀, 손 크기, 패들 회전을 가장 저렴하게 개선할 수 있는 후보입니다.', 'Often the cheapest way to improve sweat control, grip size, and paddle twisting.') },
      { name: L('보호안경', 'Eye protection'), tag: L('안전', 'Safety'), body: L('키친 앞 핸드배틀과 파트너 디플렉션이 많은 환경에서는 우선순위가 높습니다.', 'High priority around kitchen hand battles, partner deflections, and crowded club play.') },
      { name: L('손목밴드·타월', 'Wristbands and towel'), tag: L('땀 관리', 'Sweat control'), body: L('그립 젖음과 눈에 들어가는 땀을 줄이는 작은 장비입니다.', 'Small items that reduce grip moisture and sweat in the eyes.') },
      { name: L('패들·신발 분리 가방', 'Bag with shoe/paddle separation'), tag: L('클럽 이동', 'Club carry'), body: L('패들 보호, 신발 분리, 물병, 수건, 여벌 의류를 한 번에 넣을 수 있는지 확인하세요.', 'Check whether it actually carries paddles, shoes, water, towel, and spare clothing.') }
    ]
  };
  const items = examples[topic] || [];
  if (!items.length) return '';
  const titleMap = {
    balls: L('대표 공 후보와 실제 사용 기준', 'Popular ball candidates and real-use criteria'),
    shoes: L('실제 비교해 볼 만한 신발 후보', 'Shoe candidates worth comparing'),
    apparel: L('사용자가 자주 찾는 의류군', 'Apparel categories players actually use'),
    accessories: L('체감이 큰 액세서리 후보', 'Accessories with noticeable impact')
  };
  const noteMap = {
    balls: L('공은 “가장 좋은 공”보다 내가 치는 코트와 클럽에서 실제 쓰는 공에 맞추는 것이 중요합니다.', 'For balls, matching the court and club you actually play at matters more than finding one universal best ball.'),
    shoes: L('신발은 제품명보다 발볼, 뒤꿈치 고정, 코트 표면, 측면 지지력이 우선입니다.', 'For shoes, width, heel lockdown, court surface, and lateral support matter more than the model name.'),
    apparel: L('의류는 브랜드보다 땀·열·움직임·대기 시간을 해결하는지가 핵심입니다.', 'For apparel, solve sweat, heat, movement, and waiting time before focusing on brand.'),
    accessories: L('액세서리는 저렴하지만 경기 감각을 크게 바꿀 수 있으므로 작은 단위로 테스트하세요.', 'Accessories are inexpensive but can change feel a lot, so test them in small steps.')
  };
  const cards = items.map((x) => `<article class="gear-example-card"><span>${esc(x.tag)}</span><h3>${esc(x.name)}</h3><p>${esc(x.body)}</p></article>`).join('');
  return `<section class="gear-examples"><h2>${esc(titleMap[topic] || L('실제 제품군 예시', 'Real product examples'))}</h2><p>${esc(noteMap[topic] || '')}</p><div class="gear-example-grid">${cards}</div><p class="notice">${esc(L('제품 가격, 승인 상태, 재고, 클럽 제공 모델은 바뀔 수 있으므로 구매·대회 사용 전 공식 출처에서 다시 확인하세요.', 'Prices, approval status, stock, and club-provided models can change, so verify at official sources before buying or using in competition.'))}</p></section>`;
}

function renderGearIndex(loc) {
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: gearLabel(loc, 'hubTitle') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(gearLabel(loc, 'nav'))}</p><h1>${esc(gearLabel(loc, 'hubTitle'))}</h1><p class="page-head__intro">${esc(gearLabel(loc, 'hubIntro'))}</p><div class="hero-actions"><a class="btn btn--primary" href="${link(loc, 'tools/paddle-finder/')}">${esc(loc === 'ko' ? '패들 파인더' : 'Paddle Finder')}</a><a class="btn btn--ghost" href="${link(loc, 'paddles/')}">${esc(gearLabel(loc, 'hubCta'))}</a></div></div>
  ${gearVisualFigure(loc, 'lab')}
</div></section>
<section class="band"><div class="wrap"><div class="cards gear-cards">${gearCards(loc)}</div><p class="notice">${esc(gearLabel(loc, 'policyNote'))}</p></div></section>
${gearSeoBridge(loc)}
<section class="band band--alt"><div class="wrap two-col two-col--wide"><div class="prose"><h2>${esc(gearLabel(loc, 'chooseTitle'))}</h2><p>${esc(gearLabel(loc, 'chooseIntro'))}</p><ul><li>${esc(loc === 'ko' ? '처음 시작한다면 미끄러지지 않는 코트화와 편한 그립부터 확인하세요.' : 'If you are new, start with court shoes and a comfortable grip before chasing expensive upgrades.')}</li><li>${esc(loc === 'ko' ? '패들은 파워보다 컨트롤, 스위트스폿, 손목 부담을 함께 봐야 합니다.' : 'For paddles, compare control, sweet spot, and arm comfort—not just power.')}</li><li>${esc(loc === 'ko' ? '리드테이프와 그립은 작지만 밸런스와 손맛을 크게 바꿀 수 있습니다.' : 'Lead tape and grips are small changes that can noticeably change balance and feel.')}</li></ul></div><div class="prose"><h2>${esc(gearLabel(loc, 'adsenseTitle'))}</h2><p>${esc(gearLabel(loc, 'adsenseText'))}</p></div></div></section>
${adsenseDepthBlock(loc, 'gear')}`;
  return layout({ loc, rel: 'gear/', title: gearLabel(loc, 'hubTitle'), description: gearLabel(loc, 'hubIntro'), bodyHtml: body });
}

function gearTopicData(loc, topic) {
  const ko = loc === 'ko';
  const commonNotice = ko
    ? '이 페이지는 특정 상품 구매를 유도하지 않고, 코트 환경과 플레이 스타일에 맞춰 확인할 기준을 정리합니다. 실제 가격, 재고, 사이즈, 승인 여부는 판매처와 공식 출처에서 다시 확인하세요.'
    : 'This page focuses on fit and verification criteria rather than pushing a product. Verify price, stock, sizing, and eligibility at the original source before purchasing.';
  const data = {
    balls: {
      title: gearLabel(loc, 'ballsTitle'), intro: gearLabel(loc, 'ballsIntro'), visual: 'balls',
      checklist: ko ? [
        '실외 야외 코트에서는 바람과 거친 표면을 고려해 더 단단하고 구멍이 작은 공을 우선 확인합니다.',
        '실내 체육관이나 목재/스포츠 코트에서는 바운스가 부드럽고 컨트롤이 쉬운 실내용 공이 더 편할 수 있습니다.',
        '대회나 리그를 준비한다면 실제 사용하는 공과 같은 모델로 연습해야 속도와 바운스 적응이 빠릅니다.',
        'Franklin X-40은 야외 경기와 클럽에서 가장 자주 언급되는 대표 실외공 후보입니다.',
        'Dura Fast 40은 빠르고 단단한 느낌을 선호하는 경쟁 플레이어가 비교할 만한 실외공입니다.',
        'Selkirk Pro S1은 내구성, 일관성, 38홀 설계로 알려진 프리미엄 실외공 후보입니다.',
        'ONIX Fuse Indoor는 실내용 공 후보로, 실내 코트에서 부드러운 감각과 컨트롤을 비교할 때 확인할 만합니다.',
        '라이프타임 같은 클럽에서는 지점마다 제공 공이 다를 수 있으므로, 실제 플레이하는 클럽에서 쓰는 공을 확인한 뒤 같은 공으로 연습하는 것이 가장 현실적입니다.'
      ] : [
        'For outdoor hard courts, prioritize a firmer ball that handles wind and rougher surfaces.',
        'For indoor gyms or sport courts, an indoor ball can feel softer, easier to control, and less harsh off the paddle.',
        'If you are preparing for league or tournament play, practise with the same ball the event or club actually uses.',
        'Franklin X-40 is one of the most commonly referenced outdoor balls and a practical benchmark for many players.',
        'Dura Fast 40 is a firmer, faster outdoor comparison point for players who like a quicker ball.',
        'Selkirk Pro S1 is a premium outdoor candidate known for durability, consistency, and a 38-hole design.',
        'ONIX Fuse Indoor is a useful indoor candidate when comparing softer feel and controlled bounce.',
        'For clubs such as Life Time, the most useful answer is local: check what your location provides, then practise with that exact ball when possible.'
      ],
      questions: ko ? [
        ['실내공과 실외공은 꼭 다르게 써야 하나요?', '자주 치는 코트가 다르면 다르게 쓰는 편이 좋습니다. 실외공은 바람과 거친 표면, 실내공은 부드러운 바운스와 컨트롤을 기준으로 비교하세요.'],
        ['초보자는 어떤 공을 사면 좋나요?', '주로 치는 장소에서 쓰는 공을 기준으로 시작하세요. 야외 오픈플레이가 많다면 Franklin X-40 같은 대표 실외공, 실내 클럽이 많다면 ONIX Fuse Indoor 같은 실내용 후보를 비교하면 됩니다.'],
        ['라이프타임에서 쓰는 공을 꼭 따라 사야 하나요?', '항상 그럴 필요는 없지만, 해당 클럽에서 자주 친다면 같은 공으로 연습하는 것이 바운스와 속도 적응에 가장 빠릅니다. 지점마다 다를 수 있으니 현장 제공 공을 확인하세요.']
      ] : [
        ['Do indoor and outdoor balls really matter?', 'Yes, if you play both surfaces often. Outdoor balls are selected for wind and rough courts; indoor balls usually emphasize softer bounce and control.'],
        ['What ball should a beginner buy first?', 'Start with the ball used where you actually play. Outdoor open play often points to a benchmark like Franklin X-40; indoor club play points to an indoor option such as ONIX Fuse Indoor.'],
        ['Should I copy the ball used at Life Time or another club?', 'If you play there often, yes. The fastest way to adapt is to practise with the same ball your local club provides, but confirm the model at your location.']
      ],
      note: commonNotice
    },
    shoes: {
      title: gearLabel(loc, 'shoesTitle'), intro: gearLabel(loc, 'shoesIntro'), visual: 'shoes',
      checklist: ko ? [
        '러닝화가 아니라 코트화 또는 테니스/피클볼용 신발인지 먼저 확인합니다. 옆 움직임을 지지하는 구조가 중요합니다.',
        '실내 목재/스포츠 코트, 야외 아스팔트/하드코트 등 코트 표면에 맞는 밑창 패턴을 확인합니다.',
        '급정지 후 발이 신발 안에서 밀리지 않는지 봅니다. 앞코 여유는 필요하지만 발 전체가 흔들리면 안 됩니다.',
        '발볼이 넓다면 와이드 옵션을 우선 확인합니다. 발볼이 좁으면 끈 조임과 뒤꿈치 고정이 더 중요합니다.',
        '쿠션은 푹신함만 보지 말고 낮은 자세에서 균형이 무너지지 않는지 확인합니다.',
        '오른손잡이 기준 오른쪽 바깥쪽 밑창이 빨리 닳는지 확인하면 내구성 판단에 도움이 됩니다.',
        '발목을 자주 삐는 편이라면 높은 쿠션보다 측면 안정성과 뒤꿈치 고정이 우선입니다.',
        '토너먼트용이라면 장시간 대기와 여러 경기 후에도 발바닥 열감이 심하지 않은지 봅니다.'
      ] : [
        'Start with court shoes, tennis shoes, or pickleball shoes rather than running shoes. Lateral support matters more than straight-line cushioning.',
        'Match the outsole to the surface: indoor sport courts, outdoor hard courts, and dusty community courts can feel very different.',
        'Check whether your foot slides inside the shoe during hard stops. Toe room is useful, but the midfoot should not float.',
        'If you have wide feet, try wide sizing before simply sizing up. If you have narrow feet, heel lockdown matters more.',
        'Cushioning should not make you feel unstable in a low ready position.',
        'Watch outsole wear on your dominant-side outside edge; it tells you whether the shoe can handle your movement pattern.',
        'If you roll ankles often, prioritize lateral stability and heel lockdown over a tall, soft platform.',
        'For tournaments, think about heat, fatigue, and comfort across multiple matches, not only the first game.'
      ],
      questions: ko ? [
        ['러닝화로 쳐도 되나요?', '가벼운 입문 단계에서는 가능할 수 있지만, 방향 전환이 잦아질수록 옆 움직임 지지가 부족할 수 있습니다. 미끄러짐이나 발목 불안정이 느껴지면 코트화로 바꾸는 것이 좋습니다.'],
        ['쿠션이 많을수록 좋은가요?', '무릎과 발바닥 피로에는 도움이 될 수 있지만, 너무 높은 쿠션은 좌우 움직임에서 흔들림을 만들 수 있습니다. 안정성과 쿠션의 균형을 보세요.'],
        ['실내용과 야외용을 따로 둬야 하나요?', '자주 치는 코트가 다르면 따로 두는 편이 밑창 수명과 접지 유지에 좋습니다. 먼지가 많은 실내 코트는 밑창 관리도 중요합니다.']
      ] : [
        ['Can I play in running shoes?', 'At a casual beginner level, sometimes. As your movement gets faster, running shoes may lack lateral support. If you slip or feel ankle instability, move to court shoes.'],
        ['Is more cushioning always better?', 'Not always. Cushioning can reduce fatigue, but a tall soft platform may feel unstable during lateral moves. Balance comfort with stability.'],
        ['Should I separate indoor and outdoor shoes?', 'If you play often on different surfaces, yes. It can preserve traction and outsole life, especially on dusty indoor courts or rough outdoor courts.']
      ],
      note: commonNotice
    },
    apparel: {
      title: gearLabel(loc, 'apparelTitle'), intro: gearLabel(loc, 'apparelIntro'), visual: 'apparel',
      checklist: ko ? [
        '어깨 회전, 백핸드 리셋, 오버헤드 동작에서 소매와 겨드랑이가 당기지 않는지 확인합니다.',
        '면 소재만 입으면 땀이 마르지 않아 경기 후반 집중력이 떨어질 수 있습니다. 땀 배출 소재를 우선 보세요.',
        '야외 코트에서는 자외선 차단, 통풍, 모자/바이저와의 조합이 중요합니다.',
        '실내 클럽은 에어컨과 대기 시간 때문에 얇은 레이어를 준비하면 좋습니다.',
        '하의는 낮은 자세와 런지에서 허리선과 밑단이 불편하지 않아야 합니다.',
        '양말은 쿠션, 땀 흡수, 미끄럼 방지에 영향을 줍니다. 신발보다 먼저 양말을 바꿔도 체감이 큽니다.',
        '대회 날에는 여벌 셔츠, 양말, 수건을 경기 수보다 넉넉히 준비하세요.',
        '어두운 실내 코트나 저녁 야외 코트에서는 공과 배경 대비를 방해하지 않는 색도 고려합니다.'
      ] : [
        'Check shoulder rotation, backhand resets, and overheads; sleeves should not pull or restrict movement.',
        'Cotton can hold sweat and feel heavy late in a session. Moisture-management fabric is usually more practical.',
        'For outdoor courts, think about sun protection, airflow, hats or visors, and heat build-up.',
        'For indoor clubs, a light layer helps during air-conditioned waiting periods between games.',
        'Shorts, skirts, and pants should stay comfortable in a low stance and during lunges.',
        'Socks affect cushioning, moisture, and slip inside the shoe. Sometimes changing socks is the cheapest comfort upgrade.',
        'For tournaments, pack extra shirts, socks, and towels based on match count and waiting time.',
        'On darker indoor courts or evening outdoor courts, avoid colors that make the ball harder for partners to track.'
      ],
      questions: ko ? [
        ['비싼 기능성 의류가 꼭 필요한가요?', '꼭 그렇지는 않습니다. 중요한 것은 땀 배출, 움직임, 온도 조절입니다. 저렴해도 이 세 가지가 맞으면 충분합니다.'],
        ['대회 때 가장 많이 후회하는 준비물은?', '여벌 양말과 셔츠입니다. 땀에 젖은 상태로 오래 대기하면 몸이 식고 집중력이 떨어질 수 있습니다.'],
        ['야외에서는 어떤 의류가 좋나요?', '통풍, 자외선 차단, 모자/바이저와의 조합을 보세요. 너무 두꺼운 소재는 초반보다 경기 후반에 부담이 됩니다.']
      ] : [
        ['Do I need expensive performance apparel?', 'No. Focus on sweat management, movement, and temperature control. A simple item that does those three well is enough.'],
        ['What do tournament players often forget?', 'Extra socks and shirts. Long waits in wet clothing can cool you down and hurt concentration.'],
        ['What matters most outdoors?', 'Airflow, sun protection, and hat or visor compatibility. Heavy fabric often feels worse late in the day.']
      ],
      note: commonNotice
    },
    accessories: {
      title: gearLabel(loc, 'accessoriesTitle'), intro: gearLabel(loc, 'accessoriesIntro'), visual: 'accessories',
      checklist: ko ? [
        '리드테이프는 한 번에 많이 붙이지 말고 1~2g 단위로 작게 테스트합니다.',
        '3시/9시 방향은 안정성, 12시 방향은 파워와 스윙웨이트, 목 부분은 밸런스 변화가 상대적으로 부드럽습니다.',
        '오버그립은 손 크기, 땀, 회전 방지, 손목 부담을 함께 봅니다. 두껍게 감으면 컨트롤은 편해질 수 있지만 손목 각도는 달라집니다.',
        '그립이 젖어 패들이 돌아간다면 패들 교체보다 오버그립 교체 주기를 먼저 점검하세요.',
        '헤드밴드와 손목밴드는 단순 장식이 아니라 땀이 눈과 그립으로 흐르는 것을 줄이는 장비입니다.',
        '보호안경은 파트너 네트 앞 교전, 빠른 핸드배틀, 실내 클럽에서 특히 고려할 만합니다.',
        '패들 클리너는 표면 재질에 맞게 사용하고, 강한 세정제나 과한 마찰은 피하세요.',
        '가방은 패들 보호, 신발 분리, 물병, 수건, 여벌 의류를 실제로 넣어 보고 고르는 것이 좋습니다.'
      ] : [
        'Test lead tape slowly, often in 1–2 gram steps. Small changes can be very noticeable.',
        '3 and 9 o’clock usually add stability; 12 o’clock adds power and swing weight; the throat area changes balance more gently.',
        'Overgrips affect hand size, sweat control, paddle twisting, and wrist comfort. Too much thickness can change your wrist angle.',
        'If your paddle twists when sweaty, check overgrip type and replacement timing before replacing the paddle.',
        'Headbands and wristbands are not just style; they keep sweat out of your eyes and grip hand.',
        'Eye protection is worth considering for fast hand battles, crowded club play, and partner deflections at the kitchen.',
        'Use cleaners that match the paddle face material, and avoid harsh chemicals or aggressive scrubbing.',
        'Choose a bag by actually loading paddles, shoes, water, towels, and extra clothes—not by looks alone.'
      ],
      questions: ko ? [
        ['리드테이프는 초보자도 써도 되나요?', '가능하지만 먼저 기본 타점과 그립을 안정시키는 것이 우선입니다. 붙인다면 아주 소량으로 시작하고 손목 부담을 확인하세요.'],
        ['오버그립은 얼마나 자주 바꾸나요?', '땀, 사용 빈도, 미끄러짐에 따라 다릅니다. 패들이 손 안에서 돌아가거나 표면이 번들거리면 교체 신호입니다.'],
        ['패들 클리너를 쓰면 스핀이 살아나나요?', '먼지와 잔여물을 줄이면 표면 감각이 회복될 수 있습니다. 다만 마모된 표면을 새것처럼 되돌리지는 못합니다.']
      ] : [
        ['Should beginners use lead tape?', 'They can, but basic contact and grip comfort should come first. If you test it, start very small and monitor wrist load.'],
        ['How often should I replace an overgrip?', 'It depends on sweat and play frequency. If the paddle twists, feels slick, or looks glossy, it is time.'],
        ['Can paddle cleaner restore spin?', 'It can remove dust and residue, which may improve feel. It will not make a worn face new again.']
      ],
      note: commonNotice
    }
  };
  return data[topic] || data.shoes;
}

function renderGearTopicPage(loc, topic) {
  const data = gearTopicData(loc, topic);
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: gearLabel(loc, 'hubTitle'), rel: 'gear/' }, { name: data.title }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide"><div><p class="page-head__eyebrow">${esc(topic === 'paddles' ? (loc === 'ko' ? '패들' : 'Paddles') : gearLabel(loc, topic))}</p><h1>${esc(data.title)}</h1><p class="page-head__intro">${esc(data.intro)}</p></div>${gearVisualFigure(loc, data.visual)}</div></section>
<section class="band"><div class="wrap gear-page-layout"><div class="prose"><h2>${esc(gearLabel(loc, 'checklist'))}</h2><ul>${data.checklist.map((p) => `<li>${esc(p)}</li>`).join('')}</ul><p>${esc(data.note)}</p>${gearRealExamples(loc, topic)}<h2>${esc(loc === 'ko' ? '사용자가 자주 궁금해하는 점' : 'Common questions players ask')}</h2>${data.questions.map(([q,a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}<h2>${esc(loc === 'ko' ? '어떤 순서로 확인할까요?' : 'How to use this guide')}</h2><p>${esc(loc === 'ko' ? '장비는 한 번에 모두 바꾸기보다 현재 가장 자주 발생하는 문제와 연결해서 확인하는 것이 좋습니다. 미끄러짐이 문제라면 신발, 손에서 패들이 돌아간다면 그립, 공이 밀리거나 뜬다면 패들 무게와 스윙 밸런스, 땀 때문에 집중이 떨어진다면 의류와 밴드류를 먼저 봅니다. 이렇게 원인과 장비를 연결하면 불필요한 구매를 줄이고 실제 경기 개선에 가까워집니다.' : 'Use gear decisions to solve a real on-court problem. If you slip, start with shoes. If the paddle twists in your hand, check grip size and overgrips. If shots float or feel unstable, review weight and balance. If sweat breaks concentration, apparel and bands may matter more than a new paddle. Connecting the issue to the gear keeps the page useful rather than promotional.')}</p><p>${esc(loc === 'ko' ? '또한 같은 제품도 실내와 야외, 싱글과 복식, 입문자와 상급자에게 다르게 느껴질 수 있습니다. Picklary는 특정 제품을 무조건 추천하지 않고, 독자가 자신의 코트 환경과 레벨에 맞춰 확인할 수 있는 기준을 제공합니다.' : 'The same product can feel different indoors versus outdoors, in singles versus doubles, and for beginners versus advanced players. Picklary does not treat one item as a universal answer; it gives criteria readers can test against their own court, level, and goals.')}</p></div>${gearRelatedNav(loc, topic)}</div></section>`;
  return layout({ loc, rel: 'gear/' + topic + '/', title: data.title, description: data.intro, bodyHtml: body });
}

function paddleTierManual(slug) {
  const map = {
    'joola-ben-johns-perseus': 'S',
    'joola-scorpeus': 'S',
    'crbn-2x-power-series': 'S',
    'six-zero-double-black-diamond-control': 'S',
    'six-zero-ruby': 'S',
    'vatic-pro-prism-flash': 'S',
    'volair-mach-2-forza': 'S',
    'selkirk-luxx-control-air': 'A',
    'crbn-1x-power-series': 'A',
    'diadem-edge-18k': 'A',
    'engage-pursuit-pro1': 'A',
    'gearbox-pro-power-elongated': 'A',
    'paddletek-bantam-tko-c': 'A',
    'paddletek-tempest-wave-pro': 'A',
    'vatic-pro-saga': 'A',
    'joola-perseus-pro-v': 'A',
    'selkirk-project-boomstik': 'A',
    'selkirk-omni': 'A',
    'crbn-trufoam-genesis': 'A',
    'selkirk-power-air': 'B',
    'diadem-warrior-edge': 'B',
    'gearbox-cx14': 'B',
    'franklin-c45': 'B',
    'head-radical-tour': 'B',
    'bread-and-butter-filth': 'B',
    'friday-original': 'B',
    'prokennex-black-ace-pro': 'B',
    'onix-evoke-premier': 'C'
  };
  return map[slug] || 'C';
}

function paddleTierReason(p, loc) {
  const L = (ko, en) => (loc === 'ko' ? ko : en);
  const tier = paddleTierManual(p.slug);
  const r = p.ratings || {};
  const best = Object.entries(r).filter(([,v]) => typeof v === 'number').sort((a,b) => b[1]-a[1]).slice(0, 2).map(([k]) => traitLabel(loc, k));
  const price = priceLabel(p);
  if (tier === 'S') return L(`대표성·성능·사용자 적합도가 모두 높은 핵심 후보. 강점: ${best.join(' / ')}.`, `Benchmark pick with high fit, performance, and reputation. Strengths: ${best.join(' / ')}.`);
  if (tier === 'A') return L(`대부분의 사용자에게 추천 가능한 우수 후보. 가격대 ${price}에서 목적이 분명할 때 강합니다.`, `Strong recommendation for the right use case. It works best when its ${price} price tier fits the player's goal.`);
  if (tier === 'B') return L('특정 스타일·예산·레벨에 맞으면 좋은 후보. 구매 전 패들 파인더로 적합도를 한 번 더 확인하세요.', 'Good when the style, budget, and level match. Use Paddle Finder before shortlisting it.');
  if (tier === 'C') return L('제한적 추천 후보. 장점은 있지만 대체 후보와 비교한 뒤 선택하는 편이 안전합니다.', 'Limited-fit pick. It can work, but compare alternatives before choosing.');
  return L('현재 Picklary 기준에서는 추가 검토가 필요한 후보입니다.', 'Needs more review in the Picklary framework.');
}

function paddleTierIntro(loc) {
  return loc === 'ko'
    ? '이 티어표는 브랜드 광고나 절대 순위가 아니라 Picklary 데이터베이스 안에서 성능 점수, 플레이 스타일 적합도, 가격대, 초보자 관용성, 시장 기준 모델 여부를 함께 본 편집형 가이드입니다. 같은 S티어라도 파워형·컨트롤형·가성비형의 의미가 다르므로, 최종 선택은 패들 파인더와 각 상세 페이지에서 다시 확인하세요.'
    : 'This tier list is not an ad or an absolute ranking. It is an editorial guide inside the Picklary database, combining comparison scores, play-style fit, price band, beginner forgiveness, and benchmark-model signals. Even inside S tier, a power pick, control pick, and value pick mean different things, so use Paddle Finder and the detail pages before deciding.';
}

function renderPaddleTierList(loc) {
  const L = (ko, en) => (loc === 'ko' ? ko : en);
  const tierCopy = {
    S: L('성능·평판·범용성이 모두 높은 핵심 후보', 'Top benchmark picks with strong performance, reputation, and broad fit'),
    A: L('대부분의 사용자에게 추천 가능한 우수 후보', 'Strong picks for many players when the use case matches'),
    B: L('특정 스타일·예산·레벨에 맞으면 좋은 후보', 'Good fit for specific styles, budgets, or levels'),
    C: L('대체 후보와 비교 후 선택할 제한적 후보', 'Limited-fit picks to compare carefully against alternatives'),
    D: L('현재 등록 모델 중 D 등급은 두지 않았습니다', 'No current database model is placed in D tier')
  };
  const tierOrder = ['S','A','B','C','D'];
  const groups = tierOrder.reduce((acc, t) => (acc[t] = [], acc), {});
  paddles.forEach((p) => { const t = paddleTierManual(p.slug); (groups[t] || groups.C).push(p); });
  Object.keys(groups).forEach((t) => groups[t].sort((a,b) => paddleTitle(a).localeCompare(paddleTitle(b))));
  const rows = tierOrder.map((tier) => {
    const items = groups[tier] || [];
    const cards = items.length ? items.map((p) => `<a class="tier-paddle" href="${link(loc, 'paddles/' + p.slug + '/')}"><strong>${esc(paddleTitle(p))}</strong><span>${esc(styleLabel(loc, p.style))} · ${esc(priceLabel(p))}</span><small>${esc(paddleTierReason(p, loc))}</small></a>`).join('') : `<p class="tier-empty">${esc(tierCopy[tier])}</p>`;
    return `<div class="tier-row tier-row--${escAttr(tier.toLowerCase())}"><div class="tier-rank"><span>${esc(tier)}</span><small>${esc(tierCopy[tier])}</small></div><div class="tier-paddles">${cards}</div></div>`;
  }).join('');
  const stylePicks = [
    { label: L('올코트 기준', 'All-court'), slug: 'six-zero-double-black-diamond-control', body: L('밸런스형 플레이어가 비교 기준으로 삼기 좋습니다.', 'A useful reference point for balanced players.') },
    { label: L('컨트롤 기준', 'Control'), slug: 'selkirk-luxx-control-air', body: L('리셋·드롭·딩크 안정성을 우선할 때 비교하세요.', 'Compare when resets, drops, and dinks matter most.') },
    { label: L('파워 기준', 'Power'), slug: 'crbn-1x-power-series', body: L('드라이브와 스피드업을 적극적으로 쓰는 플레이어에게 적합합니다.', 'Useful for players who drive and speed up often.') },
    { label: L('가성비 기준', 'Value'), slug: 'vatic-pro-prism-flash', body: L('예산을 지키면서 컨트롤과 스핀을 확보하고 싶을 때 확인하세요.', 'Check when you want control and spin without jumping to premium pricing.') },
    { label: L('초보 친화', 'Beginner-friendly'), slug: 'friday-original', body: L('처음 시작할 때 부담 없이 비교할 수 있는 후보입니다.', 'A lower-pressure starting point for new players.') }
  ].map((x) => {
    const p = paddles.find((item) => item.slug === x.slug);
    return `<a class="tier-pick" href="${link(loc, 'paddles/' + x.slug + '/')}"><span>${esc(x.label)}</span><strong>${esc(p ? paddleTitle(p) : x.slug)}</strong><p>${esc(x.body)}</p></a>`;
  }).join('');
  return `<section class="band band--tier-list" id="paddle-tier-list"><div class="wrap">
    <div class="section-head"><div><p class="section-kicker">${esc(L('티어표', 'Tier list'))}</p><h2 class="band__title">${esc(L('Picklary 패들 티어표', 'Picklary Paddle Tier List'))}</h2><p class="band__intro">${esc(paddleTierIntro(loc))}</p></div><a class="btn btn--tier" href="${link(loc, 'tools/paddle-finder/')}">${esc(L('내 스타일로 다시 찾기', 'Find my fit'))}</a></div>
    <div class="tier-board">${rows}</div>
    <div class="tier-picks"><div><h3>${esc(L('목적별 빠른 기준 모델', 'Quick benchmark picks by purpose'))}</h3><p>${esc(L('S/A/B만 보지 말고, 내 플레이 문제와 가장 가까운 기준 모델부터 비교하세요.', 'Do not read only S/A/B. Start with the benchmark closest to your on-court problem.'))}</p></div><div class="tier-pick-grid">${stylePicks}</div></div>
    <div class="tier-method"><strong>${esc(L('산정 기준', 'Methodology'))}</strong><p>${esc(L('컨트롤·파워·스핀·관용성·핸드 스피드 점수, 레벨 적합도, 가격대, 사용 목적, 리뷰 신호를 함께 봅니다. 가격과 승인 상태는 변동될 수 있으므로 구매 전 공식 출처를 확인하세요.', 'We combine control, power, spin, forgiveness, hand speed, level fit, price band, use case, and review signals. Price and approval status can change, so verify official sources before buying.'))}</p></div>
  </div></section>`;
}

function renderPaddlesIndex(loc) {
  const brands = [...new Set(paddles.map((p) => p.brand))].sort();
  const styles = [...new Set(paddles.map((p) => p.style))].sort();
  const brandOptions = [`<option value="">${esc(tt(loc, 'paddles.allBrands'))}</option>`].concat(brands.map((b) => `<option value="${escAttr(b)}">${esc(b)}</option>`)).join('');
  const styleOptions = [`<option value="">${esc(tt(loc, 'paddles.allStyles'))}</option>`].concat(styles.map((st) => `<option value="${escAttr(st)}">${esc(styleLabel(loc, st))}</option>`)).join('');
  const levelOptions = [`<option value="">${esc(tt(loc, 'paddles.allLevels'))}</option>`].concat(levels.map((l) => `<option value="${escAttr(l.id)}">${esc(l.id)}</option>`)).join('');
  const latestPaddleUpdates = paddleUpdateItems().sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 3);
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: gearLabel(loc, 'hubTitle'), rel: 'gear/' }, { name: tt(loc, 'paddles.title') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(loc === 'ko' ? '패들' : 'Paddles')}</p><h1>${esc(tt(loc, 'paddles.title'))}</h1><p class="page-head__intro">${esc(tt(loc, 'paddles.intro'))}</p><div class="hero-actions"><a class="btn btn--primary" href="${link(loc, 'tools/paddle-finder/')}">${esc(tt(loc, 'paddles.openFinder'))}</a><a class="btn btn--tier" href="#paddle-tier-list">${esc(loc === 'ko' ? '티어표 보기' : 'View tier list')}</a></div></div>
  ${visualFigure(loc, 'ratings')}
</div></section>
${renderPaddleTierList(loc)}
<section class="band"><div class="wrap gear-page-layout gear-page-layout--paddles">
  <div>
    <div class="filter-panel" data-paddle-filters>
      <strong>${esc(tt(loc, 'paddles.filters'))}</strong>
      <label><span>${esc(tt(loc, 'paddles.allBrands'))}</span><select data-filter-brand>${brandOptions}</select></label>
      <label><span>${esc(tt(loc, 'paddles.type'))}</span><select data-filter-style>${styleOptions}</select></label>
      <label><span>${esc(tt(loc, 'label.level'))}</span><select data-filter-level>${levelOptions}</select></label>
    </div>
    <p class="notice">${esc(tt(loc, 'paddles.approvalNote'))}</p>
    <div class="paddle-grid" data-paddle-list>${paddles.map((p) => paddleCard(p, loc)).join('')}</div>
  </div>
  ${gearRelatedNav(loc, 'paddles')}
</div></section>
<section class="band band--alt"><div class="wrap">
  <div class="section-head"><div><h2 class="band__title">${esc(paddleUpdatesLabel(loc, 'title'))}</h2><p class="band__intro">${esc(paddleUpdatesLabel(loc, 'intro'))}</p></div><a class="link-more" href="${link(loc, 'paddles/updates/')}">${esc(paddleUpdatesLabel(loc, 'viewAll'))}</a></div>
  <div class="update-grid update-grid--home">${latestPaddleUpdates.length ? latestPaddleUpdates.map((u) => updateCard(u, loc)).join('') : `<p class="notice">${esc(paddleUpdatesLabel(loc, 'noItems'))}</p>`}</div>
</div></section>`;
  return layout({ loc, rel: 'paddles/', title: tt(loc, 'paddles.title'), description: tt(loc, 'paddles.intro'), bodyHtml: body });
}

function paddleProse(p, loc) {
  const La = (en, ko) => (loc === 'ko' ? ko : en);
  const r = p.ratings || {};
  const dimLabel = { power: La('power', '파워'), control: La('control', '컨트롤'), spin: La('spin', '스핀'), forgiveness: La('forgiveness', '관용성'), speed: La('hand speed', '핸드 스피드') };
  const dims = Object.keys(dimLabel).filter((k) => typeof r[k] === 'number');
  const sorted = dims.slice().sort((a, b) => r[b] - r[a]);
  const top = sorted.slice(0, 2), low = sorted[sorted.length - 1];
  const styleChar = ({
    'all-court': La('a balanced all-court paddle', '균형 잡힌 올코트 패들'),
    power: La('a power-first paddle', '파워 우선 패들'),
    control: La('a control-oriented paddle', '컨트롤 지향 패들'),
    spin: La('a spin-friendly paddle', '스핀 친화 패들'),
    hands: La('a quick-hands paddle built for the kitchen', '키친에서 빠른 손에 강한 패들'),
    value: La('a value-focused paddle', '가성비 중심 패들'),
  })[p.style] || La('a versatile paddle', '다재다능한 패들');
  const sh = (p.shape || '').toLowerCase();
  let shapeLine = '';
  if (sh.indexOf('elongat') >= 0) shapeLine = La('Its elongated shape adds reach and leverage for power and spin, but the sweet spot sits higher and rewards consistent contact.', '엘롱게이티드 형태라 리치와 레버리지가 커서 파워·스핀에 유리하지만, 스위트스폿이 위쪽에 있어 일관된 타점이 필요합니다.');
  else if (sh.indexOf('wide') >= 0) shapeLine = La('Its widebody shape gives a large, forgiving sweet spot that is easy to control.', '와이드바디 형태라 스위트스폿이 크고 관용적이어서 컨트롤이 쉽습니다.');
  else if (sh.indexOf('hybrid') >= 0) shapeLine = La('Its hybrid shape balances reach with a usable sweet spot.', '하이브리드 형태라 리치와 쓸 만한 스위트스폿의 균형이 좋습니다.');
  else if (sh.indexOf('traditional') >= 0) shapeLine = La('Its traditional shape is compact and quick to maneuver.', '트래디셔널 형태라 컴팩트하고 기동성이 좋습니다.');
  const core = p.core || '';
  let thickLine = '';
  if (/14/.test(core) && /16/.test(core)) thickLine = La(' It comes in both 14 mm and 16 mm, so you can pick pop or control.', ' 14mm·16mm로 모두 나와 팝과 컨트롤 중에서 고를 수 있습니다.');
  else if (/16/.test(core)) thickLine = La(' Its 16 mm core leans toward control and dwell.', ' 16mm 코어라 컨트롤·체류감 쪽입니다.');
  else if (/14/.test(core)) thickLine = La(' Its 14 mm core leans toward pop and hand speed.', ' 14mm 코어라 팝·핸드 스피드 쪽입니다.');
  const lv = (p.levels || []).map((x) => parseFloat(x)).filter((x) => !isNaN(x));
  const loLv = lv.length ? Math.min.apply(null, lv) : null, hiLv = lv.length ? Math.max.apply(null, lv) : null;
  const levelLine = loLv != null ? La(`It is aimed at ${loLv.toFixed(1)}–${hiLv.toFixed(1)} players`, `${loLv.toFixed(1)}~${hiLv.toFixed(1)} 플레이어에게 맞습니다`) : La('It suits a range of players', '다양한 레벨에 맞습니다');
  let begLine;
  if ((r.forgiveness || 0) >= 8 && (loLv == null || loLv <= 3.0)) begLine = La(', and it is forgiving enough for improvers still grooving their swing.', ' — 스윙을 다듬는 중급 이하에게도 관용적입니다.');
  else if (loLv != null && loLv >= 4.0) begLine = La(', and it is best in the hands of advanced players who can take advantage of it.', ' — 이를 활용할 수 있는 상급자에게 가장 잘 맞습니다.');
  else begLine = '.';
  const caveat = ({
    power: La('It favours touch over raw put-away power.', '순수 마무리 파워보다 터치에 강점이 있습니다.'),
    control: La('It trades a little touch for its other strengths.', '다른 강점을 위해 터치는 약간 양보합니다.'),
    spin: La('Its face is not the grippiest for heavy spin.', '강한 스핀을 위한 가장 그립감 좋은 면은 아닙니다.'),
    forgiveness: La('The smaller sweet spot rewards clean contact.', '스위트스폿이 작아 정확한 타점이 필요합니다.'),
    speed: La('It is not the very fastest paddle in hand at the net.', '네트에서 가장 빠른 손맛의 패들은 아닙니다.'),
  })[low] || '';
  const tier = ({ $: La('budget', '가성비'), $$: La('mid', '중상'), $$$: La('premium', '프리미엄') })[p.priceBand] || La('mid', '중상');
  const priceLine = La(`It sits in the ${tier} price tier — confirm the current price at the source before buying.`, `가격대는 ${tier}이며, 구매 전 출처에서 현재 가격을 확인하세요.`);
  const sig = p.usedBy ? La(` It is part of the ${p.usedBy}.`, ` ${p.usedBy} 라인의 일부입니다.`) : '';
  const clean = (s) => s.replace(/\s{2,}/g, ' ').replace(/\s+\./g, '.').trim();
  const para1 = clean(La(
    `The ${p.brand} ${p.model} is ${styleChar}. On our 0–10 comparison scale its strongest traits are ${dimLabel[top[0]]} and ${dimLabel[top[1]]}. ${shapeLine}${thickLine}`,
    `${p.brand} ${p.model} — 이 패들은 ${styleChar}입니다. 0~10 비교 점수에서 가장 두드러지는 특성은 ${dimLabel[top[0]]}·${dimLabel[top[1]]}입니다. ${shapeLine}${thickLine}`));
  const para2 = clean(`${levelLine}${begLine} ${caveat} ${priceLine}${sig}`);
  return `<h2>${esc(La(`How the ${p.model} plays`, `${p.model} 플레이 특성`))}</h2><p>${esc(para1)}</p><p>${esc(para2)}</p>`;
}

function renderPaddlePage(paddle, loc) {
  const same = paddles.filter((p) => p.slug !== paddle.slug && (p.brand === paddle.brand || p.style === paddle.style)).slice(0, 4);
  const title = paddleTitle(paddle);
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: gearLabel(loc, 'hubTitle'), rel: 'gear/' }, { name: tt(loc, 'paddles.title'), rel: 'paddles/' }, { name: title }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(paddle.brand)}</p><h1>${esc(title)}</h1>
  <p class="page-head__intro">${esc(loc1(paddle, loc, 'reviewSignal'))}</p>
  <p class="page-head__intro page-head__intro--small">${esc(loc1(paddle, loc, 'summary'))}</p></div>
  ${entityIllus('paddles', paddle.slug, paddle.image, (paddle.imageAlt || title) + ' — illustration', loc === 'ko' ? '양식화된 패들 일러스트' : 'Stylised paddle illustration')}
</div></section>
<section class="band"><div class="wrap two-col two-col--wide">
  <div class="spec-card"><table class="spec-table"><tbody>
    ${fieldRow(tt(loc, 'paddles.type'), styleLabel(loc, paddle.style))}
    ${fieldRow(tt(loc, 'paddles.shape'), shapeLabel(loc, paddle.shape))}
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
<section class="band"><div class="wrap narrow"><div class="prose">${paddleProse(paddle, loc)}</div></div></section>
<section class="band band--alt"><div class="wrap two-col two-col--wide">${reviewerRoundup(paddle, loc)}${paddleEngagement(paddle, loc)}</div></section>
${same.length ? `<section class="band band--alt"><div class="wrap"><h2 class="band__title">${esc(loc === 'ko' ? '비슷한 패들' : 'Similar paddles')}</h2><div class="paddle-grid">${same.map((p) => paddleCard(p, loc)).join('')}</div></div></section>` : ''}`;
  const canonical = config.url + link(loc, 'paddles/' + paddle.slug + '/');
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'Article',
    headline: title + (loc === 'ko' ? ' 리뷰·가이드' : ' review and guide'),
    description: loc1(paddle, loc, 'reviewSignal'),
    inLanguage: loc, mainEntityOfPage: canonical,
    author: { '@type': 'Person', name: ownerName(loc) },
    publisher: { '@type': 'Organization', name: config.siteName, logo: { '@type': 'ImageObject', url: config.url + '/assets/icons/apple-touch-icon.png' } },
  }];
  return layout({ loc, rel: 'paddles/' + paddle.slug + '/', title: title + (loc === 'ko' ? ' — 리뷰·스펙' : ' — review & specs'), description: enrichDesc(loc1(paddle, loc, 'reviewSignal'), loc, ' 스펙·평점·추천 레벨과 어떤 플레이어에게 맞는지 정리했습니다.', ' Specs, ratings, level fit, and who it is for.'), jsonld, bodyHtml: body });
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

function playerLearn(player, loc) {
  const s = (player.skills || []).slice(0, 3).map((x) => playerSkillLabel(loc, x));
  const list = s.join(', ');
  if (loc === 'ko') return `${player.name}의 게임에서 눈여겨볼 세 가지: ${list}. 정상급 선수가 실제 포인트에서 이 요소들을 어떻게 활용하는지 관찰하면, 같은 패턴을 자신의 경기에 더하는 가장 빠른 길이 됩니다.`;
  return `Three things to study in ${player.name}'s game: ${list}. Watching how a top professional applies these in live points is one of the fastest ways to add the same patterns to your own play.`;
}


function playerLiveProfileLinks(player, loc) {
  const urls = [player.officialProfile, player.secondaryProfile].filter(Boolean);
  const ppa = urls.find((u) => /ppatour\.com\/athlete\//.test(u)) || '';
  const dupr = urls.find((u) => /pickleball\.com\/players\//.test(u)) || '';
  const extras = urls.filter((u) => u !== ppa && u !== dupr);
  const t = (ko, en, es) => (loc === 'ko' ? ko : loc === 'es' ? es : en);
  const btns = [];
  if (ppa) btns.push(externalButton(t('공식 PPA 프로필', 'Official PPA profile', 'Perfil oficial PPA'), ppa));
  if (dupr) btns.push(externalButton(t('공식 DUPR·랭킹 프로필', 'Official DUPR & ranking profile', 'Perfil oficial de DUPR y ranking'), dupr));
  extras.forEach((u, i) => btns.push(externalButton(i === 0 ? ui(loc, 'officialProfile') : ui(loc, 'secondaryProfile'), u)));
  return btns.join('');
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
    <h2>${esc(tt(loc, 'players.skills'))}</h2>${pills((player.skills || []).map((x) => playerSkillLabel(loc, x)))}
    <h2>${esc(tt(loc, 'players.achievements'))}</h2><ul>${(player.achievements || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h2>${esc(tt(loc, 'players.events'))}</h2>${pills(player.events)}
    <h2>${esc(tt(loc, 'players.paddle'))}</h2><p>${esc(player.paddle)}</p>
    <h2>${esc(tt(loc, 'players.watch'))}</h2><p>${esc(loc1(player, loc, 'watch'))}</p>
    <h2>${esc(loc === 'ko' ? '동호인이 배울 점' : 'What club players can learn')}</h2><p>${esc(playerLearn(player, loc))}</p>
    ${playerDeepTakeaways(player, loc)}
    <h2>${esc(ui(loc, 'currentSources'))}</h2>
    <div class="source-buttons">
      ${playerLiveProfileLinks(player, loc)}
      <a class="btn btn--ghost" href="https://www.dupr.com/rankings" rel="nofollow noopener" target="_blank">DUPR</a>
      <a class="btn btn--ghost" href="https://www.ppatour.com/player-rankings/" rel="nofollow noopener" target="_blank">PPA 랭킹</a>
      <a class="btn btn--ghost" href="https://news.google.com/search?q=${q}" rel="nofollow noopener" target="_blank">뉴스</a>
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
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person', name: player.name,
      nationality: player.country || undefined,
      jobTitle: (loc === 'ko' ? '프로 피클볼 선수' : 'Professional pickleball player'),
      sameAs: [player.officialProfile, player.secondaryProfile].filter(Boolean),
    },
  }];
  return layout({ loc, rel: 'players/' + player.slug + '/', title: title + (loc === 'ko' ? ' — 프로필·플레이 스타일' : ' — profile & playing style'), description: enrichDesc(loc1(player, loc, 'style'), loc, ' — 프로필, 주요 성적, 플레이 스타일, 동호인이 배울 점을 정리했습니다.', ' — profile, key results, playing style, and takeaways for club players.'), jsonld, bodyHtml: body });
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
</div></section>
${adsenseDepthBlock(loc, 'highlights')}`;
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
      nav: 'Update Center', title: 'Pickleball Update Center', intro: 'A curated source-based feed for pickleball news, PPA/UPA rule changes, paddle legality notes, and player news & trends. Tournament schedules, results, and rankings live in the Pro Tour menu; paddle launch notes live inside the Paddles menu.',
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
      nav: '커뮤니티', title: 'Picklary 커뮤니티', intro: '함께 칠 사람, 파트너, 코치, 대회, 영상 피드백으로 이어지는 피클볼 커뮤니티 허브입니다. 승인 전 정적 버전에서는 입력 내용이 브라우저에만 저장됩니다.',
      faq: 'DUPR 레벨별 자주 묻는 질문', faqShort: '레벨별 질문', faqIntro: '2.0부터 5.0까지 자주 막히는 질문을 레벨별로 정리했습니다. 각 답변은 입문자도 이해하기 쉽게 짧게 시작하고, 레벨이 올라갈수록 전술과 의사결정 중심으로 확장됩니다.',
      qna: '상황별 질의응답', qnaShort: '상황별 질의응답', qnaIntro: '“이 상황에서는 어떻게 해야 하나요?”를 묻고 답하는 게시판 데모입니다. 현재 정적 사이트 버전에서는 입력 내용이 본인 브라우저에만 저장되며, 실제 공개 운영 전에는 로그인·신고·검수·스팸 방지 기능이 필요합니다.',
      policyTitle: '안전한 운영 기준', policyIntro: 'Play Hub는 재방문을 늘리는 핵심 기능이지만, 공개 게시판은 검수가 중요합니다. 이 버전은 선별 콘텐츠와 로컬 데모를 중심으로 운영 리스크를 낮췄습니다.',
      chooseLevel: '레벨 선택', allLevels: '전체 레벨', askFaq: '질문 제안하기', askQuestion: '질문 올리기', questionTitle: '질문 제목', situation: '상황 설명', tags: '태그', submit: '저장하기', localOnly: '현재 데모에서는 서버에 저장되지 않고 이 브라우저에만 표시됩니다. 공개 운영 시에는 검수 후 게시되도록 설계하세요.',
      answers: '답변', addAnswer: '답변 추가', answerPlaceholder: '상황, 추천 샷, 피해야 할 선택을 함께 적어 주세요.', votes: '추천', curated: '에디터 선별', suggested: '내 브라우저 저장', empty: '아직 표시할 질문이 없습니다.', homeTitle: '다음 플레이 기회를 찾는 커뮤니티 허브', homeIntro: '파트너, 코치, 대회, 영상 피드백을 목적별로 나누어 다음 경기와 다음 성장을 더 쉽게 찾도록 설계했습니다.'
    },
    en: {
      nav: 'Play Hub', title: 'Picklary Play Hub', intro: 'A connection hub for finding partners, coaches, tournaments, and video feedback. In this pre-launch static version, submissions stay in your browser.',
      faq: 'DUPR Level FAQ Board', faqShort: 'Level FAQ', faqIntro: 'Common questions from 2.0 to 5.0, organized by level. Answers start simple and become more tactical as the level rises.',
      qna: 'Situational Q&A Board', qnaShort: 'Q&A Board', qnaIntro: 'A demo board for asking “what should I do in this situation?” In this static version, submissions are stored only in your browser. A live public board needs login, reporting, review, and spam controls before publishing.',
      policyTitle: 'Safe operating standard', policyIntro: 'Community features can increase return visits, but public UGC needs review. This version keeps curated content first and limits user input to a local demo.',
      chooseLevel: 'Choose level', allLevels: 'All levels', askFaq: 'Suggest an FAQ', askQuestion: 'Ask a question', questionTitle: 'Question title', situation: 'Situation', tags: 'Tags', submit: 'Save', localOnly: 'In this demo, content is not uploaded to a server and appears only in this browser. For a public launch, publish only after review.',
      answers: 'Answers', addAnswer: 'Add answer', answerPlaceholder: 'Include the situation, recommended shot, and what to avoid.', votes: 'votes', curated: 'Curated', suggested: 'Saved in browser', empty: 'No questions to show yet.', homeTitle: 'Find your next game, partner, coach, or feedback loop', homeIntro: 'Play Hub turns community needs into clear paths: partners, tournaments, coaches, skill review, Q&A, and level FAQ.'
    },
    es: {
      nav: 'Play Hub', title: 'Picklary Play Hub', intro: 'Un hub para encontrar jugadores, parejas, entrenadores, torneos y feedback de nivel. En esta versión estática, los envíos quedan en tu navegador.',
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
function uiIcon(name) {
  const icons = {
    community: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 12.2a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Zm7 0a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2ZM3.2 19.2c.7-3 2.8-4.6 5.3-4.6s4.6 1.6 5.3 4.6H3.2Zm7.1 0c.7-2.2 2.5-3.5 5.2-3.5 2.5 0 4.7 1.2 5.3 3.5H10.3Z" fill="currentColor"/></svg>',
    partners: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="6" cy="6" r="2.2" fill="currentColor"/><circle cx="18" cy="18" r="2.2" fill="currentColor"/></svg>',
    tournaments: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v3.2c0 3.3-1.9 5.8-5 6.7-3.1-.9-5-3.4-5-6.7V4Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 20h6M12 14v6M6.5 6H4.2c.2 3.1 1.9 4.7 4.1 5.2M17.5 6h2.3c-.2 3.1-1.9 4.7-4.1 5.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    coach: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M7 10.5v4c1.4 1.3 3 2 5 2s3.6-.7 5-2v-4M20 8v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    skill: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m10 9 5 2.8-5 2.8V9Z" fill="currentColor"/><path d="M7 20h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    qna: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7l-4.5 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 9h8M8 12h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    faq: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.7 9.6A2.4 2.4 0 0 1 12 8c1.4 0 2.5.8 2.5 2.1 0 1.1-.7 1.7-1.7 2.3-.7.4-.8.8-.8 1.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>',
    rules: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.8h8.8A3.2 3.2 0 0 1 18 8v11.2H8.2A2.2 2.2 0 0 1 6 17V4.8Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 8h6M9 11h6M9 14h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M6 17c0-1.2.9-2 2.2-2H18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };
  return icons[name] || '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
}
function boardCard(loc, href, title, intro, metric, icon, tone, extra) {
  const open = tone === 'partnersFeatured'
    ? (loc === 'ko' ? '파트너 찾기 시작' : loc === 'es' ? 'Buscar compañeros' : 'Find partners')
    : (loc === 'ko' ? '바로가기' : loc === 'es' ? 'Abrir' : 'Open');
  return `<a class="board-card ${tone ? 'board-card--' + tone : ''}" href="${href}"><span class="board-card__eyebrow">${esc(metric)}</span><span class="board-card__icon" aria-hidden="true">${typeof icon === 'string' && icon.indexOf('<svg') >= 0 ? icon : esc(icon || '•')}</span><h3>${esc(title)}</h3><p>${esc(intro)}</p>${extra || ''}<span class="board-card__cta"><span>${esc(open)}</span><span aria-hidden="true">→</span></span></a>`;
}
function renderBoardsIndex(loc) {
  const L = (ko, en, es) => (loc === 'ko' ? ko : (loc === 'es' ? (es || en) : en));
  const hubCards = [
    boardCard(loc, link(loc, 'boards/friends/'), L('Community', 'Community', 'Comunidad'), L('지역 커뮤니티, 신규 멤버 모집, 방문 플레이어 매칭을 한 곳에서 탐색합니다.', 'Browse local groups, new-member invites, and visiting-player connections in one place.', 'Explora grupos locales, nuevos miembros y jugadores visitantes en un solo lugar.'), L('Local groups', 'Local groups', 'Grupos locales'), uiIcon('community'), 'community'),
    boardCard(loc, link(loc, 'boards/partners/'), L('Find partners', 'Find partners', 'Buscar compañeros'), L('레벨, 종목, 플레이 목적에 맞는 복식·클럽·드릴 파트너 후보를 빠르게 찾습니다.', 'Find doubles, club, and drill partners by level, division, and playing goal.', 'Encuentra compañeros de dobles, club o práctica por nivel, categoría y objetivo.'), communityLabel(loc, 'partnersMetric'), uiIcon('partners'), 'partnersFeatured'),
    boardCard(loc, link(loc, 'boards/tournaments/'), L('Tournaments', 'Tournaments', 'Torneos'), L('대회 정보와 참가자 모집, 참가 희망 등록을 지역별로 확인합니다.', 'Check tournament listings, participant recruiting, and player interest by region.', 'Consulta torneos, búsqueda de participantes y jugadores interesados por región.'), communityLabel(loc, 'tournamentsMetric'), uiIcon('tournaments'), 'community'),
    boardCard(loc, link(loc, 'boards/coaches/'), L('코치 찾기', 'Find coach', 'Buscar entrenador'), L('레슨, 클리닉, 지역 코치와 수강생 모집 현황을 빠르게 탐색합니다.', 'Browse lessons, clinics, local coaches, and student pools quickly.', 'Busca clases, clínicas, entrenadores locales y grupos de alumnos rápidamente.'), communityLabel(loc, 'coachesMetric'), uiIcon('coach'), 'community')
  ].join('');
  const playHubActions = [
    ['partners', link(loc, 'boards/partners/'), L('Find partners', 'Find partners', 'Buscar compañeros'), L('복식·드릴 파트너 찾기', 'Find doubles and drill partners', 'Encuentra compañeros de dobles y práctica'), uiIcon('partners')],
    ['tournaments', link(loc, 'boards/tournaments/'), L('Tournaments', 'Tournaments', 'Torneos'), L('대회 참가와 모집 확인', 'See tournament sign-ups and recruiting', 'Ver torneos e inscripciones'), uiIcon('tournaments')],
    ['community', link(loc, 'boards/friends/'), L('Community', 'Community', 'Comunidad'), L('지역 그룹과 방문 플레이어 연결', 'Open local groups and visitor links', 'Abrir grupos locales y enlaces de visitantes'), uiIcon('community')],
    ['coaches', link(loc, 'boards/coaches/'), L('코치 찾기', 'Find coach', 'Buscar entrenador'), L('레슨·클리닉 코치 탐색', 'Browse coaches, lessons, and clinics', 'Buscar entrenadores, clases y clínicas'), uiIcon('coach')]
  ].map(([tone, href, title, note, icon]) => `<a class="play-hub-action play-hub-action--${escAttr(tone)}" href="${href}"><span class="play-hub-action__icon" aria-hidden="true">${icon}</span><span><strong>${esc(title)}</strong><small>${esc(note)}</small></span></a>`).join('');
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: boardLabel(loc, 'title') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(boardLabel(loc, 'nav'))}</p><h1>${esc(boardLabel(loc, 'title'))}</h1><p class="page-head__intro">${esc(L('파트너, 대회, 코치, 지역 커뮤니티를 빠르게 찾는 실전형 플레이 허브입니다. 자주 쓰는 네 가지 경로만 남기고 첫 화면을 단순화했습니다.', 'A focused play hub for partners, tournaments, coaches, and local communities. The first screen now keeps just the four most-used paths.', 'Un play hub más limpio para compañeros, torneos, entrenadores y comunidad local. La primera pantalla ahora muestra solo las cuatro rutas principales.'))}</p></div>
  ${visualFigure(loc, 'boards')}
</div></section>
<section class="band band--compact"><div class="wrap"><p class="notice">${esc(communityLabel(loc, 'prelaunchNotice'))}</p></div></section>
${communityDashboard(loc)}
<section class="band"><div class="wrap">
  <div class="play-hub-actions">${playHubActions}</div>
  <p class="hub-subintro">${esc(L('스킬 리뷰, 질의응답, 자주 묻는 질문은 Insight 메뉴로 이동하고, 커뮤니티는 실제 매칭 중심으로 정리했습니다.', 'Skill Review, Q&A, and FAQ have moved to Insights, while Play Hub is now focused on real-world matching.', 'Skill Review, Q&A y FAQ se movieron a Insights; Play Hub ahora se enfoca en conexiones reales.'))}</p>
  <div class="hub-chooser hub-chooser--play-hub">${hubCards}</div>
</div></section>
<section class="band"><div class="wrap narrow prose source-panel source-panel--hub">
  <h2>${esc(L('운영 메모', 'How this hub works', 'Cómo funciona'))}</h2>
  <p>${esc(communityLabel(loc, 'reviewPolicy'))}</p>
  <p>${esc(loc === 'ko' ? '영상 기반 스킬 리뷰, 질의응답, 자주 묻는 질문은 이제 Insight 메뉴에서 확인할 수 있습니다.' : loc === 'es' ? 'La revisión de habilidades por video, Q&A y FAQ ahora viven en el menú Insights.' : 'Video-based skill review, Q&A, and FAQ now live under the Insights menu.')}</p>
  <p><a href="${link(loc, 'community-guidelines/')}">${esc(trustLabel(loc, 'community'))}</a> · <a href="${link(loc, 'categories/')}">${esc(tt(loc, 'categories.title'))}</a></p>
</div></section>
${adsenseDepthBlock(loc, 'boards')}`;
  return layout({ loc, rel: 'boards/', title: boardLabel(loc, 'title'), description: communityLabel(loc, 'boardsIntro'), bodyHtml: body, noAds: true });
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


// ---------------------------------------------------------------------------
//  Community marketplace: friends, coaches, external-video skill review
// ---------------------------------------------------------------------------
function communityLabel(loc, key) {
  const labels = {
    ko: {
      boardsIntro: '레벨별 학습 게시판을 넘어, 지역 커뮤니티·코치·대회·파트너·영상 기반 스킬평가를 연결하는 검수형 피클볼 커뮤니티 허브입니다. 한국어 페이지는 한국 지역을 우선하고, 영어 페이지는 글로벌 도시와 ZIP/Postal Code 검색을 기준으로 설계했습니다.',
      prelaunchNotice: 'MVP에서는 입력 후 브라우저 미리보기를 바로 확인하고, Netlify Forms 수신 데이터는 운영자 검수 후 공개 목록에 반영하는 구조로 설계했습니다.',
      marketplaceTitle: '지역 기반 커뮤니티 매칭', marketplaceIntro: '친구찾기, 코치찾기, 대회찾기, 파트너찾기는 같은 지역 안의 수요와 공급을 분리해서 보여줍니다. 새로 이사 온 플레이어, 출장·여행 중 방문한 플레이어, 대회 참가자, 대회 개최자, 복식 파트너를 찾는 플레이어가 서로 다른 목적을 명확히 표현할 수 있습니다.',
      learningTitle: '레벨 학습 게시판', learningIntro: '기존 자주 묻는 질문과 질의응답은 레벨별 의사결정과 경기 상황 해설을 담당합니다. 커뮤니티 기능이 커져도 학습 콘텐츠와 검수 기준은 별도로 유지합니다.',
      friendsTitle: '친구찾기·지역 커뮤니티', friendsShort: '친구찾기', friendsIntro: '지역 커뮤니티를 홍보하려는 사람, 새 지역·새 레벨의 파트너를 찾는 사람, 출장·여행 중 방문 플레이를 원하는 사람을 분리해 연결합니다.', friendsMetric: 'City + ZIP + Visit',
      coachesTitle: '코치찾기·수강생 찾기', coachesShort: '코치찾기', coachesIntro: '특정 스킬을 배우려는 수강생과 지역 수강생 풀을 만들려는 코치를 같은 지역 단위로 묶습니다.', coachesMetric: 'Coach + Student',
      skillTitle: '영상 기반 내 스킬 평가', skillShort: '스킬평가', skillIntro: '외부 영상 URL을 공유하면 평가자가 기준별 점수와 의견을 남기고, Picklary가 커뮤니티 DUPR식 예상 레벨을 계산합니다.', skillMetric: '기준별 평가 + 교차 확인',
      tournamentsTitle: '대회찾기·참가자 모집', tournamentsShort: '대회찾기', tournamentsIntro: '대회 참가 희망자와 참가자를 모집하는 대회 개최자를 지역·일정·종목·레벨 기준으로 연결합니다.', tournamentsMetric: 'Events + Players',
      partnersTitle: '복식 파트너 찾기', partnersShort: '파트너찾기', partnersIntro: '남자복식, 여자복식, 혼합복식, 지역 클럽활동, 대회 참가 목적에 맞는 파트너 후보를 자기소개 기반으로 정리합니다.', partnersMetric: 'MD + WD + Mixed',
      reviewPolicy: '친구찾기, 코치찾기, 대회찾기, 파트너찾기, 영상평가는 모두 검수형 커뮤니티로 설계했습니다. 현재 정적 사이트에서는 입력값이 서버에 공개 저장되지 않으며, 실제 공개 운영 시에는 관리자 승인, 신고, 삭제 요청, 스팸 차단, 개인정보 차단, 미성년자 보호 기준이 필요합니다.',
      filterTitle: '지역·목적 필터', type: '목적', allTypes: '전체 목적', cityZip: 'City 또는 ZIP', level: '레벨', allLevels: '전체 레벨', focus: '관심 스킬', allFocus: '전체 스킬', submit: '신청 내용 저장', localOnly: '입력 후 이 브라우저에 미리보기가 표시됩니다. Netlify Forms로 수신된 내용은 운영자 검수 후 공개 목록에 반영하는 구조가 안전합니다.',
      friendsHero: '지역 커뮤니티를 키우는 사람, 새로운 파트너를 찾는 사람, 방문 일정에 맞춰 게임을 찾는 사람을 따로 받습니다.', organizer: '커뮤니티 홍보·멤버 모집', playerSeeking: '플레이 파트너·상위 레벨 그룹 찾기', visitorSeeking: '출장·여행 방문 플레이어', organizerDesc: '정기 오픈플레이, 카카오/밴드/Meetup 그룹, 클럽 모임처럼 지역 참여를 확장하려는 운영자를 위한 카테고리입니다.', playerDesc: '새로 이사 왔거나, 피클볼을 막 시작했거나, 3.0에서 3.5처럼 더 경쟁적인 커뮤니티를 찾는 플레이어를 위한 카테고리입니다.', visitorDesc: '출장이나 여행으로 다른 도시를 방문하면서 일정이 맞는 오픈플레이, 드릴, 친선 게임을 찾는 플레이어를 위한 카테고리입니다.',
      travelTitle: '출장·여행 방문자 매칭', travelBody: '방문 플레이어 기능은 지역 커뮤니티의 활용도를 크게 높입니다. 평소에는 로컬 플레이어를 연결하고, 특정 기간에는 방문 도시·ZIP·가능 시간을 기준으로 단기 오픈플레이 수요를 모을 수 있습니다. 지역 운영자는 새로운 참여자를 얻고, 방문자는 낯선 도시에서도 안전하게 피클볼 네트워크를 찾을 수 있습니다.', visitWindow: '방문 가능 기간·시간', homeCity: '평소 플레이 지역',
      coachesHero: '코치를 찾는 수강생과 그룹 수업을 만들려는 코치를 같은 지역에서 연결합니다.', studentSeeking: '수강생: 특정 스킬을 배울 코치 찾기', coachSeeking: '코치: 지역 수강생 모집하기', studentDesc: '3구 드롭, 리턴 깊이, 딩크 안정성, 복식 포지셔닝처럼 특정 레벨에서 막히는 스킬을 배우고 싶은 수강생을 위한 입력입니다.', coachDesc: '특정 도시·ZIP에서 초보반, 3.0 진입반, 3.5+ 경쟁반 수강생을 모집하고 싶은 코치용 입력입니다.', poolTitle: '지역별 코치·수강생 모집 현황', poolIntro: '같은 지역에 코치와 수강생 카드가 함께 쌓이면 레슨 수요 확인, 클리닉 개설, 그룹반 모집이 쉬워집니다.',
      tournamentsHero: '대회 참가 희망자와 참가자를 모집하는 개최자를 분리해, 지역·일정·레벨·종목 기준으로 대회 정보를 정리합니다.', tournamentHost: '대회 개최자: 참가자 모집', tournamentParticipant: '참가자: 나에게 맞는 대회 찾기', tournamentHostDesc: '대회명, 장소, 일정, 종목, 레벨, 참가비, 공식 등록 링크를 정리해 참가자가 대회 개요를 빠르게 이해하도록 돕는 입력입니다.', tournamentParticipantDesc: '참가하고 싶은 지역, 가능 일정, 종목, 레벨을 남겨 적합한 대회나 팀 모집 정보를 찾기 위한 입력입니다.', tournamentWhyTitle: '대회찾기가 왜 필요한가요?', tournamentWhyBody: '대회 정보는 여러 클럽, SNS, 협회 페이지에 흩어져 있어 초보 참가자나 방문 플레이어가 찾기 어렵습니다. Picklary는 주최자 제공 정보를 검수형 카드로 정리해 참가자가 일정, 레벨, 종목, 등록 링크를 한 번에 비교할 수 있게 설계합니다. DUPR-rated 여부나 공식 등록 조건은 반드시 주최자 링크에서 최종 확인하도록 안내합니다.', tournamentDisclaimer: '대회 정보는 주최자 제공 내용을 기반으로 한 샘플 구조입니다. 날짜, 참가비, DUPR-rated 여부, 등록 마감은 공식 등록 링크에서 다시 확인해야 합니다.',
      partnersHero: '대회와 클럽 활동에서 함께 뛸 남자복식, 여자복식, 혼합복식 파트너를 지역·레벨·목표·플레이 스타일 기준으로 찾습니다.', partnerSeeking: '파트너 찾는 플레이어', partnerOffering: '파트너 후보로 등록', partnerSeekingDesc: '특정 대회, 지역 리그, 클럽 활동에서 원하는 종목과 파트너 스타일을 설명하고 후보를 찾는 입력입니다.', partnerOfferingDesc: '본인의 레벨, 강점, 플레이 스타일, 가능 일정, 선호 종목을 소개해 파트너 후보로 등록하는 입력입니다.', partnerWhyTitle: '좋은 파트너 매칭 기준', partnerWhyBody: '복식 파트너는 레벨만 맞으면 충분하지 않습니다. 목표, 커뮤니케이션 방식, 강점 조합, 언포스드 에러 성향, 공격/수비 밸런스가 맞아야 실제 대회나 클럽 경기에서 오래 갈 수 있습니다. 그래서 Picklary는 단순 연락처 게시보다 자기소개와 희망 조건을 함께 받는 구조가 더 적합합니다.',
      eventDate: '대회 날짜', registrationDeadline: '등록 마감일', venue: '장소명', division: '종목', format: '경기 방식', entryFee: '참가비', officialUrl: '공식 등록 링크', targetEvent: '희망 대회·클럽 활동', partnerStyle: '플레이 스타일', partnerGoal: '목표', desiredPartner: '희망 파트너 조건', experience: '대회·리그 경험',
      name: '닉네임 또는 표시명', country: '국가', city: '도시', zip: 'ZIP / Postal Code', note: '소개·목표', contact: '공개하지 않을 연락 메모', savePreview: '내 브라우저에 미리보기 저장', localPreview: '내 브라우저 저장 목록', directory: '샘플 디렉터리', noMatch: '조건에 맞는 항목이 없습니다.',
      videoUrl: '외부 영상 URL', selfLevel: '본인 예상 레벨', requestFocus: '평가받고 싶은 포인트', reviewerType: '평가자 유형', estimate: '종합 예상 DUPR', addReview: '기준별 평가 추가', communityEstimate: '커뮤니티 DUPR식 예상치', confidence: '신뢰도', reviews: '평가 수', duprLinked: 'DUPR 프로필 확인 평가자', officialDisclaimer: '이 결과는 Picklary 커뮤니티의 영상 기반 추정치이며 공식 DUPR 점수가 아닙니다. DUPR 명칭은 레벨 설명을 돕기 위한 참고 표현이며, 공식 점수는 DUPR 또는 관련 공식 플랫폼에서 확인해야 합니다.',
      criteriaTitle: '평가 기준별 점수', criteriaIntro: '평가자는 하나의 숫자만 입력하지 않고, 리턴·드롭·딩크·리셋·발리·포지셔닝·전략 판단처럼 실제 경기력을 설명하는 기준별 점수를 입력합니다. Picklary는 기준별 가중 평균과 평가자 신뢰도 가중치를 함께 사용해 종합 예상치를 계산합니다.', criterionScores: '기준별 점수', reviewOpinion: '평가 의견', evidenceNote: '근거 또는 장면 메모', crosscheckTitle: '평가 의견 교차검증', crosscheckDesc: '다른 유저는 각 평가가 도움이 되었는지, 본인 판단과 일치하는지, 재검토가 필요한지를 표시할 수 있습니다. 이 피드백은 평가자 품질과 의견 일치도를 보는 보조 신호로 사용하고, 공식 DUPR처럼 확정 점수로 표현하지 않습니다.', helpful: '도움됨', agree: '동의', needsReview: '재검토', computedFromCriteria: '기준별 점수로 자동 계산',
      whySplitTitle: '왜 카테고리를 나누나요?', whySplitBody: '한 지역 안에서도 “사람을 모으는 운영자”와 “들어갈 곳을 찾는 플레이어”의 목적은 다릅니다. 여기에 출장·여행 방문자를 별도로 두면 단기 참여 수요까지 잡을 수 있습니다. 입력 의도를 분리하면 스팸성 홍보와 실제 매칭 수요를 구분하기 쉽고, 나중에 지역별 뉴스레터·클리닉·리그 모집으로 확장하기도 좋습니다.'
    },
    en: {
      boardsIntro: 'A reviewed pickleball community hub for local groups, coaches, tournaments, partners, and external-video skill review. Korean pages prioritize Korea. English pages are designed for global city and ZIP/Postal Code discovery.',
      prelaunchNotice: 'In this MVP, users can preview submissions in the browser, while Netlify Forms submissions can be reviewed by an editor before appearing in public listings.',
      marketplaceTitle: 'Local community matching', marketplaceIntro: 'Friends, coaches, tournaments, and partners are organized as two-sided pools: local groups, visiting players, tournament hosts, tournament participants, doubles partners, students, and coaches can state their intent clearly by region.',
      learningTitle: 'Level learning boards', learningIntro: 'The existing FAQ and Q&A boards stay focused on level decisions and match situations while the community tools grow under a separate moderation model.',
      friendsTitle: 'Find Friends & Local Groups', friendsShort: 'Find Friends', friendsIntro: 'Separate community promoters, players looking for a new or stronger group, and visiting players seeking games during work trips or travel.', friendsMetric: 'City + ZIP + Visit',
      coachesTitle: 'Find Coaches & Students', coachesShort: 'Find Coaches', coachesIntro: 'Pair students seeking specific skills with coaches building a local student pool in the same city or postal area.', coachesMetric: 'Coach + Student',
      skillTitle: 'Video Skill Review', skillShort: 'Skill Review', skillIntro: 'Share an external video URL and let reviewers score clear criteria before Picklary calculates a community DUPR-style estimate.', skillMetric: '기준별 평가 + 교차 확인',
      tournamentsTitle: 'Find Tournaments & Participants', tournamentsShort: 'Find Tournaments', tournamentsIntro: 'Connect tournament hosts recruiting players with players searching by region, date, division, and level.', tournamentsMetric: 'Events + Players',
      partnersTitle: 'Find Doubles Partners', partnersShort: 'Find Partners', partnersIntro: 'Organize men’s doubles, women’s doubles, mixed doubles, club, league, and tournament partner searches around intro profiles and matching goals.', partnersMetric: 'MD + WD + Mixed',
      reviewPolicy: 'Friends, coaches, tournaments, partners, and skill reviews are designed as reviewed community areas. In this static MVP, submissions are not publicly uploaded to a server. A public launch should add approval, reporting, removal requests, spam controls, personal-data safeguards, and youth-safety rules.',
      filterTitle: 'Region and intent filters', type: 'Intent', allTypes: 'All intents', cityZip: 'City or ZIP', level: 'Level', allLevels: 'All levels', focus: 'Skill focus', allFocus: 'All skills', submit: 'Save request', localOnly: 'After submission, a preview appears in this browser. Netlify Forms entries should be editor-reviewed before becoming public directory listings.',
      friendsHero: 'Separate people growing local communities, players looking for a group, and visiting players trying to find games while traveling.', organizer: 'Promote a community / recruit members', playerSeeking: 'Find partners / find a stronger group', visitorSeeking: 'Visiting player / travel games', organizerDesc: 'For organizers growing open play, chat groups, clubs, ladders, or Meetup-style sessions in a city or ZIP area.', playerDesc: 'For players who moved to a new area, just started pickleball, or leveled up and want a more competitive group.', visitorDesc: 'For players visiting another city for work or travel who want to find open play, drills, or friendly games during a specific window.',
      travelTitle: 'Travel and visiting-player matching', travelBody: 'The visiting-player flow increases the utility of a local directory. Local communities can keep serving regular players while also capturing short-window demand from business trips and travel. Organizers get new participants, and visitors get a safer way to find pickleball connections in an unfamiliar city.', visitWindow: 'Visit window / available time', homeCity: 'Home playing area',
      coachesHero: 'Connect students seeking a specific skill with coaches building a local student pool.', studentSeeking: 'Student: find a coach for a specific skill', coachSeeking: 'Coach: build a local student pool', studentDesc: 'For students stuck on third-shot drops, return depth, dink consistency, resets, transition-zone defense, or doubles positioning.', coachDesc: 'For coaches building beginner, 3.0 bridge, 3.5+ competitive, clinic, or private-lesson demand in a specific city or ZIP area.', poolTitle: 'Local coach and student pools', poolIntro: 'When coach supply and student demand collect in the same region, it becomes easier to validate lesson demand, launch clinics, and form group classes.',
      tournamentsHero: 'Separate players looking for events from tournament hosts recruiting participants, then organize event information by region, date, division, and level.', tournamentHost: 'Tournament host: recruit participants', tournamentParticipant: 'Participant: find the right event', tournamentHostDesc: 'For hosts to summarize event name, venue, date, divisions, level brackets, entry fee, format, and official registration link in a clear overview.', tournamentParticipantDesc: 'For players to state the region, dates, divisions, and level range they want so relevant events or team openings can be found.', tournamentWhyTitle: 'Why tournament discovery matters', tournamentWhyBody: 'Tournament information is often scattered across club pages, social media, league tools, and registration platforms. Picklary can turn host-provided details into reviewed cards so players can compare dates, level brackets, divisions, and registration links in one place. DUPR-rated status and final registration conditions should always be confirmed on the official event link.', tournamentDisclaimer: 'Tournament details are sample, host-provided information in this static MVP. Dates, fees, DUPR-rated status, and registration deadlines should be checked on the official registration link.',
      partnersHero: 'Find men’s doubles, women’s doubles, and mixed doubles partners for tournaments, local clubs, leagues, and drill goals using region, level, style, and intro profiles.', partnerSeeking: 'Player seeking a partner', partnerOffering: 'Register as a partner candidate', partnerSeekingDesc: 'For players looking for a partner for a specific tournament, club league, or recurring play goal with clear desired partner traits.', partnerOfferingDesc: 'For players introducing their level, strengths, playing style, availability, and preferred divisions as a partner candidate.', partnerWhyTitle: 'What makes partner matching useful?', partnerWhyBody: 'A good doubles partner is not just a similar rating. Goals, communication, shot tolerance, strengths, error profile, and attack-defense balance matter. Picklary therefore asks for intro profiles and desired partner conditions rather than only posting contact details.',
      eventDate: 'Event date', registrationDeadline: 'Registration deadline', venue: 'Venue', division: 'Division', format: 'Format', entryFee: 'Entry fee', officialUrl: 'Official registration link', targetEvent: 'Target event or club activity', partnerStyle: 'Playing style', partnerGoal: 'Goal', desiredPartner: 'Desired partner', experience: 'Tournament or league experience',
      name: 'Display name', country: 'Country', city: 'City', zip: 'ZIP / Postal Code', note: 'Intro or goal', contact: 'Private contact note', savePreview: 'Save browser preview', localPreview: 'Saved in this browser', directory: 'Sample directory', noMatch: 'No matching entries.',
      videoUrl: 'External video URL', selfLevel: 'Self-estimated level', requestFocus: 'Requested feedback focus', reviewerType: 'Reviewer type', estimate: 'Overall estimated DUPR', addReview: 'Add criteria review', communityEstimate: 'Community DUPR-style estimate', confidence: 'Confidence', reviews: 'reviews', duprLinked: 'DUPR public-profile reviewer', officialDisclaimer: 'This result is a Picklary community video-based estimate, not an official DUPR rating. DUPR language is used only as a reference for level discussion. Official ratings should be checked on DUPR or other official platforms.',
      criteriaTitle: 'Criteria-based scoring', criteriaIntro: 'Reviewers should not enter only one number. They score criteria that explain match ability: return, third-shot, dink, reset, volley, positioning, and decision quality. Picklary then combines criterion weights with reviewer trust weights to calculate a community estimate.', criterionScores: 'Criterion scores', reviewOpinion: 'Review opinion', evidenceNote: 'Evidence or clip notes', crosscheckTitle: 'Cross-check review opinions', crosscheckDesc: 'Other users can mark whether each review was helpful, aligned with their view, or needs another look. This feedback becomes a quality signal for reviewer reliability and agreement, not an official DUPR result.', helpful: 'Helpful', agree: 'Agree', needsReview: 'Needs review', computedFromCriteria: 'Automatically calculated from criteria',
      whySplitTitle: 'Why split the categories?', whySplitBody: 'Within the same region, an organizer trying to grow participation and a player trying to find a group have different needs. Adding a visiting-player category captures short-window demand from work trips and travel. Splitting intent reduces noisy promotion, makes real matching demand clearer, and prepares the site for future regional newsletters, clinics, and ladders.'
    },
    es: {}
  };
  return (labels[loc] && labels[loc][key]) || labels.en[key] || key;
}

function communityCardText(x, loc, field) {
  const v = x[field];
  if (v && typeof v === 'object') return v[loc] || v.en || v.ko || '';
  return v || '';
}

function communityBoardGroups(loc) {
  return [
    { key:'partners', href: link(loc, 'boards/partners/'), label: communityLabel(loc, 'partnersShort'), intro: communityLabel(loc, 'partnersIntro'), icon: uiIcon('partners'), tone:'partners', items: partnerSeeds() },
    { key:'friends', href: link(loc, 'boards/friends/'), label: communityLabel(loc, 'friendsShort'), intro: communityLabel(loc, 'friendsIntro'), icon: uiIcon('community'), tone:'community', items: friendSeeds() },
    { key:'coaches', href: link(loc, 'boards/coaches/'), label: communityLabel(loc, 'coachesShort'), intro: communityLabel(loc, 'coachesIntro'), icon: uiIcon('coach'), tone:'coaches', items: coachSeeds() },
    { key:'tournaments', href: link(loc, 'boards/tournaments/'), label: communityLabel(loc, 'tournamentsShort'), intro: communityLabel(loc, 'tournamentsIntro'), icon: uiIcon('tournaments'), tone:'tournaments', items: tournamentSeeds() }
  ];
}
function communityAllEntries(loc) {
  return communityBoardGroups(loc).flatMap((g) => g.items.map((it) => ({ ...it, boardKey:g.key, boardLabel:g.label, boardHref:g.href, boardTone:g.tone })));
}
function countBy(arr, fn) {
  const out = new Map();
  arr.forEach((x) => { const k = fn(x); if (!k) return; out.set(k, (out.get(k) || 0) + 1); });
  return Array.from(out.entries()).sort((a,b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}
function communityDashboard(loc) {
  const L = (ko, en) => (loc === 'ko' ? ko : en);
  const groups = communityBoardGroups(loc);
  const entries = communityAllEntries(loc);
  const regions = countBy(entries, (it) => `${communityCardText(it, loc, 'city')} ${it.zip || ''}`.trim());
  const levels = countBy(entries, (it) => it.level);
  const total = entries.length;
  const topRegion = regions[0] ? regions[0][0] : '—';
  const topLevel = levels[0] ? levels[0][0] : '—';
  const recent = entries.slice(0, 5).map((it) => {
    const title = communityCardText(it, loc, 'title');
    const city = communityCardText(it, loc, 'city');
    return `<a class="community-recent" href="${escAttr(it.boardHref)}"><span>${esc(it.boardLabel)}</span><strong>${esc(title)}</strong><small>${esc(city)} · ${esc(it.level)} · ${esc(it.focus)}</small></a>`;
  }).join('');
  const tiles = [
    [L('샘플 공개 카드', 'Sample listings'), total, L('검수형 게시판 구조', 'Reviewed board structure')],
    [L('목적별 게시판', 'Purpose boards'), groups.length, L('파트너·커뮤니티·코치·대회', 'Partner, community, coach, event')],
    [L('활성 지역', 'Active regions'), regions.length, topRegion],
    [L('가장 많은 레벨', 'Top level range'), topLevel, L('필터로 바로 좁히기', 'Filter down by level')]
  ].map(([k,v,n]) => `<article class="community-dash-tile"><span>${esc(k)}</span><strong>${esc(v)}</strong><small>${esc(n)}</small></article>`).join('');
  const bars = groups.map((g) => `<a class="community-dash-board community-dash-board--${escAttr(g.tone)}" href="${escAttr(g.href)}"><span class="community-dash-board__icon" aria-hidden="true">${g.icon}</span><span><strong>${esc(g.label)}</strong><small>${esc(g.intro)}</small></span><em>${g.items.length}</em></a>`).join('');
  return `<section class="band band--alt"><div class="wrap community-dashboard" data-community-dashboard>
    <div class="section-head"><div><p class="section-eyebrow">${esc(L('Play Hub Dashboard', 'Play Hub Dashboard'))}</p><h2>${esc(L('게시판 현황 한눈에 보기', 'Community board snapshot'))}</h2><p>${esc(L('초기 MVP에서는 샘플 카드와 브라우저 저장 미리보기를 기준으로 현황을 보여주고, 공개 운영 시 Netlify Forms 또는 DB 승인 데이터를 연결합니다.', 'The MVP shows sample cards and browser-saved previews first. A public launch can connect approved Netlify Forms or database entries later.'))}</p></div><a class="btn btn--ghost" href="${link(loc, 'community-guidelines/')}">${esc(trustLabel(loc, 'community'))}</a></div>
    <div class="community-dash-grid">${tiles}</div>
    <div class="community-dash-layout"><div class="community-dash-boards">${bars}</div><div class="community-dash-recent"><h3>${esc(L('최근 샘플 등록글', 'Recent sample listings'))}</h3>${recent}</div></div>
  </div></section>`;
}
function communityMiniDashboard(loc, kind, items) {
  const L = (ko, en) => (loc === 'ko' ? ko : en);
  const regions = countBy(items, (it) => `${communityCardText(it, loc, 'city')} ${it.zip || ''}`.trim());
  const types = countBy(items, (it) => it.type);
  const levelsHit = countBy(items, (it) => it.level);
  const typeText = types.slice(0, 2).map(([k,v]) => `${communityLabel(loc, {friends:{organizer:'organizer',player:'playerSeeking',visitor:'visitorSeeking'},coaches:{coach:'coachSeeking',student:'studentSeeking'},tournaments:{host:'tournamentHost',participant:'tournamentParticipant'},partners:{seeking:'partnerSeeking',candidate:'partnerOffering'}}[kind]?.[k] || k)} ${v}`).join(' · ');
  const rows = [
    [L('등록 카드', 'Listings'), String(items.length), L('샘플 + 내 브라우저 미리보기', 'Samples + browser preview')],
    [L('지역 수', 'Regions'), String(regions.length), regions[0] ? regions[0][0] : '—'],
    [L('목적 분포', 'Intent mix'), typeText || '—', L('필터로 구분', 'Filterable')],
    [L('레벨 분포', 'Level mix'), levelsHit[0] ? levelsHit[0][0] : '—', L('레벨별 검색 가능', 'Level-search ready')]
  ];
  return `<div class="community-mini-dashboard">${rows.map(([a,b,c]) => `<article><span>${esc(a)}</span><strong>${esc(b)}</strong><small>${esc(c)}</small></article>`).join('')}</div>`;
}
function communityBoardSubnav(loc, active) {
  const boards = communityBoardGroups(loc);
  return `<nav class="community-board-tabs" aria-label="${escAttr(boardLabel(loc, 'title'))}">${boards.map((g) => `<a class="${g.key === active ? 'is-active' : ''}" href="${escAttr(g.href)}">${esc(g.label)}</a>`).join('')}</nav>`;
}

function friendSeeds() {
  return [
    { type:'organizer', country:'KR', city:{ko:'서울 강남', en:'Gangnam, Seoul'}, zip:'06164', level:'All', focus:'open-play', title:{ko:'강남 평일 저녁 오픈플레이 그룹', en:'Gangnam weeknight open-play group'}, body:{ko:'초보 환영 오픈플레이와 3.0+ 드릴 세션을 분리해 운영하려는 지역 커뮤니티 샘플입니다.', en:'A sample local community that separates beginner-friendly open play from 3.0+ drill sessions.'} },
    { type:'player', country:'KR', city:{ko:'경기 성남', en:'Seongnam, Gyeonggi'}, zip:'13524', level:'3.5', focus:'competitive', title:{ko:'3.5 이상 주말 복식 파트너 찾기', en:'Looking for 3.5+ weekend doubles partners'}, body:{ko:'레벨이 올라가면서 더 경쟁적인 랠리와 포지셔닝 피드백을 받을 수 있는 그룹을 찾는 플레이어 샘플입니다.', en:'A sample player looking for more competitive rallies and positioning feedback after leveling up.'} },
    { type:'visitor', country:'KR', city:{ko:'제주 제주시', en:'Jeju City'}, zip:'63122', level:'3.0', focus:'travel', title:{ko:'제주 출장 중 저녁 오픈플레이 찾기', en:'Visiting Jeju and looking for evening open play'}, body:{ko:'출장·여행 일정 중 1~2회 참여할 수 있는 로컬 오픈플레이나 드릴 파트너를 찾는 방문 플레이어 샘플입니다.', en:'A sample visiting player looking for local open play or drill partners for one or two sessions during a trip.'} },
    { type:'organizer', country:'US', city:{ko:'Suwanee, GA', en:'Suwanee, GA'}, zip:'30024', level:'2.5-3.5', focus:'community', title:{ko:'Suwanee 신규 멤버 모집', en:'Suwanee new-member open play'}, body:{ko:'새로 이사 온 플레이어와 2.5~3.5 레벨의 정기 게임 참여자를 모으는 커뮤니티 샘플입니다.', en:'A sample group for newly relocated players and regular 2.5–3.5 open-play participants.'} },
    { type:'player', country:'US', city:{ko:'Johns Creek, GA', en:'Johns Creek, GA'}, zip:'30097', level:'3.0', focus:'drills', title:{ko:'3.0 드릴 파트너 찾기', en:'Looking for 3.0 drill partners'}, body:{ko:'리턴 깊이, 3구 드롭, 키친 전환을 같이 연습할 파트너를 찾는 플레이어 샘플입니다.', en:'A sample player looking for partners to drill return depth, third-shot drops, and kitchen transition.'} },
    { type:'visitor', country:'US', city:{ko:'Las Vegas, NV', en:'Las Vegas, NV'}, zip:'89109', level:'3.5', focus:'travel', title:{ko:'라스베이거스 여행 중 3.5 게임 찾기', en:'Traveling to Las Vegas and seeking 3.5 games'}, body:{ko:'컨퍼런스나 가족여행 중 비는 시간에 지역 3.5 복식 게임을 찾는 방문 플레이어 샘플입니다.', en:'A sample traveler looking for local 3.5 doubles during open windows on a conference or family trip.'} }
  ];
}

function coachSeeds() {
  return [
    { type:'student', country:'KR', city:{ko:'서울 송파', en:'Songpa, Seoul'}, zip:'05510', level:'3.0', focus:'third-shot', title:{ko:'3구 드롭과 리셋 코치 찾기', en:'Seeking a coach for third-shot drops and resets'}, body:{ko:'3.0에서 3.5로 넘어가기 위해 3구 드롭, 리셋, 전환존 판단을 배우고 싶은 수강생 샘플입니다.', en:'A sample student who wants third-shot drops, resets, and transition-zone decisions to move from 3.0 to 3.5.'} },
    { type:'coach', country:'KR', city:{ko:'부산 해운대', en:'Haeundae, Busan'}, zip:'48095', level:'Beginner-3.0', focus:'beginner', title:{ko:'입문·3.0 진입반 수강생 모집', en:'Beginner and 3.0 bridge student pool'}, body:{ko:'입문자 자세, 서브/리턴 안정성, 기본 복식 포지셔닝 그룹반을 만들려는 코치 샘플입니다.', en:'A sample coach building a beginner group around fundamentals, serve/return consistency, and basic doubles positioning.'} },
    { type:'student', country:'US', city:{ko:'Alpharetta, GA', en:'Alpharetta, GA'}, zip:'30005', level:'3.5', focus:'dink', title:{ko:'3.5 딩크·카운터 코치 찾기', en:'Seeking 3.5 dink and counter coaching'}, body:{ko:'빠른 손싸움보다 낮은 딩크, 리셋, 블록 안정성을 우선 배우고 싶은 수강생 샘플입니다.', en:'A sample student who wants lower dinks, resets, and blocks before speeding up hand battles.'} },
    { type:'coach', country:'US', city:{ko:'Atlanta, GA', en:'Atlanta, GA'}, zip:'30328', level:'3.0-4.0', focus:'clinic', title:{ko:'Atlanta 3.0–4.0 클리닉 수요 확인', en:'Atlanta 3.0–4.0 clinic interest pool'}, body:{ko:'복식 전략, 전환존, 공격 전환을 주제로 지역 클리닉을 열 수 있는지 수요를 확인하는 코치 샘플입니다.', en:'A sample coach testing demand for a clinic on doubles strategy, transition-zone defense, and attack conversion.'} }
  ];
}


function tournamentSeeds() {
  return [
    { type:'host', country:'KR', city:{ko:'서울 송파', en:'Songpa, Seoul'}, zip:'05510', level:'3.0-4.0', focus:'mixed', title:{ko:'송파 주말 혼합복식 챌린지', en:'Songpa weekend mixed doubles challenge'}, body:{ko:'3.0~4.0 혼합복식 참가자를 모집하는 지역 대회 샘플입니다. 라운드로빈 후 상위팀 토너먼트 방식으로 운영됩니다.', en:'A sample local tournament recruiting 3.0–4.0 mixed doubles teams with round robin followed by a top-team bracket.'}, details:{ko:['날짜: 토요일 오전','종목: 혼합복식','방식: Round robin + bracket','등록: 공식 링크 확인'], en:['Date: Saturday morning','Division: Mixed doubles','Format: Round robin + bracket','Registration: check official link']} },
    { type:'participant', country:'KR', city:{ko:'경기 성남', en:'Seongnam, Gyeonggi'}, zip:'13524', level:'3.5', focus:'womens', title:{ko:'3.5 여자복식 대회 찾기', en:'Looking for a 3.5 women’s doubles event'}, body:{ko:'성남·분당권에서 3.5 여자복식 또는 클럽 리그 참가 기회를 찾는 참가자 샘플입니다.', en:'A sample participant looking for 3.5 women’s doubles or club-league events around Seongnam and Bundang.'}, details:{ko:['희망 일정: 주말','희망 종목: 여자복식','목표: 첫 지역대회 경험'], en:['Window: weekend','Division: women’s doubles','Goal: first local tournament experience']} },
    { type:'host', country:'US', city:{ko:'Atlanta, GA', en:'Atlanta, GA'}, zip:'30328', level:'3.0-4.5', focus:'round-robin', title:{ko:'Atlanta DUPR 스타일 라운드로빈 참가자 모집', en:'Atlanta DUPR-style round robin participant pool'}, body:{ko:'3.0~4.5 레벨별 라운드로빈 이벤트 참가자를 모집하는 대회 개최자 샘플입니다. DUPR-rated 여부는 공식 등록 링크에서 확인해야 합니다.', en:'A sample host recruiting 3.0–4.5 players for a level-based round robin. DUPR-rated status should be confirmed on the official registration link.'}, details:{ko:['장소: Atlanta area club','종목: 남복/여복/혼복','방식: 레벨별 라운드로빈'], en:['Venue: Atlanta area club','Divisions: MD / WD / Mixed','Format: level-based round robin']} },
    { type:'participant', country:'US', city:{ko:'Suwanee, GA', en:'Suwanee, GA'}, zip:'30024', level:'3.5', focus:'mens', title:{ko:'Suwanee 3.5 남자복식 대회 참가 희망', en:'Suwanee 3.5 men’s doubles tournament interest'}, body:{ko:'지역 클럽 대회나 주말 토너먼트에 함께 참여할 3.5 남자복식 기회를 찾는 참가자 샘플입니다.', en:'A sample participant looking for 3.5 men’s doubles opportunities in local club events or weekend tournaments.'}, details:{ko:['희망 종목: 남자복식','가능 시간: 주말 오전','목표: 클럽 대회 경험'], en:['Division: men’s doubles','Availability: weekend morning','Goal: club tournament experience']} }
  ];
}

function partnerSeeds() {
  return [
    { type:'seeking', country:'KR', city:{ko:'서울 강남', en:'Gangnam, Seoul'}, zip:'06164', level:'3.5', focus:'mixed', title:{ko:'3.5 혼합복식 파트너 찾기', en:'Seeking a 3.5 mixed doubles partner'}, body:{ko:'리턴과 리셋은 안정적이고, 전위 포칭과 커뮤니케이션을 같이 맞출 파트너를 찾는 플레이어 샘플입니다.', en:'A sample player seeking a mixed doubles partner who values stable returns, resets, poaching decisions, and clear communication.'}, details:{ko:['종목: 혼합복식','강점: 리턴·리셋','희망 파트너: 전위 판단 좋은 플레이어'], en:['Division: mixed doubles','Strengths: return and reset','Desired partner: strong net decisions']} },
    { type:'candidate', country:'KR', city:{ko:'부산 해운대', en:'Haeundae, Busan'}, zip:'48095', level:'3.0', focus:'womens', title:{ko:'여자복식 파트너 후보 등록', en:'Women’s doubles partner candidate'}, body:{ko:'딩크 안정성과 수비 전환을 강점으로 소개하고, 지역 클럽 리그나 친선 대회 파트너를 희망하는 샘플입니다.', en:'A sample candidate highlighting dink consistency and defensive transition for local club leagues or friendly tournaments.'}, details:{ko:['종목: 여자복식','스타일: 안정형','목표: 클럽 리그'], en:['Division: women’s doubles','Style: steady / defensive','Goal: club league']} },
    { type:'seeking', country:'US', city:{ko:'Johns Creek, GA', en:'Johns Creek, GA'}, zip:'30097', level:'4.0', focus:'mens', title:{ko:'4.0 남자복식 대회 파트너 찾기', en:'Seeking a 4.0 men’s doubles tournament partner'}, body:{ko:'드라이브 후 전진, 빠른 손싸움, 미들 콜을 명확히 맞출 4.0 파트너를 찾는 샘플입니다.', en:'A sample player seeking a 4.0 men’s doubles partner for drive-and-crash patterns, hands battles, and clear middle calls.'}, details:{ko:['종목: 남자복식','목표: 지역 대회','희망 스타일: 공격 전환 빠른 파트너'], en:['Division: men’s doubles','Goal: local tournament','Desired style: quick attack conversion']} },
    { type:'candidate', country:'US', city:{ko:'Alpharetta, GA', en:'Alpharetta, GA'}, zip:'30005', level:'3.5', focus:'mixed', title:{ko:'3.5 혼합복식 파트너 후보', en:'3.5 mixed doubles partner candidate'}, body:{ko:'낮은 딩크와 백핸드 블록을 강점으로, 주말 클럽 활동과 소규모 대회 파트너를 희망하는 샘플입니다.', en:'A sample candidate with low dinks and backhand blocks, open to weekend club play and small tournaments.'}, details:{ko:['종목: 혼합복식','강점: 딩크·블록','가능 시간: 주말'], en:['Division: mixed doubles','Strengths: dink and block','Availability: weekends']} }
  ];
}

function communityDirectoryCard(item, loc, kind) {
  const map = {
    friends: { organizer:'organizer', visitor:'visitorSeeking', player:'playerSeeking' },
    coaches: { coach:'coachSeeking', student:'studentSeeking' },
    tournaments: { host:'tournamentHost', participant:'tournamentParticipant' },
    partners: { seeking:'partnerSeeking', candidate:'partnerOffering' }
  };
  const labelKey = (map[kind] && map[kind][item.type]) || item.type;
  const typeLabel = communityLabel(loc, labelKey);
  const title = communityCardText(item, loc, 'title');
  const body = communityCardText(item, loc, 'body');
  const city = communityCardText(item, loc, 'city');
  const details = communityCardText(item, loc, 'details');
  const detailList = Array.isArray(details) && details.length
    ? `<ul class="qr-list community-details">${details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>`
    : '';
  return `<article class="qna-item community-entry" data-community-card data-type="${escAttr(item.type)}" data-country="${escAttr(item.country)}" data-city="${escAttr(city)}" data-zip="${escAttr(item.zip)}" data-level="${escAttr(item.level)}" data-focus="${escAttr(item.focus)}">
    <div class="qna-item__head"><div><h3>${esc(title)}</h3><div class="qna-item__meta"><span class="pill">${esc(typeLabel)}</span><span class="pill">${esc(city)} ${esc(item.zip)}</span><span class="pill">${esc(item.level)}</span><span class="pill">${esc(item.focus)}</span></div></div><span class="qna-item__status">${esc(boardLabel(loc, 'curated'))}</span></div>
    <p class="qna-item__question">${esc(body)}</p>${detailList}
  </article>`;
}

function communityForm(loc, kind, typeKey) {
  const typeLabel = communityLabel(loc, typeKey);
  let desc = '';
  if (kind === 'friends') desc = typeKey === 'organizer' ? communityLabel(loc, 'organizerDesc') : typeKey === 'visitor' ? communityLabel(loc, 'visitorDesc') : communityLabel(loc, 'playerDesc');
  else if (kind === 'coaches') desc = typeKey === 'student' ? communityLabel(loc, 'studentDesc') : communityLabel(loc, 'coachDesc');
  else if (kind === 'tournaments') desc = typeKey === 'host' ? communityLabel(loc, 'tournamentHostDesc') : communityLabel(loc, 'tournamentParticipantDesc');
  else if (kind === 'partners') desc = typeKey === 'seeking' ? communityLabel(loc, 'partnerSeekingDesc') : communityLabel(loc, 'partnerOfferingDesc');
  const defaultCountry = loc === 'ko' ? 'KR' : 'US';
  const toggleLabel = loc === 'ko' ? '입력 폼 열기' : 'Open form';
  const travelFields = typeKey === 'visitor' ? `
    <label>${esc(communityLabel(loc, 'homeCity'))}<input name="home" placeholder="${escAttr(loc === 'ko' ? 'Atlanta, GA / 서울 강남' : 'Atlanta, GA / Seoul')}"></label>
    <label>${esc(communityLabel(loc, 'visitWindow'))}<input name="window" placeholder="${escAttr(loc === 'ko' ? '예: 7/12 토요일 저녁, 7/13 오전' : 'Example: Sat evening, Sunday morning')}"></label>` : '';
  const tournamentFields = kind === 'tournaments' ? `
    <label>${esc(communityLabel(loc, 'venue'))}<input name="venue" placeholder="${escAttr(loc === 'ko' ? '예: 송파 실내코트 / Atlanta club' : 'Example: Atlanta club / Seoul indoor court')}"></label>
    <label>${esc(communityLabel(loc, 'eventDate'))}<input name="eventDate" placeholder="2026-08-15"></label>
    <label>${esc(communityLabel(loc, 'registrationDeadline'))}<input name="deadline" placeholder="2026-08-01"></label>
    <label>${esc(communityLabel(loc, 'division'))}<select name="division"><option value="mens">Men's Doubles</option><option value="womens">Women's Doubles</option><option value="mixed">Mixed Doubles</option><option value="singles">Singles</option><option value="round-robin">Round robin</option></select></label>
    <label>${esc(communityLabel(loc, 'format'))}<input name="format" placeholder="Round robin / Bracket / Pool play"></label>
    <label>${esc(communityLabel(loc, 'entryFee'))}<input name="fee" placeholder="$40 / ₩50,000 / TBD"></label>
    <label>${esc(communityLabel(loc, 'officialUrl'))}<input name="officialUrl" type="url" placeholder="https://..."></label>` : '';
  const partnerFields = kind === 'partners' ? `
    <label>${esc(communityLabel(loc, 'division'))}<select name="division"><option value="mens">Men's Doubles</option><option value="womens">Women's Doubles</option><option value="mixed">Mixed Doubles</option><option value="league">Club / League</option><option value="drills">Drill partner</option></select></label>
    <label>${esc(communityLabel(loc, 'targetEvent'))}<input name="targetEvent" placeholder="${escAttr(loc === 'ko' ? '예: 지역대회, 클럽리그, 주말 오픈플레이' : 'Example: local event, club league, weekend open play')}"></label>
    <label>${esc(communityLabel(loc, 'partnerStyle'))}<input name="style" placeholder="steady, aggressive, defensive, communicator"></label>
    <label>${esc(communityLabel(loc, 'desiredPartner'))}<input name="desiredPartner" placeholder="${escAttr(loc === 'ko' ? '예: 리턴 안정적, 미들 콜 명확한 파트너' : 'Example: steady returner, clear middle calls')}"></label>
    <label>${esc(communityLabel(loc, 'experience'))}<input name="experience" placeholder="${escAttr(loc === 'ko' ? '예: 클럽 리그 2회, 첫 대회 준비' : 'Example: two club leagues, first tournament')}"></label>
    <label>${esc(communityLabel(loc, 'partnerGoal'))}<input name="goal" placeholder="DUPR, fun, local league, tournament"></label>` : '';
  return `<details class="upload-card community-entry-card">
    <summary class="community-entry-card__summary">
      <div>
        <h2>${esc(typeLabel)}</h2>
        <p>${esc(desc)}</p>
      </div>
      <span class="community-entry-card__toggle">${esc(toggleLabel)}</span>
    </summary>
    <form name="picklary-${escAttr(kind)}-${escAttr(typeKey)}" method="POST" data-netlify="true" netlify-honeypot="bot-field" class="community-submit community-entry-card__form" data-community-submit data-kind="${escAttr(kind)}" data-type="${escAttr(typeKey)}">
      <input type="hidden" name="form-name" value="picklary-${escAttr(kind)}-${escAttr(typeKey)}">
      <p class="netlify-honeypot"><label>Do not fill this out <input name="bot-field"></label></p>
      <label>${esc(communityLabel(loc, 'name'))}<input name="name" required placeholder="${escAttr(loc === 'ko' ? '예: Shawn / 강남3.0모임' : 'Example: Shawn / Suwanee 3.0 Group')}"></label>
      <label>${esc(communityLabel(loc, 'country'))}<input name="country" value="${escAttr(defaultCountry)}" required></label>
      <label>${esc(communityLabel(loc, 'city'))}<input name="city" required placeholder="${escAttr(loc === 'ko' ? '서울 강남 / Suwanee, GA' : 'Suwanee, GA / Seoul')}"></label>
      <label>${esc(communityLabel(loc, 'zip'))}<input name="zip" required placeholder="30024 / 06164"></label>
      ${travelFields}
      ${tournamentFields}
      ${partnerFields}
      <label>${esc(communityLabel(loc, 'level'))}<select name="level">${levels.map((l) => `<option value="${escAttr(l.id)}">${esc(l.id)}</option>`).join('')}<option value="All">All</option></select></label>
      <label>${esc(communityLabel(loc, 'focus'))}<input name="focus" placeholder="dink, third-shot, open-play, mixed, mens, womens"></label>
      <label>${esc(communityLabel(loc, 'note'))}<textarea name="note" rows="4" required></textarea></label>
      <label>${esc(communityLabel(loc, 'contact'))}<input name="contact" placeholder="${escAttr(loc === 'ko' ? '공개하지 않을 이메일/카카오/연락 메모' : 'Private email, phone, or contact note')}"></label>
      <button class="btn btn--primary" type="submit">${esc(communityLabel(loc, 'savePreview'))}</button>
      <p class="community-submit-status" data-community-submit-status hidden></p>
      <p class="notice">${esc(communityLabel(loc, 'localOnly'))}</p>
    </form>
  </details>`;
}

function communityFilter(loc, kind) {
  let typeOptions = [];
  let focusOptions = [];
  if (kind === 'friends') { typeOptions = [['organizer', communityLabel(loc, 'organizer')], ['player', communityLabel(loc, 'playerSeeking')], ['visitor', communityLabel(loc, 'visitorSeeking')]]; focusOptions = ['open-play','community','competitive','drills','travel']; }
  else if (kind === 'coaches') { typeOptions = [['student', communityLabel(loc, 'studentSeeking')], ['coach', communityLabel(loc, 'coachSeeking')]]; focusOptions = ['third-shot','beginner','dink','clinic']; }
  else if (kind === 'tournaments') { typeOptions = [['host', communityLabel(loc, 'tournamentHost')], ['participant', communityLabel(loc, 'tournamentParticipant')]]; focusOptions = ['mens','womens','mixed','singles','round-robin']; }
  else if (kind === 'partners') { typeOptions = [['seeking', communityLabel(loc, 'partnerSeeking')], ['candidate', communityLabel(loc, 'partnerOffering')]]; focusOptions = ['mens','womens','mixed','league','drills']; }
  return `<div class="filter-panel community-filter" data-community-filter>
    <strong>${esc(communityLabel(loc, 'filterTitle'))}</strong>
    <label><span>${esc(communityLabel(loc, 'type'))}</span><select data-filter-type><option value="">${esc(communityLabel(loc, 'allTypes'))}</option>${typeOptions.map(([v,l]) => `<option value="${escAttr(v)}">${esc(l)}</option>`).join('')}</select></label>
    <label><span>${esc(communityLabel(loc, 'cityZip'))}</span><input data-filter-query placeholder="${escAttr(loc === 'ko' ? '서울, 06164, Suwanee' : 'City, ZIP, country')}"></label>
    <label><span>${esc(communityLabel(loc, 'level'))}</span><select data-filter-level><option value="">${esc(communityLabel(loc, 'allLevels'))}</option>${levels.map((l) => `<option value="${escAttr(l.id)}">${esc(l.id)}</option>`).join('')}<option value="All">All</option></select></label>
    <label><span>${esc(communityLabel(loc, 'focus'))}</span><select data-filter-focus><option value="">${esc(communityLabel(loc, 'allFocus'))}</option>${focusOptions.map((f) => `<option value="${escAttr(f)}">${esc(f)}</option>`).join('')}</select></label>
  </div>`;
}

function renderFriendsBoard(loc) {
  const seeds = friendSeeds();
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: boardLabel(loc, 'title'), rel: 'boards/' }, { name: communityLabel(loc, 'friendsShort') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(communityLabel(loc, 'friendsShort'))}</p><h1>${esc(communityLabel(loc, 'friendsTitle'))}</h1><p class="page-head__intro">${esc(communityLabel(loc, 'friendsHero'))}</p></div>
  ${visualFigure(loc, 'boards')}
</div></section>
<section class="band band--compact"><div class="wrap">${communityBoardSubnav(loc, 'friends')}${communityMiniDashboard(loc, 'friends', seeds)}</div></section>
<section class="band"><div class="wrap narrow prose"><h2>${esc(communityLabel(loc, 'whySplitTitle'))}</h2><p>${esc(communityLabel(loc, 'whySplitBody'))}</p><h2>${esc(communityLabel(loc, 'travelTitle'))}</h2><p>${esc(communityLabel(loc, 'travelBody'))}</p></div></section>
<section class="band band--alt"><div class="wrap cards cards--two">
  ${communityForm(loc, 'friends', 'organizer')}
  ${communityForm(loc, 'friends', 'player')}
  ${communityForm(loc, 'friends', 'visitor')}
</div></section>
<section class="band"><div class="wrap community-directory" data-community-directory data-no-match="${escAttr(communityLabel(loc, 'noMatch'))}">
  <div class="section-head"><div><h2>${esc(communityLabel(loc, 'directory'))}</h2><p>${esc(communityLabel(loc, 'friendsIntro'))}</p></div></div>
  ${communityFilter(loc, 'friends')}
  <div class="qna-board" data-community-list>${seeds.map((it) => communityDirectoryCard(it, loc, 'friends')).join('')}</div>
  <h2>${esc(communityLabel(loc, 'localPreview'))}</h2>
  <div class="qna-board" data-community-local-list></div>
</div></section>`;
  return layout({ loc, rel: 'boards/friends/', title: communityLabel(loc, 'friendsTitle'), description: communityLabel(loc, 'friendsIntro'), bodyHtml: body, noAds: true });
}

function renderCoachesBoard(loc) {
  const seeds = coachSeeds();
  const L = (ko, en) => (loc === 'ko' ? ko : en);
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: boardLabel(loc, 'title'), rel: 'boards/' }, { name: communityLabel(loc, 'coachesShort') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(communityLabel(loc, 'coachesShort'))}</p><h1>${esc(communityLabel(loc, 'coachesTitle'))}</h1><p class="page-head__intro">${esc(communityLabel(loc, 'coachesHero'))}</p></div>
  ${visualFigure(loc, 'boards')}
</div></section>
<section class="band band--compact"><div class="wrap">${communityBoardSubnav(loc, 'coaches')}${communityMiniDashboard(loc, 'coaches', seeds)}</div></section>
<section class="band"><div class="wrap narrow prose"><h2>${esc(communityLabel(loc, 'poolTitle'))}</h2><p>${esc(communityLabel(loc, 'poolIntro'))}</p><p>${esc(communityLabel(loc, 'whySplitBody'))}</p></div></section>
<section class="band"><div class="wrap community-directory" data-community-directory data-no-match="${escAttr(communityLabel(loc, 'noMatch'))}">
  <div class="section-head"><div><h2>${esc(communityLabel(loc, 'directory'))}</h2><p>${esc(communityLabel(loc, 'coachesIntro'))}</p></div></div>
  ${communityFilter(loc, 'coaches')}
  <div class="qna-board" data-community-list>${seeds.map((it) => communityDirectoryCard(it, loc, 'coaches')).join('')}</div>
  <h2>${esc(communityLabel(loc, 'localPreview'))}</h2>
  <div class="qna-board" data-community-local-list></div>
</div></section>
<section class="band band--alt"><div class="wrap">
  <div class="section-head"><div><h2>${esc(L('등록하기', 'Want to register?'))}</h2><p>${esc(L('입력 폼은 아래 버튼을 눌렀을 때만 펼쳐지도록 바꿨습니다.', 'The input forms stay collapsed until a user chooses to open them.'))}</p></div></div>
  <div class="two-col two-col--wide community-register-grid">
    ${communityForm(loc, 'coaches', 'student')}
    ${communityForm(loc, 'coaches', 'coach')}
  </div>
</div></section>`;
  return layout({ loc, rel: 'boards/coaches/', title: communityLabel(loc, 'coachesTitle'), description: communityLabel(loc, 'coachesIntro'), bodyHtml: body, noAds: true });
}


function renderTournamentsBoard(loc) {
  const seeds = tournamentSeeds();
  const L = (ko, en) => (loc === 'ko' ? ko : en);
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: boardLabel(loc, 'title'), rel: 'boards/' }, { name: communityLabel(loc, 'tournamentsShort') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(communityLabel(loc, 'tournamentsShort'))}</p><h1>${esc(communityLabel(loc, 'tournamentsTitle'))}</h1><p class="page-head__intro">${esc(communityLabel(loc, 'tournamentsHero'))}</p></div>
  ${visualFigure(loc, 'boards')}
</div></section>
<section class="band band--compact"><div class="wrap">${communityBoardSubnav(loc, 'tournaments')}${communityMiniDashboard(loc, 'tournaments', seeds)}</div></section>
<section class="band"><div class="wrap narrow prose"><h2>${esc(communityLabel(loc, 'tournamentWhyTitle'))}</h2><p>${esc(communityLabel(loc, 'tournamentWhyBody'))}</p><p class="notice">${esc(communityLabel(loc, 'tournamentDisclaimer'))}</p></div></section>
<section class="band"><div class="wrap community-directory" data-community-directory data-no-match="${escAttr(communityLabel(loc, 'noMatch'))}">
  <div class="section-head"><div><h2>${esc(communityLabel(loc, 'directory'))}</h2><p>${esc(communityLabel(loc, 'tournamentsIntro'))}</p></div></div>
  ${communityFilter(loc, 'tournaments')}
  <div class="qna-board" data-community-list>${seeds.map((it) => communityDirectoryCard(it, loc, 'tournaments')).join('')}</div>
  <h2>${esc(communityLabel(loc, 'localPreview'))}</h2>
  <div class="qna-board" data-community-local-list></div>
</div></section>
<section class="band band--alt"><div class="wrap">
  <div class="section-head"><div><h2>${esc(L('등록하기', 'Want to register?'))}</h2><p>${esc(L('대회 개최자와 참가 희망자는 아래 폼을 필요할 때만 펼쳐서 입력할 수 있습니다.', 'Hosts and participants can expand the form below only when they are ready to submit.'))}</p></div></div>
  <div class="two-col two-col--wide community-register-grid">
    ${communityForm(loc, 'tournaments', 'host')}
    ${communityForm(loc, 'tournaments', 'participant')}
  </div>
</div></section>`;
  return layout({ loc, rel: 'boards/tournaments/', title: communityLabel(loc, 'tournamentsTitle'), description: communityLabel(loc, 'tournamentsIntro'), bodyHtml: body, noAds: true });
}

function renderPartnersBoard(loc) {
  const seeds = partnerSeeds();
  const L = (ko, en) => (loc === 'ko' ? ko : en);
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: boardLabel(loc, 'title'), rel: 'boards/' }, { name: communityLabel(loc, 'partnersShort') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(communityLabel(loc, 'partnersShort'))}</p><h1>${esc(communityLabel(loc, 'partnersTitle'))}</h1><p class="page-head__intro">${esc(communityLabel(loc, 'partnersHero'))}</p></div>
  ${visualFigure(loc, 'boards')}
</div></section>
<section class="band band--compact"><div class="wrap">${communityBoardSubnav(loc, 'partners')}${communityMiniDashboard(loc, 'partners', seeds)}</div></section>
<section class="band"><div class="wrap narrow prose"><h2>${esc(communityLabel(loc, 'partnerWhyTitle'))}</h2><p>${esc(communityLabel(loc, 'partnerWhyBody'))}</p><p>${esc(communityLabel(loc, 'reviewPolicy'))}</p></div></section>
<section class="band"><div class="wrap community-directory" data-community-directory data-no-match="${escAttr(communityLabel(loc, 'noMatch'))}">
  <div class="section-head"><div><h2>${esc(communityLabel(loc, 'directory'))}</h2><p>${esc(communityLabel(loc, 'partnersIntro'))}</p></div></div>
  ${communityFilter(loc, 'partners')}
  <div class="qna-board" data-community-list>${seeds.map((it) => communityDirectoryCard(it, loc, 'partners')).join('')}</div>
  <h2>${esc(communityLabel(loc, 'localPreview'))}</h2>
  <div class="qna-board" data-community-local-list></div>
</div></section>
<section class="band band--alt"><div class="wrap">
  <div class="section-head"><div><h2>${esc(L('등록하기', 'Want to register?'))}</h2><p>${esc(L('Seeking / Candidate 입력란은 기본으로 접어 두고, 등록을 원하는 사람만 열 수 있게 했습니다.', 'Seeking / Candidate forms stay collapsed by default so only users who want to register need to open them.'))}</p></div></div>
  <div class="two-col two-col--wide community-register-grid">
    ${communityForm(loc, 'partners', 'seeking')}
    ${communityForm(loc, 'partners', 'candidate')}
  </div>
</div></section>`;
  return layout({ loc, rel: 'boards/partners/', title: communityLabel(loc, 'partnersTitle'), description: communityLabel(loc, 'partnersIntro'), bodyHtml: body, noAds: true });
}

function skillCriteria(loc) {
  const items = [
    { id:'return', weight:1.15, ko:'리턴 깊이·안정성', en:'Return depth and consistency' },
    { id:'thirdShot', weight:1.2, ko:'3구 드롭·드라이브 선택', en:'Third-shot drop / drive choice' },
    { id:'dink', weight:1.1, ko:'딩크 컨트롤', en:'Dink control' },
    { id:'reset', weight:1.15, ko:'리셋·블록', en:'Reset and block quality' },
    { id:'volley', weight:1.0, ko:'발리·카운터', en:'Volley and counter' },
    { id:'positioning', weight:1.2, ko:'복식 포지셔닝', en:'Doubles positioning' },
    { id:'decision', weight:1.2, ko:'샷 선택·전략 판단', en:'Shot selection and strategy' },
    { id:'consistency', weight:1.0, ko:'언포스드 에러 관리', en:'Unforced-error control' }
  ];
  return items.map((x) => ({ ...x, label: loc === 'ko' ? x.ko : x.en }));
}

function renderSkillReviewBoard(loc) {
  const criteria = skillCriteria(loc);
  const L = (ko, en) => (loc === 'ko' ? ko : en);
  const criteriaInputs = criteria.map((c) => `<label class="criterion-input"><span>${esc(c.label)} <small>w ${esc(c.weight)}</small></span><input name="crit_${escAttr(c.id)}" data-criterion-input data-weight="${escAttr(c.weight)}" type="number" min="2" max="5.5" step="0.1" value="3.0"></label>`).join('');
  const sampleRequests = [
    { tag: L('샘플', 'Sample'), status: L('리뷰 대기', 'Awaiting review'), title: L('3.0 전환구역 백핸드 리셋', '3.0 transition-zone backhand reset'), level: '3.0', city: L('Suwanee / 30024', 'Suwanee / 30024'), focus: L('백핸드 리셋 · 발 멈춤 · 팝업 방지', 'Backhand reset · split step · pop-up control'), note: L('상대가 발밑으로 빠르게 밀어 넣을 때 공이 자주 뜨는 장면을 평가받고 싶습니다.', 'I want feedback on why my reset pops up when opponents attack my feet.'), reviews: 0 },
    { tag: L('샘플', 'Sample'), status: L('검토 중', 'In review'), title: L('2.5 서브 리턴 깊이와 전진 타이밍', '2.5 return depth and move-in timing'), level: '2.5', city: L('서울 강남', 'Gangnam, Seoul'), focus: L('리턴 깊이 · 키친 진입 · 첫 4구 안정성', 'Return depth · kitchen entry · first-four-shot consistency'), note: L('리턴 후 앞으로 올라가는 타이밍이 늦는지 확인하고 싶습니다.', 'I want to know whether I move forward too late after the return.'), reviews: 2 },
    { tag: L('샘플', 'Sample'), status: L('리뷰 완료', 'Reviewed'), title: L('3.5 혼복 스피드업 판단', '3.5 mixed doubles speed-up decision'), level: '3.5', city: 'Atlanta / 30328', focus: L('스피드업 선택 · 몸쪽 공격 · 카운터 대비', 'Speed-up choice · body attack · counter readiness'), note: L('공격 가능한 공과 기다려야 하는 공을 구분하고 싶습니다.', 'I want help separating attackable balls from balls I should keep neutral.'), reviews: 5 }
  ];
  const sampleCards = sampleRequests.map((r) => `
    <article class="skill-request-card">
      <div class="skill-request-card__top"><span class="pill">${esc(r.tag)}</span><span class="skill-request-status">${esc(r.status)}</span></div>
      <h3>${esc(r.title)}</h3>
      <div class="skill-request-card__meta"><span>${esc(r.level)}</span><span>${esc(r.city)}</span><span>${esc(r.reviews)} ${esc(L('평가', 'reviews'))}</span></div>
      <p class="skill-request-card__focus">${esc(r.focus)}</p>
      <p>${esc(r.note)}</p>
    </article>`).join('');
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: boardLabel(loc, 'title'), rel: 'boards/' }, { name: communityLabel(loc, 'skillShort') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(communityLabel(loc, 'skillShort'))}</p><h1>${esc(communityLabel(loc, 'skillTitle'))}</h1><p class="page-head__intro">${esc(communityLabel(loc, 'skillIntro'))}</p></div>
  ${visualFigure(loc, 'dupr')}
</div></section>
<section class="band"><div class="wrap narrow prose"><h2>${esc(loc === 'ko' ? '외부 영상 URL 방식' : 'External-video workflow')}</h2><p>${esc(loc === 'ko' ? '사이트에 영상을 직접 업로드하지 않고 YouTube, Instagram, TikTok, Facebook Reels 등 외부 영상 URL만 공유하도록 설계했습니다. 이렇게 하면 서버 용량, 저작권, 개인정보, 삭제 요청 관리 부담을 줄이면서도 Picklary 안에서는 평가 기준, 평균, 신뢰도, 훈련 추천을 콘텐츠화할 수 있습니다.' : 'Instead of uploading video files to Picklary, players share a YouTube, Instagram, TikTok, Facebook Reels, or similar external URL. This lowers storage, copyright, privacy, and takedown risk while Picklary adds value through criteria, estimates, confidence, and training recommendations.')}</p><p class="notice">${esc(communityLabel(loc, 'officialDisclaimer'))}</p></div></section>
<section class="band band--alt"><div class="wrap skill-review-demo" data-skill-review-demo>
  <div class="skill-board-head">
    <div>
      <p class="section-eyebrow">${esc(L('게시판', 'Board'))}</p>
      <h2>${esc(L('리뷰 요청 리스트', 'Review request board'))}</h2>
      <p>${esc(L('먼저 현재 올라온 요청을 확인하고, 내 영상을 평가받고 싶을 때만 Review Request 버튼으로 입력 폼을 여세요.', 'Browse current requests first, then open the Review Request form only when you want to submit your own video.'))}</p>
    </div>
    <button type="button" class="btn btn--primary" data-open-skill-request>${esc(L('Review Request 열기', 'Open Review Request'))}</button>
  </div>
  <div class="skill-board-stats" aria-label="${escAttr(L('스킬 리뷰 현황', 'Skill review stats'))}">
    <div><strong>3</strong><span>${esc(L('샘플 요청', 'sample requests'))}</span></div>
    <div><strong>7</strong><span>${esc(L('기준별 평가', 'criteria reviews'))}</span></div>
    <div><strong>3.0</strong><span>${esc(L('최다 레벨', 'most common level'))}</span></div>
    <div><strong>${esc(L('리셋', 'Reset'))}</strong><span>${esc(L('인기 주제', 'top focus'))}</span></div>
  </div>
  <div class="skill-request-list" data-skill-request-list>${sampleCards}<div data-skill-local-list></div></div>
  <div class="skill-request-panel" data-skill-request-panel hidden>
    <form class="upload-card skill-request-form" name="picklary-skill-review" method="POST" data-netlify="true" netlify-honeypot="bot-field" data-video-request-form>
      <input type="hidden" name="form-name" value="picklary-skill-review">
      <p class="hidden"><label>Do not fill this out <input name="bot-field"></label></p>
      <div class="skill-form-head"><h2>${esc(loc === 'ko' ? '평가 요청 등록' : 'Submit a review request')}</h2><button type="button" class="btn btn--ghost" data-close-skill-request>${esc(L('닫기', 'Close'))}</button></div>
      <label>${esc(communityLabel(loc, 'videoUrl'))}<input name="url" type="url" required placeholder="https://youtube.com/..."></label>
      <div class="form-grid form-grid--two">
        <label>${esc(communityLabel(loc, 'selfLevel'))}<select name="level">${levels.map((l) => `<option value="${escAttr(l.id)}">${esc(l.id)}</option>`).join('')}</select></label>
        <label>${esc(communityLabel(loc, 'requestFocus'))}<input name="focus" required placeholder="dink, reset, third-shot, positioning"></label>
      </div>
      <div class="form-grid form-grid--two">
        <label>${esc(communityLabel(loc, 'city'))}<input name="city" placeholder="Suwanee / Seoul / Atlanta"></label>
        <label>${esc(communityLabel(loc, 'contact'))}<input name="contact" placeholder="${escAttr(L('공개되지 않는 연락 메모', 'Private contact note'))}"></label>
      </div>
      <label>${esc(communityLabel(loc, 'note'))}<textarea name="note" rows="4" required placeholder="${escAttr(L('어떤 장면을 평가받고 싶은지 적어 주세요.', 'Describe what you want reviewers to look at.'))}"></textarea></label>
      <label class="checkbox-line"><input name="consent" type="checkbox" required> <span>${esc(L('영상 공유 권한과 개인정보 노출 여부를 확인했습니다.', 'I confirm I have permission to share the video and checked personal information exposure.'))}</span></label>
      <button class="btn btn--primary" type="submit">${esc(communityLabel(loc, 'savePreview'))}</button>
      <p class="notice" data-skill-request-status hidden></p>
      <p class="notice">${esc(communityLabel(loc, 'localOnly'))}</p>
    </form>
  </div>
</div></section>
<section class="band"><div class="wrap two-col two-col--wide skill-review-analysis" data-skill-review-analysis>
  <div>
    <div class="result-card skill-estimate" data-skill-estimate>
      <p class="result-card__eyebrow">${esc(communityLabel(loc, 'communityEstimate'))}</p>
      <h2 class="result-card__band" data-estimate-value>—</h2>
      <p class="result-card__desc" data-estimate-meta>${esc(loc === 'ko' ? '기준별 평가를 추가하면 가중 평균, 평가자 신뢰도, 교차검증 신호가 표시됩니다.' : 'Add criteria reviews to show weighted average, reviewer trust, and cross-check signals.')}</p>
      <p class="notice">${esc(communityLabel(loc, 'officialDisclaimer'))}</p>
    </div>
    <div class="qna-board" data-review-list></div>
  </div>
  <form class="upload-card" data-review-form>
    <h2>${esc(loc === 'ko' ? '커뮤니티 기준별 평가 추가' : 'Add a criteria-based review')}</h2>
    <p class="notice">${esc(communityLabel(loc, 'criteriaIntro'))}</p>
    <label>${esc(communityLabel(loc, 'reviewerType'))}<select name="reviewer"><option value="general">General player</option><option value="email">Email-checked player</option><option value="dupr">DUPR public-profile reviewer</option><option value="coach">Coach / editor reviewed</option></select></label>
    <fieldset class="criteria-grid"><legend>${esc(communityLabel(loc, 'criterionScores'))}</legend>${criteriaInputs}</fieldset>
    <p class="notice" data-criteria-preview>${esc(communityLabel(loc, 'computedFromCriteria'))}: 3.00</p>
    <label>${esc(communityLabel(loc, 'reviewOpinion'))}<textarea name="note" rows="3" placeholder="Why this estimate?"></textarea></label>
    <label>${esc(communityLabel(loc, 'evidenceNote'))}<input name="evidence" placeholder="Example: 0:42 return short, 1:10 reset miss"></label>
    <button class="btn btn--primary" type="submit">${esc(communityLabel(loc, 'addReview'))}</button>
  </form>
</div></section>
<section class="band"><div class="wrap narrow prose"><h2>${esc(communityLabel(loc, 'criteriaTitle'))}</h2><p>${esc(communityLabel(loc, 'criteriaIntro'))}</p><h2>${esc(communityLabel(loc, 'crosscheckTitle'))}</h2><p>${esc(communityLabel(loc, 'crosscheckDesc'))}</p></div></section>`;
  return layout({ loc, rel: 'boards/skill-review/', title: communityLabel(loc, 'skillTitle'), description: communityLabel(loc, 'skillIntro'), bodyHtml: body, noAds: true });
}

function renderCategoriesIndex(loc) {
  const L = (ko, en, es) => (loc === 'ko' ? ko : (loc === 'es' ? (es || en) : en));
  const rulesCard = boardCard(
    loc,
    link(loc, 'pro-scene/rules/'),
    L('PPA · MLP 룰 북 & 규정변경', 'PPA & MLP Rulebook + Rule Changes', 'Reglas PPA y MLP + cambios'),
    L('PPA·MLP 규정, 룰 북, 시즌별 주요 변경사항을 하나의 카드에서 바로 확인합니다.', 'Open PPA/MLP rules, rulebooks, and notable season changes from this single card.', 'Abre reglas, reglamentos y cambios relevantes de PPA/MLP desde esta tarjeta.'),
    L('규정 허브', 'Rules hub', 'Centro de reglas'),
    uiIcon('rules'),
    'rules'
  );
  const blogsCard = `<article class="board-card board-card--blogs">
    <span class="board-card__eyebrow">${esc(L('블로그 링크', 'Blog links', 'Blogs'))}</span>
    <span class="board-card__icon" aria-hidden="true">${uiIcon('qna')}</span>
    <h3>${esc(L('블로그 연결', 'Blog gateways', 'Puertas al blog'))}</h3>
    <p>${esc(L('Picklary 외부 블로그로 연결되는 창구입니다.', 'Direct gateways to the external Picklary blogs.', 'Puertas directas a los blogs externos de Picklary.'))}</p>
    <div class="board-card__actions board-card__actions--stack">
      <a class="community-shortcut community-shortcut--partners" href="https://picklary.blogspot.com/" target="_blank" rel="noopener noreferrer"><span class="community-shortcut__icon" aria-hidden="true">↗</span><span><strong>picklary.blogspot.com</strong><small>${esc(L('구글 블로그', 'Google Blogger', 'Google Blogger'))}</small></span></a>
      <a class="community-shortcut community-shortcut--coaches" href="https://blog.naver.com/arctic" target="_blank" rel="noopener noreferrer"><span class="community-shortcut__icon" aria-hidden="true">↗</span><span><strong>blog.naver.com/arctic</strong><small>${esc(L('네이버 블로그', 'Naver Blog', 'Blog de Naver'))}</small></span></a>
    </div>
  </article>`;
  const boardsCard = `<article class="board-card board-card--skill">
    <span class="board-card__eyebrow">${esc(L('커뮤니티에서 이동', 'Moved from Play Hub', 'Movido desde Play Hub'))}</span>
    <span class="board-card__icon" aria-hidden="true">${uiIcon('skill')}</span>
    <h3>${esc(L('스킬 리뷰 · 질의응답 · 자주 묻는 질문', 'Skill Review · Q&A · FAQ', 'Skill Review · Q&A · FAQ'))}</h3>
    <p>${esc(L('커뮤니티에서 분리한 학습형 콘텐츠를 이 메뉴에서 모아 봅니다.', 'Learning-focused content split out of Play Hub is now grouped here.', 'El contenido de aprendizaje separado de Play Hub ahora vive aquí.'))}</p>
    <div class="board-card__actions board-card__actions--stack">
      <a class="community-shortcut community-shortcut--partners" href="${link(loc, 'boards/skill-review/')}"><span class="community-shortcut__icon" aria-hidden="true">${uiIcon('skill')}</span><span><strong>${esc(L('스킬 리뷰', 'Skill Review', 'Skill Review'))}</strong><small>${esc(L('영상 기반 피드백과 커뮤니티 추정치', 'Video-based feedback and community estimate', 'Feedback en video y estimación comunitaria'))}</small></span></a>
      <a class="community-shortcut community-shortcut--tournaments" href="${link(loc, 'boards/qna/')}"><span class="community-shortcut__icon" aria-hidden="true">${uiIcon('qna')}</span><span><strong>${esc(L('질의응답', 'Q&A', 'Q&A'))}</strong><small>${esc(L('경기 상황 질문과 답변', 'Questions and answers for match situations', 'Preguntas y respuestas sobre situaciones de juego'))}</small></span></a>
      <a class="community-shortcut community-shortcut--coaches" href="${link(loc, 'boards/dupr-faq/')}"><span class="community-shortcut__icon" aria-hidden="true">${uiIcon('faq')}</span><span><strong>${esc(L('자주 묻는 질문', 'FAQ', 'FAQ'))}</strong><small>${esc(L('레벨별 자주 묻는 질문', 'Level-based frequently asked questions', 'Preguntas frecuentes por nivel'))}</small></span></a>
    </div>
  </article>`;
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'categories.title') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(tt(loc, 'categories.title'))}</p><h1>${esc(tt(loc, 'categories.title'))}</h1><p class="page-head__intro">${esc(L('중복되는 메뉴를 줄이고, 규정·블로그·학습형 커뮤니티 기능을 한곳에 묶은 인사이트 허브입니다.', 'An Insights hub that trims overlap and groups rules, blog gateways, and learning-oriented community tools in one place.', 'Un hub de Insights que reduce solapamientos y reúne reglas, blogs y herramientas de aprendizaje en un solo lugar.'))}</p></div>
  ${visualFigure(loc, 'insights')}
</div></section>
<section class="band"><div class="wrap"><div class="hub-chooser hub-chooser--insights">${rulesCard}${boardsCard}${blogsCard}</div></div></section>
<section class="band"><div class="wrap narrow prose source-panel source-panel--hub"><h2>${esc(L('구성 원칙', 'Why this layout', 'Por qué este diseño'))}</h2><p>${esc(L('Play Hub는 실제 사람과 연결되는 경로에 집중하고, Insights는 규정·콘텐츠·학습형 게시판을 모아 탐색성을 높였습니다.', 'Play Hub now focuses on real-world connections, while Insights gathers rules, content, and learning boards to improve findability.', 'Play Hub se enfoca ahora en conexiones reales, mientras Insights reúne reglas, contenido y tableros de aprendizaje para mejorar la navegación.'))}</p></div></section>
${adsenseDepthBlock(loc, 'categories')}`;
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
</div></section>
${categoryDepthBlock(cat, loc)}`;
  return layout({ loc, rel, title: name, description: enrichDesc(loc1(cat, loc, 'blurb'), loc, ' 이 주제의 가이드·글·도구를 한곳에 모았습니다.', ' Guides, articles, and tools on this topic, in one place.'), bodyHtml: body });
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
  let related = (p.related || []).map((s) => postBySlug[s]).filter(Boolean);
  if (related.length < 3) {
    const have = new Set([p.slug, ...related.map((r) => r.slug)]);
    const byDate = (a, b) => String(b.updated || b.date || '').localeCompare(String(a.updated || a.date || ''));
    const sameCat = publishedPosts.filter((x) => x.category === p.category && !have.has(x.slug)).sort(byDate);
    const others = publishedPosts.filter((x) => x.category !== p.category && !have.has(x.slug)).sort(byDate);
    for (const x of sameCat.concat(others)) { if (related.length >= 3) break; related.push(x); have.add(x.slug); }
  }
  related = related.slice(0, 3);
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

  const visualHtml = postVisual(loc, p);

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
      ${nextStepSection(loc, p.category === 'paddles' || p.category === 'gear' ? 'gear' : p.category === 'pro' ? 'pro' : p.category === 'rules' ? 'rules' : 'post', { slug: p.slug })}
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
  if (p.heroImage) jsonld[0].image = `${config.url}/assets/img/${String(p.heroImage).replace(/^\/+/, '').replace(/^assets\/img\//, '')}`;
  if (faq.length) jsonld.push({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  });

  return layout({
    loc, rel, title, description: summary, ogType: 'article', theme: themeForCategory(p.category),
    noindex: !translated, jsonld, bodyHtml: articleBody, bodyClass: 'page-post',
    ogImage: p.heroImage ? `/assets/img/${String(p.heroImage).replace(/^\/+/, '').replace(/^assets\/img\//, '')}` : undefined,
  });
}

function renderColumnsIndex(loc) {
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'nav.columns') }])}
<section class="page-head"><div class="wrap">
  <p class="page-head__eyebrow">${esc(tt(loc, 'label.column'))}</p>
  <h1>${esc(tt(loc, 'author.columnsTitle'))}</h1>
  <p class="page-head__intro">${esc(tt(loc, 'author.visitorIntro'))}</p>
</div></section>
<section class="band"><div class="wrap"><div class="cards">${publishedColumns.map((c) => columnCard(c, loc)).join('')}</div></div></section>
${adsenseDepthBlock(loc, 'columns')}`;
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
      ${nextStepSection(loc, 'post')}
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
  <p>${esc(loc === 'ko' ? '대회 관련 내용은 모두 프로투어 메뉴에 모았습니다. 업데이트 센터는 규정 변경, 선수 동향, 대회 외 피클볼 뉴스에 집중합니다.' : 'All tournament coverage lives in the Pro Tour menu. The Update Center focuses on rule changes, player news, and non-tournament pickleball news.')}</p>
  <p><a class="btn btn--primary" href="${link(loc, 'tournaments/')}">${esc(loc === 'ko' ? '프로투어로 가기' : 'Go to Pro Tour')} →</a></p>
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
    ? `<img class="rank-avatar__img" src="/assets/img/players/${escAttr(slug)}.svg"${svgDims('players/' + slug + '.svg')} alt="${escAttr(name)} — illustration" loading="lazy">`
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

function rulesLegalityBlock(loc) {
  const RL = rulesLegality || { paddleStatus: [], ruleChanges: [] };
  const t = (ko, en) => (loc === 'ko' ? ko : en);
  const pickKo = (o, b) => (loc === 'ko' && o[b + 'Ko']) ? o[b + 'Ko'] : o[b];
  const kindLabel = { removed: t('승인 취소', 'Removed'), review: t('조사 중', 'Under review'), resolved: t('해결됨', 'Resolved'), note: t('주의', 'Note') };
  // Paddle-legality rows
  const rows = (RL.paddleStatus || []).map((p) => {
    const status = pickKo(p, 'status');
    const note = pickKo(p, 'note');
    const paddleLink = p.relPaddle ? `<a class="legal-row__link" href="${link(loc, 'paddles/' + p.relPaddle + '/')}">${esc(t('우리 리뷰 보기', 'See our review'))} →</a>` : '';
    return `<li class="legal-row legal-row--${esc(p.kind)}">
      <div class="legal-row__top">
        <span class="legal-row__name">${esc(p.brand)} <span class="legal-row__model">${esc(p.model)}</span></span>
        <span class="status-badge status-badge--${esc(p.kind)}">${esc(kindLabel[p.kind] || status)}</span>
      </div>
      <p class="legal-row__note">${esc(note)}</p>
      <div class="legal-row__meta"><span class="auth-chip">${esc(p.authority)}</span><span class="legal-row__date">${esc(t('확인', 'checked'))} ${esc(p.date)}</span><a class="legal-row__src" href="${escAttr(p.sourceUrl)}" rel="nofollow noopener" target="_blank">${esc(p.sourceName)}</a>${paddleLink}</div>
    </li>`;
  }).join('');
  // 2026 rule-change cards
  const ruleCards = (RL.ruleChanges || []).map((r) => `<article class="rule-card">
    <span class="rule-card__tag">${esc(pickKo(r, 'tag'))}</span>
    <h3 class="rule-card__title">${esc(pickKo(r, 'title'))}</h3>
    <p class="rule-card__body">${esc(pickKo(r, 'summary'))}</p>
  </article>`).join('');
  const verifyNote = t(
    `패들 상태는 ${esc(RL.checked)} 기준으로 공식·신뢰 출처에서 확인했으며 매일 바뀔 수 있습니다 — 대회 전 반드시 공식 데이터베이스에서 최종 확인하세요. 승인은 USAP(아마추어)·UPA-A(프로)가 별도로 관리합니다.`,
    `Paddle statuses were verified on ${esc(RL.checked)} from official and reputable sources and can change daily — always confirm on the official database before you compete. USAP (amateur) and UPA-A (pro) certify separately.`);
  const explore = (href, k, ttl, d) => `<a class="explore-card" href="${href}"><span class="explore-card__k">${esc(k)}</span><span class="explore-card__t">${esc(ttl)}</span><span class="explore-card__d">${esc(d)}</span></a>`;
  return `
<section class="band"><div class="wrap">
  <div class="section-head"><div><h2 class="band__title">${esc(t('합법성은 두 기구가 정합니다', 'Two bodies decide legality'))}</h2><p class="band__intro">${esc(t('한 기구의 승인이 다른 기구의 승인을 보장하지 않습니다. 어디서 경기하느냐에 따라 확인할 목록이 다릅니다.', 'Approval by one body does not guarantee approval by the other — where you play decides which list to check.'))}</p></div></div>
  <div class="body-cards">
    <article class="body-card"><h3>USA Pickleball (USAP)</h3><p class="body-card__tag">${esc(t('아마추어·공인 대회', 'Amateur & sanctioned play'))}</p><p>${esc(t('전국·지역·로컬 공인 대회를 관장합니다. 규격·소재·표면 그릿(스핀)과 PBCoR(반발·“트램펄린” 파워 한도)을 테스트합니다.', 'Governs Nationals, regional, and local sanctioned events. Tests dimensions, materials, surface grit (spin), and PBCoR — the rebound or “trampoline” power limit.'))}</p><p class="body-card__db">${esc(t('실시간 DB', 'Live database'))}: equipment.usapickleball.org</p></article>
    <article class="body-card"><h3>UPA-A</h3><p class="body-card__tag">${esc(t('프로 투어 (PPA·MLP)', 'The pro tours (PPA & MLP)'))}</p><p>${esc(t('PPA 투어와 MLP 장비를 인증합니다. 파워·스핀·브레이크인 이후 변화를 독립적이고 더 엄격한 실험실 테스트로 검증합니다.', 'Certifies equipment for the PPA Tour and MLP with independent, stricter lab testing for power, spin, and post-break-in changes.'))}</p><p class="body-card__db">${esc(t('목록', 'List'))}: upaa.unitedpickleball.com</p></article>
  </div>
</div></section>
<section class="band band--alt"><div class="wrap">
  <div class="section-head"><div><h2 class="band__title">${esc(t('패들 합법성 워치', 'Paddle legality watch'))}</h2><p class="band__intro">${esc(t('최근 승인 취소·조사·재승인 사례. 한눈에 확인하고, 출처로 바로 이동하세요.', 'Recent removals, reviews, and re-approvals — scan the status, then jump to the source.'))}</p></div></div>
  <ul class="legal-list">${rows}</ul>
  <p class="notice">${verifyNote}</p>
  <div class="source-buttons"><a class="btn btn--ghost" href="https://equipment.usapickleball.org/compliance/" rel="nofollow noopener" target="_blank">USAP ${esc(t('컴플라이언스', 'Compliance'))}</a><a class="btn btn--ghost" href="https://equipment.usapickleball.org" rel="nofollow noopener" target="_blank">USAP ${esc(t('승인 DB', 'Approved DB'))}</a></div>
</div></section>
<section class="band"><div class="wrap">
  <div class="section-head"><div><h2 class="band__title">${esc(t('2026 규정 변경', '2026 rule changes'))}</h2><p class="band__intro">${esc(t('2026년 1월 1일 발효. 대부분은 회색지대를 줄인 명확화이며, 우리 문장으로 요약했습니다.', 'Effective January 1, 2026 — mostly clarifications that close gray areas, summarised in our own words.'))}</p></div></div>
  <div class="rule-cards">${ruleCards}</div>
</div></section>
<section class="band band--alt"><div class="wrap">
  <div class="section-head"><div><h2 class="band__title">${esc(t('사기 전·나가기 전 확인', 'Check before you buy or compete'))}</h2></div></div>
  <ol class="check-flow">
    <li class="check-step"><span class="check-step__n">1</span><div><strong>${esc(t('정확한 모델명 확인', 'Match the exact model name'))}</strong><p>${esc(t('두께·모양·버전 표기(14/16mm, 엘롱게이티드, Pro/Power 등)까지 정확히 일치해야 합니다.', 'Thickness, shape, and version letters (14/16mm, elongated, Pro/Power) all have to match exactly.'))}</p></div></li>
    <li class="check-step"><span class="check-step__n">2</span><div><strong>${esc(t('맞는 데이터베이스에서 검색', 'Search the right database'))}</strong><p>${esc(t('아마추어·공인 대회는 USAP, PPA·MLP 프로 부문은 UPA-A 목록을 확인하세요.', 'USAP for amateur and sanctioned events; UPA-A for PPA and MLP pro divisions.'))}</p></div></li>
    <li class="check-step"><span class="check-step__n">3</span><div><strong>${esc(t('대회 직전 다시 확인', 'Re-check right before the event'))}</strong><p>${esc(t('상태는 매일 바뀔 수 있고, 승인 취소된 패들은 몰수로 이어집니다. 등재 화면을 날짜와 함께 캡처해 두세요.', 'Statuses can change daily and a removed paddle means forfeiture — screenshot the listing with the date.'))}</p></div></li>
  </ol>
  <div class="section-head" style="margin-top:1.5rem"><div><h3 class="band__title">${esc(t('Picklary에서 이어 보기', 'Keep going on Picklary'))}</h3></div></div>
  <div class="explore-grid">
    ${explore(link(loc, 'tools/paddle-finder/'), t('도구', 'Tool'), t('패들 파인더', 'Paddle Finder'), t('플레이 스타일에 맞는 승인 패들 추천', 'Approved paddles matched to your style'))}
    ${explore(link(loc, 'paddles/'), t('패들', 'Paddles'), t('패들 전체 보기', 'Browse all paddles'), t('스펙·플레이 감각 비교', 'Compare specs and how they play'))}
    ${explore(link(loc, 'paddles/selkirk-project-boomstik/'), t('리뷰', 'Review'), 'Selkirk Project Boomstik', t('MOI 클램프 관련 패들 리뷰', 'The paddle behind the MOI-clamp note'))}
    ${explore(link(loc, 'level/'), t('레벨', 'Levels'), t('내 레벨 알아보기', 'Find your level'), t('2.0–5.0 레벨별 기술과 성장법', 'Skills and step-ups from 2.0 to 5.0'))}
  </div>
</div></section>`;
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
      news: 'Short notes on non-tournament pickleball news and official announcements. For schedules, results, and rankings, see the Pro Tour menu.',
      rules: 'Official rules, paddle approval, and ban-related updates that can affect tournament play.',
      players: 'Player ratings, ranking moves, roster or team changes, and returns or injuries — verified at the source.'
    }
  };
  const intro = (introMap[loc] && introMap[loc][type]) || (introMap.en[type] || updateLabel(loc, 'intro'));
  const richBlock = type === 'rules' ? rulesLegalityBlock(loc) : '';
  const feedGrid = `<div class="update-grid">${items.length ? items.map((u) => updateCard(u, loc)).join('') : `<p class="notice">${esc(updateLabel(loc, 'noItems'))}</p>`}</div>`;
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: updateLabel(loc, 'title'), rel: 'updates/' }, { name: title }])}
<section class="page-head"><div class="wrap"><p class="page-head__eyebrow">${esc(updateLabel(loc, 'nav'))}</p><h1>${esc(title)}</h1><p class="page-head__intro">${esc(intro)}</p></div></section>
<section class="band"><div class="wrap">${updateCategoryTabs(loc, type)}${richBlock ? '' : feedGrid}</div></section>
${richBlock}
${richBlock ? `<section class="band"><div class="wrap"><h2 class="band__title">${esc(loc === 'ko' ? '관련 업데이트 피드' : 'Related update feed')}</h2>${feedGrid}</div></section>` : ''}
<section class="band band--alt"><div class="wrap"><h2 class="band__title">${esc(updateLabel(loc, 'sources'))}</h2>${updateSourceCards(loc, type)}</div></section>`;
  const isRules = type === 'rules';
  const seoTitle = isRules ? (loc === 'ko' ? '피클볼 규정·패들 승인 (2026)' : 'Pickleball rules & paddle legality (2026)') : (title + ' · ' + updateLabel(loc, 'title'));
  const seoDesc = isRules ? (loc === 'ko' ? '2026 USA Pickleball 규정 변경과 패들 합법성을 쉽게 정리했습니다 — USAP와 UPA-A의 차이, 최근 승인 취소·조사 중 패들, 대회 전 내 패들 확인법.' : 'A plain-English guide to 2026 USA Pickleball rule changes and paddle legality — how USAP and UPA-A differ, which paddles were recently removed or are under review, and how to check yours before you compete.') : intro;
  const canonical = config.url + '/' + loc + '/updates/rules/';
  const rulesJsonld = isRules ? [{ '@context': 'https://schema.org', '@type': 'Article', headline: seoTitle, description: seoDesc, inLanguage: loc, datePublished: '2026-01-01', dateModified: (rulesLegality && rulesLegality.checked) || '2026-06-26', author: { '@type': 'Organization', name: config.siteName, url: config.url }, publisher: { '@type': 'Organization', name: config.siteName, logo: { '@type': 'ImageObject', url: config.url + '/assets/icons/og-default.png' } }, image: config.url + '/assets/icons/og-default.png', mainEntityOfPage: { '@type': 'WebPage', '@id': canonical } }] : undefined;
  return layout({ loc, rel: 'updates/' + type + '/', title: seoTitle, description: seoDesc, noindex: !isRules, bodyHtml: body, noAds: false, jsonld: rulesJsonld });
}


function tournamentLabel(loc, key) {
  const labels = {
    ko: {
      nav: '프로투어', title: '피클볼 프로투어·결과', intro: 'PPA, MLP 등 프로 투어 일정과 최근 결과, 참가 요강, 주요 참가선수 확인 경로를 한곳에서 정리합니다. 접수 마감, 참가 명단, 장소 변경은 반드시 원문 공식 페이지에서 최종 확인하세요.',
      all: '전체 프로투어 정보', usa: '미국 투어', international: '미국 외 투어', results: '경기 결과', domestic: '미국 외 투어', sources: '프로투어 확인 출처', latest: '최신 프로투어 정보', viewAll: '프로투어 전체 보기', noItems: '아직 확인된 프로투어 정보가 없습니다.'
    },
    en: {
      nav: 'Pro Tour', title: 'Pickleball Pro Tour & Results', intro: 'PPA, MLP, and other pro-tour schedules, recent results, entry notes, and player-field source links in one place. Always verify registration deadlines, draws, locations, and player fields at the official source.',
      all: 'All pro-tour info', usa: 'U.S. tour events', international: 'Non-U.S. tour events', results: 'Results', domestic: 'Non-U.S. tour events', sources: 'Pro-tour sources', latest: 'Latest pro-tour information', viewAll: 'View pro tour', noItems: 'No pro-tour information has been approved yet.'
    },
    es: {
      nav: 'Pro Tour', title: 'Pro Tour y resultados de pickleball', intro: 'Calendarios del PPA, MLP y otros tours profesionales, con resultados recientes, notas de inscripción y enlaces a las fuentes de los cuadros y jugadores. Verifica siempre fechas, draws, sedes y fields en la fuente oficial.',
      all: 'Toda la información', usa: 'Eventos del tour en EE. UU.', international: 'Eventos del tour fuera de EE. UU.', results: 'Resultados', domestic: 'Eventos del tour fuera de EE. UU.', sources: 'Fuentes del pro tour', latest: 'Información reciente del pro tour', viewAll: 'Ver pro tour', noItems: 'Todavía no hay información aprobada del pro tour.'
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

function proSceneLabel(loc, key) {
  const labels = {
    ko: {
      hub: '프로 무대', players: '프로 선수 정보', results: '메이저 대회 결과', rules: 'PPA·MLP 규정',
      title: '프로 무대 허브', intro: '프로 선수 프로필, 주요 메이저 대회 결과, PPA·MLP 규정과 규정 변화를 한 곳에서 확인하는 프로 피클볼 허브입니다.',
      playersDesc: '정상급 선수들의 스타일, 주요 기술, DUPR·랭킹 확인 링크와 어떤 점을 배울 수 있는지 정리합니다.',
      resultsDesc: 'PPA, MLP, 국제 대회 중 주요 결과를 요약하고 공식 브래킷·순위 확인 경로를 연결합니다.',
      rulesDesc: 'PPA 토너먼트 운영, MLP 팀 리그 방식, DreamBreaker, 랭킹·포인트·경기 포맷의 변화 포인트를 설명합니다.',
      sources: '공식 확인 링크', updated: '변동 정보 확인 기준', sourceNote: '프로 대회 일정, 랭킹, 규정, 경기 결과는 수시로 바뀔 수 있습니다. Picklary는 이해를 돕는 요약을 제공하고, 최종 판단은 공식 출처에서 다시 확인하도록 연결합니다.',
      ruleWatch: '규정 변화에서 무엇을 봐야 할까?', whyRules: 'PPA와 MLP는 모두 프로 피클볼이지만 운영 목적이 다릅니다. PPA는 개인·복식 투어와 랭킹 포인트 중심이고, MLP는 팀 매치·혼합복식·DreamBreaker 같은 팀 리그 요소가 강합니다.',
      ppaCard: 'PPA Tour 규정·운영', mlpCard: 'MLP 팀 리그 규정', changeCard: '규정 변화 체크포인트'
    },
    en: {
      hub: 'Pro Scene', players: 'Pro Players', results: 'Major Results', rules: 'PPA & MLP Rules',
      title: 'Pro Scene Hub', intro: 'A structured hub for pro player profiles, major event results, and PPA/MLP rules and rule-change notes.',
      playersDesc: 'Study top players by style, key skills, live DUPR/ranking source links, and practical takeaways for club players.',
      resultsDesc: 'Follow major PPA, MLP, and international results with official bracket, standings, and source links.',
      rulesDesc: 'Understand PPA tournament structure, MLP team format, DreamBreakers, ranking points, and the rule changes worth watching.',
      sources: 'Official source links', updated: 'How current information is checked', sourceNote: 'Pro schedules, rankings, rules, and results can change quickly. Picklary adds plain-language explanation and links back to official sources for final verification.',
      ruleWatch: 'What to watch in rule changes', whyRules: 'PPA and MLP are both pro pickleball, but they reward different things. PPA is tour-and-ranking driven; MLP adds team matches, mixed doubles, DreamBreakers, and season standings.',
      ppaCard: 'PPA Tour rules & operations', mlpCard: 'MLP team-league rules', changeCard: 'Rule-change watchlist'
    }
  };
  const l = labels[loc] || labels.en;
  return l[key] || labels.en[key] || key;
}
function proSceneTabs(loc, active) {
  const items = [['pro-scene/', 'hub'], ['pro-scene/players/', 'players'], ['pro-scene/results/', 'results']];
  return `<nav class="update-tabs" aria-label="${escAttr(proSceneLabel(loc, 'hub'))}">${items.map(([rel, key]) => `<a class="${active === key ? 'is-active' : ''}" href="${link(loc, rel)}">${esc(proSceneLabel(loc, key))}</a>`).join('')}</nav>`;
}
function proSceneSourceButtons(loc) {
  const items = [
    ['PPA Tour — How it works', 'https://ppatour.com/how-it-works/'],
    ['PPA Tournament Handbook', 'https://ppatour.com/wp-content/uploads/2026/01/PPA-Tournament-Handbook.pdf'],
    ['PPA Player Rankings', 'https://ppatour.com/player-rankings/'],
    ['PPA Schedule', 'https://ppatour.com/schedule/'],
    ['MLP — How MLP Works', 'https://majorleaguepickleball.co/abcs-of-mlp/'],
    ['MLP Standings', 'https://majorleaguepickleball.co/standings/'],
    ['MLPlay Rules Guide', 'https://drive.google.com/file/d/1UR54-12ej87Ea7GMZcapFpbhCk2w4m8_/view']
  ];
  return `<div class="source-buttons source-buttons--wrap">${items.map(([name, url]) => `<a class="btn btn--ghost" href="${escAttr(url)}" rel="nofollow noopener" target="_blank">${esc(name)}</a>`).join('')}</div>`;
}
function renderProSceneHub(loc) {
  const card = (key, href, title, desc, icon) => `<a class="explore-card pro-scene-card pro-scene-card--${escAttr(key)}" href="${link(loc, href)}"><span class="explore-card__k">${esc(proSceneLabel(loc, key))}</span><span class="pro-scene-card__icon" aria-hidden="true">${icon}</span><span class="explore-card__t">${esc(title)}</span><span class="explore-card__d">${esc(desc)}</span></a>`;
  const latest = tourResults.filter((r) => r.status === 'published').slice(0, 1).map((r) => resultRecap(loc, r)).join('');
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: proSceneLabel(loc, 'hub') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(tt(loc, 'nav.proScene'))}</p><h1>${esc(proSceneLabel(loc, 'title'))}</h1><p class="page-head__intro">${esc(proSceneLabel(loc, 'intro'))}</p></div>
  ${visualFigure(loc, 'players')}
</div></section>
<section class="band"><div class="wrap">${proSceneTabs(loc, 'hub')}<div class="explore-grid">
  ${card('players', 'pro-scene/players/', proSceneLabel(loc, 'players'), proSceneLabel(loc, 'playersDesc'), '👤')}
  ${card('results', 'pro-scene/results/', proSceneLabel(loc, 'results'), proSceneLabel(loc, 'resultsDesc'), '🏆')}
</div></div></section>
${latest ? `<section class="band band--alt"><div class="wrap"><h2 class="band__title">${esc(loc === 'ko' ? '최근 주요 결과' : 'Latest major result')}</h2><div class="recaps">${latest}</div><p><a class="btn btn--primary" href="${link(loc, 'pro-scene/results/')}">${esc(proSceneLabel(loc, 'results'))} →</a></p></div></section>` : ''}
<section class="band"><div class="wrap narrow prose"><h2>${esc(proSceneLabel(loc, 'updated'))}</h2><p>${esc(proSceneLabel(loc, 'sourceNote'))}</p>${proSceneSourceButtons(loc)}</div></section>`;
  return layout({ loc, rel: 'pro-scene/', title: proSceneLabel(loc, 'title'), description: proSceneLabel(loc, 'intro'), bodyHtml: body });
}
function renderProScenePlayers(loc) {
  const title = proSceneLabel(loc, 'players');
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: proSceneLabel(loc, 'hub'), rel: 'pro-scene/' }, { name: title }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(proSceneLabel(loc, 'hub'))}</p><h1>${esc(title)}</h1><p class="page-head__intro">${esc(proSceneLabel(loc, 'playersDesc'))}</p></div>
  ${visualFigure(loc, 'players')}
</div></section>
<section class="band"><div class="wrap">${proSceneTabs(loc, 'players')}<p class="notice">${esc(tt(loc, 'players.sourceNote'))}</p><div class="player-grid">${players.map((pl) => playerCard(pl, loc)).join('')}</div></div></section>`;
  return layout({ loc, rel: 'pro-scene/players/', title: title + ' · ' + proSceneLabel(loc, 'hub'), description: proSceneLabel(loc, 'playersDesc'), bodyHtml: body });
}
function renderProSceneResults(loc) {
  const title = proSceneLabel(loc, 'results');
  const recapsHtml = tourResults.filter((r) => r.status === 'published').map((r) => resultRecap(loc, r)).join('') || `<p class="notice">${esc(tournamentLabel(loc, 'noItems'))}</p>`;
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: proSceneLabel(loc, 'hub'), rel: 'pro-scene/' }, { name: title }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(proSceneLabel(loc, 'hub'))}</p><h1>${esc(title)}</h1><p class="page-head__intro">${esc(proSceneLabel(loc, 'resultsDesc'))}</p></div>
  ${visualFigure(loc, 'majorResults')}
</div></section>
<section class="band"><div class="wrap">${proSceneTabs(loc, 'results')}<h2 class="band__title">${esc(loc === 'ko' ? '현재 종목별 선두' : 'Current discipline leaders')}</h2>${rankingsBoard(loc)}<h2 class="band__title">${esc(loc === 'ko' ? '주요 메이저·리그 결과' : 'Major event and league results')}</h2><div class="recaps">${recapsHtml}</div></div></section>
<section class="band band--alt"><div class="wrap narrow prose"><h2>${esc(proSceneLabel(loc, 'sources'))}</h2><p>${esc(proSceneLabel(loc, 'sourceNote'))}</p>${proSceneSourceButtons(loc)}</div></section>`;
  return layout({ loc, rel: 'pro-scene/results/', title: title + ' · ' + proSceneLabel(loc, 'hub'), description: proSceneLabel(loc, 'resultsDesc'), bodyHtml: body });
}
function renderProSceneRules(loc) {
  const title = proSceneLabel(loc, 'rules');
  const L = (en, ko) => loc === 'ko' ? ko : en;
  const ppaBullets = [
    L('Event tiers such as Worlds, Slam, Cup, Open, and Challenger determine ranking-point weight.', 'Worlds, Slam, Cup, Open, Challenger 같은 대회 등급에 따라 랭킹 포인트 비중이 달라집니다.'),
    L('PPA rankings reflect recent tournament results and are updated after events; use official rankings for current seeding context.', 'PPA 랭킹은 최근 대회 결과를 반영해 업데이트되므로, 시드·현재 순위는 공식 랭킹에서 확인해야 합니다.'),
    L('The tournament handbook is the deeper reference for officiating, player conduct, match procedures, and operational standards.', '토너먼트 핸드북은 심판 운영, 선수 행동, 경기 절차, 운영 기준을 확인하는 더 깊은 기준 문서입니다.')
  ];
  const mlpBullets = [
    L('MLP uses coed team matches: women’s doubles, men’s doubles, and two mixed doubles games.', 'MLP는 여자복식, 남자복식, 두 개의 혼합복식으로 구성된 코에드 팀 매치 구조입니다.'),
    L('If the team match is tied after four games, a DreamBreaker singles tiebreak decides the match.', '네 경기 후 팀 매치가 동률이면 DreamBreaker 단식 타이브레이크로 승부를 가릅니다.'),
    L('Regular-season standings points, playoff seeding, and team availability matter as much as individual player form.', '정규 시즌 standings 포인트, 플레이오프 시드, 팀별 출전 구성이 개인 선수 컨디션만큼 중요합니다.')
  ];
  const watchBullets = [
    L('Scoring format: side-out versus rally scoring changes comeback patterns and timeout value.', '스코어링 방식: 사이드아웃과 랠리 스코어링 차이는 역전 가능성과 타임아웃 가치에 영향을 줍니다.'),
    L('Ranking points and event tiers: a result at a Slam is not weighted the same as a smaller event.', '랭킹 포인트와 대회 등급: Slam 결과와 소규모 대회 결과는 같은 비중이 아닙니다.'),
    L('Equipment and eligibility: paddle legality, roster rules, injury rules, and participation policies can affect brackets and lineups.', '장비와 출전 자격: 패들 승인, 로스터, 부상 규정, 참가 정책이 브래킷과 라인업에 영향을 줄 수 있습니다.'),
    L('Schedule changes: weather, broadcast windows, and league format updates can change when results become official.', '일정 변경: 날씨, 중계 시간, 리그 포맷 변화에 따라 결과 확정 시점이 달라질 수 있습니다.')
  ];
  const sourceLinks = {
    ppa: [
      ['PPA Tour - How it works', 'https://ppatour.com/how-it-works/'],
      ['PPA Player Rankings', 'https://ppatour.com/player-rankings/']
    ],
    mlp: [
      ['MLP - How MLP Works', 'https://majorleaguepickleball.co/abcs-of-mlp/'],
      ['MLP Standings', 'https://majorleaguepickleball.co/standings/']
    ],
    watch: [
      ['PPA Tournament Handbook', 'https://ppatour.com/wp-content/uploads/2026/01/PPA-Tournament-Handbook.pdf'],
      ['MLPlay Rules Guide', 'https://drive.google.com/file/d/1UR54-12ej87Ea7GMZcapFpbhCk2w4m8_/view']
    ]
  };
  const card = (tone, title, body, items, links) => `<article class="body-card rule-source-card rule-source-card--${escAttr(tone)}"><h2>${esc(title)}</h2><p>${esc(body)}</p><ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul><div class="rule-source-card__actions">${links.map(([name, url]) => `<a class="rule-source-card__btn" href="${escAttr(url)}" rel="nofollow noopener" target="_blank">${esc(name)} <span aria-hidden="true">→</span></a>`).join('')}</div></article>`;
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'categories.title'), rel: 'categories/' }, { name: title }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(tt(loc, 'categories.title'))}</p><h1>${esc(title)}</h1><p class="page-head__intro">${esc(proSceneLabel(loc, 'rulesDesc'))}</p></div>
  ${visualFigure(loc, 'dupr')}
</div></section>
<section class="band"><div class="wrap"><div class="body-cards">
  ${card('ppa', proSceneLabel(loc, 'ppaCard'), L('Use PPA sources when you want tournament brackets, event tiers, ranking points, draw format, and player-seeding context.', 'PPA 자료는 토너먼트 브래킷, 대회 등급, 랭킹 포인트, 드로우 방식, 선수 시드 맥락을 볼 때 사용합니다.'), ppaBullets, sourceLinks.ppa)}
  ${card('mlp', proSceneLabel(loc, 'mlpCard'), L('Use MLP sources when the question is about team matches, roster construction, DreamBreakers, standings, and playoffs.', 'MLP 자료는 팀 매치, 로스터 구성, DreamBreaker, standings, 플레이오프 구조를 볼 때 사용합니다.'), mlpBullets, sourceLinks.mlp)}
  ${card('watch', proSceneLabel(loc, 'changeCard'), proSceneLabel(loc, 'whyRules'), watchBullets, sourceLinks.watch)}
</div></div></section>
<section class="band band--alt"><div class="wrap narrow prose"><h2>${esc(proSceneLabel(loc, 'ruleWatch'))}</h2><p>${esc(proSceneLabel(loc, 'sourceNote'))}</p></div></section>`;
  return layout({ loc, rel: 'pro-scene/rules/', title: title + ' · ' + tt(loc, 'categories.title'), description: proSceneLabel(loc, 'rulesDesc'), bodyHtml: body });
}

function renderTournamentsIndex(loc) {
  const items = [...tournamentItems('all')].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 12);
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tournamentLabel(loc, 'title') }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(tournamentLabel(loc, 'nav'))}</p><h1>${esc(tournamentLabel(loc, 'title'))}</h1><p class="page-head__intro">${esc(tournamentLabel(loc, 'intro'))}</p></div>
  ${visualFigure(loc, 'players')}
</div></section>
${tourResults.length ? `<section class="band"><div class="wrap">
  ${tournamentTabs(loc, 'all')}
  <h2 class="band__title">${esc(loc === 'ko' ? '최근 대회 결과' : 'Recent results')}</h2>
  <div class="recaps">${resultRecap(loc, tourResults[0])}</div>
  <p><a class="btn btn--ghost" href="${link(loc, 'tournaments/results/')}">${esc(loc === 'ko' ? '전체 대회 결과 보기' : 'See all results')} →</a></p>
</div></section>` : `<section class="band"><div class="wrap">${tournamentTabs(loc, 'all')}</div></section>`}
<section class="band band--alt"><div class="wrap">
  ${tourResults.length ? '' : tournamentTabs(loc, 'all')}
  <h2 class="band__title">${esc(tournamentLabel(loc, 'latest'))}</h2>
  <div class="update-grid">${items.length ? items.map((u) => updateCard(u, loc)).join('') : `<p class="notice">${esc(tournamentLabel(loc, 'noItems'))}</p>`}</div>
</div></section>
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
  const medals = ['🥇', '🥈', '🥉'];
  const winners = (r.winners || []).map((w) => {
    const div = (loc === 'ko' && w.divisionKo) ? w.divisionKo : w.division;
    const note = (loc === 'ko' && w.noteKo) ? w.noteKo : w.note;
    const places = [w.champ, w.silver, w.bronze].filter(Boolean).map((name, i) =>
      `<div class="podium__row"><span class="podium__medal" aria-hidden="true">${medals[i]}</span><span class="podium__name">${esc(name)}</span></div>`).join('');
    return `<li class="recap-win"><span class="recap-win__div">${esc(div)}</span><div class="podium">${places}</div>${note ? `<span class="recap-win__note">${esc(note)}</span>` : ''}</li>`;
  }).join('');
  const champLabel = (loc === 'ko' && r.winnersLabelKo) ? r.winnersLabelKo : (r.winnersLabel || (loc === 'ko' ? '종목별 우승' : 'Champions by division'));
  const standings = (r.standings || []).map((sx, i) => {
    const note = (loc === 'ko' && sx.noteKo) ? sx.noteKo : sx.note;
    return `<li class="race"><span class="race__rank">${i + 1}</span><span class="race__body"><span class="race__team">${esc(sx.team)}</span>${note ? `<span class="race__note">${esc(note)}</span>` : ''}</span></li>`;
  }).join('');
  const standingsLabel = (loc === 'ko' && r.standingsLabelKo) ? r.standingsLabelKo : (r.standingsLabel || (loc === 'ko' ? '타이틀 레이스' : 'Title race'));
  const liveBtn = r.liveUrl ? `<a class="btn btn--primary" href="${escAttr(r.liveUrl)}" rel="nofollow noopener" target="_blank">${esc((loc === 'ko' && r.liveLabelKo) ? r.liveLabelKo : (r.liveLabel || (loc === 'ko' ? '라이브 순위·스코어' : 'Live standings & scores')))} →</a>` : '';
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
    <div class="recap__winners"><h3>${esc(champLabel)}</h3><ul class="recap-win-list">${winners}</ul></div>
    ${standings ? `<div class="recap__race"><h3>${esc(standingsLabel)}</h3><ol class="race-list">${standings}</ol></div>` : ''}
    <div class="recap__story"><h3>${esc(pick('storylineTitle') || '')}</h3><p>${esc(pick('storyline'))}</p></div>
    <div class="source-buttons">${liveBtn}<a class="btn btn--ghost" href="${escAttr(r.sourceUrl)}" rel="nofollow noopener" target="_blank">${esc(r.sourceName)}</a></div>
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
  const exploreCard = (href, k, t, d) => `<a class="explore-card" href="${href}"><span class="explore-card__k">${esc(k)}</span><span class="explore-card__t">${esc(t)}</span><span class="explore-card__d">${esc(d)}</span></a>`;
  const exploreBlock = isResults ? `<section class="band"><div class="wrap">
  <div class="section-head"><div><h2 class="band__title">${esc(loc === 'ko' ? 'Picklary에서 더 깊이 보기' : 'Go deeper on Picklary')}</h2><p class="band__intro">${esc(loc === 'ko' ? '결과에 등장한 선수들을 살펴보고, 같은 아이디어를 내 게임에 적용해 보세요.' : 'Meet the players behind these results, then take the same ideas to your own game.')}</p></div></div>
  <div class="explore-grid">
    ${exploreCard(link(loc, 'players/anna-leigh-waters/'), loc === 'ko' ? '선수' : 'Player', 'Anna Leigh Waters', loc === 'ko' ? 'NJ 5s — 콜럼버스·오스틴 우승을 견인' : 'New Jersey 5s — drove the Columbus & Austin titles')}
    ${exploreCard(link(loc, 'players/anna-bright/'), loc === 'ko' ? '선수' : 'Player', 'Anna Bright', loc === 'ko' ? 'St. Louis Shock 연승의 주역' : 'Powering the Shock’s winning streak')}
    ${exploreCard(link(loc, 'players/ben-johns/'), loc === 'ko' ? '선수' : 'Player', 'Ben Johns', loc === 'ko' ? 'LA Mad Drops 라인업의 핵심' : 'Anchor of the LA Mad Drops lineup')}
    ${exploreCard(link(loc, 'players/tyson-mcguffin/'), loc === 'ko' ? '선수' : 'Player', 'Tyson McGuffin', loc === 'ko' ? '신생 Palm Beach Royals를 이끈다' : 'Leading the expansion Palm Beach Royals')}
    ${exploreCard(link(loc, 'level/'), loc === 'ko' ? '레벨' : 'Levels', loc === 'ko' ? '내 레벨 알아보기' : 'Find your level', loc === 'ko' ? '2.0–5.0 레벨별 기술과 성장법' : 'Skills and step-ups from 2.0 to 5.0')}
    ${exploreCard(link(loc, 'tools/paddle-finder/'), loc === 'ko' ? '도구' : 'Tool', loc === 'ko' ? '패들 파인더' : 'Paddle Finder', loc === 'ko' ? '플레이 스타일에 맞는 패들 추천' : 'Matched to your playing style')}
  </div></div></section>` : '';
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tournamentLabel(loc, 'title'), rel: 'tournaments/' }, { name: title }])}
<section class="page-head"><div class="wrap"><p class="page-head__eyebrow">${esc(tournamentLabel(loc, 'nav'))}</p><h1>${esc(title)}</h1><p class="page-head__intro">${esc(intro)}</p></div></section>
<section class="band"><div class="wrap">${tournamentTabs(loc, key)}${isResults ? `<h2 class="band__title">${esc(loc === 'ko' ? '현재 종목별 선두' : 'Current discipline leaders')}</h2>${rankingsBoard(loc)}<h2 class="band__title">${esc(loc === 'ko' ? '최근 대회 결과' : 'Recent results')}</h2><div class="recaps">${recapsHtml}</div>` : `<div class="update-grid">${items.length ? items.map((u) => updateCard(u, loc)).join('') : `<p class="notice">${esc(tournamentLabel(loc, 'noItems'))}</p>`}</div>`}</div></section>
${exploreBlock}${tournamentDepthBlock(loc, type)}<section class="band band--alt"><div class="wrap"><h2 class="band__title">${esc(tournamentLabel(loc, 'sources'))}</h2>${updateSourceCards(loc, type)}</div></section>`;
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
  <div><p class="page-head__eyebrow">${esc(gearLabel(loc, 'nav'))}</p><h1>${esc(paddleUpdatesLabel(loc, 'title'))}</h1><p class="page-head__intro">${esc(paddleUpdatesLabel(loc, 'intro'))}</p></div>
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
  ${adsenseDepthBlock(loc, 'brief')}
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
<p>${esc(ownerBio(loc))} 문의, 오류 제보, 제휴 문의는 <a href="mailto:${escAttr(config.email)}">${esc(config.email)}</a>로 보내주세요. 글 작성 기준은 <a href="${link(loc, 'editorial-policy/')}">편집 정책</a>과 <a href="${link(loc, 'corrections-policy/')}">정정 정책</a>에서 확인할 수 있습니다.</p><h2>왜 Picklary를 만들었나요</h2><p>피클볼을 시작하면 규칙, 레벨, DUPR, 패들, 복식 포지셔닝, 프로 경기 정보가 서로 흩어져 있어 초보자가 한 번에 이해하기 어렵습니다. Picklary는 그 흩어진 정보를 그대로 복사하는 대신, 동호인이 실제로 다음 행동을 정할 수 있게 정리하는 것을 목표로 합니다. 예를 들어 자가진단 결과를 레벨 페이지로 연결하고, 레벨 페이지를 샷 연습과 패들 선택으로 연결하는 식입니다.</p><p>사이트의 장기 방향은 광고 수익보다 재방문 가치입니다. 사용자가 오늘은 DUPR 자가진단을 하고, 다음에는 패들 비교를 보고, 이후에는 프로 선수의 패턴을 공부하며 다시 돌아오도록 만드는 구조가 핵심입니다.</p>` : `
<p>${esc(config.siteName)} is an independent information site about pickleball, written for players who want to choose gear sensibly and steadily improve. It is not a news aggregator, bookmaker, or marketplace — it is a curated hub of practical guides.</p>
<h2>What we cover</h2>
<p>Four core experiences: level-based rules and skills from 2.0 to 5.0, paddle research by brand and play style, pro player profile research, and highlight/video feedback education.</p>
<h2>How we work</h2>
<ul class="principles">${principles}</ul>
<h2>Who runs it</h2>
<p>${esc(ownerBio(loc))} You can reach the site by email at <a href="mailto:${escAttr(config.email)}">${esc(config.email)}</a>. Read more in the <a href="${link(loc, 'editorial-policy/')}">Editorial Policy</a> and <a href="${link(loc, 'corrections-policy/')}">Corrections Policy</a>.</p><h2>Why Picklary exists</h2><p>When players start pickleball, rules, levels, DUPR, paddles, doubles positioning, and pro-event information are scattered across many sources. Picklary is built to organize that information into practical next steps instead of copying it as a feed. A self-check result connects to a level page, a level page connects to shot practice, and paddle pages connect to clear buying considerations.</p><p>The long-term goal is return value, not only advertising inventory. A reader should be able to check a level today, compare paddles later, study a pro player before the next match, and come back when new results or guides are published.</p>`;
  return simplePage(loc, 'about/', tt(loc, 'nav.about'), loc === 'ko' ? config.tagline : 'Who runs Picklary and how the pickleball guides are written, sourced, corrected, and updated.', html, { translated: loc === 'ko' || loc === SOURCE, noindex: false });
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
<p class="notice">이 양식은 서버에 내용을 저장하지 않고 사용자의 이메일 앱을 여는 방식으로 작동합니다. 실제 애드센스 신청 전에는 위 이메일 주소가 수신 가능한 실제 주소인지 확인하세요.</p>${contactDepthHtml(loc)}` : `
<p>${esc(tt(loc, 'contact.intro'))}</p>
<p class="contact-email"><strong>${esc(tt(loc, 'contact.emailLabel'))}:</strong> <a href="mailto:${escAttr(config.email)}">${esc(config.email)}</a></p>
<form class="contact-form" data-contact-form data-email="${escAttr(config.email)}">
  <label>${esc(tt(loc, 'contact.formName'))}<input type="text" name="name" autocomplete="name"></label>
  <label>${esc(tt(loc, 'contact.formEmail'))}<input type="email" name="from" autocomplete="email"></label>
  <label>${esc(tt(loc, 'contact.formMessage'))}<textarea name="message" rows="5"></textarea></label>
  <button type="submit" class="btn btn--primary">${esc(tt(loc, 'contact.formSend'))}</button>
</form>
<p class="notice">${esc(tt(loc, 'contact.note'))}</p>${contactDepthHtml(loc)}`;
  return simplePage(loc, 'contact/', tt(loc, 'contact.title'), tt(loc, 'contact.intro'), html, { translated: loc === 'ko' || loc === SOURCE, noindex: false });
}



function renderAuthor(loc) {
  const o = config.owner;
  const L = (en, ko) => (loc === 'ko' ? ko : en);
  const tr = (o.translations && o.translations[loc]) || {};
  const locTxt = tr.location || o.location || '';
  const socials = (o.social || []).map((s) => `<a href="${escAttr(s.url)}" target="_blank" rel="me noopener">${esc(s.name)}</a>`).join(' · ');
  const metaItems = [];
  if (locTxt) metaItems.push(`<li><strong>${esc(L('Based in', '활동 지역'))}:</strong> ${esc(locTxt)}</li>`);
  metaItems.push(`<li><strong>${esc(L('Contact', '연락처'))}:</strong> <a href="mailto:${escAttr(config.email)}">${esc(config.email)}</a></li>`);
  if (socials) metaItems.push(`<li><strong>${esc(L('Blog', '블로그'))}:</strong> ${socials}</li>`);
  const principles = editorialPrinciplesFor(loc).map((p) => `<li>${esc(p)}</li>`).join('');
  const cols = publishedColumns.map((c) => columnCard(c, loc)).join('');
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'author.title') }])}
<section class="page-head"><div class="wrap">
  <h1>${esc(tt(loc, 'author.title'))}</h1>
</div></section>
<section class="band"><div class="wrap narrow">
  ${authorBox(loc)}
  <ul class="author-meta">${metaItems.join('')}</ul>
  <p class="author-visitor" data-author-visitor>${esc(tt(loc, 'author.visitorIntro'))}</p>

  <h2>${esc(tt(loc, 'author.principlesTitle'))}</h2>
  <ul class="principles">${principles}</ul>

  <h2>${esc(loc === 'ko' ? '작성자 관점' : 'Author perspective')}</h2>
  <p>${esc(loc === 'ko' ? 'Picklary의 글은 프로 코치의 공식 커리큘럼을 대체하려는 것이 아니라, 동호인이 실제 게임을 하며 자주 만나는 선택지를 이해하기 쉽게 정리하려는 목적입니다. 패들 추천이나 레벨 판단도 하나의 정답처럼 말하지 않고, 어떤 플레이어에게 왜 맞는지와 어떤 한계가 있는지 함께 설명합니다.' : 'Picklary articles are not meant to replace a professional coaching curriculum. They are written to make common club-player decisions easier to understand. Gear suggestions and level notes are not presented as one universal answer; they explain who a choice may fit, why it may fit, and what limitations remain.')}</p>
  <p>${esc(loc === 'ko' ? '사이트가 성장할수록 직접 플레이 경험, 공개 스펙 비교, 공식 출처 확인, 독자 피드백을 구분해 기록할 예정입니다. 이 구분은 독자가 광고, 제휴 링크, 개인 의견, 현재 사실을 혼동하지 않도록 하기 위한 운영 원칙입니다.' : 'As the site grows, it will keep separating personal playing observation, published-spec comparison, official-source verification, and reader feedback. That separation helps readers understand the difference between ads, affiliate links, opinion, and current facts.')}</p>
  <p>${esc(loc === 'ko' ? '작성자 페이지를 별도로 둔 이유는 사이트의 책임 소재와 편집 기준을 더 명확하게 보여 주기 위해서입니다. 방문자가 특정 패들 평가나 레벨 조언을 읽을 때 누가 어떤 관점으로 썼는지 확인할 수 있으면, 사이트 전체의 신뢰도가 높아집니다.' : 'The author page exists to make accountability and editorial perspective clearer. When readers see a paddle note or level recommendation, they can understand who wrote it and from what point of view, which strengthens trust across the site.')}</p>

  <h2>${esc(tt(loc, 'author.columnsTitle'))}</h2>
  <div class="cards">${cols}</div>
</div></section>`;
  const person = { '@type': 'Person', name: ownerName(loc), description: ownerBio(loc) };
  if (o.address) person.address = { '@type': 'PostalAddress', addressLocality: o.address.locality, addressRegion: o.address.region, addressCountry: o.address.country };
  if (o.social && o.social.length) person.sameAs = o.social.map((s) => s.url);
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'ProfilePage', mainEntity: person }];
  return layout({ loc, rel: 'author/', title: tt(loc, 'author.title'), description: ownerBio(loc), jsonld, bodyHtml: body });
}

function renderTool(loc) {
  const L = (en, ko) => (loc === 'ko' ? ko : en);
  const styleLabels = { 'all-court': L('All-court', '올라운드'), hands: L('Hands battle', '핸즈(빠른 손)'), control: L('Control', '컨트롤'), power: L('Power', '파워'), spin: L('Spin', '스핀'), value: L('Value', '가성비') };
  const fdata = {
    base: link(loc, 'paddles/'),
    ranks: loc === 'ko' ? ['1위', '2위', '3위'] : ['#1', '#2', '#3'],
    paddles: paddles.map((p) => ({
      brand: p.brand, model: p.model, slug: p.slug, style: p.style, styleLabel: styleLabels[p.style] || p.style,
      shape: p.shape, band: p.priceBand, usd: p.priceUsd, sourceUrl: p.sourceUrl, sourceName: p.sourceName,
      levels: p.levels, traits: p.traits, usedBy: p.usedBy, ratings: p.ratings, summary: loc1(p, loc, 'summary')
    })),
    questions: [
      { id: 'q_style', title: L('Your play style', '플레이 스타일'), opts: [
        { id: 'control', label: L('Control / soft game', '컨트롤 / 소프트 게임') }, { id: 'power', label: L('Power / attacking', '파워 / 공격') },
        { id: 'allcourt', label: L('All-court (balanced)', '올라운드 (균형)') }, { id: 'hands', label: L('Fast hands at the net', '네트 핸즈 (빠른 손)') },
        { id: 'spin', label: L('Spin-heavy', '스핀 위주') } ] },
      { id: 'q_level', title: L('Your level', '실력 레벨'), opts: [
        { id: 'l30', label: L('Beginner–3.0', '입문~3.0') }, { id: 'l35', label: L('3.5', '3.5') }, { id: 'l40', label: L('4.0+', '4.0+') } ] },
      { id: 'q_budget', title: L('Budget', '가격대'), opts: [
        { id: 'b1', label: L('Budget ($)', '예산형 ($)') }, { id: 'b2', label: L('Mid ($$)', '중급 ($$)') },
        { id: 'b3', label: L('Premium ($$$)', '프리미엄 ($$$)') }, { id: 'any', label: L('No preference', '상관없음') } ] },
      { id: 'q_feel', title: L('Preferred feel / thickness', '선호 감 / 두께'), optional: true, opts: [
        { id: 'thick', label: L('Thicker — control & touch', '두껍게 — 컨트롤/터치') }, { id: 'thin', label: L('Thinner — pop & power', '얇게 — 팝/파워') },
        { id: 'any', label: L('No preference', '상관없음') } ] },
      { id: 'q_weight', title: L('Preferred weight', '선호 무게'), optional: true, opts: [
        { id: 'light', label: L('Lighter & maneuverable', '가볍고 기민하게') }, { id: 'heavy', label: L('Heavier & stable', '묵직하고 안정적') },
        { id: 'any', label: L('No preference', '상관없음') } ] },
      { id: 'q_height', title: L('Your height', '신장'), optional: true, opts: [
        { id: 'short', label: L('Shorter', '작은 편') }, { id: 'avg', label: L('Average', '보통') }, { id: 'tall', label: L('Taller', '큰 편') } ] },
      { id: 'q_hand', title: L('Hand size (for a grip tip)', '손 크기 (그립 팁용)'), optional: true, opts: [
        { id: 'small', label: L('Small', '작음') }, { id: 'med', label: L('Medium', '보통') }, { id: 'large', label: L('Large', '큼') } ] },
      { id: 'q_player', title: L('Favorite player / style (optional)', '좋아하는 선수 / 스타일 (선택)'), optional: true, opts: [
        { id: 'benjohns', label: L('Ben Johns (all-court)', '벤 존스 (올라운드)') }, { id: 'collinjohns', label: L('Collin Johns (hands)', '콜린 존스 (핸즈)') },
        { id: 'alshon', label: L('Christian Alshon (power)', '크리스찬 알숀 (파워)') }, { id: 'alw', label: L('Anna Leigh Waters (all-court)', '애나 리 워터스 (올라운드)') },
        { id: 'crossover', label: L('Tennis / racquet crossover', '테니스 전향형') }, { id: 'any', label: L('No preference', '상관없음') } ] }
    ],
    i18n: {
      intro: L('Answer a few questions and get three paddles ranked for you, with reasons. These are picks from our curated list — always confirm the current price and exact spec at the source before buying.', '몇 가지 질문에 답하면 이유와 함께 패들 3개를 순위로 추천합니다. 큐레이션한 목록에서 고른 것이며, 구매 전 반드시 출처에서 현재 가격과 정확한 사양을 확인하세요.'),
      see: L('See 3 fit candidates', '적합 후보 3개 보기'), restart: L('Start over', '다시 하기'),
      why: L('Why it fits', '맞는 이유'), view: L('View details', '자세히 보기'),
      verify: L('verify price at source', '가격은 출처에서 확인'), source: L('Source', '출처'),
      none: L('No close match — try changing your answers.', '딱 맞는 결과가 없습니다 — 답변을 바꿔 보세요.'),
      gripTipSmall: L('For smaller hands, a thinner grip (about 4 in / 10.2 cm) or an added overgrip helps wrist action and spin.', '손이 작은 편이면 얇은 그립(약 4인치/10.2cm)이나 오버그립 추가가 손목 사용과 스핀에 유리합니다.'),
      gripTipMed: L('A medium grip (about 4 1/8–4 1/4 in) suits most players; you can build it up with an overgrip.', '보통 그립(약 4 1/8~4 1/4인치)이 대부분에게 무난하며, 오버그립으로 키울 수 있습니다.'),
      gripTipLarge: L('For larger hands, a slightly larger grip or building up with overgrips improves comfort and control.', '손이 큰 편이면 약간 큰 그립이나 오버그립으로 키우면 편안함과 컨트롤이 좋아집니다.'),
      disclaimer: L('A guide based on a curated paddle list and general fit, not a sponsored ranking. Weight and grip vary by model and configuration, and many paddles offer 14 mm and 16 mm options that change the feel — confirm details and current price at the source.', '큐레이션한 패들 목록과 일반적 적합성에 기반한 가이드이며, 협찬 순위가 아닙니다. 무게·그립은 모델/구성에 따라 다르고 다수 패들은 14mm·16mm 옵션이 있어 감이 달라지니, 출처에서 세부와 현재 가격을 확인하세요.'),
      trust: {
        bestFit: L('Best overall fit', '종합 적합도 1순위'),
        benchmarkPick: L('Popular benchmark pick', '인기 기준 모델'),
        fitPick: L('Fit pick', '적합 후보'),
        reason: L('widely recognized benchmark model', '인지도 높은 기준 모델'),
        compareTitle: L('Also compare with popular paddles', '인기 패들과도 비교해 보세요'),
        compareIntro: L('These well-known models did not make your top three, but they are useful benchmarks before choosing.', '아래 인기 모델은 3순위 안에는 들지 않았지만, 최종 선택 전 비교 기준으로 보기 좋습니다.'),
        styleFit: L('Style fit', '스타일 적합'),
        budgetFit: L('Budget fit', '예산 적합'),
        levelFit: L('Level fit', '레벨 적합'),
        profileFit: L('Shape / thickness fit', '모양·두께 적합'),
        confidence: L('Why this appeared', '추천 근거')
      },
      reasons: {
        style: L('matches your {x} style', '{x} 스타일에 맞음'), level: L('suited to {x} level', '{x} 레벨대에 적합'),
        budget: L('in your {x} budget', '{x} 가격대'), control: L('control {x}/10 for touch', '컨트롤 {x}/10 — 터치'),
        power: L('power {x}/10', '파워 {x}/10'), light: L('quick and maneuverable', '가볍고 기민함'),
        heavy: L('stable and solid', '안정적이고 묵직함'), reach: L('elongated shape for reach', '엘롱게이티드 — 리치 확보'),
        forgiving: L('forgiving, maneuverable shape', '관용적이고 다루기 쉬운 형태'), player: L('associated line: {x}', '연관/시그니처 라인: {x}')
      },
      profile: {
        title: L('Your ideal paddle profile', '당신에게 맞는 패들 프로필'),
        intro: L('Based on your answers, this is the core thickness and shape that tend to fit you best:', '답변을 바탕으로, 당신에게 가장 잘 맞는 코어 두께와 모양은 다음과 같습니다:'),
        thicknessLabel: L('Core thickness', '코어 두께'), shapeLabel: L('Paddle shape', '패들 모양'),
        t16: L('16 mm', '16mm'), t14: L('14 mm', '14mm'),
        t16why: L('A thicker core gives more control, dwell, and forgiveness — easier resets and dinks.', '두꺼운 코어는 컨트롤·체류감·관용성이 커서 리셋과 딩크가 쉬워집니다.'),
        t14why: L('A thinner core gives more pop and faster hands, with a firmer, livelier feel.', '얇은 코어는 팝과 빠른 손, 더 단단하고 경쾌한 느낌을 줍니다.'),
        shapeWide: L('Widebody', '와이드바디'), shapeHybrid: L('Hybrid', '하이브리드'), shapeElong: L('Elongated', '엘롱게이티드'),
        wideWhy: L('A wider face has the biggest sweet spot and most forgiveness — the easiest to control.', '넓은 면은 스위트스폿이 가장 크고 관용성이 높아 컨트롤이 가장 쉽습니다.'),
        hybridWhy: L('A hybrid shape balances sweet spot, reach, and maneuverability.', '하이브리드는 스위트스폿·리치·기동성의 균형이 좋습니다.'),
        elongWhy: L('An elongated shape adds reach and leverage for power and spin, with a smaller sweet spot.', '엘롱게이티드는 리치와 레버리지가 커서 파워·스핀에 유리하지만 스위트스폿은 작습니다.'),
        note: L('Many models come in both 14 mm and 16 mm — pick the thickness that matches this profile, and confirm the spec at the source.', '다수 모델이 14mm·16mm로 함께 나옵니다 — 이 프로필에 맞는 두께를 고르고, 사양은 출처에서 확인하세요.')
      }
    }
  };
  const data = JSON.stringify(fdata).replace(/</g, '\\u003c');
  const metaDesc = L(
    'Find the right pickleball paddle by play style, level, and budget — with a plain-English guide to core thickness (14 vs 16 mm), shape (widebody, hybrid, elongated), weight, and grip.',
    '플레이 스타일·레벨·예산으로 맞는 피클볼 패들을 찾고, 코어 두께(14 vs 16mm)·모양(와이드바디·하이브리드·엘롱게이티드)·무게·그립 선택법까지 쉽게 정리한 가이드.');
  const guideHtml = `
    <h2>${esc(L('How this finder works', '이 파인더는 이렇게 작동합니다'))}</h2>
    <p>${esc(L('This finder weighs your answers across eight factors — play style, level, budget, preferred feel and thickness, weight, height, hand size, and a favourite player\u2019s style — then ranks paddles from our curated list and shows the core thickness and shape that tend to fit you. Treat the result as a starting point: confirm the current price and exact spec at the source before buying, and demo a paddle whenever you can.', '이 파인더는 플레이 스타일·레벨·예산·선호 감과 두께·무게·신장·손 크기·좋아하는 선수 스타일까지 8가지 답변을 종합해, 큐레이션한 목록에서 패들을 순위로 추천하고 당신에게 맞는 코어 두께와 모양도 알려줍니다. 결과는 출발점으로 삼고, 구매 전 출처에서 현재 가격과 정확한 사양을 확인하고 가능하면 직접 쳐보세요.'))}</p>
    <h2>${esc(L('Core thickness: 14 mm vs 16 mm', '코어 두께: 14mm vs 16mm'))}</h2>
    <p>${esc(L('A 16 mm (thicker) core gives more control, longer dwell time, a softer feel, and more forgiveness on resets and dinks, with slightly less raw pop. It suits control players, beginners, and anyone building a soft, touch-based kitchen game.', '16mm(두꺼운) 코어는 컨트롤·체류감·부드러운 감·관용성이 크고 리셋과 딩크에 유리하며, 순수 팝은 약간 적습니다. 컨트롤 지향, 입문자, 부드러운 터치 위주의 키친 게임을 만드는 사람에게 맞습니다.'))}</p>
    <p>${esc(L('A 14 mm (thinner) core gives more pop, faster hand speed at the net, and a firmer, livelier feel, but it is a little less forgiving. It suits power players, fast-hands players, and those who create their own control. Many models offer both thicknesses, and for most players thickness changes the feel more than the shape does.', '14mm(얇은) 코어는 팝과 네트에서의 손 속도가 빠르고 더 단단하고 경쾌하지만 관용성은 약간 낮습니다. 파워·빠른 손 플레이어, 스스로 컨트롤을 만드는 사람에게 맞습니다. 다수 모델이 두 두께로 나오며, 많은 사람에게 두께는 모양보다 감을 더 크게 바꿉니다.'))}</p>
    <h2>${esc(L('Paddle shape: widebody, hybrid, elongated', '패들 모양: 와이드바디·하이브리드·엘롱게이티드'))}</h2>
    <ul>
      <li>${esc(L('Widebody (standard, about 16 in \u00d7 8 in): the biggest sweet spot and the most forgiveness, easy to control and maneuver, with less reach — a great fit for beginners and for control or hands players.', '와이드바디(표준, 약 16″×8″): 스위트스폿이 가장 크고 관용성이 높아 컨트롤과 조작이 쉽지만 리치는 짧습니다. 입문자와 컨트롤·핸즈 플레이어에게 좋습니다.'))}</li>
      <li>${esc(L('Elongated (about 16.5 in \u00d7 7.5 in): more reach and leverage for power and spin, but a smaller, higher sweet spot that rewards consistent contact — suited to taller players, two-handed backhands, and power baseline games.', '엘롱게이티드(약 16.5″×7.5″): 리치와 레버리지가 커서 파워·스핀에 유리하지만 스위트스폿이 작고 높아 일관된 타점이 필요합니다. 키가 크거나 양손 백핸드, 베이스라인 파워 게임에 맞습니다.'))}</li>
      <li>${esc(L('Hybrid: a middle ground that balances sweet spot, reach, and maneuverability — a safe all-court choice if you are unsure.', '하이브리드: 스위트스폿·리치·기동성의 균형을 맞춘 중간형으로, 고민될 때 무난한 올코트 선택입니다.'))}</li>
    </ul>
    <h2>${esc(L('Weight and grip', '무게와 그립'))}</h2>
    <p>${esc(L('Weight and swing weight: lighter paddles (about 7.6–7.9 oz) give quicker hands and easier maneuvering with less plow-through; heavier paddles (about 8.0–8.5 oz) add stability and plow-through power but slow your hands and load the arm more. How heavy a paddle feels while swinging (swing weight) matters as much as the number on the scale, and you can add lead or tungsten tape to fine-tune the balance.', '무게와 스윙 웨이트: 가벼운 패들(약 7.6~7.9oz)은 손이 빠르고 다루기 쉽지만 플로스루가 적고, 무거운 패들(약 8.0~8.5oz)은 안정감과 관통력이 크지만 손이 느려지고 팔 부담이 늘어납니다. 스윙 시 느껴지는 무게(스윙 웨이트)도 저울 숫자만큼 중요하며, 납·텅스텐 테이프로 밸런스를 미세 조정할 수 있습니다.'))}</p>
    <p>${esc(L('Grip size: a smaller grip (about 4 1/8 in) frees up wrist action and spin and can be built up with an overgrip, while a larger grip (about 4 1/4 in or more) adds stability but can raise grip tension. A grip that is too large is hard to fix, so when in doubt size down and add an overgrip.', '그립 크기: 작은 그립(약 4 1/8″)은 손목 사용과 스핀에 유리하고 오버그립으로 키울 수 있으며, 큰 그립(약 4 1/4″ 이상)은 안정감이 늘지만 그립을 너무 꽉 쥐게 될 수 있습니다. 너무 큰 그립은 되돌리기 어려우니, 애매하면 작게 고르고 오버그립을 더하세요.'))}</p>
    <h2>${esc(L('How to read the results', '결과 읽는 법'))}</h2>
    <p>${esc(L('Fit suggestions come from a curated paddle list and general fit, not paid placement, and the 0–10 ratings are editorial estimates meant only for comparing paddles within this list. Prices and exact specs change often, so always confirm them at the source before you buy.', '적합 후보는 큐레이션한 패들 목록과 일반적 적합성에 기반하며 협찬·유료 배치가 아닙니다. 0~10 점수는 이 목록 안에서 비교하기 위한 편집 추정치입니다. 가격과 정확한 사양은 자주 바뀌니 구매 전 반드시 출처에서 확인하세요.'))}</p>`;
  const faqs = [
    [L('Is 14 mm or 16 mm better?', '14mm와 16mm 중 뭐가 더 좋나요?'), L('Neither is universally better. A 16 mm core leans toward control and forgiveness; a 14 mm core leans toward pop and hand speed. Choose by your game — and note that many models come in both.', '절대적으로 더 나은 건 없습니다. 16mm는 컨트롤·관용성에, 14mm는 팝·손 속도에 가깝습니다. 본인 게임에 맞춰 고르세요 — 다수 모델이 두 두께로 함께 나옵니다.')],
    [L('What paddle shape should a beginner use?', '입문자는 어떤 패들 모양이 좋나요?'), L('A widebody (standard) shape. Its larger sweet spot and forgiveness make it the easiest to control while you build consistency.', '와이드바디(표준) 모양이 좋습니다. 스위트스폿이 크고 관용성이 높아, 일관성을 키우는 동안 컨트롤하기 가장 쉽습니다.')],
    [L('Do elongated paddles really add power?', '엘롱게이티드 패들이 정말 파워가 더 나오나요?'), L('They add reach and leverage that can increase power and spin, but the sweet spot is smaller and sits higher, so they reward consistent contact and suit more experienced players.', '리치와 레버리지가 커서 파워·스핀이 늘 수 있지만, 스위트스폿이 작고 위쪽에 있어 일관된 타점이 필요하고 더 숙련된 플레이어에게 맞습니다.')],
    [L('How heavy should my paddle be?', '패들 무게는 어느 정도가 좋나요?'), L('Most players land around 7.9–8.3 oz. Lighter gives quicker hands; heavier gives more stability and plow-through. You can add lead or tungsten tape to fine-tune.', '대부분 약 7.9~8.3oz에 자리합니다. 가벼우면 손이 빠르고, 무거우면 안정감과 관통력이 큽니다. 납·텅스텐 테이프로 미세 조정할 수 있습니다.')],
    [L('Are these fit suggestions sponsored?', '이 적합 후보는 협찬인가요?'), L('No. They come from a curated list and general fit, not paid placement. Always confirm the current price and exact spec at the source before buying.', '아닙니다. 큐레이션한 목록과 일반적 적합성에 기반하며 유료 배치가 아닙니다. 구매 전 반드시 출처에서 현재 가격과 정확한 사양을 확인하세요.')],
  ];
  const faqHtml = `<h2>${esc(L('Frequently asked questions', '자주 묻는 질문'))}</h2>` + faqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('');
  const faqJsonld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: tt(loc, 'tool.title') }])}
<section class="page-head"><div class="wrap">
  <h1>${esc(tt(loc, 'tool.title'))}</h1>
  <p class="page-head__intro">${esc(tt(loc, 'tool.intro'))}</p>
</div></section>
<section class="band"><div class="wrap narrow">
  <div class="finder" data-paddle-finder></div>
  <script type="application/json" id="paddle-finder-data">${data}</script>
  <p class="notice"><a href="${link(loc, 'paddles/')}">${esc(tt(loc, 'paddles.title'))}</a> · <a href="${link(loc, 'how-to-choose-your-first-pickleball-paddle/')}">${esc(tt(loc, 'label.readMore'))}: ${esc(loc1(postBySlug['how-to-choose-your-first-pickleball-paddle'], loc, 'title'))}</a></p>
</div></section>
<section class="band"><div class="wrap narrow"><div class="prose">
  ${guideHtml}
  ${faqHtml}
</div></div></section>`;
  return layout({ loc, rel: 'tools/paddle-finder/', title: tt(loc, 'tool.title'), description: metaDesc, jsonld: [faqJsonld], bodyHtml: body });
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
  return layout({ loc, rel: 'sitemap/', title: tt(loc, 'sitemap.title'), description: tt(loc, 'sitemap.intro'), bodyHtml: body, noindex: true });
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
<p>언어 선택, <strong>DUPR 자가진단 결과 기록</strong>, 로컬 하이라이트·후기 데모 같은 기능은 사용자의 브라우저 localStorage를 사용할 수 있습니다. 예를 들어 DUPR 자가진단을 완료하면 추정 점수와 날짜가 사용자의 브라우저에만 저장되어, 다음 방문 시 변화 추이를 확인할 수 있습니다. 이 정보는 사이트 서버로 전송되지 않고 다른 사이트에서의 추적에 사용되지 않으며, 사용자는 자가진단 화면의 '기록 지우기' 버튼이나 브라우저 설정에서 언제든 삭제할 수 있습니다.</p>
<h2>언어 선택</h2>
<p>현재 정적 배포 버전에서는 IP 기반 국가 추정이나 공개 GeoIP 엔드포인트를 사용하지 않습니다. 루트 페이지는 언어 선택용 안내 페이지로 유지되며, 사용자가 상단 언어 선택 메뉴에서 직접 고른 값은 브라우저 localStorage에 저장되어 이후 선택에 활용됩니다.</p>
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
<h2>언어 안내</h2>
<p>현재 정적 배포 버전은 접속 국가를 추정하지 않고, 루트 페이지에서 사용자가 직접 한국어 또는 영어 페이지를 선택하도록 설계되어 있습니다. 선택한 언어는 브라우저 localStorage에 저장될 수 있으며, 언제든 상단 언어 선택 메뉴로 변경할 수 있습니다.</p>
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
<h2>Elección de idioma</h2>
<p>En la versión estática para revisión de AdSense, ${esc(site)} no usa detección de país por IP ni endpoints públicos GeoIP para dirigir el idioma. La página raíz funciona como página de elección de idioma, y una selección manual puede guardarse en localStorage del navegador.</p>
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
    cookies: `<p>${esc(site)} puede usar almacenamiento del navegador para preferencias de idioma e historial de herramientas, y tras la aprobación Google u otros proveedores pueden usar cookies publicitarias. La versión estática de revisión de AdSense no usa enrutamiento de idioma basado en IP. Puedes borrar cookies y localStorage en el navegador y cambiar el idioma manualmente en cualquier momento.</p>`,
    advertising: `<p>${esc(site)} puede mostrar anuncios de Google AdSense tras la aprobación y puede usar enlaces de afiliado en contenido de equipo. Los anuncios se mantienen separados del contenido editorial y no pedimos a los usuarios que hagan clic en anuncios.</p>`,
    community: `<p>Las áreas de highlights, FAQ y Q&A son para aprendizaje constructivo. Comparte solo contenido propio o con permiso, evita datos personales y mantén el feedback respetuoso. El acoso, spam, desinformación, subidas no autorizadas y manipulación de votos no están permitidos.</p>`
  };

  return {
    privacy: `
<p>This Privacy Policy explains how ${esc(site)} handles information when you visit. We aim to collect as little as possible.</p>
<h2>Information we collect</h2>
<p>${esc(site)} is a static information site. We do not ask you to create an account. If you email us, we receive the information you choose to include in that email.</p>
<h2>Cookies and local storage</h2>
<p>The site may store your chosen language and some on-device feature data in your browser via localStorage — for example, your <strong>DUPR self-check history</strong> (estimated scores and dates) so you can see your progress on return visits, plus the local highlight/review demo. This data stays in your browser, is not sent to our servers, and is not used to track you across other sites. You can remove it anytime with the "Clear history" button on the self-check or by clearing your browser storage.</p>
<h2>Language choice</h2>
<p>In the current static build, ${esc(site)} does not use IP-based country detection or public GeoIP endpoints for language routing. The root page remains a language-choice landing page, and a manual language selection may be stored in browser localStorage so the language switcher can remember the choice.</p>
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
    cookies: `<p>${esc(site)} may use browser storage for language preferences and tool history, and Google or other advertising vendors may use cookies when ads are active. The current static build does not use IP-based language routing. You can clear cookies and localStorage in your browser settings, and you can change the language manually at any time. Personalised ads can be managed in Google Ads Settings.</p>`,
    advertising: `<p>${esc(site)} may display Google AdSense ads and may use affiliate links in gear content. Ads are kept visually separate from editorial content and we do not ask users to click ads.</p>`,
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
  return simplePage(loc, rel, titles[key], intros[key], bodies[key] + policyDepthHtml(loc, key), { translated: loc === 'ko' || loc === SOURCE, noindex: false, showFallback: false });
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

function render410() {
  const loc = DEFAULT;
  const body = `<section class="page-head"><div class="wrap">
  <h1>This page is gone</h1>
  <p class="page-head__intro">This address is no longer part of Picklary and has been permanently removed. 이 주소는 더 이상 Picklary의 페이지가 아니며 영구적으로 삭제되었습니다.</p>
  <p><a class="btn btn--primary" href="${link(loc, '')}">${esc(tt(loc, 'notFound.cta'))}</a></p>
</div></section>`;
  return layout({ loc, rel: '', title: 'Gone — Picklary', description: 'This page has been permanently removed.', noindex: true, bodyHtml: body });
}


function renderRootLanding() {
  const labels = { ko: '한국어', en: 'English', es: 'Español' };
  const langButtons = locales.map((l) =>
    `<a class="lang-btn" href="/${l}/">${esc(labels[l] || (config.languageNames && config.languageNames[l]) || l)}</a>`
  ).join('');
  const altTags = locales.map((l) =>
    `<link rel="alternate" hreflang="${l}" href="${config.url}/${l}/">`
  ).join('\n  ');
  const sections = [
    { en:'Levels & DUPR pathway', ko:'레벨 & DUPR 로드맵', href:'level/', be:'Find your level from 2.0 to 5.0 and the skills that move you up.', bk:'2.0~5.0 레벨과 다음 단계로 올라가는 데 필요한 기술을 확인하세요.' },
    { en:'DUPR self-check', ko:'DUPR 자가진단', href:'dupr-self-check/', be:'Answer ten on-court situations and get a level estimate.', bk:'코트 위 10가지 상황에 답하고 레벨을 추정해 보세요.' },
    { en:'Paddles', ko:'패들', href:'paddles/', be:'Compare paddle types, materials, and what suits your game.', bk:'패들 종류와 소재, 내게 맞는 선택을 비교하세요.' },
    { en:'Pro players', ko:'프로 선수', href:'players/', be:'Study the styles and patterns of top players.', bk:'정상급 선수들의 스타일과 패턴을 살펴보세요.' },
    { en:'Pro Tour', ko:'프로투어', href:'tournaments/', be:'See current pro-tour events, results, and the wider scene.', bk:'프로투어 일정, 결과, 최신 흐름을 확인하세요.' },
    { en:'Guides', ko:'가이드', href:'categories/', be:'Rules, skills, gear, and getting started, all explained.', bk:'규칙·기술·장비·입문까지 차근차근 설명합니다.' }
  ];
  const cards = sections.map((s) =>
    `<a class="card" href="/${DEFAULT}/${s.href}"><span class="card__title">${esc(s.en)}</span><span class="card__title-ko">${esc(s.ko)}</span><span class="card__blurb">${esc(s.be)}</span><span class="card__blurb">${esc(s.bk)}</span></a>`
  ).join('');
  const desc = 'Picklary is a bilingual pickleball learning hub: DUPR levels and a self-check, paddle comparisons, pro players, pro-tour coverage, and step-by-step guides.';
  return `<!doctype html>
<html lang="${DEFAULT}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(config.siteName)} — Pickleball levels, DUPR, paddles, players & pro tour</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${config.url}/">
  ${altTags}
  <link rel="alternate" hreflang="x-default" href="${config.url}/${DEFAULT}/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(config.siteName)}">
  <meta property="og:title" content="${esc(config.siteName)} — Pickleball levels, DUPR, paddles, players & pro tour">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${config.url}/">
  <meta property="og:image" content="${config.url}/assets/icons/og-default.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${config.url}/assets/icons/og-default.png">
  <style>
    :root{--teal:#1E6F5C;--ink:#16332b;--cream:#f7faf8;--line:#e2ebe6}
    *{box-sizing:border-box}
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0;background:var(--cream);color:var(--ink);line-height:1.6}
    .wrap{max-width:960px;margin:0 auto;padding:0 20px}
    header.top{padding:28px 0 8px}
    .brand{font-weight:800;font-size:1.5rem;letter-spacing:-.02em;color:var(--teal)}
    .hero{padding:24px 0 8px}
    .hero h1{font-size:1.85rem;line-height:1.25;margin:.2em 0 .45em}
    .hero p{margin:.35em 0;color:#33473f}
    .langs{display:flex;gap:12px;flex-wrap:wrap;margin:22px 0 8px}
    .lang-btn{display:inline-block;padding:12px 22px;border-radius:999px;background:var(--teal);color:#fff;font-weight:700;text-decoration:none}
    .lang-btn+.lang-btn{background:#fff;color:var(--teal);border:2px solid var(--teal)}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin:28px 0 48px}
    .card{display:flex;flex-direction:column;gap:4px;padding:20px;border:1px solid var(--line);border-radius:18px;background:#fff;text-decoration:none;color:inherit;transition:box-shadow .15s,transform .15s}
    .card:hover{box-shadow:0 12px 30px rgba(0,0,0,.07);transform:translateY(-2px)}
    .card__title{font-weight:800;color:var(--teal)}
    .card__title-ko{font-weight:700;font-size:.92rem;color:#2c5e51}
    .card__blurb{font-size:.9rem;color:#4a5b54}
    footer.foot{padding:20px 0 40px;color:#6b776f;font-size:.85rem}
    footer.foot a{color:var(--teal)}
  </style>
</head>
<body>
  <header class="top"><div class="wrap"><span class="brand">${esc(config.siteName)}</span></div></header>
  <main>
    <section class="hero"><div class="wrap">
      <h1>Pickleball levels, DUPR, paddles, players &amp; tournaments — in one place</h1>
      <p>Picklary is a bilingual pickleball learning hub. Find your level, take the DUPR self-check, compare paddles, study pro players, and follow the pro tour and the wider scene.</p>
      <p>Picklary는 피클볼 학습 허브입니다. 내 레벨 찾기, DUPR 자가진단, 패들 비교, 프로 선수 분석, 프로투어 정보까지 한곳에서 만나보세요.</p>
      <div class="langs">${langButtons}</div>
    </div></section>
    <section><div class="wrap">
      <div class="grid">${cards}</div>
      <section class="root-more"><h2>How Picklary is organized / Picklary 구성 방식</h2><p>Picklary combines structured guides, original diagrams, interactive tools, and curated source links so that visitors can learn without depending on copied feeds or unreviewed user posts. The English and Korean sections point to the same core learning paths while keeping each language easy to browse.</p><p>Picklary는 단순 링크 모음이 아니라 레벨, 패들, 선수, 프로투어, 커뮤니티 학습을 연결하는 피클볼 학습 허브입니다. 방문자는 자신의 레벨을 먼저 확인하고, 필요한 스킬 가이드와 패들 비교, 프로 선수 분석으로 이동할 수 있습니다.</p><p>Current facts such as rankings, event schedules, product availability, and equipment approval can change. Picklary therefore adds plain-language explanation while linking readers to official sources for final verification.</p><p>The site also keeps advertising and interactive demo areas separate from editorial content. User-generated board posts and highlight submissions are not automatically published in this static version, which reduces moderation, privacy, and copyright risk before a full public community launch.</p><p>For new visitors, the recommended path is simple: choose a language, open the level pathway, try the DUPR self-check, then continue to skills, paddles, players, and pro-tour pages based on the result.</p></section>
    </div></section>
  </main>
  <footer class="foot"><div class="wrap">© ${new Date().getFullYear()} ${esc(config.siteName)} · <a href="/${DEFAULT}/about/">About</a> · <a href="/${DEFAULT}/privacy/">Privacy</a> · <a href="/sitemap.xml">Sitemap</a></div></footer>
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

function minifyCss(s) {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, '')          // strip comments
    .replace(/\s+/g, ' ')                        // collapse whitespace to single space
    .replace(/\s*([{}:;,])\s*/g, '$1')           // trim space around { } : ; ,
    .replace(/;}/g, '}')                         // drop final semicolons
    .trim();
}
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name), d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (entry.name.endsWith('.css')) fs.writeFileSync(d, minifyCss(fs.readFileSync(s, 'utf8')));
    else fs.copyFileSync(s, d);
  }
}


function renderBlogsPage(loc) {
  const t = {
    ko: {
      nav: '내 다른 블로그',
      title: 'Shawn의 다른 블로그',
      intro: 'Picklary 안에서 더 읽고 싶은 분들을 위해 운영 중인 다른 블로그를 연결했습니다. 같은 콘텐츠 흐름 안에서 계속 둘러보고, 마음에 드는 채널을 즐겨찾기해 재방문할 수 있게 구성했습니다.',
      cards: [
        { label: 'Picklary Blogspot', title: 'picklary.blogspot.com', desc: '피클볼 글과 사이트 업데이트를 블로그 형식으로 이어서 볼 수 있는 채널입니다.', href: 'https://picklary.blogspot.com' },
        { label: 'Naver Blog', title: 'blog.naver.com/arctic', desc: '네이버에서 운영하는 블로그입니다. 다른 글 포맷과 누적 콘텐츠를 연결하는 허브 역할을 합니다.', href: 'https://blog.naver.com/arctic' }
      ],
      noteTitle: 'Picklary 활용 팁',
      note: ['Picklary에서 내 레벨을 확인한 뒤 관련 블로그 글을 이어서 읽어보세요.', '블로그 글을 읽다가 필요한 도구가 있으면 자가진단, 레벨 페이지, 패들 파인더를 바로 활용할 수 있습니다.', '새 글과 경기 결과 요약은 블로그와 Picklary에서 함께 확인할 수 있습니다.']
    },
    en: {
      nav: 'More Blogs',
      title: "Shawn's Other Blogs",
      intro: 'This menu connects the rest of the content ecosystem around Picklary, so readers can keep exploring in a familiar format and return more often.',
      cards: [
        { label: 'Picklary Blogspot', title: 'picklary.blogspot.com', desc: 'A companion blog for pickleball posts and site updates in a blog-style reading flow.', href: 'https://picklary.blogspot.com' },
        { label: 'Naver Blog', title: 'blog.naver.com/arctic', desc: 'A Naver blog that extends the content mix and connects to another audience and format.', href: 'https://blog.naver.com/arctic' }
      ],
      noteTitle: 'How to use Picklary',
      note: ['Check your level on Picklary, then continue with related blog posts.', 'When a blog post mentions a tool, open the self-check, level pages, or Paddle Finder to apply it.', 'Follow new guides and result summaries across both the blogs and Picklary.']
    },
    es: {
      nav: 'Más blogs',
      title: 'Otros blogs de Shawn',
      intro: 'Este menú conecta el resto del ecosistema de contenido alrededor de Picklary para que los lectores sigan explorando y vuelvan con más frecuencia.',
      cards: [
        { label: 'Picklary Blogspot', title: 'picklary.blogspot.com', desc: 'Un blog complementario para publicaciones de pickleball y novedades del sitio.', href: 'https://picklary.blogspot.com' },
        { label: 'Naver Blog', title: 'blog.naver.com/arctic', desc: 'Un blog en Naver que amplía el formato del contenido y conecta otra audiencia.', href: 'https://blog.naver.com/arctic' }
      ],
      noteTitle: 'Cómo usar Picklary',
      note: ['Revisa tu nivel en Picklary y continúa con artículos relacionados en el blog.', 'Cuando un artículo mencione una herramienta, abre la autoevaluación, las páginas de nivel o el Paddle Finder para aplicarlo.', 'Sigue nuevas guías y resúmenes de resultados en los blogs y en Picklary.']
    }
  }[loc] || null;
  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: t.title }])}
<section class="page-head page-head--visual"><div class="wrap two-col two-col--wide">
  <div><p class="page-head__eyebrow">${esc(t.nav)}</p><h1>${esc(t.title)}</h1><p class="page-head__intro">${esc(t.intro)}</p></div>
  ${visualFigure(loc, 'boards')}
</div></section>
<section class="band"><div class="wrap"><div class="cards">${t.cards.map((c) => `<article class="card"><p class="card__eyebrow">${esc(c.label)}</p><h2 class="card__title">${esc(c.title)}</h2><p>${esc(c.desc)}</p><p><a class="btn btn--primary" href="${escAttr(c.href)}" rel="nofollow noopener" target="_blank">${esc(loc === 'ko' ? '바로 가기' : loc === 'es' ? 'Abrir' : 'Open')} →</a></p></article>`).join('')}</div></div></section>
<section class="band band--alt"><div class="wrap narrow"><div class="prose"><h2>${esc(t.noteTitle)}</h2><ul>${t.note.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div></section>
${blogReturnSection(loc)}
${adsenseDepthBlock(loc, 'blogs')}`;
  return layout({ loc, rel: 'blogs/', title: t.title, description: t.intro, bodyHtml: body });
}

function buildRssXml(loc) {
  const site = config.url;
  const items = [...publishedPosts]
    .sort((a, b) => String(b.updated || b.date || '').localeCompare(String(a.updated || a.date || '')))
    .slice(0, 20);
  const toDate = (iso) => { try { return new Date(String(iso) + 'T00:00:00Z').toUTCString(); } catch (e) { return new Date().toUTCString(); } };
  const rows = items.map((p) => {
    const url = site + link(loc, p.slug + '/');
    const title = loc1(p, loc, 'title') || p.title;
    const desc = loc1(p, loc, 'summary') || p.summary || '';
    return `    <item>
      <title>${esc(title)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <pubDate>${toDate(p.updated || p.date)}</pubDate>
      <description>${esc(desc)}</description>
    </item>`;
  }).join('\n');
  const feedTitle = config.siteName + (loc === 'ko' ? ' — 최신 글' : ' — Latest');
  const feedDesc = loc === 'ko' ? 'Picklary의 최신 피클볼 가이드와 업데이트' : 'Latest pickleball guides and updates from Picklary';
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(feedTitle)}</title>
    <link>${site}/${loc}/</link>
    <atom:link href="${site}/${loc}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${esc(feedDesc)}</description>
    <language>${loc}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${rows}
  </channel>
</rss>`;
}
function buildSitemapXml() {
  const urls = [];
  // Root global landing page (indexable, language-neutral)
  urls.push(`  <url>\n    <loc>${config.url}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`);
  const add = (rel, changefreq, priority) => {
    const alts = locales.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${config.url}${link(l, rel)}"/>`).join('\n');
    for (const loc of locales) {
      urls.push(`  <url>\n    <loc>${config.url}${link(loc, rel)}</loc>\n${alts}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${config.url}${link(DEFAULT, rel)}"/>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`);
    }
  };
  add('', 'weekly', '1.0');
  add('level/', 'weekly', '0.9');
  levels.forEach((l) => add('level/' + l.slug + '/', 'monthly', '0.75'));
  paddles.forEach((p) => add('paddles/' + p.slug + '/', 'monthly', '0.7'));
  players.forEach((pl) => add('players/' + pl.slug + '/', 'monthly', '0.65'));
  add('dupr-self-check/', 'weekly', '0.8');
  add('gear/', 'weekly', '0.9');
  ['balls','shoes','apparel','accessories'].forEach((type) => add('gear/' + type + '/', 'monthly', '0.70'));
  add('paddles/', 'weekly', '0.86');
  add('tools/paddle-finder/', 'weekly', '0.75');
  add('players/', 'weekly', '0.8');
  add('pro-scene/', 'weekly', '0.86');
  ['players','results','rules'].forEach((type) => add('pro-scene/' + type + '/', 'weekly', '0.74'));
  add('tournaments/', 'daily', '0.84');
  ['us','international','results'].forEach((type) => add('tournaments/' + type + '/', 'daily', '0.72'));
  add('updates/rules/', 'weekly', '0.7');
  add('boards/', 'weekly', '0.8');
  add('boards/dupr-faq/', 'weekly', '0.8');
  add('boards/qna/', 'weekly', '0.7');
  add('boards/friends/', 'weekly', '0.72');
  add('boards/coaches/', 'weekly', '0.72');
  add('boards/skill-review/', 'weekly', '0.72');
  add('boards/tournaments/', 'weekly', '0.72');
  add('boards/partners/', 'weekly', '0.72');
  add('highlights/', 'weekly', '0.8');
  add('blogs/', 'monthly', '0.45');
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
    writePage(loc, 'gear', renderGearIndex(loc));
    ['balls','shoes','apparel','accessories'].forEach((type) => writePage(loc, 'gear/' + type, renderGearTopicPage(loc, type)));
    writePage(loc, 'paddles', renderPaddlesIndex(loc));
    writePage(loc, 'paddles/updates', renderPaddleUpdatesPage(loc));
    paddles.forEach((p) => writePage(loc, 'paddles/' + p.slug, renderPaddlePage(p, loc)));
    writePage(loc, 'players', renderPlayersIndex(loc));
    players.forEach((p) => writePage(loc, 'players/' + p.slug, renderPlayerPage(p, loc)));
    writePage(loc, 'pro-scene', renderProSceneHub(loc));
    writePage(loc, 'pro-scene/players', renderProScenePlayers(loc));
    writePage(loc, 'pro-scene/results', renderProSceneResults(loc));
    writePage(loc, 'pro-scene/rules', renderProSceneRules(loc));
    writePage(loc, 'tournaments', renderTournamentsIndex(loc));
    writePage(loc, 'tournaments/us', renderTournamentsCategory(loc, 'tournaments'));
    writePage(loc, 'tournaments/international', renderTournamentsCategory(loc, 'international'));
    writePage(loc, 'tournaments/results', renderTournamentsCategory(loc, 'results'));
    writePage(loc, 'updates', renderUpdatesIndex(loc));
    ['news','rules','players'].forEach((type) => writePage(loc, 'updates/' + type, renderUpdatesCategory(loc, type)));
    writePage(loc, 'boards', renderBoardsIndex(loc));
    writePage(loc, 'boards/dupr-faq', renderDuprFaqBoard(loc));
    writePage(loc, 'boards/qna', renderQnaBoard(loc));
    writePage(loc, 'boards/friends', renderFriendsBoard(loc));
    writePage(loc, 'boards/coaches', renderCoachesBoard(loc));
    writePage(loc, 'boards/skill-review', renderSkillReviewBoard(loc));
    writePage(loc, 'boards/tournaments', renderTournamentsBoard(loc));
    writePage(loc, 'boards/partners', renderPartnersBoard(loc));
    writePage(loc, 'highlights', renderHighlights(loc));
    writePage(loc, 'blogs', renderBlogsPage(loc));
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
  writeFile('410.html', render410());
  writeFile('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /data/\nDisallow: /i18n/\n\nSitemap: ${config.url}/sitemap.xml\n`);
  const adsensePubId = (((config.adsense && config.adsense.clientId) || '').trim()).replace(/^ca-/, '');
  writeFile('ads.txt', adsensePubId
    ? `google.com, ${adsensePubId}, DIRECT, f08c47fec0942fa0\n`
    : `# Set adsense.clientId in data/site.config.js to auto-generate this line, e.g.:\n# google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0\n`);
  writeFile('sitemap.xml', buildSitemapXml());
  locales.forEach((loc) => writeFile(path.join(loc, 'feed.xml'), buildRssXml(loc)));
  // root index -> IP/country-aware language redirect
  writeFile('index.html', renderRootLanding());

  // counts
  const pages = locales.length * (18 + categories.length + publishedPosts.length + publishedColumns.length + 3);
  console.log(`✓ Built ${config.siteName}`);
  console.log(`  locales: ${locales.join(', ')}`);
  console.log(`  ~${pages} localized pages, ${publishedPosts.length} posts, ${publishedColumns.length} columns, ${categories.length} categories`);
  console.log(`  output: ${DIST}`);
}

build();
