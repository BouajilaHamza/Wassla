from neomodel import (
    DateTimeProperty,
    IntegerProperty,
    Relationship,
    RelationshipFrom,
    RelationshipTo,
    StringProperty,
    StructuredNode,
    UniqueIdProperty,
    config,
)
from neomodel.contrib.spatial_properties import PointProperty

from backend.app.core.config import settings

config.DATABASE_URL = settings.NEOMODEL_URL


class User(StructuredNode):
    user_id = UniqueIdProperty()
    username = StringProperty(unique_index=True, required=True)
    email = StringProperty(unique_index=True, required=True)
    posts = RelationshipTo("Post", "POSTS")
    likes = RelationshipTo("Post", "LIKES")
    follows = RelationshipTo("User", "FOLLOWS")


class Post(StructuredNode):
    post_id = UniqueIdProperty()
    content = StringProperty(required=True)
    bus_number = StringProperty()  # Bus number or route ID (optional)
    issue_type = StringProperty(required=True)  # Type of issue (Delay, Accident, etc.)
    delay_duration = IntegerProperty()  # Delay in minutes (optional)
    expected_arrival = DateTimeProperty()  # When the transport is expected (optional)
    severity_level = StringProperty(
        choices={
            "Low": "Low",
            "Medium": "Medium",
            "High": "High",
            "Critical": "Critical",
        }
    )  # Severity of the issue
    status = StringProperty(
        default="Open",
        choices={"Open": "Open", "In Progress": "In Progress", "Resolved": "Resolved"},
    )  # Current status of the post
    location = PointProperty(crs="wgs-84")  # Location of the issue
    created_at = DateTimeProperty(default_now=True)  # When the post was created

    # Relationships
    reported_by = Relationship("User", "REPORTED_BY")  # Who reported the issue
    user = RelationshipFrom("User", "POSTS")
    liked_by = RelationshipFrom("User", "LIKES")


class Comment(StructuredNode):
    comment_id = UniqueIdProperty()
    content = StringProperty(required=True)
    created_at = DateTimeProperty(default_now=True)
    user = RelationshipFrom("User", "COMMENTS_ON")
    post = RelationshipTo("Post", "COMMENTS_ON")
