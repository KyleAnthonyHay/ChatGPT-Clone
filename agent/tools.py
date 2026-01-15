from langchain_core.tools import tool
from .chroma_setup import collection


@tool
def search_policies(query: str) -> str:
    """
    Search across all policies using semantic similarity.
    Given a topic or question, return the most relevant policy excerpts
    with their titles and relevance scores.
    Use this when the specific policy is not known.

    Args:
        query: The topic or question to search for in the policy database.

    Returns:
        A formatted string containing the top matching policy excerpts,
        their titles, and relevance scores.
    """
    try:
        results = collection.query(
            query_texts=[query],
            n_results=5,
            include=["documents", "metadatas", "distances"]
        )

        if not results or not results["documents"] or not results["documents"][0]:
            return "No relevant policies found for your query."

        output_parts = []
        for i, (doc, meta, distance) in enumerate(
            zip(
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0]
            ),
            start=1
        ):
            relevance_score = round(1 - distance, 3)
            policy_name = meta.get("policy_name", "Unknown Policy")
            source = meta.get("source", "Unknown Source")

            output_parts.append(
                f"**Result {i}**\n"
                f"Policy: {policy_name}\n"
                f"Source: {source}\n"
                f"Relevance: {relevance_score}\n"
                f"Excerpt:\n{doc[:500]}{'...' if len(doc) > 500 else ''}\n"
            )
        print("search_policies: Tool Used")
        return "\n---\n".join(output_parts)

    except Exception as e:
        return f"Error searching policies: {e}"
