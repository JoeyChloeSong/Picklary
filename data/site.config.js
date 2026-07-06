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
    email: 'iam4na2@gmail.com',

    // ★ Google Search Console "HTML tag" verification token (the content="..." value).
    //    Leave empty to emit nothing. Easiest method is a DNS-TXT "Domain" property
    //    (no code needed); use this only if you prefer the URL-prefix meta-tag method.
    googleSiteVerification: '',

    // ★ Operator identity. Use a real name or a consistent pen name.
    //    State experience honestly; never invent credentials.
    owner: {
      name: 'Shawn',
      role: 'Pickleball player of 2 years and the person who built Picklary',
      bio: "I'm Shawn. I moved from tennis to pickleball in 2024 and now play doubles about three times a week around Atlanta, at Lifetime Fitness and ACE Pickleball Club. I have no tournament experience, but I enjoy helping newer players, and I buy and test gear myself and write up what I learn. I built Picklary because clear, well-organized information on levels, rules, and gear was hard to find in both Korean and English — so I'm gathering what I study in one place anyone can use. For anything that changes — ratings, prices, rules — Picklary points readers back to official sources.",
      location: 'Atlanta, GA, USA',
      address: { locality: 'Atlanta', region: 'GA', country: 'US' },
      social: [{ name: 'Naver Blog', url: 'https://blog.naver.com/arctic' }],
      handle: 'author',
      translations: {
        ko: {
          name: 'Shawn',
          role: '피클볼 2년차 동호인이자 Picklary를 만든 사람',
          bio: '안녕하세요, Shawn입니다. 2024년 테니스에서 피클볼로 전향해 지금은 애틀랜타 지역의 Lifetime Fitness와 ACE Pickleball Club에서 주 3회가량 복식을 칩니다. 공식 대회 경험은 없지만 입문자 강습을 돕고, 장비를 직접 사서 써보며 배운 것을 정리하는 걸 좋아합니다. 레벨·규칙·장비를 한국어와 영어로 깔끔하게 정리한 정보가 부족해서, 제가 공부하며 모은 내용을 누구나 보기 쉽게 한곳에 모으려고 Picklary를 만들었습니다. 레이팅·가격·규칙처럼 자주 바뀌는 정보는 공식 출처를 함께 안내합니다.',
          location: '미국 조지아주 애틀랜타'
        },
        es: {
          name: 'Shawn',
          role: 'Jugador de pickleball desde hace 2 años y creador de Picklary',
          bio: 'Soy Shawn. Pasé del tenis al pickleball en 2024 y juego dobles unas tres veces por semana en Atlanta. Creé Picklary para reunir información clara sobre niveles, palas y reglas. Para lo que cambia —ratings, precios, reglas— remito a las fuentes oficiales.'
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
      clientId: 'ca-pub-3524565373895748' // e.g. 'ca-pub-0000000000000000'
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
    // AdSense review mode: keep automatic IP/GeoIP language routing disabled.
    // Visitors land on the root language-choice page and can select Korean or
    // English manually. This avoids unnecessary location lookups before review.
    // After approval, you may enable a privacy-reviewed server-side redirect,
    // but do not use public GeoIP endpoints unless the Privacy Policy is updated.
    languageDetection: {
      enabled: false,
      fallbackLocale: 'en',
      countryLocaleMap: {
        ko: ['KR']
      },
      geoEndpoints: [],
      timeoutMs: 0
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
