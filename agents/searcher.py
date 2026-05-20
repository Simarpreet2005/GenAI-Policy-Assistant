import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def search_policy_db(query: str) -> str:
    """Mock function to search the University Career Services Policy database."""
    logger.info("Searching policy database with query: %s", query)
    query_lower = query.lower()
    
    if "withdraw" in query_lower or "drop" in query_lower:
        return (
            "University Career Services Policy Section 4.2 - Drive Withdrawal:\n"
            "Students are permitted to withdraw from an active recruitment drive without penalty "
            "only if they submit a formal withdrawal request at least 48 hours prior to the first round of interviews. "
            "Withdrawals within 48 hours of the drive starting, or absence from any scheduled round without prior approval "
            "from the placement cell, will result in an automatic suspension from the career portal for 3 months "
            "and a ban from the next 2 active campus recruitment drives."
        )
    elif "register" in query_lower or "signup" in query_lower:
        return (
            "University Career Services Policy Section 2.1 - Registration:\n"
            "All undergraduate and postgraduate students seeking placement assistance must register on the "
            "Career Services Portal by September 15th of their graduation academic year. "
            "A minimum cumulative GPA of 6.0 and 80% attendance in prep workshops are mandatory pre-requisites for registration. "
            "Late registrations are strictly not tolerated unless accompanied by a medical certificate verified by the University Medical Board."
        )
    elif any(term in query_lower for term in ["misconduct", "plagiarize", "cheat", "behavior", "disciplinary"]):
        return (
            "University Career Services Policy Section 7.5 - Code of Conduct:\n"
            "Any form of academic misconduct, cheating, resume falsification, or unprofessional behavior during campus recruitment "
            "drives is classified as a Level-1 infraction. "
            "Upon report of misconduct, the student's portal access is immediately suspended. "
            "A disciplinary hearing will be conducted within 7 working days. If found guilty, the student will be permanently debarred "
            "from all future campus placement activities, and the incident will be reported to the University Dean."
        )
    
    return (
        "University Career Services Policy General Section 1.1:\n"
        "Students must adhere to professional ethics in all communications. "
        "Active participation in pre-placement presentations and complying with the scheduling instructions is mandatory "
        "for all registered candidates. Failure to attend pre-placement talks (PPT) without a valid reason "
        "will result in de-registration from the specific company's hiring process."
    )

def searcher_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Retrieval Agent Node that searches the policy database."""
    query = state.get("query", "")
    try:
        policy_context = search_policy_db(query)
        return {"retrieved_context": policy_context}
    except Exception as e:
        logger.exception("Error in searcher_node: %s", str(e))
        return {"error": f"Searcher Error: {str(e)}"}
