import os
import logging
from typing import Dict, Any
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

logger = logging.getLogger(__name__)

def writer_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Summary Agent Node that writes a polite response citing the rule."""
    query = state.get("query", "")
    policy_context = state.get("retrieved_context", "")
    is_compliant = state.get("is_compliant")
    reasoning = state.get("reasoning", "")
    
    if state.get("error"):
        logger.warning("Skipping writer_node due to existing error: %s", state["error"])
        fallback_msg = (
            "We apologize, but an internal processing error occurred while evaluating your request. "
            f"Detail: {state.get('error')}. Please contact Career Services support."
        )
        return {"final_response": fallback_msg}

    try:
        if not os.environ.get("GROQ_API_KEY"):
            raise ValueError("GROQ_API_KEY environment variable is not set.")

        llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.5)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", (
                "You are a helpful, professional, and polite University Career Services assistant.\n"
                "Your goal is to convey the compliance verdict to the student.\n"
                "Address the student directly, maintain a formal yet supportive tone, and explicitly cite the relevant rule/section from the policy context.\n\n"
                "Rule Context:\n"
                "{policy_context}\n\n"
                "Compliance Verdict:\n"
                "- Compliant: {is_compliant}\n"
                "- Judge Reasoning: {reasoning}"
            )),
            ("user", "Draft a response to the student's situation/query: {query}")
        ])
        
        chain = prompt | llm
        response = chain.invoke({
            "policy_context": policy_context,
            "is_compliant": is_compliant,
            "reasoning": reasoning,
            "query": query
        })
        
        final_text = response.content
        logger.info("Summary response drafted successfully.")
        return {"final_response": str(final_text)}
        
    except Exception as e:
        logger.exception("Error in writer_node processing query: %s", query)
        fallback_msg = (
            "Thank you for reaching out. We encountered a technical issue while evaluating your request. "
            f"Judge verdict reasoning: {reasoning}. Please consult the Career Services manual or try again later."
        )
        return {
            "final_response": fallback_msg,
            "error": f"Writer Error: {str(e)}"
        }
