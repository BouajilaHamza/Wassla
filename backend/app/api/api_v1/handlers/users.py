from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select

from backend.app.database.postgres_db import engine
from backend.app.models.postgres_models import User
from backend.app.schemas.user_schemas import UserCreate, UserResponse

users_router = APIRouter()


@users_router.get("/get/{user_id}/", response_model=UserResponse)
async def get_user(user_id: UUID):
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user


@users_router.get("/list/", response_model=List[UserResponse])
async def list_users():
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        return users


@users_router.put("/update/{user_id}/", response_model=UserResponse)
async def update_user(user_id: UUID, user_update: UserCreate):
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user_data = user_update.dict(exclude_unset=True)
        for key, value in user_data.items():
            setattr(user, key, value)

        session.add(user)
        session.commit()
        session.refresh(user)
        return user


@users_router.delete("/delete/{user_id}/", status_code=204)
async def delete_user(user_id: UUID):
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        session.delete(user)
        session.commit()
        return {"message": "User deleted successfully"}
