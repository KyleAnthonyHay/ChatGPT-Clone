from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from agent.chat_agent import chat, delete_thread
from .schemas import ChatRequest, ChatResponse

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
        answer = chat(payload.message, thread_id=payload.thread_id)
        return ChatResponse(reply=answer)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.delete("/chat/{thread_id}")
def delete_chat_endpoint(thread_id: str):
    try:
        delete_thread(thread_id)
        return {"status": "deleted", "thread_id": thread_id}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
