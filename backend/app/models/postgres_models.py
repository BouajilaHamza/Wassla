from sqlmodel import SQLModel,Field
from typing import Optional
from pydantic import EmailStr

class User(SQLModel, table=True):
 
    id: Optional[int] = Field(default_factory=int,primary_key=True,index=True)
    username: str 
    email: EmailStr
    password: str
    full_name: Optional[str] = None