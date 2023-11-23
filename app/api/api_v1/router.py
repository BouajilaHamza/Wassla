from app.api.api_v1.handlers import Dashboard
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.api_v1.handlers import *
# from app.services.course_service import *

router = APIRouter()

router.include_router(Dashboard.Dashboard_router, 
                      prefix="/Dashboard", tags=["Dashboard"])