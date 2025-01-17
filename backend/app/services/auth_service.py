from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.exceptions import HTTPException
from jose import jwt
from jose.exceptions import JWTError
from backend.app.core.config import settings 




oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
