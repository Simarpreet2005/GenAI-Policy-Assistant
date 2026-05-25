import logging
from typing import Dict, Any
from agents.vector_search import search_policy

logger = logging.getLogger(__name__)


def search_policy_db(query: str):
    logger.info("Searching policy database with query: %s", query)

    results = search_policy(query)

    documents = results.get("documents", [])
    similarity_score = results.get("similarity_score", 0)

    if not documents:
        return {
            "policy_context": "No relevant policy sections found.",
            "similarity_score": 0
        }

    return {
        "policy_context": "\n\n".join(documents),
        "similarity_score": similarity_score
    }

def searcher_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Retrieval Agent Node that searches the policy database."""
    query = state.get("query", "")
    try:
        search_results = search_policy_db(query)

        policy_context = search_results["policy_context"]
        similarity_score = search_results["similarity_score"]

        return {
            "retrieved_context": policy_context,
            "similarity_score": similarity_score
        }
    except Exception as e:
        logger.exception("Error in searcher_node: %s", str(e))
        return {"error": f"Searcher Error: {str(e)}"}
    search_results = search_policy_db(query)


