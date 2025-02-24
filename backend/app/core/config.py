from pydantic_settings import BaseSettings
from decouple import config


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Wassla"
   
    SECRET_KEY: str = config("SECRET_KEY",cast=str)
    ALGORITHM : str = config("ALGORITHM",cast=str)
    
    NEO4J_URI: str = config("NEO4J_URI",cast=str)
    NEO4J_USERNAME: str = config("NEO4J_USERNAME",cast=str)
    NEO4J_PASSWORD: str = config("NEO4J_PASSWORD",cast=str)
    AURA_INSTANCEID: str = config("AURA_INSTANCEID",cast=str)
    AURA_INSTANCENAME:str = config("AURA_INSTANCENAME",cast=str)

    DATABASE_URL: str = config("DATABASE_URL", cast=str)

    
    class Config:
        case_sensitive = True


settings = Settings()
