from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AutoInvest"
    environment: str = "development"
    debug: bool = False
    database_url: str = "sqlite:///./autoinvest.db"
    redis_url: str = "redis://localhost:6379/0"
    api_prefix: str = "/api/v1"
    cors_origins: list[str] = ["http://localhost:3000"]
    demo_user_email: str = "demo@autoinvest.local"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
