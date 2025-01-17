from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from fastapi.security import OAuth2PasswordRequestForm

from backend.app.models.postgres_models import User
from backend.app.database.postgres_db import get_db
from backend.app.schemas.auth_schemas import UserSignup, Token
from backend.app.core.config import settings



auth_router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")




@auth_router.post("/signup")
async def signup(user: UserSignup, db: Session = Depends(get_db)):
    # Check if email or username already exists
    if db.query(User).filter((User.email == user.email) | (User.username == user.username)).first():
        raise HTTPException(status_code=400, detail="Email or username already in use")

    # Hash password
    hashed_password = pwd_context.hash(user.password)

    # Create new user
    new_user = User(username=user.username, email=user.email, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully", "id": new_user.id}



@auth_router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Fetch user by email
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Verify password
    if not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Generate JWT token
    token_data = {"sub": user.email}
    access_token = jwt.encode(token_data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return {"access_token": access_token, "token_type": "bearer"}



