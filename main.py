import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from agent_workflow import app as agent_app

from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent / ".env"

load_dotenv(dotenv_path=env_path)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Policy & Compliance Assistant API",
    description="Backend API for verifying student compliance with Career Services policies using LangGraph and Groq.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str = Field(..., description="The query or situation statement from the student.")

class ChatResponse(BaseModel):
    query: str = Field(..., description="The original query submitted by the user.")
    is_compliant: Optional[bool] = Field(None, description="Compliance verdict from the judge agent.")
    reasoning: Optional[str] = Field(None, description="Explanation/reasoning behind the compliance verdict.")
    final_response: str = Field(..., description="Polite and formal response addressing the student and citing rules.")
    error: Optional[str] = Field(None, description="Error message if a node or step failed during execution.")

    confidence_score: Optional[int] = Field(
        None,
        description="Confidence score derived from retrieval similarity."
    )

    retrieval_similarity: Optional[float] = Field(
        None,
        description="Semantic similarity score from vector retrieval."
    )

    grounded_response: Optional[bool] = Field(
        None,
        description="Whether the response was generated using retrieved policy context."
    )

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Endpoint that accepts incoming student queries, routes them through the sequential
    multi-agent compliance verification graph, and returns the final decision and reasoning.
    """
    logger.info("Received compliance check request: '%s'", request.message)
    
    initial_state = {
        "query": request.message,
        "retrieved_context": None,
        "is_compliant": None,
        "reasoning": None,
        "final_response": None,
        "error": None,
        "similarity_score": 0
    }
    
    try:
        result = agent_app.invoke(initial_state)
        
        if result.get("error"):
            logger.error("Graph execution completed with errors: %s", result["error"])
        else:
            logger.info("Graph execution completed successfully.")
            
        return ChatResponse(
            query=request.message,
            is_compliant=result.get("is_compliant"),
            reasoning=result.get("reasoning"),
            final_response=result.get("final_response") or "Failed to generate a final response.",
            error=result.get("error"),
            confidence_score=int(result.get("similarity_score", 0) * 100),
            retrieval_similarity=result.get("similarity_score", 0),
            grounded_response=True
        )
        
    except Exception as e:
        logger.exception("Unhandled exception during graph execution or output generation.")
        return ChatResponse(
            query=request.message,
            is_compliant=False,
            reasoning="An internal server error occurred while processing the request.",
            final_response=(
                "We are sorry, but our compliance verification system is temporarily unavailable. "
                "Please verify your policy compliance with a Career Services advisor directly."
            ),
            error=str(e)
        )
