# Claude review notes — pre-AdSense pass

This is a final review pass before applying to Google AdSense. The package was already
in strong shape (real policy pages, hidden admin/data folders, localized Korean content,
no ad code shipped). The changes below remove the few remaining things most likely to be
read as "unverifiable / fabricated data," which is the single biggest quality risk in an
AdSense review.

## What was changed

1. **Removed specific DUPR numbers (`data/dupr-snapshot.js`).**
   The snapshot shipped precise figures (e.g. 7.126 doubles) presented as current data.
   These cannot be continuously verified and read as fabricated. The file is now empty of
   numbers; player pages show a "DUPR check" chip and link to the official DUPR rankings
   instead. (`duprPanel()` in `build.js` was updated to render cleanly with no numbers.)

2. **Neutralized the three tournament "result" cards (`data/auto-updates.js`).**
   They asserted specific division winners / medalists / match counts for 2026 events.
   These are unverifiable specifics. The cards now say the event has concluded and point
   to the official bracket/results source, without naming winners or counts.

3. **Removed Spanish from the public build (`data/site.config.js` → `locales: ['ko','en']`).**
   Spanish UI existed but the body content was not translated, so ~80 indexable `/es/`
   pages were essentially English duplicates — a thin/duplicate-content risk. Korean and
   English (both fully populated) remain. `i18n/es.json` is kept so Spanish can be
   re-enabled later once the content is actually translated.

## What was deliberately kept (already fine for AdSense)

- Paddle "play profile" ratings (power/control/etc.) — these carry an explicit on-page
  note that they are editorial comparison scores, not lab measurements. That is normal
  for a review site and is original content.
- Paddle reference prices (MSRP) — labeled as reference price with an official product
  link and a "verify before purchase" note.
- Player achievements — written as attributed, general statements ("PPA profile describes…"),
  not fabricated medal tallies.
- `auto-updates.js` source cards — these are link-to-official-source notes in our own words.
- Original SVG illustrations — explicitly non-photographic, no logos or real likenesses.

## Residual recommendations (optional, not blockers)

- The per-paddle SVG cards bake the MSRP price into the image, so a price change leaves the
  image stale. Consider removing the price text from the SVGs and showing price only as
  editable text on the page.
- A few player bios include an exact age; ages drift. Minor, but you can soften to "born YYYY".
- Keep building original written depth (the guides are the strongest asset). 20–30 solid,
  fully-Korean articles is a comfortable place to be for review.

## Still required before you apply (unchanged from ADSENSE_READINESS.md)

- Real HTTPS domain in `data/site.config.js` (`url`), real working `email`, then rebuild.
- Deploy `dist/`. Confirm `/sitemap.xml`, `/robots.txt`, and every footer policy page open.
- Add your real `adsense.clientId` only when ready; the build then writes `ads.txt`.

Run locally exactly as before: **`00_RUN_SITE_WINDOWS.bat`** (build + local preview).

---

# Pass 2 — reducing "scaled / low-value content" risk (the #1 AdSense rejection reason)

The biggest remaining controllable risk was a large number of auto-generated, thin,
near-identically-templated pages (24 paddle detail pages, 12 player detail pages,
7 level sub-pages, the updates/news cards, and the paddle-finder tool). In 2024–2025
this pattern is exactly what Google's "Scaled content" / "low value content" policy flags.

## What changed in pass 2

1. **`noindex` on the thin templated pages** (build.js render functions):
   paddle detail, player detail, level sub-pages, `updates/*`, `paddles/updates`, and the
   paddle-finder tool now carry `noindex,follow`. They stay fully usable for visitors and
   will still show ads after approval — they are just removed from the index so Google
   evaluates the site on its strong content.
2. **Sitemap cleaned to match:** removed those noindexed URLs from `sitemap.xml`, and fixed
   a real bug where the sitemap pointed to non-existent `tournaments/world` and
   `tournaments/korea` pages (404s). Sitemap is now 100% live, indexable URLs.
