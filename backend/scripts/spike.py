"""Data spike: poke the real Qloo API and save what comes back.

This is an exploration tool, not production code. Its job is to answer, with
evidence, questions we would otherwise guess at:
  * What does an entity search return for a podcast? For a YouTube channel?
  * Which entity types does the API accept?
  * What do brand / demographics / tag insights look like for a given show?

Run from the backend/ folder (so .env is found):

    python -m scripts.spike search "Huberman Lab"
    python -m scripts.spike search "MrBeast" --types urn:entity:person
    python -m scripts.spike insights --type urn:entity:brand --entity <ENTITY_ID>
    python -m scripts.spike raw /v2/insights -p filter.type=urn:entity:brand -p take=5

Every response is printed (trimmed) AND saved in full to backend/.cache/spike/,
so we can build the typed models in Stage 1 from real samples.

NOTE: the endpoint paths and parameter names below follow Qloo's public docs as
I know them. Confirm them against the hackathon developer guide; if a call
returns 404 or 400, the printed body usually says what to fix.
"""

import argparse
import asyncio
import json
import re
import time
from pathlib import Path

import httpx

from app.config import get_settings

CACHE_DIR = Path(".cache") / "spike"
PRINT_LIMIT = 3000  # characters shown on screen; the full body goes to disk


def _slug(text: str) -> str:
    return re.sub(r"[^a-zA-Z0-9]+", "_", text).strip("_").lower()[:80]


async def call(path: str, params: dict[str, str]) -> None:
    settings = get_settings()
    url = settings.qloo_base_url.rstrip("/") + path
    headers = {"X-Api-Key": settings.qloo_api_key.get_secret_value()}

    started = time.perf_counter()
    async with httpx.AsyncClient(timeout=settings.http_timeout_seconds) as client:
        response = await client.get(url, params=params, headers=headers)
    elapsed_ms = (time.perf_counter() - started) * 1000

    print(f"GET {response.request.url}")
    print(f"-> {response.status_code} in {elapsed_ms:.0f} ms")

    try:
        body = response.json()
        pretty = json.dumps(body, indent=2, ensure_ascii=False)
    except ValueError:
        pretty = response.text

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    name = _slug(path + "_" + "_".join(f"{k}={v}" for k, v in params.items()))
    out_file = CACHE_DIR / f"{int(time.time())}_{name}.json"
    out_file.write_text(pretty, encoding="utf-8")

    print(pretty[:PRINT_LIMIT])
    if len(pretty) > PRINT_LIMIT:
        print(f"... trimmed. Full response saved to {out_file}")
    else:
        print(f"(saved to {out_file})")


def parse_params(pairs: list[str]) -> dict[str, str]:
    params: dict[str, str] = {}
    for pair in pairs:
        key, _, value = pair.partition("=")
        params[key] = value
    return params


def main() -> None:
    parser = argparse.ArgumentParser(description="Explore the Qloo API")
    sub = parser.add_subparsers(dest="command", required=True)

    s = sub.add_parser("search", help="entity search by name")
    s.add_argument("query")
    s.add_argument("--types", help="e.g. urn:entity:podcast")
    s.add_argument("--limit", default="5")

    i = sub.add_parser("insights", help="insights for an entity signal")
    i.add_argument("--type", required=True, help="e.g. urn:entity:brand")
    i.add_argument("--entity", required=True, help="entity id used as the signal")
    i.add_argument("--take", default="10")

    r = sub.add_parser("raw", help="any GET path with -p key=value params")
    r.add_argument("path")
    r.add_argument("-p", "--param", action="append", default=[])

    args = parser.parse_args()

    if args.command == "search":
        params = {"query": args.query, "take": args.limit}
        if args.types:
            params["types"] = args.types
        asyncio.run(call("/search", params))
    elif args.command == "insights":
        params = {
            "filter.type": args.type,
            "signal.interests.entities": args.entity,
            "take": args.take,
        }
        asyncio.run(call("/v2/insights", params))
    else:
        asyncio.run(call(args.path, parse_params(args.param)))


if __name__ == "__main__":
    main()
