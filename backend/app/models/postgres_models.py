from sqlmodel import SQLModel,Field
from typing import Optional
from pydantic import EmailStr
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default_factory=int,primary_key=True,index=True)
    username: str 
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class Post(SQLModel, table=True):
    id: int = Field(primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    content: str
    created_at: datetime


class Comment(SQLModel, table=True):
    id: int = Field(primary_key=True)
    post_id: int = Field(foreign_key="post.id")
    user_id: int = Field(foreign_key="user.id")
    content: str
    created_at: datetime



class Like(SQLModel, table=True):
    id: int = Field(primary_key=True)
    post_id: int = Field(foreign_key="post.id")
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime