import os
import logging
from typing import Dict, Any
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

logger = logging.getLogger(__name__)

class ComplianceEvaluation(BaseModel):
    is_compliant: bool = Field(
        description="True if the student's situation is compliant with the retrieved policy rules. False if there is any violation or infraction."
    )
    reasoning: str = Field(
        description="Detailed explanation of the compliance evaluation. Explicitly reference relevant rules from the policy context."
    )

def judge_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Compliance Agent Node that evaluates compliance against policy rules."""
    query = state.get("query", "")
    policy_context = state.get("retrieved_context", "")
    
    if state.get("error"):
        logger.warning("Skipping judge_node due to existing error: %s", state["error"])
        return {}

    try:
        if not os.environ.get("GROQ_API_KEY"):
            raise ValueError("GROQ_API_KEY environment variable is not set.")

        llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.0)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", (
                "You are a strict compliance judge for the University Career Services.\n"
                "Evaluate if the student's behavior or request matches the following policy guidelines.\n"
                "Be objective and strict.\n\n"
                "Policy Guidelines:\n"
                "{policy_context}\n\n"
                "CRITICAL INSTRUCTIONS FOR TOOL USE:\n"
                "1. You must respond ONLY by calling the provided function tool (ComplianceEvaluation) with the correct arguments.\n"
                "2. Do NOT wrap your output in text tags like '<function>' or '</function>'.\n"
                "3. Do NOT wrap your response in markdown code blocks like ```json or similar.\n"
                "4. Do NOT output any introductory text, conversation, explanations, or general response outside the tool call.\n"
                "5. Populate 'is_compliant' (boolean) and 'reasoning' (clear string explaining the verdict) directly as tool parameters."
            )),
            ("user", "Student's situation/query: {query}")
        ])
        
        chain = prompt | llm.with_structured_output(ComplianceEvaluation)
        evaluation = chain.invoke({"policy_context": policy_context, "query": query})
        
        logger.info("Compliance evaluation completed: is_compliant=%s", evaluation.is_compliant)
        return {
            "is_compliant": evaluation.is_compliant,
            "reasoning": evaluation.reasoning
        }
        
    except Exception as e:
        logger.exception("Error in judge_node processing query: %s", query)
        return {
            "is_compliant": False,
            "reasoning": f"An error occurred during compliance evaluation: {str(e)}",
            "error": f"Judge Error: {str(e)}"
        }