# PickleLevel AdSense approval checklist

This package has been upgraded for a cleaner AdSense review path. It does not guarantee approval, but it removes common avoidable issues.

## What was changed

- Korean is now the default public language and all Korean article pages are indexable.
- The public build contains real Korean article bodies for all 15 guides and 3 editor columns.
- Footer trust pages were added: About, Contact, Privacy Policy, Cookie Policy, Terms, Disclaimer, Editorial Policy, Corrections Policy, Advertising Disclosure, Community Guidelines.
- Public `/dist` no longer exposes the demo admin or raw data JSON.
- The highlight page now acts as a browser-only preview and feedback guide; it does not pretend to upload video to a server.
- `robots.txt`, `sitemap.xml`, canonical tags, and hreflang tags are generated.
- No Google ad unit placeholders are shown before approval.

## Before you submit to AdSense

1. Replace `data/site.config.js` values with your real details:
   - `url`: your final live domain, for example `https://picklelevel.com`
   - `email`: a working inbox on the same brand/domain if possible
   - `owner.name`: a real name or consistent editor pen name
   - `owner.bio`: honest experience only; do not invent credentials

2. Build the site:

```bash
npm run build
```

3. Deploy only the `dist` folder to Netlify, Vercel, Cloudflare Pages, or your hosting provider.
   Do not deploy the whole source folder if you only want the public AdSense review site.

4. Confirm these URLs work on the live domain:
   - `/ko/`
   - `/ko/about/`
   - `/ko/contact/`
   - `/ko/privacy/`
   - `/ko/editorial-policy/`
   - `/sitemap.xml`
   - `/robots.txt`

5. Add the site to Google Search Console and submit `/sitemap.xml`.

6. Only after you receive your real AdSense publisher ID, paste it into:

```js
adsense: {
  clientId: 'ca-pub-0000000000000000'
}
```

Then run `npm run build` again. The build will inject the AdSense account meta/script and generate the matching `ads.txt` line.

## Policy reminders

- Never ask users to click ads.
- Never click your own live ads.
- Do not place arrows, labels, images, or buttons that make users click ads accidentally.
- Keep ads visually separate from navigation, video upload buttons, voting buttons, and download buttons.
- Keep privacy/cookie information updated when you enable ads or analytics.

Useful official references:

- AdSense eligibility: https://support.google.com/adsense/answer/9724
- AdSense program policies: https://support.google.com/adsense/answer/48182
- Ad placement policies: https://support.google.com/adsense/answer/1346295
- Privacy disclosures for ads/cookies: https://support.google.com/adsense/answer/1348695
- ads.txt guide: https://support.google.com/adsense/answer/12171612
