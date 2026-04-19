from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "dev-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    DATABASE_URL: str = "sqlite+aiosqlite:///./skillforge.db"
    GITHUB_TOKEN: str = ""
    FRONTEND_URL: str = "http://localhost:3001"
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
