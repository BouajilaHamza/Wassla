from neomodel import (
    DateTimeProperty,
    IntegerProperty,
    RelationshipFrom,
    RelationshipTo,
    StringProperty,
    StructuredNode,
    config,
)

from backend.app.core.config import settings

config.DATABASE_URL = settings.NEOMODEL_URL


class User(StructuredNode):
    user_id = IntegerProperty(unique_index=True, required=True)
    username = StringProperty(unique_index=True, required=True)
    email = StringProperty(unique_index=True, required=True)
    posts = RelationshipTo("Post", "POSTS")
    likes = RelationshipTo("Post", "LIKES")
    follows = RelationshipTo("User", "FOLLOWS")


class Post(StructuredNode):
    post_id = IntegerProperty(unique_index=True, required=True)
    content = StringProperty(required=True)
    created_at = DateTimeProperty()
    user = RelationshipFrom("User", "POSTS")
    liked_by = RelationshipFrom("User", "LIKES")


class Comment(StructuredNode):
    comment_id = IntegerProperty(unique_index=True, required=True)
    content = StringProperty(required=True)
    created_at = DateTimeProperty()
    user = RelationshipFrom("User", "COMMENTS_ON")
    post = RelationshipTo("Post", "COMMENTS_ON")
