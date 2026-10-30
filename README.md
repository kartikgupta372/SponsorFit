# SponsorFit

**An AI sponsorship agent for creators.** Enter your podcast or YouTube channel; SponsorFit uses
Qloo's taste graph to find the brands your audience already loves, proves it with data, and drafts
the pitch that lands the deal.

> Built for the Qloo Agentic Hackathon ("Agents, but with taste").

## Why Qloo is essential

An LLM alone can only list famous brands that sponsor everyone. Qloo knows which brands a specific
audience *over-indexes* on, across music, film, dining, travel and more, plus the audience's
demographics and where they live. SponsorFit turns that into a ranked, explainable sponsor shortlist.

## Status

Work in progress. See `docs/LEARNING.md` for the build log.

## Project layout

```
backend/    FastAPI + LangGraph agent + Qloo client + scoring
frontend/   Next.js app
docs/       Architecture notes and learning log
```

## Run the backend locally

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy ..\.env.example .env      # then edit .env and add your keys
```

## License

MIT, see `LICENSE`.
