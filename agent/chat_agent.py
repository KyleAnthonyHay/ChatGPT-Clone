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

def chat(user_input: str, thread_id: str = "default") -> str:
    context = get_relevant_context(user_input)
    
    if context:
        enriched_input = f"Context from knowledge base:\n{context}\n\nUser Question:\n{user_input}"
    else:
        enriched_input = user_input
        
    config = {"configurable": {"thread_id": thread_id}}
    result = agent.invoke(
        {"messages": [("user", enriched_input)]},
        config
    )
    return result["messages"][-1].content


def delete_thread(thread_id: str) -> None:
    """Delete all checkpoints for a given thread_id from the database."""
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM checkpoints WHERE thread_id = %s", (thread_id,))
            cur.execute("DELETE FROM checkpoint_writes WHERE thread_id = %s", (thread_id,))
            cur.execute("DELETE FROM checkpoint_blobs WHERE thread_id = %s", (thread_id,))
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
        
        response = chat(user_input, thread_id)
        print(f"AI: {response}\n")
