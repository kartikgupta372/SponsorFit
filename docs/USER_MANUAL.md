# SponsorFit user manual

Two parts: how to run it on your computer, and how to use the app.

## Part 1. Run it locally

### There is no separate backend
SponsorFit is one Next.js app in `frontend/`. The "backend" is the API routes in
`frontend/src/app/api/` and the agent in `frontend/src/lib/server/`. They start together with
the frontend, so there is only one command to run. The `backend/` folder holds early Python
experiments and is not needed.

### What you need
- Node.js 20 or newer (`node -v`)
- A Supabase project (free)
- A Groq API key (free) from console.groq.com
- A Qloo API key from the hackathon. Without it the app runs on a clearly labeled sample graph.

### Steps
1. **Database.** In Supabase, open SQL Editor and run every file in `supabase/migrations/` in
   name order. Each file is safe to run once; the last one adds table descriptions.
2. **Auth settings.** Authentication, then Sign In / Providers: turn on *Allow anonymous
   sign-ins* (one-click demo) and turn off *Confirm email* (instant sign-up).
3. **Keys.** In `frontend/`, copy `.env.example` to `.env.local` and fill it in:

   | Variable | Where to find it |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase, Project Settings, API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page (publishable or anon key) |
   | `QLOO_API_KEY` | Hackathon developer guide |
   | `QLOO_BASE_URL` | `https://hackathon.api.qloo.com` unless the guide says otherwise |
   | `GROQ_API_KEY` | console.groq.com, API Keys |
   | `GROQ_MODEL` | `llama-3.3-70b-versatile` |

   Never commit `.env.local`. It is already in `.gitignore`.
4. **Install and start.**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open http://localhost:3000. On Windows PowerShell the same commands work.
5. **Check it.** Press *Try the demo*, search "Radiolab", run an analysis. You should see the
   seven agent steps stream and a ranked brand list.

### Useful commands
| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (run before deploying) |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint the code |

### Editing data in Supabase
Open Table Editor in Supabase. Every table and column has a description. Useful edits:
- `deals`: fix a stage or amount.
- `profiles`: change `safety` or `existing_sponsors`.
- `analyses`: delete a run (its matches go with it).
Row Level Security keeps each user's rows private, but the dashboard uses an admin role and
sees everything.

### Troubleshooting
| Symptom | Fix |
|---|---|
| "Sample data" banner | `QLOO_API_KEY` is empty or wrong. Set it and restart. |
| Demo button says the demo is switched off | Turn on anonymous sign-ins in Supabase. |
| Pitches look generic | `GROQ_API_KEY` is missing, so the template is used. |
| 401 or redirect loop on `/app` | Supabase URL or key is wrong. Check `.env.local`. |
| Changes to `.env.local` ignored | Stop and restart `npm run dev`. |

### Deploy to Vercel
Import the repo at vercel.com/new, set Root Directory to `frontend`, add the same variables,
deploy. Redeploy after changing any variable.

## Part 2. Using the app

SponsorFit finds brands your audience already loves, proves it with data, and writes the pitch.
Follow the steps in order the first time. The same guide is inside the app under **How to use**.

1. **Settings.** Choose categories to avoid and list your current sponsors.
2. **New analysis.** Search your show. If it is small and not in Qloo, add up to five similar
   shows. Enter your average audience (used for pricing only).
3. **Watch the run.** The agent resolves your show, profiles the audience, finds brands,
   scores them, checks safety and writes the reasons. Each Qloo call is shown.
4. **Audience DNA.** Read who listens: tastes, ages, locations, episode ideas.
5. **Sponsors.** Brands ranked by Fit Score. Open one to see the score breakdown, evidence,
   audience comparison and a rate range per episode. Use the *Without vs With Qloo* panel to
   see what Qloo added.
6. **Pitches.** Pick a tone (Professional, Casual, Bold). You get an email, two follow-ups and an
   ad read. Edit freely, then copy.
7. **Media kits.** Publish a public one-page kit and send the link.
8. **Pipeline.** Mark as pitched, then drag the card through Replied, Negotiating, Won or Lost.

### Reading the Fit Score
Fit = 45% audience affinity + 25% age match + 20% shared tastes + 10% novelty. Above 80 is a
strong fit, 60 to 80 is worth a pitch, below 60 needs a reason. Hidden gems are high fit but
less famous brands, so they are likelier to reply.

### Good to know
- Pitch numbers come only from your analysis; invented figures are rejected.
- Rates are a guide based on typical CPM, not a quote.
- Free accounts run up to 15 analyses a day.
- *Delete my data* in Settings removes everything you created.
