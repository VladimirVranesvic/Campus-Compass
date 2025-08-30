# Campus Compass

Student-focused agent that turns Australian government data into a personalised 4‑week action plan for deadlines, benefits, transport and housing.

## Quickstart
```bash
# 1) Unzip this starter, then run:
bash scripts/bootstrap.sh

# 2) Start dev server
cd app && pnpm dev    # or: npm run dev
```

## What this starter gives you
- `scripts/bootstrap.sh` scaffolds a Next.js (TypeScript + Tailwind) app in `./app` and adds stub pages & API routes.
- `data/*.json` seed datasets used by API tool stubs (swap to live APIs later).
- `docs/` pitch + dataset checklist you can paste into GovHack.
- `.env.example` for local config.

## MVP Pages
- `/` landing
- `/onboarding` quiz
- `/plan` 4‑week plan
- `/commute` commute summary
- `/rent` rent medians
- `/benefits` benefits triage
- `/opal` concession helper
- `/help` HELP explainer
- `/accessibility` TTS & large-type toggle

## License
MIT — see `LICENSE`.
