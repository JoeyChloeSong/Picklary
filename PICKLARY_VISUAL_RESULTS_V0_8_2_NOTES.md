# Picklary v0.8.2 — Visual Gear + In-site Tour Results

Date: 2026-09-09

## User-requested changes

1. Removed the Home hero `Find people to play with / 함께 칠 사람 찾기` button.
2. Added verified manufacturer product imagery to the Gear Lab paddle experience for eight high-interest models and changed paddle detail rendering to prefer real product imagery over the legacy illustration when available.
3. Added a new `RESULTS INSIDE PICKLARY` block directly to Tour Board. It shows division, champion, runner-up, and game-by-game final score without requiring an external link.
4. Completed-event cards can now surface champions directly on Tour Board when tournament result records are available.
5. Made Gear Lab substantially more visual: image-led category cards plus a new real-paddle gallery, responsive on mobile.
6. Expanded Results Center finals display with game-by-game score chips (G1/G2/G3/G4) while retaining source verification links.

## Real paddle images added

- JOOLA Ben Johns Perseus Pro IV
- JOOLA Collin Johns Scorpeus Pro IV
- Six Zero Double Black Diamond Control
- Six Zero Ruby
- Paddletek Bantam TKO-C
- Selkirk LABS Project Boomstik Elongated
- CRBN 1 TruFoam Genesis
- Volair Mach 2 Forza

The image override file is `data/paddle-real-images-v082.js`. Manufacturer-hosted imagery is used rather than repackaging image binaries in the deploy archive. Older models without a verified manufacturer image retain their project illustration rather than using an unverified third-party image.

## Tour result presentation

The newest PPA Nationals result record now appears directly on Tour Board with:
- Women's Singles
- Men's Singles
- Women's Doubles
- Men's Doubles
- Mixed Doubles
- Champion + runner-up
- Game-by-game finals score

Recent MLP and PPA Asia results are also shown in the same in-site results area when structured results are available.

## Validation

- Build: PASS
- Sitemap URLs: 364
- HTML files: 387
- Local href/src references scanned: 20,964
- Broken local references: 0
- Home community CTA removed in EN/KO: PASS
- Gear real-image gallery present: PASS
- Tour in-site result module present: PASS
- Champion names + score detail present: PASS
- Results Center game-score chips present: PASS
