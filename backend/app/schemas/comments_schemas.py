from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    comment_id: Optional[UUID] = None
    post_id: UUID
    user_id: UUID
    content: str = Field(..., max_length=500, description="Content of the comment.")
    created_at: Optional[datetime] = Field(
        None, description="Time when the comment was created."
    )


class CommentUpdate(BaseModel):
    content: Optional[str] = None


class CommentResponse(BaseModel):
    id: UUID
    post_id: UUID
    user_id: UUID
    content: str
    created_at: Optional[datetime] = None
