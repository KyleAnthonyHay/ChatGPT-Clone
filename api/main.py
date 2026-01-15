from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from agent.chat_agent import chat, delete_thread, store_feedback
from .schemas import ChatRequest, ChatResponse, FeedbackRequest

app = FastAPI(title="ChatGPT Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
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
