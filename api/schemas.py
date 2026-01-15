from pydantic import BaseModel, Field
from typing import Optional, Literal


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    thread_id: Optional[str] = "default"


class ChatResponse(BaseModel):
    reply: str
    response_time_ms: int
    context_used: bool
    tool_calls: list[str]
    error_occurred: bool
    error_type: Optional[str] = None


class FeedbackRequest(BaseModel):
    message_id: str
    thread_id: Optional[str] = None
    feedback: Optional[Literal['up', 'down']] = None
    message_content: str
    session_id: Optional[str] = None
    response_time_ms: Optional[int] = None
    context_used: Optional[bool] = None
    tool_calls: Optional[list[str]] = None
    error_occurred: bool = False
    error_type: Optional[str] = None