from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException

from backend.app.models.neo4j_models import Comment, Post, User
from backend.app.schemas.comments_schemas import (
    CommentCreate,
    CommentResponse,
    CommentUpdate,
)

comments_router = APIRouter()


@comments_router.post("/create/", response_model=CommentResponse)
async def create_comment(comment_create: CommentCreate):
    user = User.nodes.get_or_none(user_id=comment_create.user_id)
    post = Post.nodes.get_or_none(post_id=comment_create.post_id)
    if not user or not post:
        raise HTTPException(status_code=404, detail="User or Post not found")

    new_comment = Comment(
        comment_id=comment_create.comment_id,
        content=comment_create.content,
        created_at=comment_create.created_at,
    )
    new_comment.save()
    new_comment.user.connect(user)
    new_comment.post.connect(post)

    return {
        "id": new_comment.comment_id,
        "post_id": post.post_id,
        "user_id": user.user_id,
        "content": new_comment.content,
        "created_at": new_comment.created_at.isoformat()
        if new_comment.created_at
        else None,
    }


@comments_router.get("/get/{comment_id}/", response_model=CommentResponse)
async def get_comment(comment_id: UUID):
    comment = Comment.nodes.get_or_none(comment_id=comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    user = comment.user.single()
    post = comment.post.single()
    return {
        "id": comment.comment_id,
        "post_id": post.post_id if post else None,
        "user_id": user.user_id if user else None,
        "content": comment.content,
        "created_at": comment.created_at.isoformat() if comment.created_at else None,
    }


@comments_router.get("/list/", response_model=List[CommentResponse])
async def list_comments():
    comments = Comment.nodes.all()
    return [
        {
            "id": comment.comment_id,
            "post_id": comment.post.single().post_id if comment.post else None,
            "user_id": comment.user.single().user_id if comment.user else None,
            "content": comment.content,
            "created_at": comment.created_at.isoformat()
            if comment.created_at
            else None,
        }
        for comment in comments
    ]


@comments_router.put("/update/{comment_id}/", response_model=CommentResponse)
async def update_comment(comment_id: UUID, comment_update: CommentUpdate):
    comment = Comment.nodes.get_or_none(comment_id=comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment_update.content is not None:
        comment.content = comment_update.content
        comment.save()

    user = comment.user.single()
    post = comment.post.single()
    return {
        "id": comment.comment_id,
        "post_id": post.post_id if post else None,
        "user_id": user.user_id if user else None,
        "content": comment.content,
        "created_at": comment.created_at.isoformat() if comment.created_at else None,
    }


@comments_router.delete("/delete/{comment_id}/", status_code=204)
async def delete_comment(comment_id: UUID):
    comment = Comment.nodes.get_or_none(comment_id=comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    comment.delete()
    return {"message": "Comment deleted successfully"}


# from fastapi import APIRouter, HTTPException
# from sqlmodel import Session, select

# from backend.app.database.postgres_db import engine
# from backend.app.models.postgres_models import Comment
# from backend.app.schemas.comments_schemas import CommentCreate, CommentResponse, CommentUpdate

# comments_router = APIRouter()

# @comments_router.post("/create/", response_model=CommentResponse)
# async def create_comment(comment_create: CommentCreate):
#     with Session(engine) as session:
#         new_comment = Comment.from_orm(comment_create)
#         session.add(new_comment)
#         session.commit()
#         session.refresh(new_comment)
#         return new_comment

# @comments_router.get("/get/{comment_id}/", response_model=CommentResponse)
# async def get_comment(comment_id: UUID):
#     with Session(engine) as session:
#         comment = session.get(Comment, comment_id)
#         if not comment:
#             raise HTTPException(status_code=404, detail="Comment not found")
#         return comment

# @comments_router.get("/list/", response_model=List[CommentResponse])
# async def list_comments():
#     with Session(engine) as session:
#         comments = session.exec(select(Comment)).all()
#         return comments

# @comments_router.put("/update/{comment_id}/", response_model=CommentResponse)
# async def update_comment(comment_id: UUID, comment_update: CommentUpdate):
#     with Session(engine) as session:
#         comment = session.get(Comment, comment_id)
#         if not comment:
#             raise HTTPException(status_code=404, detail="Comment not found")

#         comment_data = comment_update.dict(exclude_unset=True)
#         for key, value in comment_data.items():
#             setattr(comment, key, value)

#         session.add(comment)
#         session.commit()
#         session.refresh(comment)
#         return comment

# @comments_router.delete("/delete/{comment_id}/", status_code=204)
# async def delete_comment(comment_id: UUID):
#     with Session(engine) as session:
#         comment = session.get(Comment, comment_id)
#         if not comment:
#             raise HTTPException(status_code=404, detail="Comment not found")

#         session.delete(comment)
#         session.commit()
#         return {"message": "Comment deleted successfully"}
