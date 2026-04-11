from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )
    ENV: str = "development"
    DATABASE_URL: str
    CORS_ORIGINS: list[str] = []
    SECRET_KEY: str = "change-me"

@lru_cache
def get_settings() -> Settings:
    return Settings()