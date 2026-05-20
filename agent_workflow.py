import logging
from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END
from agents.searcher import searcher_node
from agents.judge import judge_node
from agents.writer import writer_node

logger = logging.getLogger(__name__)

class AgentState(TypedDict):
    """Structured Pydantic-compatible state definition for the LangGraph workflow."""
    query: str
    retrieved_context: Optional[str]
    is_compliant: Optional[bool]
    reasoning: Optional[str]
    final_response: Optional[str]
    error: Optional[str]

# Define the state graph with our state schema
workflow = StateGraph(AgentState)

# Wire nodes to the graph
workflow.add_node("searcher", searcher_node)
workflow.add_node("judge", judge_node)
workflow.add_node("writer", writer_node)

# Set entry point
workflow.set_entry_point("searcher")

# Sequential routing transitions
workflow.add_edge("searcher", "judge")
workflow.add_edge("judge", "writer")
workflow.add_edge("writer", END)

# Compile graph into an executable application
app = workflow.compile()
