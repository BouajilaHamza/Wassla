from pydantic_settings import BaseSettings
from decouple import config


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "LAinerBotAPI"

    DATABASE_URL: str = config("DATABASE_URL", cast=str)
    MONGO_DB_NAME: str = config("MONGO_DB_NAME", cast=str)

   


    class Config:
        case_sensitive = True


settings = Settings()