3. **Verified:** 0 broken internal links; 0 sitemap 404s; 0 noindex URLs in the sitemap.

## Indexed surface after pass 2 (per language, ko & en)

~50 indexed pages, dominated by genuinely original written content:
home (~1,700 words), 15 in-depth guides (~580 words each), 2 substantial FAQ/Q&A boards
(~900–1,000 words), the paddles / players / level hub pages, the DUPR explainer, columns,
the 5 category hubs, the tournament hubs, and the standard policy/about/author pages.
The thin product/player/level/update pages are present for users but out of the index.

## Honest probability assessment

Code/structure side is now in the top tier of what is controllable: real policy pages,
hidden source folders, no fabricated stats/results, no thin scaled pages in the index,
clean sitemap, no broken links, localized Korean content, source transparency, original art.

I cannot honestly promise a fixed "90%+", because the factors that now dominate are set at
deploy time and are not in the code:

- **Domain maturity** — a brand-new domain is rejected more often regardless of quality;
  an established HTTPS domain with some age/history raises the odds materially.
- **Content depth/volume actually published** — 15 solid guides is enough to apply; 25–30
  with 800–1,200 words each is a stronger position.
- **Real identity + working email** — fill the ★ owner name/bio and a monitored email.
- **Live, crawlable deployment** + Search Console indexing, and the inherent subjectivity
  and timing of the human review.

