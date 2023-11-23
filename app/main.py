from app.api.api_v1.router import router
from app.core.config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware





app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json", host="coinmarketcap-service"
)




@app.on_event("startup")
async def app_init():
    """
        Initialize crucial application services
    """
    app.include_router(router, prefix=settings.API_V1_STR)