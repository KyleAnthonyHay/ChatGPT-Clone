import os
from typing import Optional, List
from psycopg_pool import ConnectionPool
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent.parent / "agent" / ".env")

SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")
pool = ConnectionPool(conninfo=SUPABASE_DB_URL, max_size=5)


class ChatDBService:
    @staticmethod
    def create_chat(chat_id: str, title: str) -> None:
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO chats (id, title, created_at, updated_at)
                    VALUES (%s, %s, NOW(), NOW())
                    ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        updated_at = NOW()
                """, (chat_id, title))
            conn.commit()

    @staticmethod
    def save_message(
        message_id: str,
        chat_id: str,
        role: str,
        content: str,
        response_time_ms: Optional[int] = None,
        context_used: Optional[bool] = None,
        tool_calls: Optional[List[str]] = None,
        error_occurred: bool = False,
        error_type: Optional[str] = None
    ) -> None:
        tool_calls_str = ",".join(tool_calls) if tool_calls else None
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO messages (
                        id, chat_id, role, content, response_time_ms,
                        context_used, tool_calls, error_occurred, error_type
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        content = EXCLUDED.content,
                        response_time_ms = EXCLUDED.response_time_ms,
                        context_used = EXCLUDED.context_used,
                        tool_calls = EXCLUDED.tool_calls,
                        error_occurred = EXCLUDED.error_occurred,
                        error_type = EXCLUDED.error_type
                """, (
                    message_id, chat_id, role, content, response_time_ms,
                    context_used, tool_calls_str, error_occurred, error_type
                ))
            conn.commit()

    @staticmethod
    def get_chats() -> List[dict]:
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, title, created_at, updated_at
                    FROM chats
                    ORDER BY updated_at DESC
                """)
                chats = []
                for row in cur.fetchall():
                    chat_id = row[0]
                    cur.execute("""
                        SELECT id, role, content, response_time_ms, context_used,
                               tool_calls, error_occurred, error_type, created_at
                        FROM messages
                        WHERE chat_id = %s
                        ORDER BY created_at ASC
                    """, (chat_id,))
                    
                    messages = []
                    for msg_row in cur.fetchall():
                        tool_calls = msg_row[5].split(",") if msg_row[5] else []
                        messages.append({
                            "id": msg_row[0],
                            "role": msg_row[1],
                            "content": msg_row[2],
                            "metadata": {
                                "response_time_ms": msg_row[3],
                                "context_used": msg_row[4],
                                "tool_calls": tool_calls if tool_calls else None,
                                "error_occurred": msg_row[6],
                                "error_type": msg_row[7],
                            },
                        })
                    
                    chats.append({
                        "id": chat_id,
                        "title": row[1],
                        "created_at": row[2].isoformat() if row[2] else None,
                        "updated_at": row[3].isoformat() if row[3] else None,
                        "messages": messages,
                    })
                return chats

    @staticmethod
    def get_chat_with_messages(chat_id: str) -> Optional[dict]:
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, title, created_at, updated_at
                    FROM chats WHERE id = %s
                """, (chat_id,))
                chat_row = cur.fetchone()
                if not chat_row:
                    return None

                cur.execute("""
                    SELECT id, role, content, response_time_ms, context_used,
                           tool_calls, error_occurred, error_type, created_at
                    FROM messages
                    WHERE chat_id = %s
                    ORDER BY created_at ASC
                """, (chat_id,))

                messages = []
                for row in cur.fetchall():
                    tool_calls = row[5].split(",") if row[5] else []
                    messages.append({
                        "id": row[0],
                        "role": row[1],
                        "content": row[2],
                        "metadata": {
                            "response_time_ms": row[3],
                            "context_used": row[4],
                            "tool_calls": tool_calls if tool_calls else None,
                            "error_occurred": row[6],
                            "error_type": row[7],
                        },
                        "created_at": row[8].isoformat() if row[8] else None,
                    })

                return {
                    "id": chat_row[0],
                    "title": chat_row[1],
                    "created_at": chat_row[2].isoformat() if chat_row[2] else None,
                    "updated_at": chat_row[3].isoformat() if chat_row[3] else None,
                    "messages": messages,
                }

    @staticmethod
    def update_chat_title(chat_id: str, title: str) -> None:
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE chats SET title = %s, updated_at = NOW() WHERE id = %s
                """, (title, chat_id))
            conn.commit()

    @staticmethod
    def delete_chat(chat_id: str) -> None:
        with pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM chats WHERE id = %s", (chat_id,))
            conn.commit()
