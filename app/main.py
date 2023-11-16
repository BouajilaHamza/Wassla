import fastapi
from app.core.config import settings

app = fastapi(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json", host="weatherforcast-service"
)