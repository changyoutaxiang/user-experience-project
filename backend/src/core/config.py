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

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str, info) -> str:
        """验证 SECRET_KEY 的安全性"""
        # 如果是生产环境，SECRET_KEY 必须足够长且不是默认值
        environment = info.data.get("ENVIRONMENT", "development")

        if environment == "production":
            if len(v) < 32:
                raise ValueError(
                    "生产环境的 SECRET_KEY 必须至少 32 个字符长。"
                    f"使用 secrets.token_urlsafe(32) 生成一个安全的密钥。"
                )
            if v in ["your-secret-key-change-in-production", "dev-secret-key", "test"]:
                raise ValueError(
                    "生产环境禁止使用默认或测试 SECRET_KEY！"
                    "请设置一个安全的随机密钥。"
                )

        return v

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

        # 生产环境不允许使用 localhost
        if self.ENVIRONMENT == "production":
            localhost_origins = [o for o in origins if "localhost" in o or "127.0.0.1" in o]
            if localhost_origins:
                raise ValueError(
                    f"生产环境不允许使用 localhost CORS 源: {localhost_origins}"
                )

        return origins


# Global settings instance
settings = Settings()


def generate_secret_key() -> str:
    """生成一个安全的随机 SECRET_KEY"""
    return secrets.token_urlsafe(32)
