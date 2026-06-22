# COMPLIANCE — read before enabling any ingestion source

The ingestion pipeline exists to **save you link-collecting busywork**, not to republish other people's work. Used wrongly, automated content is one of the fastest ways to fail AdSense review and to infringe copyright. Used correctly, it's just a tidy inbox of leads that **you** turn into original writing.

## The non-negotiables
1. **Never republish source text.** Store a link and write your **own** summary. Quoting must be minimal and attributed; never reproduce paragraphs, tables, or rankings.
2. **Never re-host video or highlights.** Link to the official channel; your value is your own text recap/analysis.
3. **A human reviews and rewrites every item before anything is published.** No item goes from inbox to site automatically. AI may *assist* drafting, but a person fact-checks and edits.
4. **No fabricated facts, stats, prices, rankings, dates, or "experience."** If you didn't verify it, don't state it.
5. **Disclose affiliate relationships** on any post that uses them, and on the Disclaimer page.

## Per-source checklist (do this for EACH source before `enabled: true`)
- [ ] **Terms of Service** — does the site permit automated access / reuse of its feed? Some forbid scraping outright.
- [ ] **robots.txt** — does it disallow the paths you'd read? Respect it. (`respectRobots` is on by default; honor it manually too.)
- [ ] **Feed/API license** — is the RSS/API offered for syndication, and on what terms (link-only? attribution? non-commercial)?
- [ ] **Rate & identification** — keep `requestDelayMs` polite; keep a real contact in the `userAgent`.
- [ ] **What you'll store** — confirm you will keep only a link + your own words, matching the source's `license` note in the config.
- [ ] **Trademarks/logos** — name brands in text; don't reuse their logos/images.

If you can't tick every box, leave the source **disabled**.

## Why this protects you
- **AdSense:** Google rewards original, people-first content and penalizes scraped/scaled/auto-translated material. The human-in-the-loop step is exactly what keeps you on the right side of that line.
- **Copyright:** linking + original commentary is normal practice; copying text/media is not.
- **Trust:** readers (and reviewers) can tell the difference between a genuine improvement hub and a reposting feed.

## Translations are content too
Machine-translating articles into many languages and publishing them unreviewed is treated like other low-quality scaled content. Translate the **UI** freely; publish **article** translations only when a fluent human has reviewed them. Untranslated pages fall back to the source language and are `noindex` until translated.
