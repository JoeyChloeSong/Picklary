# PickleLevel upgrade notes

This upgraded version applies the requested product direction to the uploaded static site.

## What changed

1. **Rebranded to PickleLevel**
   - Site name, package metadata, admin labels, footer, config, and generated pages now use PickleLevel.
   - Canonical URL placeholder is set to `https://picklelevel.com`; change it in `data/site.config.js` if the final registered domain differs.

2. **Expanded DUPR pathway**
   - Added `/level/` plus level pages for `2.0`, `2.5`, `3.0`, `3.5`, `4.0`, `4.5`, and `5.0`.
   - Each level page includes focus areas, core skills, drills, recommended paddle profile, related reads, and a visual DUPR ladder.

3. **Image-assisted readability**
   - Added original SVG diagrams under `assets/img/`:
     - `court-zones.svg`
     - `skill-shot-map.svg`
     - `paddle-shapes.svg`
     - `dupr-ladder.svg`
     - `pro-profile.svg`
     - `highlight-battle.svg`
     - `paddle-ratings.svg`
   - Article pages now automatically receive a relevant visual by category.

4. **Top menu and left quick bar**
   - Top navigation now highlights: Levels, Paddles, Pro Players, Highlight Battle, DUPR, Guides.
   - A desktop left-side quick bar gives direct access to levels and major sections.

5. **Highlight Battle menu**
   - Added `/highlights/` with a static front-end upload form, level/skill tags, local leaderboard, and recommendation voting.
   - Current behavior stores demo submissions in the browser via `localStorage`; production still needs backend storage, login, vote protection, reporting, copyright consent, and moderation.

6. **World pro player profiles**
   - Added `/players/` plus individual player pages for major pros.
   - Profiles include style, skills, events, paddle/sponsor line, what to study, and live-source buttons for DUPR/rankings/news.

7. **Paddle ranking/finder menu**
   - Added `/paddles/` plus individual paddle detail pages.
   - Starter database includes 24 popular paddles across JOOLA, Selkirk, CRBN, Six Zero, Paddletek, Engage, Gearbox, Diadem, Vatic Pro, ProKennex, Franklin, HEAD, Volair, Bread & Butter, Friday, and ONIX.
   - Filters: brand, style, and level.

8. **Four core user experiences on the homepage**
   - Rules & Skills
   - Paddle information
   - Pro player information
   - Video/highlight sharing and feedback

## How to run

```bash
npm run build
npm start
```

The static output is generated in `/dist`.

## Important launch reminders

- Replace placeholder contact email, owner name/bio, and final domain in `data/site.config.js`.
- Add your real AdSense publisher ID only after you are ready to verify/apply.
- Do not place ads next to vote buttons, upload controls, or UI elements in a way that may encourage accidental clicks.
- Verify current paddle prices, approval status, DUPR ratings, rankings, results, and news before publishing pages as current/factual claims.
