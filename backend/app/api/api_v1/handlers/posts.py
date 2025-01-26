from typing import List, Optional

from fastapi import APIRouter, HTTPException
from neomodel.contrib.spatial_properties import NeomodelPoint
from shapely.geometry import Point

from backend.app.models.neo4j_models import Post, User
from backend.app.schemas.posts_schemas import PostCreate, PostResponse, PostUpdate

posts_router = APIRouter()


@posts_router.post("/create/", response_model=PostResponse)
async def create_post(post: PostCreate):
    user = User.nodes.get_or_none(user_id=post.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    location = (
        NeomodelPoint(
            Point(post.location.longitude, post.location.latitude), crs="wgs-84"
        )
        if post.location
        else None
    )

    new_post = Post(
        post_id=post.post_id,
        content=post.content,
        bus_number=post.bus_number,
        issue_type=str(post.issue_type.value),
        delay_duration=post.delay_duration,
        expected_arrival=post.expected_arrival,
        severity_level=str(post.severity_level.value),
        status=str(post.status.value),
        location=location,
        created_at=post.created_at,
    )
    new_post.save()
    user.posts.connect(new_post)

    return {
        "post_id": new_post.post_id,
        "content": new_post.content,
        "created_at": new_post.created_at.isoformat() if new_post.created_at else None,
        "user_id": post.user_id,
    }


@posts_router.get("/get/{post_id}/", response_model=PostResponse)
async def get_post(post_id: int):
    post = Post.nodes.get_or_none(post_id=post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    user = post.user.single()
    return {
        "post_id": post.post_id,
        "content": post.content,
        "created_at": post.created_at.isoformat() if post.created_at else None,
        "user_id": user.user_id if user else None,
    }


@posts_router.get("/get/{user_id}", response_model=List[PostResponse])
async def list_posts(user_id: Optional[int] = None):
    if user_id:
        user = User.nodes.get_or_none(user_id=user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        posts = user.posts.all()
    else:
        posts = Post.nodes.all()

    return [
        {
            "post_id": post.post_id,
            "content": post.content,
            "created_at": post.created_at.isoformat() if post.created_at else None,
            "user_id": post.user.single().user_id if post.user else None,
        }
        for post in posts
    ]


@posts_router.put("/update/{post_id}/", response_model=PostResponse)
async def update_post(post_id: int, post_update: PostUpdate):
    post = Post.nodes.get_or_none(post_id=post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post_update.content is not None:
        post.content = post_update.content
        post.save()

    user = post.user.single()
    return {
        "post_id": post.post_id,
        "content": post.content,
        "created_at": post.created_at.isoformat() if post.created_at else None,
        "user_id": user.user_id if user else None,
    }


@posts_router.delete("/delete/{post_id}/", status_code=204)
async def delete_post(post_id: int):
    post = Post.nodes.get_or_none(post_id=post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.delete()
    return {"message": "Post deleted successfully"}


@posts_router.get("/feed/", response_model=List[PostResponse])
async def get_feed():
    feed = Post.nodes.all()
    return [
        {
            "post_id": post.post_id,
            "content": post.content,
            "created_at": post.created_at.isoformat() if post.created_at else None,
            "user_id": post.user.single().user_id if post.user else None,
        }
        for post in feed
    ]
