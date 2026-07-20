# Picklary Tour Board + Clip Lite upgrade

## Information architecture decision

The existing **Pro Scene** menu was not duplicated. It was expanded and renamed **Tour Board** because both concepts cover the same reader journey. The existing `/pro-scene/` URL is preserved for search and bookmark continuity, while `/tour` aliases redirect to it.

Tour Board now connects:

- tournament schedules and updates
- pro player profiles
- results and rankings
- player storylines
- connected Picklary and Naver blog content

## Clip Lite integration

Picklary Lite v0.7.5 is included under `/picklary-lite/`, with Korean and English landing pages, Windows ZIP downloads, setup notes, test guides, and acceptance reports. A native Picklary page is generated at `/ko/clip-lite/` and `/en/clip-lite/`, and Clip Lite is shown in the main navigation and home experience cards.

## Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Drag-and-drop deployment: use the separate Netlify deploy ZIP generated from `dist`.
