from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PostCreate(BaseModel):
    content: str
    user_id: int
    created_at: Optional[datetime] = datetime.utcnow()
    post_id: Optional[int] = None


class PostUpdate(BaseModel):
    content: Optional[str] = None


class PostResponse(BaseModel):
    post_id: int
    content: str
    created_at: Optional[str] = None
    user_id: int
