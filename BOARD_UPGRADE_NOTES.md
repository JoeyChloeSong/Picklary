# PickleLevel Board Upgrade Notes

This upgrade adds two AdSense-aware community board areas:

1. `/ko/boards/dupr-faq/` and `/en/boards/dupr-faq/`
   - Curated FAQ board organized by DUPR levels 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, and 5.0.
   - 35 total FAQ entries are rendered directly in the HTML for search engines and users.
   - Level filter works in the browser without a server.

2. `/ko/boards/qna/` and `/en/boards/qna/`
   - Situational Q&A board demo with 8 moderated sample questions.
   - Sample questions and answers are rendered directly in the HTML and also hydrate into an interactive board.
   - New questions and answers are stored only in the visitor's browser localStorage. They are not uploaded or published.

AdSense safety decisions:

- Board pages are currently generated with `noAds: true`, so the AdSense script is not injected on these UGC-style pages even after a publisher ID is added.
- This is intentional. Public boards should not be monetized until login, spam protection, reporting, human moderation, and post approval are implemented.
- A live backend should publish user questions only after review.
- When moderation is ready, you can remove `noAds: true` from board pages selectively for reviewed pages.

Files changed/added:

- `data/boards.js`
- `build.js`
- `assets/js/site.js`
- `assets/css/style.css`
- `assets/img/community-board.svg`
- `dist/` rebuilt

Run:

```powershell
npm run build
npm run serve
```

or double-click:

```text
00_RUN_SITE_WINDOWS.bat
```
