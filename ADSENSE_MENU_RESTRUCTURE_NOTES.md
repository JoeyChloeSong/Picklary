# PickleLevel AdSense-friendly menu restructure

This version keeps the private automation tooling in the source project, but removes automation/agent wording from the public Update Center pages.

## Public menu changes

- Added top-level `Tournaments` / `대회정보` menu.
- Moved world tournament schedules, results, and Korean tournament notes out of the public Update Center.
- Added public pages:
  - `/tournaments/`
  - `/tournaments/world/`
  - `/tournaments/results/`
  - `/tournaments/korea/`
- Moved paddle launch/review update notes into the existing Paddles section:
  - `/paddles/updates/`
- The public Update Center now focuses on:
  - news
  - rules and paddle legality
  - rankings

## AdSense readiness changes

- Removed public phrases such as automation workflow, agent, OpenAI API, review draft, and monitored draft from Update Center HTML.
- Kept public wording focused on editor-checked source links and user-facing information.
- Stopped generating these old public routes:
  - `/updates/tournaments/`
  - `/updates/results/`
  - `/updates/domestic/`
  - `/updates/paddles/`
- Updated sitemap and internal links to the new structure.
- Kept automation files available in the source package for future maintenance, but they are not copied into `dist`.

## Build check

Run:

```powershell
npm run build
```

Then deploy only the `dist` folder.
