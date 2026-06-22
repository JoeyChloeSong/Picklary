# PickleLevel AdSense Readiness Notes

This package was upgraded with AdSense review readiness in mind. Approval is never guaranteed, but the build now avoids the biggest early-review issues: thin untranslated pages, unclear policies, missing contact/editorial pages, public demo/admin folders, and weak source transparency.

## What changed in this final upgrade

1. **Korean-first review version**
   - The default public language remains Korean.
   - English remains available.
   - Spanish was removed from the generated public build because it was not fully translated enough for a review-ready site.

2. **Original/localized content**
   - All 15 guide posts and 3 columns now include Korean body text instead of Korean pages falling back to English.
   - Public guide pages are indexable; only the 404 page is noindex.

3. **Trust and policy pages**
   - Privacy Policy
   - Cookie Policy
   - Terms
   - Disclaimer
   - Editorial Policy
   - Corrections Policy
   - Advertising/Affiliate Disclosure
   - Community Guidelines
   - Contact
   - About
   - Author
   - Sitemap

4. **Source transparency**
   - Guide articles now include a source/live-check panel that points users to official sources for changing facts such as rules, DUPR, rankings, approved equipment, and pricing.

5. **Public build cleanup**
   - `dist/` no longer exposes `/admin/`, `/data/`, or `/i18n/`.
   - `robots.txt` disallows those source/demo paths.
   - `ads.txt` is generated automatically from the real AdSense publisher ID when it is added to `data/site.config.js`.

6. **Validation performed**
   - `node build.js` succeeded.
   - Internal link/media check: 0 broken local links.
   - Public `dist` folders generated: Korean and English.
   - Noindex check: only `404.html` contains noindex.
   - ZIP integrity check: passed after packaging.

## Before submitting to Google AdSense

1. **Use a real domain and HTTPS**
   - Update `data/site.config.js`:
     - `url: 'https://your-real-domain.com'`
   - Rebuild with `npm run build`.
   - Deploy only the `dist/` folder.

2. **Use a working contact email**
   - Update `data/site.config.js`:
     - `email: 'your-working-email@your-domain.com'`
   - Make sure the inbox actually receives mail.
   - Rebuild.

3. **Add the real AdSense publisher ID only when ready**
   - In `data/site.config.js`, set:
     - `adsense.clientId: 'ca-pub-XXXXXXXXXXXXXXXX'`
   - Rebuild with `npm run build`.
   - The build injects the AdSense script and writes `ads.txt`.
   - Never use a fake publisher ID.

4. **Check the live site after deployment**
   - Homepage loads.
   - All footer policy pages open.
   - `/sitemap.xml` works.
   - `/robots.txt` works.
   - `/ads.txt` works after publisher ID is set.
   - Mobile navigation works.
   - No placeholder email/domain remains.

5. **Ad placement after approval**
   - Keep ads visually separate from menus, video buttons, upload buttons, and recommendation/vote buttons.
   - Do not write text asking users to click ads.
   - Do not place arrows or images that appear to point at ads.

6. **Community/UGC caution**
   - The current highlight feature is a browser-only preview tool; it does not upload videos to a server. Before real public uploads, add user accounts, storage, moderation, reporting, copyright/permission agreement, spam prevention, and vote-abuse controls.
   - Moderate comments and uploads before showing ads around them.

## Recommended submission order

1. Deploy `dist/` to Netlify/Vercel/hosting.
2. Connect real domain and HTTPS.
3. Replace email and URL in `data/site.config.js` and rebuild.
4. Review every footer policy page on the live domain.
5. Add real AdSense publisher ID and rebuild.
6. Confirm `ads.txt`.
7. Submit the live domain in AdSense.

## Local execution

Windows:

```bat
00_RUN_SITE_WINDOWS.bat
```

PowerShell/Node:

```powershell
npm run build
npm run serve
```

The local preview opens the Korean homepage, usually at:

```text
http://127.0.0.1:8787/ko/
```
