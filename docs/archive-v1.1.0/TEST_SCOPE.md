# v1.1.0 test scope

## Executed

1. Node static build and path/schema/redirect validation.
2. 24 Node tool tests: bilingual quiz data, routes, app controls, CRC/ZIP integrity, registry gating, register-release helper, worker protocol, cancel behavior and local File reading.
3. 144 restored-tool browser checks: five widths (1440/1024/768/390/360), bilingual pages, 3D/2D and keyboard/touch toggle, 10/20 adaptive questions, answer review, opt-in history, corrupt history handling, JSON output, actual synthetic H264/AAC Blob preview, cut editing and JSON export, failure/cancel contract.
4. 235 base-site checks: editorial layouts, search/compare, schedule geometry, menu, manual worksheet, local video and notes exports.
5. Eight native FFmpeg/ZIP checks: two 1s cuts, ~2s concatenation, fallback codec arguments, optional audio, actual download ZIP CRCs, edited output differs from source.

## Important limitations

Managed Chromium cannot navigate ordinary URLs. Tests did NOT change browser policy. Local HTML/CSS/JS were injected into about:blank; static HTTP endpoints were independently read via urllib. localStorage was an explicitly identified in-memory double.

Local video preview really decoded a synthetic video Blob. Error/cancel adapter tests used a mock encoder, ONLY to test UI failure handling. The native FFmpeg CLI test is separate and is NOT browser FFmpeg.wasm output verification.

No complete native Vision or Windows application was present, so no model inference, calibrated DUPR comparison or Windows execution was performed. The manual GitHub Action for real browser export was provided but not run.

No production-domain deployment or live image availability/permission review took place in this restoration.
