import logging
from typing import Dict, Any
from agents.vector_search import search_policy

logger = logging.getLogger(__name__)

def search_policy_db(query: str) -> str:
    logger.info("Searching policy database with query: %s", query)

    results = search_policy(query)

    if not results:
        return "No relevant policy sections found."

    return "\n\n".join(results)

def searcher_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Retrieval Agent Node that searches the policy database."""
    query = state.get("query", "")
    try:
        policy_context = search_policy_db(query)
        return {"retrieved_context": policy_context}
    except Exception as e:
        logger.exception("Error in searcher_node: %s", str(e))
        return {"error": f"Searcher Error: {str(e)}"}
