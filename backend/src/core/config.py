"""Application configuration management."""
import secrets
import os
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "用户体验拯救项目群管理系统"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # Token validity: 30 minutes (industry standard)

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    # Removed validation for Vercel compatibility

    @property
    def database_url_async(self) -> str:
        """
        Convert DATABASE_URL to async format for asyncpg.

        Railway provides DATABASE_URL in format: postgresql://...
        We need: postgresql+asyncpg://...
        """
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url

    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
        return origins


# Global settings instance
settings = Settings()


def generate_secret_key() -> str:
    """生成一个安全的随机 SECRET_KEY"""
    return secrets.token_urlsafe(32)
