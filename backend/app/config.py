"""Central configuration.

Every setting the app needs lives here, loaded from environment variables
(or a local .env file). No other module reads os.environ directly.

Why this matters:
  * One place to see everything the app depends on.
  * Settings are validated at startup. A missing key fails immediately with a
    clear message, instead of crashing mid-request in front of a judge.
  * Secrets use SecretStr, so printing or logging the settings object shows
    '**********' instead of leaking the key.
"""

from functools import lru_cache

from pydantic import SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Read from backend/.env when running from the backend/ folder.
    # `extra="ignore"` lets the .env hold variables this class doesn't declare.
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Qloo ---
    # No default: the app must refuse to start without a key (fail fast).
    qloo_api_key: SecretStr
    qloo_base_url: str = "https://hackathon.api.qloo.com"

    # --- LLM (Groq), used from Stage 3 ---
    groq_api_key: SecretStr | None = None
    groq_fast_model: str = "llama-3.3-70b-versatile"
    groq_writer_model: str = "llama-3.3-70b-versatile"

    # --- Redis ---
    # None means "use the in-memory cache", which is fine for local work.
    redis_url: str | None = None

    # --- Budgets and limits: protect the shared Qloo quota ---
    max_qloo_calls_per_run: int = 40
    qloo_rate_limit_per_second: float = 5.0
    cache_ttl_seconds: int = 86_400  # 24 hours
    http_timeout_seconds: float = 20.0

    @field_validator("redis_url", mode="before")
    @classmethod
    def empty_string_means_none(cls, value: str | None) -> str | None:
        """`REDIS_URL=` in a .env file arrives as '' rather than missing."""
        return value or None


@lru_cache
def get_settings() -> Settings:
    """Return the one shared Settings object.

    lru_cache makes this a cheap singleton: the .env file is parsed once, and
    every caller gets the same object. In tests we can call
    get_settings.cache_clear() to rebuild it with different env vars.
    """
    return Settings()  # type: ignore[call-arg]  # values come from the environment
