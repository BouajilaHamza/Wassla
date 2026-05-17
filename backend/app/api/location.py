from fastapi import APIRouter

router = APIRouter()

@router.post("/location")
async def post_location():
    # Placeholder for Task 4
    return {"status": "received"}
