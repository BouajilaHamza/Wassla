from fastapi import HTTPException,APIRouter

from backend.app.database.neo4j_db import neo4j_service
from backend.app.schemas.posts_schemas import CreatePostRequest

posts_router= APIRouter()

@posts_router.post("/create/")
async def create_post(request: CreatePostRequest):
    query = """
    MERGE (u:User {id: $user_id})
    CREATE (p:Post {id: $post_id, content: $content, created_at: datetime()})
    MERGE (u)-[:CREATED]->(p)
    RETURN p
    """
    params = {
        "user_id": request.user_id,
        "post_id": request.post_id,
        "content": request.content,
    }
    result = neo4j_service.execute_query(query, params)
    if result:
        return {"message": "Post created successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to create post")
