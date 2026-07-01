# Picklary AdSense pre-launch checklist

Use this checklist before requesting Google AdSense review.

## 1. Publisher ID

1. Open `data/site.config.js`.
2. Set `adsense.clientId` to your real value, for example `ca-pub-0000000000000000`.
3. Do not invent this value. Use the publisher ID shown inside your AdSense account.
4. Run `npm run build`.
5. Confirm that `dist/ads.txt` contains the matching `google.com, pub-...` line.

## 2. Deploy only the built site

On Netlify:

- Build command: `npm run build`
- Publish directory: `dist`

For manual deploy, upload the contents of `dist` only. Do not upload the whole repository folder as the live public site.

## 3. Language routing

The AdSense-review build keeps IP/GeoIP-based language routing disabled.

- `/` remains a static language-choice landing page.
- Users choose `/ko/` or `/en/` manually.
- Language preference is stored only through browser-side storage used by the site UI.

After AdSense approval, country-based routing can be reconsidered, but update the Privacy Policy first if any IP-based or GeoIP service is used.

## 4. Community features

Before AdSense approval, keep community features in demo or review-first mode.

- Do not auto-publish user posts.
- Do not expose personal contact details.
- Do not allow unreviewed external videos to become monetized public content.
- Keep friend finder, coach finder, and skill review as guided/static MVP flows until moderation is ready.

## 5. Search Console

After deployment:

1. Add the domain in Google Search Console.
2. Submit `https://picklary.com/sitemap.xml`.
3. Request indexing for `/`, `/ko/`, `/en/`, `/ko/level/`, `/en/level/`, and the community landing pages.
