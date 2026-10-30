# SponsorFit learning log

One entry per build step: what we built, why, and what to take away.

---

## Lesson 0: Project scaffold

**Files:** `.gitignore`, `LICENSE`, `.env.example`, `README.md`, `backend/requirements.txt`

**Concepts**

1. **Secrets never live in git.** `.gitignore` excludes `.env`; `.env.example` is the safe template
   that shows *which* variables exist without their values. Rule: if a key was ever committed,
   treat it as leaked and rotate it. Deleting the file later does not remove it from history.
2. **Why a LICENSE file matters here.** The hackathon requires an open-source license visible in
   the repo's About section. GitHub shows it automatically when a standard `LICENSE` file exists.
3. **Dependencies are chosen, not dumped.** We list only what Stage 1 needs and say why. Each later
   library (LangGraph, FastAPI, Redis) will arrive with the stage that needs it.

**Try it yourself:** open `.gitignore` and explain, in one sentence each, why `!.env.example`
appears after `.env.*`. (Hint: ignore rules are applied top to bottom and `!` re-includes a file.)

---

## Lesson 1: Configuration that fails fast

**File:** `backend/app/config.py`

**Concepts**

1. **Single source of configuration.** Only `config.py` reads environment variables. Everything
   else imports `get_settings()`. When something misbehaves, there is one place to look.
2. **Fail fast.** `qloo_api_key` has no default, so a missing key stops the app at startup with a
   clear error, not halfway through a live demo.
3. **`SecretStr`.** The key prints as `**********`; you must call `.get_secret_value()` to read
   it, which makes accidental logging unlikely.
4. **`lru_cache` as a singleton.** The `.env` file is parsed once. Tests can call
   `get_settings.cache_clear()` to rebuild with different values.
5. **Validators for messy real-world input.** `REDIS_URL=` in a `.env` arrives as an empty string;
   the validator turns it into `None` so the rest of the code can write `if settings.redis_url:`.

**Try it yourself:** run `python -c "from app.config import get_settings; print(get_settings())"`
once with a key set and once with the key removed. Compare the output and the error message.

---

## Lesson 2: Explore the API before modeling it (data spike)

**File:** `backend/scripts/spike.py`

**Concepts**

1. **Spike first.** We do not write typed models of an API we have not seen. A spike is a small,
   throwaway program whose output answers questions: does Qloo know small podcasts? YouTube
   channels? What does the demographic data look like?
2. **Save raw responses to disk.** Real samples become test fixtures and the basis for Pydantic
   models in Stage 1.
3. **Async HTTP with `httpx`.** `async with httpx.AsyncClient(...)` opens one connection pool and
   closes it cleanly. We will fire many such calls concurrently in the agent.
4. **Timing every call.** Latency decides how we design caching and parallelism, so we measure it
   from the first request.

**Try it yourself:** run the three spike commands from the file's docstring on a podcast you
listen to, and write down: which entity types came back, and what field holds the entity ID?

## Lesson 3: The frontend design system
- **Tokens first.** The palette (eggplant, violet, orchid, signal orange) lives in `tailwind.config.ts`, so every screen uses names like `bg-eggplant-900`, never raw hex codes.
- **One "do this" colour.** Signal orange is used only for primary actions, so the eye always knows where to click.
- **Charts without libraries.** The Fit ring, index bars and heatmap are hand-written SVG. Small bundle, full control.
- **Accessibility.** Visible labels, `role="radiogroup"`, `role="tab"` and `role="switch"`, focus rings, and reduced-motion support.

## Lesson 4: Auth and data with Supabase
- **Row Level Security (RLS)** is the real security boundary. Each table has `using (auth.uid() = user_id)`, so even if the browser asks for someone else's rows, Postgres refuses.
- **`@supabase/ssr`** keeps the session in cookies. `middleware.ts` refreshes it and protects `/app/*`.
- **Server components** load data (`src/lib/server/data.ts`). Client components only handle interaction.
- **A trigger** (`handle_new_user`) creates a profile row for every new user.

## Lesson 5: The agent
- **A pipeline, not a free-roaming agent.** Seven fixed steps make it fast, cheap and debuggable. The LLM is used only where judgment or writing is needed.
- **Streaming.** `/api/analyses/[id]/run` returns a `ReadableStream` of NDJSON events (`step`, `call`, `profile`, `match`, `done`). The browser reads it with `res.body.getReader()`.
- **Deterministic scoring** in `src/lib/scoring.ts`: the same inputs always give the same score.
- **Guardrails.** `onlyAllowedNumbers` rejects LLM text with invented statistics. Budgets cap Qloo calls. A run lock (`update ... where status = 'queued'`) makes starting a run idempotent.

## Lesson 6: Shipping
- One Next.js app on Vercel holds the UI, the API and the agent: one deploy, one URL.
- Secrets live only in Vercel environment variables. `NEXT_PUBLIC_*` values are safe to expose; the Qloo and Groq keys never are.
