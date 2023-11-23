from pydantic_settings import BaseSettings
from decouple import config


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "CoinMarketCap"
   
    class Config:
        case_sensitive = True


settings = Settings()
