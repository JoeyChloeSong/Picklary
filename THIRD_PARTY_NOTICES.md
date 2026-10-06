# Third-party content and image rights

This repository is not an open licence for third-party photographs, trademarks, video libraries or editorial sources.

## Images

`data/media.json` records 48 named subjects, source pages, check dates, local/remote paths and a rights status. Source matching means that the picture was associated with the named athlete or product by its source; it does **not** mean that the site operator has a redistribution, commercial or advertising licence.

All records remain `rights: "not-documented"` because permission documents were not provided or obtained in this work. Do not change this flag merely because a URL returns HTTP 200 or a media download succeeded.

Before publication/monetization, record the applicable permission or reuse basis, permitted use, credit wording, and any expiry or restrictions. Use `docs/MEDIA_RIGHTS_CHECKLIST.csv`. Replace material whose use cannot be supported with your own accurately labeled photos or licensed alternatives. Never replace one athlete with another, or one brand/model with a visually similar but unrelated product.

Local copies in `public/assets/media/` are supplied for review of the proposed site. Remote linking also requires review; it is not a workaround for rights.

## Data and editorial sources

Tournament scores, product identification and ranking values cite the relevant source. Picklary adds its own comparison prompts, learning tasks and editorial structure. Source articles are not republished wholesale. Manufacturer statements are not presented as measured Picklary test results.

## Legacy software

`legacy/clip-lite-web/` contains earlier application source for reference. Its included `third-party-notices.html` and any external FFmpeg imports retain their own terms. That application is not included in the new public build and its export behavior has not been certified here.

## Fonts

The new site uses system font stacks. No font files are redistributed.

## No endorsement

PPA, MLP, USA Pickleball, DUPR and product brands are not represented as endorsing Picklary.

## Restored video tools (v1.1.0)

The restored browser UI originates in the operator-supplied Picklary v0.8.4 site
(Clip Lite Web 0.5.13.0). The worker adapter and stored-ZIP utility in this edition
are source code, not copies of the native Windows application.

Browser export loads `@ffmpeg/core` **0.12.6** (single-thread UMD JS/WASM) from
`https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/` unless the operator packages it at
`/assets/vendor/ffmpeg-core/`. FFmpeg and bundled codecs have their own licences;
review upstream build/source obligations before redistributing a cached binary.
A codec-enabled FFmpeg core should not be assumed to be MIT simply because a
JavaScript wrapper is MIT. Core binaries are not included in this source ZIP.

Official implementation guidance: https://ffmpegwasm.netlify.app/docs/getting-started/installation/
Upstream project/source: https://github.com/ffmpegwasm/ffmpeg.wasm
FFmpeg legal information: https://ffmpeg.org/legal.html

The archive under downloads labeled Vision documentation contains user-supplied
historical guides/examples only. Those examples are not new verified measurements.
No Vision model weights or Windows application executable were recovered.
