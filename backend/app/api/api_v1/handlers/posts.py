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



@posts_router.get("/get/{user_id}/")
async def get_user_posts(user_id: str):
    query = """ MATCH (p:Post)<-[:CREATED]-(u:User {id: $user_id}) 
                RETURN p.content,p.created_at,p.id
                """
    params = {"user_id": user_id}
    users = neo4j_service.driver.session().run(query,params)
    if users:
        return users.to_df().to_dict(orient="records")
    else:
        raise HTTPException(status_code=404, detail="User not found")
