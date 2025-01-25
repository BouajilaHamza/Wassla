from neomodel import StructuredNode, StringProperty, IntegerProperty, DateTimeProperty, RelationshipTo, RelationshipFrom

class User(StructuredNode):
    id = IntegerProperty(unique_index=True, required=True)
    username = StringProperty(unique_index=True, required=True)
    email = StringProperty(unique_index=True, required=True)
    posts = RelationshipTo("Post", "POSTS")
    likes = RelationshipTo("Post", "LIKES")
    follows = RelationshipTo("User", "FOLLOWS")

class Post(StructuredNode):
    id = IntegerProperty(unique_index=True, required=True)
    content = StringProperty(required=True)
    created_at = DateTimeProperty()
    user = RelationshipFrom("User", "POSTS")
    liked_by = RelationshipFrom("User", "LIKES")

class Comment(StructuredNode):
    id = IntegerProperty(unique_index=True, required=True)
    content = StringProperty(required=True)
    created_at = DateTimeProperty()
    user = RelationshipFrom("User", "COMMENTS_ON")
    post = RelationshipTo("Post", "COMMENTS_ON")
