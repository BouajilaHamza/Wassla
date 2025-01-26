from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# Define enums for issue types and severity levels
class IssueType(str, Enum):
    DELAY = "Delay"
    ACCIDENT = "Accident"
    BREAKDOWN = "Breakdown"
    ROUTE_CHANGE = "Route Change"

    def __str__(self):
        return self.value


class SeverityLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

    def __str__(self):
        return self.value


class IssueStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"

    def __str__(self):
        return self.value


class Location(BaseModel):
    latitude: float
    longitude: float


class PostCreate(BaseModel):
    user_id: int
    post_id: int
    content: str = Field(
        ..., max_length=500, description="Description or details of the issue."
    )
    bus_number: Optional[str] = Field(
        None, description="Bus or route number, if applicable."
    )
    issue_type: IssueType = Field(
        ..., description="Type of issue (e.g., Delay, Accident, etc.)."
    )
    location: Location = Field(
        ...,
        description="A dictionary representing the geospatial point with 'latitude' and 'longitude'.",
    )
    severity_level: Optional[SeverityLevel] = Field(
        "Medium", description="Severity of the issue (Low, Medium, High, Critical)."
    )
    delay_duration: Optional[int] = Field(
        None, description="Delay duration in minutes (if applicable)."
    )
    expected_arrival: Optional[datetime] = Field(
        None, description="Expected arrival time of the transport (if applicable)."
    )
    created_at: Optional[datetime] = Field(
        datetime.utcnow(), description="Time when the post was created."
    )
    status: IssueStatus = Field(
        "Open", description="Current status of the post (Open, In Progress, Resolved)."
    )

    @field_validator("issue_type")
    def validate_issue_type(cls, value):
        allowed_types = ["Delay", "Accident", "Breakdown", "Route Change"]
        if value not in allowed_types:
            raise ValueError(f"Issue type must be one of {allowed_types}")
        return value

    @field_validator("severity_level")
    def validate_severity_level(cls, value):
        allowed_levels = ["Low", "Medium", "High", "Critical"]
        if value not in allowed_levels:
            raise ValueError(f"Severity level must be one of {allowed_levels}")
        return value


class PostUpdate(BaseModel):
    content: Optional[str] = None


class PostResponse(BaseModel):
    post_id: int
    content: str
    created_at: Optional[str] = None
    user_id: int
