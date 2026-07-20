# Picklary Tour Board Results & Story v0.5.0

## Main changes

- Removed the U.S. tour, non-U.S. tour, and standalone Results filter links from the tournament landing page.
- Rebuilt the tournament landing page as an interactive media hub with a new gradient hero, current-event cards, result-publication status, methodology section, verified-results archive, and source policy.
- Added detailed bilingual event pages with:
  - official result status and verification date;
  - champions, finalists, and final scores where confirmed;
  - official-result-pending states where official medal tables are not yet published;
  - field/format information, notable facts, viewing questions, season context, and event storylines.
- Added verified archive pages for PPA Finals 2026 and Veolia Atlanta 2026.
- Preserved the Tour Board, player, ranking, storyline, home-language routing, and Clip Lite web application changes from prior versions.

## Data integrity rule

No medalist is inferred from an event's completed status. A champion or finalist is displayed only when a visible official recap or result table confirms the name and score.

## Deployment

- Netlify manual deployment: upload the Netlify Deploy ZIP directly in Deploys > Drag and drop.
- Git deployment: use the source ZIP, run `npm install` and `npm run build`, and publish `dist`.
