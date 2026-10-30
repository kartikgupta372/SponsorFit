# SponsorFit: Devpost submission text

## Tagline
An AI sponsorship agent that finds the brands your podcast or YouTube audience already loves, proves it with Qloo taste data, and writes the pitch.

## What it does
Sponsorship is how most creators get paid, but mid-size creators pitch blind. They chase the same famous brands everyone pitches, with no proof their audience fits.

SponsorFit is an agent that turns Qloo's taste graph into a sponsorship pipeline:

1. **Search your show** (or add 1 to 5 "shows like mine" if you're too small to be in the graph).
2. **Watch the agent work.** It resolves your audience in Qloo, reads their taste tags, demographics and US heatmap, collects the brands they over-index on, and profiles each brand's own audience. Every Qloo call streams to the screen live.
3. **Get a ranked shortlist** with a transparent Fit Score:
   `Fit = 45% affinity + 25% demographic match + 20% taste overlap + 10% novelty`,
   with filters for category, Qloo popularity, hidden gems, a competitor guard and brand safety.
4. **Open a brand** to see the evidence: score breakdown, both audiences' age profiles, shared tastes and a rate advisor.
5. **Draft the pitch** in Casual, Professional or Bold tone, with two follow-ups and a host-read ad script.
6. **Publish a media kit**: a public, brand-facing page with the data built in, exportable to PDF, with a view counter.
7. **Track the deal** on a Pitched, Replied, Negotiating, Won, Lost pipeline.

## What makes it Qloo-powered
Every number in SponsorFit comes from Qloo. The audience profile comes from `urn:tag`, `urn:demographics` and `urn:heatmap` insights. The candidate brands come from `urn:entity:brand` insights on the audience signal. The demographic match compares the audience's and each brand's `urn:demographics`. Novelty is Qloo popularity. Remove Qloo and the app has no shortlist, no score, no evidence and no kit.

To make the point visible, every shortlist shows a **"Without vs. With Qloo"** panel. On the left is what an LLM guesses with no data (VPNs, meal kits, mattresses). On the right are the specific brands this audience measurably over-indexes on.

## How we built it
- **Agent:** a fixed seven-step pipeline (Resolve, Profile, Discover, Enrich, Score, Critic, Generate) in TypeScript route handlers. Progress streams to the browser as NDJSON.
- **Deterministic scoring:** the Fit Score is plain maths over Qloo data, not an LLM opinion, so it is reproducible and explainable.
- **LLM for judgment only:** Groq (Llama 3.3 70B, JSON mode) classifies categories, flags brand-safety issues and competitors of current sponsors, and writes reasons and pitches. A guardrail rejects any LLM output containing a number we didn't provide and falls back to a data-built template. A keyword safety net still runs if the LLM is unavailable.
- **Production basics:** Supabase Postgres with Row Level Security on every table, Supabase Auth (email plus a one-click demo workspace), retries and backoff for Qloo, a response cache, a 40-call budget per run, a daily run limit, and a run lock against double starts.
- **Frontend:** Next.js 15, React 19 and Tailwind, with hand-drawn SVG charts (no chart library) and a custom palette of eggplant, violet, orchid and signal orange. Deployed on Vercel.

## Challenges
- Smaller shows are often missing from the taste graph, so we added "shows like mine": any podcasts, artists, films or books can stand in as the audience signal.
- Keeping the LLM honest. Pitches quote real numbers, so we validate every figure against the facts we passed in.

## What's next
Gmail sending and reply tracking, YouTube and Spotify audience imports, brand-side discovery (brands finding creators), and benchmark CPMs by category.

## Built with
Qloo Insights API, Next.js, React, TypeScript, Tailwind CSS, Supabase (Postgres, Auth, RLS), Groq, Llama 3.3, Vercel
