import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from agent.chat_agent import chat, delete_thread, store_feedback
from .schemas import ChatRequest, ChatResponse, FeedbackRequest, CreateChatRequest, MessageRequest
from .db_service import ChatDBService

app = FastAPI(title="ChatGPT Clone API")

allowed_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest):
    try:
        result = chat(payload.message, thread_id=payload.thread_id)
        if result["error_occurred"]:
            raise HTTPException(status_code=500, detail=result["error_type"])
        return ChatResponse(**result)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.delete("/chat/{thread_id}")
def delete_chat_endpoint(thread_id: str):
    try:
        delete_thread(thread_id)
        return {"status": "deleted", "thread_id": thread_id}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/feedback")
def feedback_endpoint(payload: FeedbackRequest):
    try:
        store_feedback(
            message_id=payload.message_id,
            thread_id=payload.thread_id,
            feedback=payload.feedback,
            message_content=payload.message_content,
            session_id=payload.session_id,
            response_time_ms=payload.response_time_ms,
            context_used=payload.context_used,
            tool_calls=payload.tool_calls,
            error_occurred=payload.error_occurred,
            error_type=payload.error_type,
        )
        return {"status": "ok", "feedback": payload.feedback}
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/chats")
def get_chats():
    try:
        return ChatDBService.get_chats()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/chats/{chat_id}")
def get_chat(chat_id: str):
    try:
        chat_data = ChatDBService.get_chat_with_messages(chat_id)
        if not chat_data:
            raise HTTPException(status_code=404, detail="Chat not found")
        return chat_data
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/chats")
def create_chat(payload: CreateChatRequest):
    try:
        ChatDBService.create_chat(payload.chat_id, payload.title)
        return {"status": "ok", "chat_id": payload.chat_id}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.delete("/chats/{chat_id}")
def delete_chat_db(chat_id: str):
    try:
        ChatDBService.delete_chat(chat_id)
        delete_thread(chat_id)
        return {"status": "deleted", "chat_id": chat_id}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/messages")
def save_message(payload: MessageRequest):
    try:
        ChatDBService.save_message(
            message_id=payload.message_id,
            chat_id=payload.chat_id,
            role=payload.role,
            content=payload.content,
            response_time_ms=payload.response_time_ms,
            context_used=payload.context_used,
            tool_calls=payload.tool_calls,
            error_occurred=payload.error_occurred,
            error_type=payload.error_type,
        )
        return {"status": "ok"}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
