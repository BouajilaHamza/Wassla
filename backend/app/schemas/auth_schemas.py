from pydantic import BaseModel,EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str


# Pydantic model for signup
class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str