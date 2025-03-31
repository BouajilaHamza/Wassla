# from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlmodel import SQLModel

from backend.app.api.api_v1.router import router
from backend.app.core.config import settings
from backend.app.database.postgres_db import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Initialize crucial application services
    """
    # Startup code
    app.include_router(router, prefix=settings.API_V1_STR)
    SQLModel.metadata.create_all(engine)
    yield
    # Shutdown code (if any)


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    host="coinmarketcap-service",
    lifespan=lifespan,
)
