# Picklary v1.1.0 - restored tools

**Korean / English. GitHub source with a Netlify static build.**

## What this release restores

| Area | Included and working in the website | Not included / not claimed |
|---|---|---|
| DUPR Self Check | Original 32 scenarios, 10/20 adaptive questions, 3D/2D court, answer review, opt-in local history, JSON export | Official DUPR or calibrated match-rating accuracy |
| Clip Lite Web | Original editing workspace, local preview, IN/OUT, multiple cuts, cut preview/delete, MP4/ZIP export integration, JSON cut list, progress/error/cancel UI | Native DualCam, Clip POV, Clip Join, native scoreboard/bookmark features |
| Vision Rating | Original desktop workflow, setup guidance, local-app link, documentation, conditional native downloads | Analyzer executable, Python application, model weights, or hosted AI service |
| Program sharing | Download page, actual local browser-editor ZIP, clearly labeled docs-only ZIP, checksum manifest | Unavailable Windows/analysis ZIPs are never replaced by docs or fake downloads |

The supplied `Picklary_v0.8.4_SOURCE_FINAL(1).zip` is WEBSITE source, not the native application distributions. Do not uninstall or overwrite existing desktop programs. Their latest versions remain independent of this website.

The website retains v1.0's bilingual learning, gear, sourced results, genuine image mappings and policy pages. Competition content remains dated **2026-10-04**. Tool restoration is dated **2026-10-06**; it is not a new results refresh.

## Start locally

Install Node.js 22 or newer. There are no mandatory npm runtime dependencies.

```sh
npm ci --ignore-scripts
npm run check
npm run serve
```

Open `http://127.0.0.1:8080/en/` or `/ko/`. Do not double-click a local HTML file.

## GitHub and Netlify

Upload the extracted source contents to the repository root, including the hidden `.github/` folder. Do not upload only this ZIP. The root should contain `package.json`, `netlify.toml`, `data/`, `public/`, `scripts/`, `templates/`, and `.github/`.

Netlify settings:

```text
Base directory: leave blank
Build command: npm run check
Publish directory: dist
Node: 22
```

Use a preview branch/deploy first. This task creates files; it does not push to GitHub or deploy to picklary.com.

`npm run check` builds fully rendered HTML, validates internal paths, redirects and metadata, and executes 24 tool unit/contract tests. `.github/workflows/ci.yml` runs that check and makes a deployable `dist` artifact. It does not claim browser encoding or Windows testing.

## Restored public routes

| English | Korean |
|---|---|
| `/en/level-check/` | `/ko/level-check/` |
| `/en/dupr-self-check/` | `/ko/dupr-self-check/` |
| `/en/vision-rating/` | `/ko/vision-rating/` |
| `/en/video-tools/` | `/ko/video-tools/` |
| `/en/clip-lite/` | `/ko/clip-lite/` |
| `/en/downloads/` | `/ko/downloads/` |

Legacy `/clip-lite/`, `/clip-lite/en/`, `/picklary-lite/`, and `/download/en` or `/download/ko` route to the appropriate tool or download center. Restored quiz/editor URLs no longer redirect to the manual notes worksheet. Manual worksheets remain supplementary under `/en|ko/tools/`.

## Browser video export: first-use requirement

Local video preview does not need the encoding core. When the user clicks Export, a same-origin worker loads pinned `@ffmpeg/core@0.12.6` JS/WASM from unpkg.com unless a local core was packaged. Video bytes are not uploaded. Engine downloads are network requests and are disclosed separately in Privacy.

The optional core is NOT present in this delivered archive. Its first download is roughly 32 MB. Browser export is capped at a 750 MB input, and smaller files can still exceed available device memory. Prefer the installed desktop program for large 4K/HEVC footage.

To package the core on the same origin, on a machine with network access:

```sh
npm run engine:cache
npm run check
```

Review the applicable FFmpeg/core and codec licenses before redistribution. The script checks binary format and records hashes; it is not an independent supply-chain or license audit.

### Real browser smoke test (manual GitHub Action)

In GitHub Actions, run **Optional real browser export and engine package**. It packages the core, builds the site, runs a genuine browser export with synthetic H.264/AAC video in all three modes, and checks the resulting MP4s using ffprobe. A successful run produces an engine-packaged Netlify artifact and the actual test report.

**This action was authored, NOT run in this restoration environment.** Managed Chromium here blocks ordinary URL navigation; our executed tests use injected local DOM and an explicit storage double. Cancellation/failure contract tests use a mock adapter. Do not confuse them with a completed WASM encoding test.

## Register missing desktop programs (no code rewriting required)

Required originals:

- Vision Rating v0.2.4 complete Korean and/or English program ZIP, not the documentation bundle.
- Your current Picklary Lite Windows distribution (v0.9.8 requested), not this web-editor ZIP.

After the operator has reviewed the source, installation and target-device behavior:

```sh
npm run release:register -- --id vision-ko --file /path/to/Vision_KO.zip --version 0.2.4 --reviewed
npm run release:register -- --id vision-en --file /path/to/Vision_EN.zip --version 0.2.4 --reviewed
npm run release:register -- --id windows-editor --file /path/to/Picklary_Lite_Windows.zip --version 0.9.8 --reviewed
npm run check
```

The helper does NOT execute archives. It checks ZIP paths and expected application files, copies the ZIP to `releases/`, and records its SHA256 in `data/app-releases.json`. A matching, explicitly reviewed file is copied into `dist/downloads/` and receives a real download button. File absent, unreviewed or hash mismatch: no fake button; a mismatch fails the build.

`--reviewed` is operator attestation, NOT an antivirus result, signed-installer status, verified AI accuracy or a security certificate. Do not distribute secrets, private video, model weights without permission, or unreviewed packages.

## Sharing the web editor locally

The build creates `dist/downloads/Picklary_Clip_Web_v1.1.0_Local.zip`. This is an actual local BROWSER edition, not the native Windows suite. Extract it and use `START_WINDOWS.bat` or `node server.mjs` after installing Node.js 22+. It listens only on `127.0.0.1:8877`. Engine first-use download requirements still apply.

The Vision documentation download is named `Picklary_Vision_v0.2.4_Docs_Only.zip`. It includes original guides and illustrative reports, NOT a model, installer or a result of the user's video.

## Verification and release boundaries

- `docs/RELEASE_AUDIT.md`: actual restoration changes and results.
- `docs/TEST_SCOPE.md`: what ran and what did not.
- `docs/PUBLICATION_CHECKLIST.md`: checks before replacing the live site.
- `docs/INPUT_INVENTORY.json`: source ZIP hash and actual supplied contents.
- `docs/verification/`: machine-readable reports from this release.
- `docs/archive-v1.0.0/`: previous audit, preserved as historical context.

No ad requests are served in the apps. Ownership meta/ads.txt remain. No AdSense approval is promised. Third-party image availability and usage rights retain the v1.0 limitations; see `THIRD_PARTY_NOTICES.md` and the media rights checklist.
