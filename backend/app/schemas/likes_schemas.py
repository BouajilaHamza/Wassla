from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class LikeCreate(BaseModel):
    like_id: Optional[UUID] = None
    post_id: UUID
    user_id: UUID
    created_at: Optional[datetime] = Field(
        None, description="Time when the like was created."
    )


class LikeUpdate(BaseModel):
    pass


class LikeResponse(BaseModel):
    id: UUID
    post_id: UUID
    user_id: UUID
    created_at: Optional[datetime] = None
