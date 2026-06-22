# Live data and community upgrade notes

This upgrade adds four operating changes:

1. Player profile DUPR references
   - `data/dupr-snapshot.js` is intentionally kept EMPTY of specific numbers. We do not ship precise DUPR figures we cannot continuously verify (unverifiable "live stats" hurt trust and AdSense review).
   - Player cards show a neutral "DUPR check" chip and player detail pages link to the official DUPR rankings instead of printing a number.
   - If you ever want to show a value, add it only after confirming it on the official source and keep the official link visible.

2. Tournament menu restructuring
   - Tournament pages are now grouped as U.S. events, non-U.S. events, and results.
   - Korea-specific tournament pages and source cards have been removed from public tournament navigation.
   - Three completed 2026 event-result cards are included as structured examples: PPA Finals, Veolia Atlanta Championships, and PPA The Masters.

3. Paddle menu user reaction
   - Each paddle detail page includes a Like button and review form.
   - Current implementation uses browser `localStorage` only. It is safe as a static demo because it does not publish unmoderated UGC.
   - Before public multi-user reviews, add login, spam filtering, reporting, and moderation.

4. Reviewer roundup framework
   - Each paddle now has a `reviewerScores` array.
   - The page displays reviewer source links from Pickleball Effect, Pickleball Studio, and John Kew Pickleball.
   - Do not invent external scores. Add exact scores only when the original reviewer uses a clear score/rating scale and attribution is allowed.
