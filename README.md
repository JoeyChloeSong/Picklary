# Picklary

# Windows quick start

Double-click `00_RUN_SITE_WINDOWS.bat`. Do not double-click `serve.js`.

The script rebuilds the site, starts a local server, and opens `http://127.0.0.1:8787/ko/` or the next available port automatically.

A level-based pickleball **growth hub** — 2.0~5.0 DUPR pathway, rules and skills, paddle rankings, world pro profiles, and a highlight-battle demo for community feedback. Built as a **static site** (great for SEO/AdSense) with a **multilingual** front end, a lightweight **admin (CMS-lite)** demo, and an **AdSense-safe content-ingestion** scaffold.

> Built to reflect what Google AdSense reviewers look for: genuine, people-first, original content. Approval is always at Google's discretion — this is about quality, not a guarantee. No ad code is included; add your AdSense snippet yourself **after** approval.

## Run it

```bash
npm start        # builds the site and serves it at http://localhost:3000
```

Other scripts:

```bash
npm run build      # generate the static site into /dist
npm run serve      # serve an already-built /dist
npm run ingest:dry # demo the ingestion pipeline (writes nothing)
npm run ingest     # run the pipeline on ENABLED, permitted sources
npm run digest     # print a "The Brief" draft from ingested items
```

On **Replit**: import the repo and press **Run** (uses `npm start`).

## How it works

- **Single source of data** in `/data` → a small Node build script (`build.js`) generates a real static HTML file for **every page, in every locale**. You edit data in one place; readers and crawlers get fully-rendered HTML.
- **Output** lands in `/dist` (deployable to any static host).
- The **admin** at `/admin/` is a browser-only demo: it edits a copy of your content in `localStorage` and can export/import JSON. It does **not** write to the server or auto-publish — publishing is a deliberate, human step.

## Where to edit

| Want to change… | Edit |
|---|---|
| Site name, tagline, **★ email**, **★ owner name/bio**, **★ site URL**, colors, locales | `data/site.config.js` |
| The color palette on the live site | `assets/css/style.css` (`--main`, `--sub` variables) — keep in sync with the config |
| Categories (+ their ko/es translations) | `data/categories.js` |
| Level pathway pages from 2.0 to 5.0 | `data/levels.js` |
| Paddle ranking/finder database | `data/paddles.js` |
| Pro player profile database | `data/players.js` |
| Highlight battle seed examples | `data/highlights.js` |
| Articles and guides | `data/posts.js` |
| Owner columns | `data/columns.js` |
| UI text (nav, buttons, labels) for a language | `i18n/<locale>.json` |
| Admin demo password & copy | `data/site.config.js` (`adminDemoPassword`) / `admin/index.html` |
| **AdSense** publisher ID (verification snippet + ads.txt) | `data/site.config.js` (`adsense.clientId`) |

**★ = must be your real details before launch.** Never invent a name, email, address, or credentials.

### Add an article
Add an object to the array in `data/posts.js`. Required-ish fields: `id, slug, category, status('published'|'draft'), date, title, subtitle, summary, body`. The `body` is HTML; use `<h2 id="...">` headings so the table of contents builds itself. Optional: `keyTakeaways[]`, `commonMistakes[]`, `checklist[]`, `faq[]`, `related[]`, `level` (for skills, e.g. `"3.0"` — places it on the DUPR rail), `featured`.

### Add a language
1. Copy `i18n/en.json` to `i18n/<locale>.json` and translate the UI strings.
2. Add the locale code to `locales` in `data/site.config.js` (and to `rtlLocales` if it's right-to-left).
3. Rebuild. The language selector, locale URLs (`/<locale>/…`), and `hreflang` tags update automatically.

### Add a translation of an article
On any post/column, add a `translations` map:

```js
translations: {
  ko: { title: "…", subtitle: "…", summary: "…", body: "…(HTML)…",
        keyTakeaways: [...], faq: [...] }
}
```

Pages **without** a translation fall back to the source language and are marked `noindex` until translated, with a visible notice. **Only publish translations a fluent human has reviewed** — auto-translated text published as-is hurts SEO and AdSense review.

### Add an ingestion source
Edit `ingest/sources.config.json`: add a source and set `enabled: true` **only after** confirming you're permitted to use it (see `COMPLIANCE.md`). Then:

```
npm run ingest        # fetch -> normalize -> data/ingested/
```

Review items in the admin **Ingestion Inbox**, rewrite them in your own words, turn the good ones into drafts, finish writing, set `status: "published"`, and `npm run build`. The pipeline only ever stores a **link + your own summary stub** — it never republishes source text, and never re-hosts video/highlights.

## New Picklary sections

- `/level/` and `/level/2-0/` through `/level/5-0/`: expanded DUPR pathway with level-specific skills, drills, paddle profile, and related guides.
- `/paddles/`: brand/type/level-filterable paddle ranking dashboard plus individual paddle detail pages.
- `/players/`: world pro player cards and profile pages with skill, event, paddle-line, DUPR/ranking/news source buttons.
- `/highlights/`: front-end demo for user highlight submission, local recommendation votes, and weekly leaderboard layout. Connect a real backend, storage, login, voting limits, copyright consent, reporting, and moderation before public launch.
- `/assets/img/`: original SVG diagrams for court zones, shot paths, DUPR ladder, paddle shapes, pro profiles, and highlight competition.

## Connecting Google AdSense
1. When you're ready to verify/apply, open `data/site.config.js` and set `adsense.clientId` to your **real** publisher ID (it looks like `ca-pub-0000000000000000`). Leave it empty until then — never invent an ID.
2. Run `npm run build` and redeploy. The build injects the AdSense verification + loader `<script>` into **every page's `<head>`** and writes the matching `ads.txt` line automatically.
3. No ads show until Google approves the site. After approval, add ad units where you want them (e.g. in the page templates in `build.js`) and redeploy.

## Integrity notes
- Real **Privacy / Terms / Disclaimer** pages are included; the Privacy page covers cookies, Google as a third-party ad vendor, and opt-out.
- Contact is **email-only** (no fake address/phone).
- No fabricated stats, rankings, reviews, or "latest 2026" claims.

## Project layout
```
data/        content (single source of truth) + ingested/ inbox items
i18n/        UI message catalogs, one JSON per language
assets/      css, js, icons
ingest/      AdSense-safe ingestion scaffold (config, adapter, pipeline, digest/draft tools)
admin/       browser-only CMS-lite demo
build.js     static-site generator (per-locale)
serve.js     tiny static server for /dist
dist/        generated output (gitignored)
```

## License
MIT for the code. You are responsible for the content you publish and for the terms of any source you ingest.

## Automation agent for ongoing updates

This package includes a review-first ChatGPT/OpenAI automation layer for ongoing site management.

Useful commands:

```bash
npm run agent:status
npm run agent:scan
npm run agent:publish
npm run build
```

Read `automation/README_AGENT.md` before enabling additional sources or connecting the OpenAI API. The agent creates editorial drafts from official/permitted sources for news, tournaments, results, Korea events, paddle launches/reviews, rules, paddle approval/ban changes, and rankings. It does not auto-publish high-risk updates without editor approval.
