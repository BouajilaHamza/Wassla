from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

from backend.app.core.config import settings
from backend.app.database.postgres_db import get_session
from backend.app.models.neo4j_models import User as NeoUser
from backend.app.models.postgres_models import User
from backend.app.schemas.auth_schemas import Token
from backend.app.schemas.user_schemas import UserCreate, UserResponse

auth_router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@auth_router.post("/signup", response_model=UserResponse)
async def signup(user_create: UserCreate, session: Session = Depends(get_session)):
    # Check if email or username already exists
    if session.exec(select(User).where(User.email == user_create.email)).first():
        raise HTTPException(status_code=400, detail="Email or username already in use")

    hashed_password = pwd_context.hash(user_create.password)
    # Create new user
    user_create.password = hashed_password
    user_create.id = uuid4()
    new_user = User.model_validate(user_create)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    neo_user = NeoUser.nodes.get_or_none(user_id=user_create.id)
    if not neo_user:
        neo_user = NeoUser(
            user_id=user_create.id,
            username=user_create.username,
            email=user_create.email,
        )
        neo_user.save()

    return new_user


@auth_router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    # Fetch user by email
    user = session.exec(select(User).where(User.username == form_data.username)).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Verify password
    if not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Generate JWT token
    token_data = {"sub": user.email}
    access_token = jwt.encode(
        token_data, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    return {"access_token": access_token, "token_type": "bearer"}
