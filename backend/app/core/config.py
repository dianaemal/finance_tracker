from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings:

    #APP Settings
    APP_NAME: str = "Personal Finance Tracker App"
    DEBUG : bool = True

    # Detabase
    DETABASE_URL: str 

    #Security
    SECRET_KEY : str
    ALGORITHM : str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 1
    # when deploting, add the production url
    BACKEND_CORS_ORIGIN : List[str] = [ "http://localhost:5173"]

    # read environment variables from .env file
    model_config = SettingsConfigDict(env_file=".env")

# read from .env only once and prevents recreating config after every request
@lru_cache
def get_settings():
    return Settings()

settings = get_settings()