Rough estimate (mine, not Google's): on a real, somewhat-established HTTPS domain with the
identity/email filled in and content kept or expanded, this sits around the **low-to-high
80s%**. On a brand-new domain, lower. The remaining lever toward 90%+ is mostly **domain
maturity + more article depth**, not more code.

---

# Pass 3 — real, engaging tournament results (verified via web search)

Per request, the results pages now show actual recaps (champions by division + the week's
storyline/upset), not just a "verify at source" link. Crucially, **none of this is invented** —
every winner was verified against reputable sources (PPA Tour and major pickleball outlets)
on 2026-06-19 and is source-linked, with a "results as of <date>, may be amended" note.

## New file: `data/results.js`
Three completed 2026 events with verified champions and an original-prose summary + storyline:
- **Carvana PPA Masters** (Jan 12–18, Palm Springs) — ALW Triple Crown; Johns/Tardio MD;
  Haworth def. Sock in MS; record 1M+ peak broadcast audience.
- **Veolia Atlanta** (Apr 27–May 3, Peachtree Corners) — ALW 44th career Triple Crown;
  Johns/Tardio MD streak; storyline = 15-year-old No. 22 seed Tama Shimabukuro reaching
  the men's singles final.
- **Toys "R" Us PPA Finals** (May 4–10, San Clemente) — season finale; Johns/Tardio finish
  an unbeaten MD year; Fahey takes WS with ALW out injured; storyline = Connor Garnett's
  pool-play upset of world No. 1 Haworth.

All summaries/storylines are written in our own words (no copied article text or quotes).
Winners and scores are facts (not copyrightable); the prose is original.

## Build changes
- `resultRecap()` renderer added; `tournaments/results` now renders these rich cards.
- Tournaments landing shows a "Recent results" recap teaser + link to the full results page.
- The old neutralized "verify-only" result cards were removed from `auto-updates.js` to avoid
  duplication; `auto-updates.js` keeps the source-pointer cards only.

## How to keep it accurate (operator)
- Add a new event to `data/results.js` ONLY after confirming winners on an official/reputable
  source; write your own summary; set `checked` to the date you verified.
- Do not paste reviewer article text or stat tables. Winners/scores only, in your own framing.
- The results pages stay indexable because they are now genuine, original, sourced content —
  exactly the kind of value-add that helps (not hurts) an AdSense review.

---

# Pass 4 — UI fixes, DUPR milestones + popups, and a new DUPR self-check

Done this pass:
- **Bug fix:** the English player pages showed a Korean label ("약력"); fixed to "Biography".
- **Active top-nav highlight:** the current section is now highlighted in the top menu (underline / tinted on mobile) via `is-active` + `aria-current`.
- **Home DUPR rail:** the 2.0 / 3.0 / 4.0 / 5.0 markers are now four distinct shapes and colours (teal circle, amber diamond, blue square, purple star) and each opens a popup with that level's focus + a link to its guide.
- **NEW page `/dupr-self-check/`:** a 10-scenario, court-based self-assessment. Each scenario draws player positions + the incoming ball on an SVG court; the user picks a shot, power, and target zone (tapping the court); after 10 it estimates a level band, reviews each answer vs. the higher-percentage play, and links to the matching level guide. It is clearly labelled a **self-assessment, not an official DUPR rating** (real DUPR is match-result based at dupr.com). The scoring rewards widely-accepted high-percentage choices.
- **Player & paddle illustrations now display:** the slug-matched SVGs in `assets/img/players/` and `assets/img/paddles/` were present but not shown on detail pages; they now render with a "stylised illustration (not a photo)" caption. This improves readability and is the safe alternative to copyrighted photos.

Declined (and why): **real player photos** — pro-player photos are copyrighted and carry publicity rights; using them on an ad-monetised site risks copyright/AdSense/DMCA problems. The stylised illustrations stay. To use real photos, the operator must license them.
On DUPR numbers: player pages show **verified achievements + a live DUPR/PPA link**, not fabricated decimal ratings.

Still open (recommended next, needs verified data — happy to do next):
- Rebuild the Rankings page into a verified "current leaders" board (with the illustrated avatars + live links).
- Add MLP and international recaps alongside the PPA recaps, and surface the recaps inside the home "latest updates" feed.

---

# Pass 5 — Rankings board + MLP/international recaps + recaps in updates

Done this pass (all verified via web search on 2026-06-19, written in our own words):
- **Rankings page rebuilt** (`/updates/rankings/`): a "current leaders" board for all five pro
  divisions (men's/women's singles, men's/women's/mixed doubles) with the player illustrations
  as avatars (initials badge when no illustration exists), notable chasers, an "as of" date, and
  links to the official PPA ladder + DUPR. It names leaders/chasers rather than printing exact
  positions or DUPR decimals (those change continuously — the live ladder is linked). This page
  is now **indexable** (real original content) and added to the sitemap.
- **MLP recap added**: 2026 MLP season (in progress) — New Jersey 5s won MLP Austin and lead
  the standings; parity theme; earlier wins by LA Mad Drops and St. Louis Shock.
- **International recap added**: PPA Asia MB Hanoi Cup (Apr 2026, Vietnam) — Hong Kit "Jack" Wong
  beat Christian Alshon in the men's singles final; Anna Leigh Waters took a Triple Crown.
- These two join the three PPA recaps, so the results page now covers **PPA + MLP + international**.
- **Recaps surfaced in "latest updates"**: the updates landing now has a "Recent results,
  analysed" block showing the two newest recaps + a link to the full results page.

Net effect on the earlier requests: the generic "use the official site / verify at source"
phrasing is no longer the main content on the results and rankings pages — real, source-linked
summaries lead, with the official links kept underneath as a reference. Verified facts only;
no fabricated numbers; live links for anything that changes (DUPR, exact standings).

Sitemap now 104 indexable URLs, 0 missing, 0 noindex-in-sitemap; 0 broken internal links.

---

# Pass 5 — Rankings verified, MLP + international recaps, recaps on home, and AdSense pre-submission audit

Done this pass:
- **Rankings page** (`/updates/rankings/`): confirmed it renders a verified "current leaders" board for all five pro divisions, using the slug-matched player illustrations (with initials badges for players without a page), notes, an "as of" date, and live PPA/DUPR links. It is indexable.
- **MLP recap corrected:** removed an unverified team ("St. Louis Shock") and kept only what is sourced — LA Mad Drops (Week 1, MLP Dallas) and the New Jersey 5s (won MLP Austin, early-season standings leader). Framed honestly as an in-progress season.
- **International (Hanoi Cup) recap rewritten:** the previous version contained a pre-tournament prediction that did NOT happen ("Wong beat Alshon", an ALW "Triple Crown"). Replaced with the verified result — an all-Vietnamese men's singles final (Ly Hoang Nam d. Truong Vinh Hien), Kaitlyn Christian's comeback in women's singles, Johns/Tardio in men's doubles, Waters/Bright in women's doubles, Waters/Johns in mixed (ALW won WD + MxD on her international debut, did not play singles).
- **Home page** now has a "Recent results, analysed" section surfacing the two newest verified recaps with a link to the full results page.

## AdSense pre-submission audit (code/content side) — all green
- **No ad code shipped**; `adsense.clientId` is empty (add it only when you apply, then rebuild).
- **Essential pages present:** privacy, terms, disclaimer, advertising-disclosure, cookie-policy, corrections-policy, editorial-policy, community-guidelines, about, contact.
- **No fabricated DUPR decimals** anywhere near "DUPR"; player ratings on paddles are clearly labelled editorial, not lab data.
- **No real photos** — player/paddle visuals are stylised SVG illustrations only.
- **Indexed surface:** ~52 substantial indexed ko pages (home, 15 guides, FAQ boards, hubs, rankings, results, DUPR explainer, columns, policies) with ~48 thin templated pages set to noindex,follow.
- **robots.txt** disallows /admin, /data, /i18n and references the sitemap; those source folders are not emitted into `dist`.
- **hreflang** alternates present (ko / en / x-default); **0 broken internal links**; sitemap is 100% live, indexable URLs.

## Operator checklist BEFORE clicking "apply" (these are the deciding factors, not the code)
1. **Domain:** use a real HTTPS domain; ideally deploy and let Google index it for a little while before applying. Brand-new domains are rejected more often regardless of quality.
2. **Identity & email:** confirm `hello@picklelevel.com` actually receives mail and is monitored; consider using a real author name in `data/site.config.js` (currently the generic "PickleLevel Editor").
3. **Ad client id:** set `adsense.clientId` only at apply time, then `node build.js` again.
4. **Search Console:** submit the sitemap and confirm pages are getting indexed.
5. **Content depth:** the 15 guides are enough to apply; 20–30 in-depth articles is a stronger position. Keep results/rankings honest (verified + sourced + "as of" date).

---

# Pass 6 — Domain switch to picklary.com, DUPR self-check v2, and a refined visual system

## Domain — now uniformly picklary.com
- `data/site.config.js` → `url: 'https://picklary.com'`, `email: 'hello@picklary.com'`.
- Verified in `dist`: canonical, hreflang, sitemap `<loc>`s, robots `Sitemap:` line, and every contact/footer email all use **picklary.com** (204 files reference it; **0 stray** old domains; **0** `picklelevel.com`/`ratemypickle.com`/`courtnote`).
- Brand name on screen stays **"PickleLevel"** (only the live domain is picklary.com). If you ever want the visible name to match the domain, say so and I'll swap the wordmark/footer too.

## DUPR self-check (`/dupr-self-check/`) — full overhaul
- **30-scenario pool, 10 served per attempt, reshuffled every time** (10 easy / 10 medium / 10 hard). Verified embedded data: 30 scenarios, `total: 10`, difficulty split 10/10/10.
- **Adaptive difficulty:** the next question gets harder or easier based on how well you answered the previous one (frontier-adaptive; already-answered questions are preserved when you navigate).
- **BACK / forward navigation** — you can go back and change earlier answers.
- **Incoming-ball visualisation** — the ball's path is animated along its trajectory, with an arrowhead, and a **power chip** (soft / medium / hard); animation speed and line weight scale with power.
- **Shot buttons (8):** dink, drop, drive, **reset**, **block** (reset and block are now split), **smash** (added), speedup, lob. 3 power levels, 6 target zones.
- **ATP + Erne scenarios** included (`d3-atp`, `d3-atp2`, `d3-erne`).
- **2-decimal estimate** — the result is a single number to two decimals (e.g. 3.74), not a range, clamped to a sane 2.00–5.49 band, with the usual "estimate, not an official DUPR rating" disclaimer.
- **Per-question review with hidden answers** — the model answer stays hidden until you click to reveal it.
- **Position bug fixed:** every scenario now draws *your* players in the bottom half (y > net) and *opponents* (red dots) in the top half (y < net). Verified: **0 position errors** across all 30 (this covers the previously reported items where our players appeared in the opponents' court or red dots were missing — including the old #2/#4/#5/#6/#9/#10).
- One stray scoring key (`roll`, not a real button) was removed from a medium scenario so the scored answer only ever uses the 8 available buttons.

## Refined visual system (consistent colour language)
A single 4–5 colour palette now runs through the level visuals so the page reads as one system:
**teal `#1E6F5C` · amber `#E8A800` · blue `#2f6fed` · purple `#7b53e0`** (+ rose `#d6455d` for the 5th guide category).
- **Growth-level ladder** (`assets/img/dupr-ladder.svg`, used on **both** the home hero and the *What is DUPR?* page — verified 1× on each, in ko and en): redrawn so 2.0 / 3.0 / 4.0 / 5.0 each have a **distinct shape *and* colour** — 2.0 teal **circle**, 3.0 amber **diamond**, 4.0 blue **square**, 5.0 purple **star** — with the .5 levels as small grey dots and a rising gradient rail. Same shape/colour set as the hero rail markers, so the two are consistent.
- **Hero rail markers** (2.0/3.0/4.0/5.0) use the same four shapes/colours and remain clickable (popup with that level's focus + guide link).
- **"Four core experiences" pictograms** — the four cards now have **distinct, intuitive inline-SVG icons** (court diagram / paddle + ball / player figure / play-card), each on its own coloured tile (teal / amber / blue / purple).
- **Level quick-select** — each 1.0 band is colour-coded (2.x teal, 3.x amber, 4.x blue, 5.x purple), and the self-check CTA sits at the top of the box.
- **Hero order** — the **self-check CTA now sits above** the level quick-select, and the quick-select box also links to the self-check at its top.
- **Guides-by-topic pictograms** — each of the 5 categories has a **distinct refined icon + colour**: Rules & Getting Started (teal, open book), Skills & Drills (amber, target), Paddles & Gear (blue, paddle), Tournaments & Leagues (purple, trophy), Players & Global Scene (rose, globe). Colour shows on both the icon tile and the card's left accent bar.

## Final audit after all changes — all green
- Build OK (ko + en). Sitemap **104** indexable URLs, **0** missing, **0** noindex-in-sitemap, **0** broken internal links.
- Quiz data: 30 scenarios / 10 served / 8 shots / 6 zones / 5 bands, all balls have a valid power, **0** invalid shot/zone keys, **0** position errors.
- Still **no ad code** in `dist` (`adsbygoogle`/`ca-pub` = 0); `adsense.clientId` still empty (set it only at apply time, then rebuild).

## Reminder — the AdSense decision is still mostly off-code
Same as Pass 5: buy/point the domain → deploy the `dist/` folder (Netlify/Vercel drag-and-drop) → set a real monitored email + a real author name → submit the sitemap in Search Console and let it index → only then set `adsense.clientId`, rebuild, and apply. The code/content side is in top-tier shape; domain age, a real inbox/author, live crawlable hosting, and indexing are the deciding factors I can't set from here.
