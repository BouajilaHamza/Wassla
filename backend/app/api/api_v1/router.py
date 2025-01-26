from fastapi import APIRouter

from backend.app.api.api_v1.handlers.authentication import auth_router
from backend.app.api.api_v1.handlers.posts import posts_router
from backend.app.api.api_v1.handlers.users import users_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
router.include_router(users_router, prefix="/users", tags=["Users"])
router.include_router(posts_router, prefix="/posts", tags=["Posts"])
