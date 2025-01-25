from pydantic import BaseModel


class CreatePostRequest(BaseModel):
    user_id: str
    post_id: str
    content: str
