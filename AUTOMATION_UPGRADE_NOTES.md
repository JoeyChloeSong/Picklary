# PickleLevel automation upgrade notes

This version adds an AdSense-safe automation layer for ongoing site management.

## Added public pages

- `/ko/updates/` and `/en/updates/` — update center landing page
- `/ko/updates/news/` — news monitor
- `/ko/updates/tournaments/` — global tournament schedules and entry notes
- `/ko/updates/results/` — match results and standings updates
- `/ko/updates/domestic/` — Korea tournament and federation updates
- `/ko/updates/paddles/` — new paddle launches, market reaction, reviewer scores
- `/ko/updates/rules/` — rules, approval, paddle ban/decertification watch
- `/ko/updates/rankings/` — DUPR/ranking changes

English equivalents are generated under `/en/`.

## Added automation files

- `automation/picklelevel-agent.js`
- `automation/sources.json`
- `automation/reviewer-score-template.csv`
- `automation/README_AGENT.md`
- `.env.example`
- `.github/workflows/picklelevel-agent.yml`
- `data/auto-updates.js`
- `data/agent/drafts/`
- `data/agent/approved/`
- `data/agent/archive/`

## New npm scripts

```text
npm run agent:status
npm run agent:scan
npm run agent:scan:dry
npm run agent:publish
npm run agent:review
```

## Operating model

The agent is deliberately review-first:

1. Scan official/permitted sources.
2. Detect source changes by hash.
3. Create review drafts in `data/agent/drafts/`.
4. Editor verifies facts, source, copyright, and policy risk.
5. Approved drafts move to `data/agent/approved/`.
6. `npm run agent:publish` writes approved items into `data/auto-updates.js`.
7. `npm run build` regenerates static pages.

This avoids automatically publishing unverified scores, schedule changes, paddle bans, or rule updates.

## OpenAI API use

If `OPENAI_API_KEY` is set, `automation/picklelevel-agent.js` calls the OpenAI Responses API to create a Korean editorial JSON draft. Without an API key, it still creates a conservative fallback draft requiring manual writing.

Do not commit real API keys. Use `.env` locally or GitHub repository secrets in Actions.

## GitHub Actions

The included workflow runs twice daily and opens a pull request with any generated drafts. The PR should be reviewed before merging.

## AdSense-safe defaults

- No unverified source text is republished.
- Long copied passages are avoided.
- Rule/paddle-ban updates are treated as high-risk and require manual approval.
- Commercial brand pages and review sources are disabled by default unless permission/noise level is reviewed.
- The update center is content-rich but review-driven rather than fully auto-generated.
