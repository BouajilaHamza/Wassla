from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


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
    user_id: UUID
    content: str = Field(
        ..., max_length=500, description="Description or details of the issue."
    )
    bus_number: Optional[str] = Field(
        None, description="Bus or route number, if applicable."
    )
    issue_type: IssueType = Field(
        ..., description="Type of issue (e.g., Delay, Accident, etc.)."
    )
    location: Optional[Location] = Field(
        None,
        description="A dictionary representing the geospatial point with 'latitude' and 'longitude'.",
    )
    severity_level: SeverityLevel = Field(
        ..., description="Severity of the issue (Low, Medium, High, Critical)."
    )
    delay_duration: Optional[int] = Field(
        None, description="Delay duration in minutes (if applicable)."
    )
    expected_arrival: Optional[datetime] = Field(
        None, description="Expected arrival time of the transport (if applicable)."
    )
    created_at: Optional[datetime] = Field(
        None, description="Time when the post was created."
    )
    status: IssueStatus = Field(
        ..., description="Current status of the post (Open, In Progress, Resolved)."
    )


class PostUpdate(BaseModel):
    content: Optional[str] = None


class PostResponse(BaseModel):
    post_id: UUID
    content: str
    created_at: Optional[datetime] = None
    user_id: UUID
