# Picklary v0.7.0 — Mobile audit

Audited the eight primary destinations in Korean and English at the CSS/layout level with phone breakpoints centered on 360, 390, 430, 640, 760 and tablet widths.

## Fixes
- Restored the language selector on <=420px phones; an older rule hid it even after the v0.6.9 masthead update.
- Added extra 360–380px masthead compaction without changing menu order.
- Added shared minimum touch-target and overflow safeguards for top-level content cards and headings.
- Brought Clip Lite's independent master header into the same navy/mint design and responsive drawer behavior as the main site.
- Reduced duplicate vertical chrome in Clip Lite on mobile by hiding its secondary app topbar below 720px.
- Kept Clip Lite IN/OUT controls compact at 2 columns down to 351px, then 1 column on very narrow screens.
- Preserved existing 1-column mobile grids, table horizontal scrolling, responsive Vision Rating radar layout, Tour Board filter scrolling, and paddle/player card breakpoints.

## Primary menu audit
- Home: responsive hero, level cards, return-loop and content bands already collapse correctly.
- Level Up: page hero and level/detail grids collapse to one column; sticky visual becomes static.
- Gear Lab: visual dashboard and gear grids collapse; hotspot overlays remain percentage-based.
- Tour Board: portals, live desk, feed, filters, stats, and tables have dedicated <=760/420 rules.
- Clip Lite: fixed in this release; now shares master-nav behavior and narrower mobile editor spacing.
- Vision Rating: hero, section nav, logic, result radar, CTA and buttons collapse at 980/680.
- Play Hub: action/card grids collapse from 4 -> 2 -> 1 columns.
- Insights: card/dashboard layouts use shared one-column mobile safeguards.
