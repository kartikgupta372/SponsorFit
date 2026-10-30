# SponsorFit

**An AI sponsorship agent for podcasters and YouTubers, powered by Qloo's taste graph.**

Search your show. SponsorFit reads your audience through Qloo, ranks the brands they already love with
an explainable Fit Score, writes the pitch email, and publishes a data-backed media kit you can send to
the brand.

> Built for the Qloo Agentic Hackathon, "Agents, but with taste".

- **Live demo:** _add your Vercel URL here_ (press **Try the demo**, no account needed)
- **License:** MIT

---

## Why it needs Qloo

Ask a plain LLM who should sponsor a podcast and you get the same famous names every creator gets: VPNs,
meal kits, mattresses. It has no idea what *your* audience actually likes.

Qloo does. Given your show (or a few shows like it), Qloo returns the brands your audience
**over-indexes on**, the taste tags they share across music, film, food and travel, their
age and gender profile, and where in the country they concentrate. SponsorFit is built on those
numbers. Without Qloo there is no shortlist, no score, no evidence and no media kit, so the app would not
work at all. The app even shows the difference: every shortlist puts the LLM's no-data guesses next to
the Qloo-backed results.

## What the agent does

A fixed seven-step pipeline. Every Qloo call is streamed to the screen as it happens.

| Step | What happens | Qloo call |
| --- | --- | --- |
| 1. Resolve | Uses your show's Qloo entity plus any "shows like mine" as the audience signal | `/search` |
| 2. Profile | Reads the audience's taste tags, demographics and US heatmap | `/v2/insights` with `filter.type=urn:tag`, `urn:demographics`, `urn:heatmap` |
| 3. Discover | Collects the brands this audience over-indexes on | `/v2/insights` with `filter.type=urn:entity:brand` |
| 4. Enrich | Profiles each brand's own audience | `/v2/insights` with `filter.type=urn:demographics` |
| 5. Score | Computes the Fit Score with plain maths (no AI) | none |
| 6. Critic | An LLM (Groq, Llama 3.3 70B) flags brand-safety issues and competitors and writes short reasons | none |
| 7. Generate | Saves the shortlist. Pitches and kits are written on demand. | none |

A run makes 5 to 15 Qloo calls, with a hard cap of 40.

### The Fit Score

```
Fit = 100 x (0.45 x Affinity + 0.25 x Demographics + 0.20 x Taste overlap + 0.10 x Novelty)
```

- **Affinity**: Qloo's affinity of the brand for your audience, rescaled across the candidates.
- **Demographics**: cosine similarity between your audience's and the brand audience's Qloo age indexes.
- **Taste overlap**: share of the brand's Qloo tags that appear in your audience's top taste tags.
- **Novelty**: 1 minus Qloo popularity, so less crowded brands get some credit. These become "hidden gems".

The score is deterministic and lives in [`frontend/src/lib/scoring.ts`](frontend/src/lib/scoring.ts).

### No made-up numbers

The LLM only judges and writes. Every number it could use is passed in, and
[`onlyAllowedNumbers`](frontend/src/lib/server/groq.ts) rejects any output containing a figure it was not
given. A rejected draft falls back to a template built from the same data.

## Features

- **Live agent run**: watch every step and every Qloo call stream in, with call count, latency and cache hits
- **Audience DNA**: age and gender indexes, a taste map by domain, a US heatmap, themes, a shareable card and AI episode ideas
- **Sponsor shortlist**: filters for category, Qloo popularity (niche, rising, mainstream), hidden gems, a competitor guard and brand safety, plus a "Without vs. With Qloo" comparison
- **Brand deep dive**: score breakdown, evidence, both audiences' age profiles, brand tags with shared tastes highlighted, and a rate advisor
- **Pitch studio**: Casual, Professional or Bold tone; editable draft; two timed follow-ups; a 20-second host-read ad script; the evidence list; copy, open in your email app, save
- **Public media kit**: one page per brand at `/kit/<slug>`, readable without login, with export to PDF and a view counter
- **Deal pipeline**: Pitched, Replied, Negotiating, Won and Lost stages, with deal value and notes
- **Settings**: current sponsors (feed the competitor guard), brand-safety switches, delete-my-data
- **Auth**: email and password, password reset, and a one-click demo workspace

## Architecture

```
Browser (Next.js 15, React 19, Tailwind)
   |  NDJSON stream of agent events
   v
Next.js route handlers on Vercel  ----->  Qloo Insights API  (X-Api-Key, server only)
   |   /api/analyses/[id]/run     ----->  Groq (Llama 3.3 70B, JSON mode)
   |   /api/pitch, /api/kits, /api/qloo/search
   v
Supabase: Postgres with Row Level Security, plus Auth
```

- **One deployable**: site, API and agent are one Next.js app on Vercel.
- **Security**: API keys never reach the browser. Every table uses RLS, so a user can only read their own rows. Public kits are frozen snapshots, readable by link.
- **Resilience**: retries with backoff on 429 and 5xx, a 6-hour in-memory response cache, a per-run call budget, a daily analysis limit per user, and a run lock so two tabs can't start the same run.
- **Fallback**: if `QLOO_API_KEY` is missing, a small labelled sample graph keeps the app usable. Runs record their data source and the UI shows it.

Schema: [`supabase/migrations`](supabase/migrations).

## Run it locally

Requirements: Node 20 or later, a Supabase project, a Qloo API key and a Groq API key.

```bash
# 1. Database: run supabase/migrations/*.sql in the Supabase SQL editor
# 2. App
cd frontend
cp .env.example .env.local   # fill in the values
npm install
npm run dev                  # http://localhost:3000
```

In Supabase, under Authentication and then Sign In / Providers, turn on **anonymous sign-ins** for the
one-click demo, and optionally turn off **Confirm email**.

## Deploy

Import the repo into Vercel, set the **Root Directory** to `frontend`, add the variables from
`frontend/.env.example`, and deploy.

## Repo layout

```
frontend/              Next.js app: UI, API route handlers, agent
  src/lib/server/      agent.ts, qloo.ts, groq.ts, pitch.ts (server only)
  src/lib/scoring.ts   the Fit Score
supabase/migrations/   database schema and RLS policies
backend/               early Python exploration scripts for the Qloo API (spike)
docs/                  learning notes
```

## License

MIT. See [LICENSE](LICENSE).
