from decimal import Decimal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_DEV_JWT_SECRET = "dev-only-change-me-with-at-least-32-bytes"


class Settings(BaseSettings):
    app_name: str = "AutoInvest"
    environment: str = "development"
    debug: bool = False
    database_url: str = "sqlite:///./autoinvest.db"
    redis_url: str = "redis://localhost:6379/0"
    api_prefix: str = "/api/v1"
    cors_origins: list[str] = ["http://localhost:3000"]

    jwt_secret_key: str = DEFAULT_DEV_JWT_SECRET
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    demo_user_email: str = "demo@autoinvest.local"
    demo_user_password: str = "demo1234"
    initial_cash_balance: Decimal = Decimal("10000.00")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @model_validator(mode="after")
    def validate_production_secrets(self) -> Settings:
        if self.environment not in {"development", "test"} and (
            self.jwt_secret_key == DEFAULT_DEV_JWT_SECRET
        ):
            raise ValueError("JWT_SECRET_KEY must be set when ENVIRONMENT is not development")
        return self


settings = Settings()
