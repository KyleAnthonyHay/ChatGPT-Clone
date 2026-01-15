import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
os.environ["LANGSMITH_PROJECT"] = os.getenv("LANGSMITH_PROJECT", "chatgpt-clone")
os.environ["LANGSMITH_TRACING"] = os.getenv("LANGSMITH_TRACING", "false")

SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")

from .chroma_setup import collection
from .tools import search_policies

from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.postgres import PostgresSaver
from psycopg_pool import ConnectionPool
import psycopg

with psycopg.connect(SUPABASE_DB_URL, autocommit=True) as setup_conn:
    PostgresSaver(setup_conn).setup()
    setup_conn.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id SERIAL PRIMARY KEY,
            message_id TEXT NOT NULL UNIQUE,
            thread_id TEXT,
            feedback TEXT,
            message_content TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    setup_conn.execute("ALTER TABLE feedback ADD COLUMN IF NOT EXISTS session_id TEXT")
    setup_conn.execute("ALTER TABLE feedback ADD COLUMN IF NOT EXISTS response_time_ms INTEGER")
    setup_conn.execute("ALTER TABLE feedback ADD COLUMN IF NOT EXISTS context_used BOOLEAN")
    setup_conn.execute("ALTER TABLE feedback DROP COLUMN IF EXISTS tool_calls")
    setup_conn.execute("ALTER TABLE feedback ADD COLUMN IF NOT EXISTS tool_calls TEXT")
    setup_conn.execute("ALTER TABLE feedback ADD COLUMN IF NOT EXISTS error_occurred BOOLEAN DEFAULT FALSE")
    setup_conn.execute("ALTER TABLE feedback ADD COLUMN IF NOT EXISTS error_type TEXT")
    setup_conn.execute("""
        DO $$ BEGIN
            ALTER TABLE feedback ADD CONSTRAINT feedback_message_id_key UNIQUE (message_id);
        EXCEPTION WHEN duplicate_table THEN NULL;
        END $$;
    """)

pool = ConnectionPool(conninfo=SUPABASE_DB_URL, max_size=5)
checkpointer = PostgresSaver(pool)

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

SYSTEM_PROMPT = """You are an institutional policy specialist. 
Always rely on the context supplied from the Chroma knowledge base to answer user questions. 
When the context is relevant, quote or paraphrase it precisely and mention the policy title or section. 
If the context is insufficient or missing, say so and suggest what additional information is needed—do not guess. 
Keep answers concise, professional, and focused on the user's question about university policies.
Remember previous messages in our conversation and refer back to them when relevant."""

agent = create_react_agent(
    model=llm,
    tools=[search_policies],
    checkpointer=checkpointer,
    prompt=SystemMessage(content=SYSTEM_PROMPT),
)

def get_relevant_context(query: str) -> str:
    """Retrieve top 3 relevant chunks from ChromaDB"""
    try:
        results = collection.query(
            query_texts=[query],
            n_results=3
        )
        if results and results["documents"]:
            return "\n\n".join(results["documents"][0])
        return ""
    except Exception as e:
        print(f"Error retrieving context: {e}")
        return ""

def chat(user_input: str, thread_id: str = "default") -> dict:
    import time
    start_time = time.time()
    
    error_occurred = False
    error_type = None
    tool_calls = []
    
    try:
        context = get_relevant_context(user_input)
        context_used = bool(context)
        
        if context:
            enriched_input = f"Context from knowledge base:\n{context}\n\nUser Question:\n{user_input}"
        else:
            enriched_input = user_input
            
        config = {"configurable": {"thread_id": thread_id}}
        result = agent.invoke(
            {"messages": [("user", enriched_input)]},
            config
        )
        
        for msg in result["messages"]:
            if hasattr(msg, 'tool_calls') and msg.tool_calls:
                tool_calls.extend([tc['name'] for tc in msg.tool_calls])
        
        response_time_ms = int((time.time() - start_time) * 1000)
        
        return {
            "reply": result["messages"][-1].content,
            "response_time_ms": response_time_ms,
            "context_used": context_used,
            "tool_calls": tool_calls,
            "error_occurred": False,
            "error_type": None,
        }
    except Exception as e:
        response_time_ms = int((time.time() - start_time) * 1000)
        return {
            "reply": "",
            "response_time_ms": response_time_ms,
            "context_used": False,
            "tool_calls": tool_calls,
            "error_occurred": True,
            "error_type": type(e).__name__,
        }


def delete_thread(thread_id: str) -> None:
    """Delete all checkpoints for a given thread_id from the database."""
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM checkpoints WHERE thread_id = %s", (thread_id,))
            cur.execute("DELETE FROM checkpoint_writes WHERE thread_id = %s", (thread_id,))
            cur.execute("DELETE FROM checkpoint_blobs WHERE thread_id = %s", (thread_id,))
        conn.commit()


def store_feedback(
    message_id: str,
    thread_id: str | None,
    feedback: str | None,
    message_content: str,
    session_id: str | None = None,
    response_time_ms: int | None = None,
    context_used: bool | None = None,
    tool_calls: list[str] | None = None,
    error_occurred: bool = False,
    error_type: str | None = None,
) -> None:
    """Store user feedback with response metadata in Supabase."""
    tool_calls_str = ",".join(tool_calls) if tool_calls else None
    
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO feedback (
                    message_id, thread_id, feedback, message_content,
                    session_id, response_time_ms, context_used, tool_calls,
                    error_occurred, error_type
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (message_id) DO UPDATE SET
                    feedback = EXCLUDED.feedback,
                    thread_id = EXCLUDED.thread_id
            """, (
                message_id, thread_id, feedback, message_content,
                session_id, response_time_ms, context_used, tool_calls_str,
                error_occurred, error_type
            ))
        conn.commit()

if __name__ == "__main__":
    print("ChatGPT Clone - Type 'quit' to exit\n")
    thread_id = "session_1"
    
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() == "quit":
            print("Goodbye!")
            break
        if not user_input:
            continue
        
        result = chat(user_input, thread_id)
        print(f"AI: {result['reply']}\n")
