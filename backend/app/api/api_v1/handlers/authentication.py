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

auth_router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@auth_router.post("/signup", response_model=User)
async def signup(user: User, session: Session = Depends(get_session)):
    # Check if email or username already exists
    if session.exec(select(User).where(User.email == user.email)).first():
        raise HTTPException(status_code=400, detail="Email or username already in use")

    hashed_password = pwd_context.hash(user.password)
    # Create new user
    user.password = hashed_password
    session.add(user)
    session.commit()
    session.refresh(user)
    neo_user = NeoUser.nodes.get_or_none(user_id=user.id)
    if not neo_user:
        neo_user = NeoUser(user_id=user.id, username=user.username, email=user.email)
        neo_user.save()

    return {"message": "User created successfully", "id": user.id}


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
