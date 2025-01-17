from fastapi import APIRouter
from app.api.api_v1.handlers.authentication import auth_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
