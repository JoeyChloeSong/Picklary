# Picklary AdSense Final v0.8.1

## Purpose
Final prelaunch hardening for the next Google AdSense review.

## Changes
- Updated Korean and English Privacy Policy to disclose Netlify Forms submissions, purpose, review workflow, private-contact handling, browser previews, deletion/correction contact, and actual `/` -> `/en/` routing.
- Added inline privacy notices to community registration and Video Skill Review forms.
- Corrected community copy that previously implied submitted forms never left the browser.
- AdSense loader is not injected on `noindex` pages such as 404, 410, sitemap, and update utility pages.
- Trust/policy pages are `noAds` so Auto Ads cannot appear on them.
- Removed live references to four Windows ZIP files absent from this Windows-safe source archive.
- `/download/ko` and `/download/en` resolve to working product-information pages instead of missing ZIPs.
- Vision Rating automatically uses its real ZIP only when present; otherwise the CTA opens the existing quick-start guide.
- Clip Lite pages no longer promise a missing ZIP in this AdSense-review package.

## Deployment
Run `npm run build`, deploy `dist/` (or connect the repository to Netlify using `netlify.toml`), then verify the live URLs before requesting AdSense review.
