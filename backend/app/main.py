from fastapi import FastAPI
from app.api import location

app = FastAPI(title="Wassla API")

app.include_router(location.router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "ok"}
