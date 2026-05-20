from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LocationCreate(BaseModel):
    user_id: str
    lat: float
    lng: float
    speed: float
    heading: float
    timestamp: datetime
    battery_level: Optional[float] = None
