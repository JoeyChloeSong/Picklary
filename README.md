# Picklary 1.2.2 - image-first menu edition

This release keeps the v1.2.1 site and tool engines, and uses the supplied older menu artwork to create large, labeled navigation images. It is not a new ranking, event update, or native program release.

## Quick start

Requires Node.js 22 or newer. No production npm dependencies.

```sh
npm run check
npm run serve
```

GitHub: extract the SOURCE ZIP and put its CONTENTS at the repository root, including `.github/`, `public/`, `data/`, `scripts/`, `templates/`, `design/` and `package.json`. Do not upload only the ZIP or place everything under `dist/`.

Netlify:
- Base directory: empty
- Build command: `npm run check`
- Publish directory: `dist`
- Node: `22`

The separate NETLIFY_PREVIEW ZIP has `index.html`, `_redirects`, `_headers`, `assets/`, `downloads/`, `en/` and `ko/` at its root. For manual deployment, extract it and deploy that folder to a preview first.

## What changed

- One large illustrated hero, two prominent tool tiles and four secondary image tiles.
- Two-column image navigation on mobile, with reduced card text and no automatic carousel.
- Reused cropped artwork for Gear Lab categories, tour entries, skill topics and tool hubs.
- Real HTML links and localized labels outside the bitmaps; no nested screenshot buttons.
- Removed legacy full-screen art with an unsupported DUPR verification badge/sample ratings from public navigation.
- Named product/player photos remain distinct from generic menu illustrations.
- Responsive local WebP variants and content-hashed CSS; no external network request is required to load menu artwork.
- Included the new menu stylesheet in the standalone local web-editor ZIP, with a regression test for all of its local CSS/JS references.

## Preservation and limits

`docs/V1_2_2_PRESERVATION.json` compares the original quiz, templates, engines and editorial datasets with v1.2.1. The independent estimate is not official DUPR. Editorial data remains dated 2026-10-04.

Desktop Vision Rating / Windows editing binaries are still not supplied. The download registry and missing-package states are unchanged. Browser MP4/WASM end-to-end export, external photo CDN availability and live deployment are not certified by these design tests.

## Artwork

`design/menu-originals/` contains privately archived artwork from the supplied v0.8.4 source (the older visual-menu style referenced in the conversation). It is NOT published. `data/menu-art.json` records source hashes, crop rectangles and output hashes. Only cropped illustrations in `public/assets/menu/v122/` are published.

To regenerate committed menu assets (optional; not needed for normal builds):

```sh
python -m pip install Pillow
python scripts/prepare-menu-art.py
npm run check
```

Only menu art is localised/recropped in this release. No new third-party photograph rights are claimed. The pre-existing named-image register still contains 17 local and 31 remote images. See `THIRD_PARTY_NOTICES.md` before monetization.

## Tests and previews

- `npm run check`: build, references, quiz/editor unit tests, visual structure, image hashes and local-editor package checks.
- `python scripts/image-menu-audit.py`: Chromium visual and menu regression checks (requires Playwright, Pillow, BeautifulSoup, and Chromium).
- `python scripts/browser-tools-audit.py`: existing active-tool interaction checks.
- `docs/preview/`: screenshots of THIS release.
- `docs/verification/v1.2.2/`: actual audit outputs.

Browser screenshot tests embed local images and block external requests. The localStorage harness is a test double. See `docs/TEST_SCOPE.md` for exact boundaries.
