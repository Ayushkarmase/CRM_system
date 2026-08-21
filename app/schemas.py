from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator, field_serializer


class NoteBase(BaseModel):
    note_text: str = Field(..., min_length=1, description="Internal note text")

    @field_validator("note_text")
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Note text cannot be empty or blank")
        return v.strip()


class NoteCreate(NoteBase):
    pass


class NoteResponse(NoteBase):
    id: int
    ticket_id: int
    created_at: datetime

    @field_serializer("created_at")
    def serialize_datetime(self, dt: datetime) -> str:
        if dt and dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat() if dt else ""

    model_config = ConfigDict(from_attributes=True)


class TicketCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=255)
    customer_email: EmailStr
    subject: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    priority: Optional[str] = Field(default="Medium", description="Priority level: Low, Medium, High, Urgent")

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> str:
        valid_priorities = {"Low", "Medium", "High", "Urgent"}
        if v and v.title() in valid_priorities:
            return v.title()
        return "Medium"

    @field_validator("customer_name", "subject", "description")
    @classmethod
    def validate_non_empty_strings(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be empty or blank")
        return v.strip()


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        valid_statuses = {"Open", "In Progress", "Closed"}
        matched = [s for s in valid_statuses if s.lower() == v.lower().strip()]
        if matched:
            return matched[0]
        raise ValueError(f"Invalid status '{v}'. Allowed values: Open, In Progress, Closed")

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        valid_priorities = {"Low", "Medium", "High", "Urgent"}
        matched = [p for p in valid_priorities if p.lower() == v.lower().strip()]
        if matched:
            return matched[0]
        raise ValueError(f"Invalid priority '{v}'. Allowed values: Low, Medium, High, Urgent")


class TicketResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime

    @field_serializer("created_at", "updated_at", check_fields=False)
    def serialize_datetime(self, dt: datetime) -> str:
        if dt and dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat() if dt else ""

    model_config = ConfigDict(from_attributes=True)


class TicketDetailResponse(TicketResponse):
    notes: List[NoteResponse] = []

    model_config = ConfigDict(from_attributes=True)


class TicketUpdateResponse(BaseModel):
    success: bool = True
    ticket_id: str
    status: str
    priority: str
    updated_at: datetime

    @field_serializer("updated_at", check_fields=False)
    def serialize_datetime(self, dt: datetime) -> str:
        if dt and dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat() if dt else ""


class StatsResponse(BaseModel):
    total: int
    open: int
    in_progress: int
    closed: int


# AI Assistant Schemas
class AIQuestionRequest(BaseModel):
    question: str = Field(..., min_length=1, description="Question asked to DeskFlow AI Assistant")


class AIAnswerResponse(BaseModel):
    answer: str
    suggested_topics: List[str] = []
