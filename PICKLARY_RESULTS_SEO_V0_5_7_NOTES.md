# Picklary v0.5.7 — Pro Results + Search Console Redirect Fix

Updated: 2026-07-28

## Pro results
- MLP Chicago: Dallas Flash champion, Brooklyn runner-up, California third; final decided by Dallas 21-10 DreamBreaker.
- PPA Tour Asia Singapore Open: all five pro finals, scores, and storylines added.
- MLP Orlando preview refreshed for the final playoff cut.
- Tour Board, tournament detail pages, results page, and storylines updated in Korean and English.

## Google Search Console: Page with redirect
- Removed the redirecting root URL from sitemap.xml generation.
- Changed the permanent default-language redirect from 302 to 301.
- Replaced internal links that pointed to redirect aliases with direct canonical Clip Lite URLs.
- Added a build-time SEO audit that fails the build if redirect-source URLs appear in the sitemap, canonical tags, or internal links.

Intentional legacy aliases remain 301 redirects and may still appear as excluded “Page with redirect” URLs; this is expected.
