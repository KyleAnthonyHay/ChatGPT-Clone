import os
from dotenv import load_dotenv
import traceback

load_dotenv()

CHROMA_API_KEY = os.getenv("CHROMA_API_KEY")
CHROMA_TENANT = os.getenv("CHROMA_TENANT")
CHROMA_DATABASE = os.getenv("CHROMA_DATABASE")

if not all([CHROMA_API_KEY, CHROMA_TENANT, CHROMA_DATABASE]):
    missing = [name for name, value in [
        ("CHROMA_API_KEY", CHROMA_API_KEY),
        ("CHROMA_TENANT", CHROMA_TENANT),
        ("CHROMA_DATABASE", CHROMA_DATABASE)
    ] if not value]
    print(f"Error: Missing environment variables: {', '.join(missing)}")
    exit(1)

try:
    import chromadb
    
    client = chromadb.CloudClient(
        tenant=CHROMA_TENANT,
        database=CHROMA_DATABASE,
        api_key=CHROMA_API_KEY,
    )
    
    collection = client.get_or_create_collection(
        name="richmond_policies",
        metadata={"description": "Richmond University policies chunked documents"}
    )
    
except Exception as e:
    print(f"Error during initialization: {e}")
    print(f"Error type: {type(e).__name__}")
    traceback.print_exc()
    raise

if __name__ == "__main__":
    print("ChromaDB client initialized successfully!")
    print(f"Tenant: {CHROMA_TENANT}")
    print(f"Database: {CHROMA_DATABASE}")
    print(f"Collection: {collection.name}")
    print(f"Collection count: {collection.count()}")