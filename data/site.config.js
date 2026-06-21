/*
 * Global site configuration.
 * Loaded by build.js (Node, via require) AND by the admin UI (browser, via <script>).
 * --------------------------------------------------------------------------
 * EDIT THE ITEMS MARKED ★ WITH YOUR REAL DETAILS. Do not invent fake info.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SITE_CONFIG = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  return {
    siteName: 'Picklary',
    tagline: '내 레벨에 맞는 피클볼 성장 지도 — 스킬, 패들, 프로 분석, 하이라이트 배틀.',
    description:
      'Picklary is a level-based pickleball hub for rules and skill learning, DUPR pathway guidance from 2.0 to 5.0, paddle comparisons, pro player profiles, and community highlight feedback.',

    // ★ Your live domain (no trailing slash). Used for canonical/hreflang/sitemap.
    url: 'https://picklary.com',

    // ★ Your contact email. Replace this with a working inbox before AdSense review.
    email: 'hello@picklary.com',

    // ★ Operator identity. Use a real name or a consistent pen name.
    //    State experience honestly; never invent credentials.
    owner: {
      name: 'The Picklary Editor',
      bio: 'I build practical pickleball guides for players who want level-based improvement, smarter paddle choices, and clear ways to study pro patterns. For live ratings, rankings, prices, and rules, Picklary points readers back to official sources.',
      handle: 'author',
      translations: {
        ko: {
          name: 'Picklary 에디터',
          bio: '레벨별 성장, 패들 선택, 프로 패턴 분석을 실전 플레이어 관점에서 정리합니다. DUPR, 랭킹, 가격, 규칙처럼 자주 바뀌는 정보는 공식 출처를 함께 확인하도록 안내합니다.'
        },
        es: {
          name: 'Editor de Picklary',
          bio: 'Publica guías prácticas sobre mejora por nivel, elección de palas y patrones profesionales. Para DUPR, rankings, precios y reglas, dirige a fuentes oficiales actualizadas.'
        }
      }
    },

    // Brand colours (also mirrored as CSS variables in assets/css/style.css).
    colors: { main: '#1E6F5C', sub: '#F4B400' },

    // --- Google AdSense -------------------------------------------------------
    // Leave clientId EMPTY until you are ready to verify/apply. When you paste your
    // real publisher ID here (it looks like 'ca-pub-0000000000000000'), the build:
    //   1) injects the AdSense verification + loader <script> into every page's <head>, and
    //   2) writes the matching ads.txt line automatically.
    // No ads appear until Google approves the site; after approval you add ad units
    // yourself (see README). Never invent or guess an ID.
    adsense: {
      clientId: '' // e.g. 'ca-pub-0000000000000000'
    },

    // --- Internationalisation -------------------------------------------------
    // Locales the build will actually generate. The language selector shows these.
    // Add a locale: 1) add its code here, 2) add i18n/<code>.json, 3) (optional) add
    // translations to posts/columns/categories. UI localises immediately; article
    // bodies fall back to the source language (and are set to noindex) until translated.
    locales: ['ko', 'en'],
    defaultLocale: 'en',
    sourceLocale: 'en',

    // Native names (autonyms) shown in the language selector. Includes the full
    // suggested set so enabling a language only requires adding it to `locales`.
    languageNames: {
      en: 'English', es: 'Español', pt: 'Português', fr: 'Français', de: 'Deutsch',
      it: 'Italiano', nl: 'Nederlands', pl: 'Polski', tr: 'Türkçe', ru: 'Русский',
      ar: 'العربية', he: 'עברית', 'zh-Hans': '中文', ja: '日本語', ko: '한국어',
      hi: 'हिन्दी', id: 'Bahasa Indonesia', vi: 'Tiếng Việt', th: 'ไทย'
    },

    // Right-to-left locales (layout is mirrored when one of these is active).
    rtlLocales: ['ar', 'he', 'fa', 'ur'],



    // --- Entry language routing ---------------------------------------------
    // The root page (/) detects an approximate visitor country and redirects to:
    //   KR -> /ko/, Latin America -> /es/, all other countries -> /en/.
    // Static hosting cannot read IP addresses directly in JavaScript, so the root
    // page first tries Cloudflare's same-origin country trace when available, then
    // falls back to a public GeoIP JSON endpoint, and finally to browser language.
    languageDetection: {
      enabled: true,
      fallbackLocale: 'en',
      countryLocaleMap: {
        ko: ['KR'],
        es: ['MX','GT','BZ','SV','HN','NI','CR','PA','AR','BO','BR','CL','CO','EC','FK','GF','GY','PY','PE','SR','UY','VE','CU','DO','PR']
      },
      geoEndpoints: [
        { type: 'cloudflareTrace', url: '/cdn-cgi/trace' },
        { type: 'json', url: 'https://ipapi.co/json/', countryFields: ['country_code','country','countryCode'] }
      ],
      timeoutMs: 1600
    },

    // The DUPR pathway used as a recurring UI device on skill articles.
    duprPathway: ['2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0'],

    // Editorial principles shown on the home, About, and author pages.
    editorialPrinciples: [
      'We write for players, not for search engines — every page should help a player choose a level, paddle, player profile, or feedback path.',
      'We separate what we have tested from what we compare by published spec — and we say which is which.',
      'For anything that changes — rankings, prices, dates, rules — we link to the official source instead of guessing.',
      'No fabricated reviews, statistics, or credentials. Ever.',
      'Guides are revised as gear and the game evolve, and each shows when it was last updated.'
    ],

    // Admin DEMO password (front-end only — NOT real security; see admin/index.html).
    // Change this, and never store anything sensitive in the demo admin.
    adminDemoPassword: 'courtnote',

    // For AdSense review, keep the front-end admin demo out of the public build.
    exposeAdminDemo: false
  };
}));
