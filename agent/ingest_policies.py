import os
from pathlib import Path
from .chroma_setup import client, collection

CHUNKS_DIR = Path("Richmond_Policies_Cleaned/chunked")
MAX_DOCUMENT_BYTES = 16000  # leave headroom under 16,384-byte Chroma limit

def ingest_policies():
    documents = []
    metadatas = []
    ids = []
    
    chunk_files = list(CHUNKS_DIR.glob("*.txt"))
    print(f"Found {len(chunk_files)} chunk files")
    
    for i, filepath in enumerate(chunk_files):
        content = filepath.read_text()
        
        # Skip documents that exceed Chroma's per-document size limit
        if len(content.encode("utf-8")) > MAX_DOCUMENT_BYTES:
            print(f"Skipping {filepath.name}: {len(content.encode('utf-8'))} bytes (exceeds {MAX_DOCUMENT_BYTES})")
            continue
        
        filename = filepath.stem
        
        # Extract policy name from filename (e.g., "ch1-academic_credit_policy-len477")
        parts = filename.split("-", 1)
        chunk_num = parts[0] if parts else f"ch{i}"
        policy_name = parts[1].rsplit("-len", 1)[0] if len(parts) > 1 else filename
        
        documents.append(content)
        metadatas.append({
            "source": filepath.name,
            "policy_name": policy_name.replace("_", " "),
            "chunk": chunk_num,
        })
        ids.append(f"{filename}_{i}")
    
    # Add in batches (ChromaDB has limits)
    batch_size = 100
    for i in range(0, len(documents), batch_size):
        batch_end = min(i + batch_size, len(documents))
        collection.upsert(
            documents=documents[i:batch_end],
            metadatas=metadatas[i:batch_end],
            ids=ids[i:batch_end],
        )
        print(f"Added batch {i//batch_size + 1}: {i} to {batch_end}")
    
    print(f"Ingestion complete! Total documents: {collection.count()}")

if __name__ == "__main__":
    ingest_policies()