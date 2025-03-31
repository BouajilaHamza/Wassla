from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException

from backend.app.models.neo4j_models import Like, Post, User
from backend.app.schemas.likes_schemas import LikeCreate, LikeResponse, LikeUpdate

likes_router = APIRouter()


@likes_router.post("/create/", response_model=LikeResponse)
async def create_like(like_create: LikeCreate):
    user = User.nodes.get_or_none(user_id=like_create.user_id)
    post = Post.nodes.get_or_none(post_id=like_create.post_id)
    if not user or not post:
        raise HTTPException(status_code=404, detail="User or Post not found")

    new_like = Like(
        like_id=like_create.like_id,
        created_at=like_create.created_at,
    )
    new_like.save()
    new_like.user.connect(user)
    new_like.post.connect(post)

    return {
        "id": new_like.like_id,
        "post_id": post.post_id,
        "user_id": user.user_id,
        "created_at": new_like.created_at.isoformat() if new_like.created_at else None,
    }


@likes_router.get("/get/{like_id}/", response_model=LikeResponse)
async def get_like(like_id: UUID):
    like = Like.nodes.get_or_none(like_id=like_id)
    if not like:
        raise HTTPException(status_code=404, detail="Like not found")

    user = like.user.single()
    post = like.post.single()
    return {
        "id": like.like_id,
        "post_id": post.post_id if post else None,
        "user_id": user.user_id if user else None,
        "created_at": like.created_at.isoformat() if like.created_at else None,
    }


@likes_router.get("/list/", response_model=List[LikeResponse])
async def list_likes():
    likes = Like.nodes.all()
    return [
        {
            "id": like.like_id,
            "post_id": like.post.single().post_id if like.post else None,
            "user_id": like.user.single().user_id if like.user else None,
            "created_at": like.created_at.isoformat() if like.created_at else None,
        }
        for like in likes
    ]


@likes_router.put("/update/{like_id}/", response_model=LikeResponse)
async def update_like(like_id: UUID, like_update: LikeUpdate):
    like = Like.nodes.get_or_none(like_id=like_id)
    if not like:
        raise HTTPException(status_code=404, detail="Like not found")

    user = like.user.single()
    post = like.post.single()
    return {
        "id": like.like_id,
        "post_id": post.post_id if post else None,
        "user_id": user.user_id if user else None,
        "created_at": like.created_at.isoformat() if like.created_at else None,
    }


@likes_router.delete("/delete/{like_id}/", status_code=204)
async def delete_like(like_id: UUID):
    like = Like.nodes.get_or_none(like_id=like_id)
    if not like:
        raise HTTPException(status_code=404, detail="Like not found")

    like.delete()
    return {"message": "Like deleted successfully"}
