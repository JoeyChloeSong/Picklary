# Final AdSense-oriented upgrade notes

Date: 2026-06-19

## Summary

This version is optimized for a cleaner Google AdSense review path.

### Added or improved

- Full Korean content pack for all 15 guides and 3 editor columns.
- Korean trust pages: About, Contact, Privacy Policy, Cookie Policy, Terms, Disclaimer, Editorial Policy, Corrections Policy, Advertising Disclosure, Community Guidelines.
- Korean pages are now indexable; fallback/noindex Korean pages have been removed.
- Public build no longer includes `/admin`, `/data`, or `/i18n` folders.
- `robots.txt` blocks non-public paths and points to `sitemap.xml`.
- `sitemap.xml` includes Korean/English hreflang alternates and policy pages.
- Highlight page now clearly explains that browser preview cards are local-only and provides feedback rules.
- `ADSENSE_APPROVAL_CHECKLIST.md` added.
- `DEPLOY_DIST_ONLY.txt` added.

### Important before going live

- Replace the email in `data/site.config.js` with a working inbox.
- Confirm the final domain in `data/site.config.js`.
- Deploy only the `dist` directory for public review.
- After receiving the real AdSense publisher ID, put it in `data/site.config.js` and rebuild.

### Validation performed

- `node build.js`: success.
- Missing internal links/images: 0.
- Korean noindex pages: 0.
- English noindex pages: 0.
- Public dist admin/data/i18n folders: not present.
- ZIP integrity test: performed after packaging.
