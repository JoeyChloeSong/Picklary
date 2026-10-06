# Picklary v1.2.0 — Test scope

## Executed for this version

- `npm run check`: static build/validation, 24 original tool unit/contract tests, 8 new visual and source-preservation tests.
- `python scripts/visual-audit.py`: 483 browser checks, bilingual, widths 1440/1024/768/390/360; gallery containment, card separation, tabs, score source parity, partial coverage labels, brand filters, compare, mobile menu/dock.
- `python scripts/browser-tools-audit.py`: 144 restored-tool checks.
- `python scripts/browser-audit.py --offline-render`: 235 base-site regression checks.

The three browser reports have overlapping coverage; their counts are not a count of unique user studies or performance benchmarks.

## Core source preservation

18 SHA256 references in `V1_1_SOURCE_PRESERVATION.json` are compared by `tests/visual.test.mjs`.
These include quiz/editor logic and templates plus products, players, media, results and rankings.
The original editorial reference date remains 2026-10-04; this release is a visual interface update.

## Environment and important limitations

The managed Chromium navigation policy was not changed. Tests rendered local HTML/CSS/JS through about:blank/set_content; external requests were blocked. The explicit in-memory localStorage double supports logical storage tests but is not a production-origin persistence test.

Synthetic local H264/AAC Blob playback was tested. Failure/cancellation adapter tests used a test encoder, not a real full FFmpeg.wasm export.
No actual browser MP4 encoding, Windows application execution, Vision inference or calibrated rating study was performed in this visual release.

The optional GitHub Action `browser-export-smoke.yml` remains available for a real-browser export check; it has not been run by this release's container tests.
Native FFmpeg CLI reports archived from v1.1.0 are historical and are not claimed as newly executed v1.2.0 tests.

31 remote image URLs and their reuse permissions remain operator checks. Test screenshots intentionally show fallbacks where remote requests were blocked.
No production-domain deployment or AdSense approval was tested.

## Evidence

`docs/verification/` contains only reports from this visual release.
`docs/archive-v1.1.0/verification/` preserves prior-version results with their original scope.
Fresh ZIP extraction/build and archive integrity are recorded separately in `PACKAGE_VERIFICATION.json`.
