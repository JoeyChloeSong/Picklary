# Picklary v0.8.0 — AdSense & Results Center Refresh

## Purpose
This release is a quality-focused rebuild after an AdSense rejection. It does not guarantee AdSense approval. The goal is to address the areas Google highlights most often: original and useful content, sufficient editorial depth, clear navigation, and a complete user experience.

## AdSense-focused content changes
- Removed repetitive generic filler from shared rich-text sections.
- Added original Picklary editorial sections to Home, Level Up, Gear Lab, Paddles, Pro Players, Tour Board, Vision Rating, and Clip Lite.
- Added practical interpretation rather than only lists of links/results: what a result means, what players can learn, how to use equipment/player data, and limitations of Vision Rating.
- Marked thin utility/download-only pages `noindex,follow` where they do not need to compete in search.
- Kept legal/compliance utility pages accessible without treating thin launcher/notice pages as primary search content.

## New Results Center
Tour Board > Results is now organized into three clear channels:
1. PPA
2. MLP
3. ASIA (PPA Tour Asia / international results)

Each channel includes current results, the next relevant event, source links, and editorial context. A direct results directory page links users to the appropriate section instead of duplicating long result content.

## September 2026 data refresh
- PPA Nationals, Cary (Aug 31–Sep 6): final champions and scores added.
- Current PPA World Pickleball Rankings snapshot added to the results center.
- MLP Finals, New York City (Aug 28–30): New Jersey 5s championship and current postseason context added.
- MLP Nations Cup, Dallas (Oct 30–Nov 1): upcoming event page added conservatively; unconfirmed rosters/format are not invented.
- PPA Tour Asia Shenzhen Open (Aug 20–23): final results and event context added.
- PPA Asia 1000 Leapmotor Kuala Lumpur Cup (Sep 9–13): moved to live status for Malaysia’s Sep 9 qualifying day, with schedule, prize/points context, seeds, projected matchups, and official-source links.
- Veolia Arizona Open (Sep 14–20): next U.S. PPA main-tour event added.

## Mobile / UX improvements
- Results channel cards collapse to one column on phones.
- Result cards, next-event cards, ranking lists, and editorial sections use responsive one-column layouts below tablet widths.
- Long team/player names wrap safely.
- CTA/source buttons wrap and retain mobile-sized touch targets.
- Tables remain readable with existing responsive handling.
- Master palette remains aligned with Vision Rating (deep navy, teal, mint accents).

## Validation
- Node build completed successfully.
- SEO redirect/canonical audit passed.
- 387 HTML files generated.
- 364 sitemap URLs generated.
- 21,042 local link/asset references checked with 0 missing targets.
- Thin Picklary Lite redirect and third-party notice pages are `noindex,follow`.

## Important
AdSense approval is ultimately determined by Google. This release improves content depth, originality, navigation, and index quality but should not be presented as a guaranteed approval fix.
