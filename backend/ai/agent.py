from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from google import genai
from google.genai import types
from core.config import settings
from ai.embeddings import aget_embedding
from db.mongodb import get_db
from db.qdrant import qdrant_client
import httpx
from bson import ObjectId

# Initialize Gemini Client for LLM
client = genai.Client(api_key=settings.GEMINI_API_KEY)

class TicketAnalysis(BaseModel):
    category: str = Field(description="The category of the issue (e.g., bug, feature_request, access_issue, question)")
    priority: str = Field(description="The priority level: low, medium, high, critical")
    affected_system: str = Field(description="The system or component affected")
    tags: List[str] = Field(description="Relevant tags for the issue")

class TicketState(BaseModel):
    ticket_id: str
    description: str
    analysis: Optional[dict] = None
    similar_tickets: Optional[List[dict]] = None
    kb_articles: Optional[List[dict]] = None
    suggestions: Optional[str] = None
    jira_key: Optional[str] = None
    error: Optional[str] = None

# Nodes

def analyze_node(state: TicketState) -> TicketState:
    prompt = f"Analyze the following support ticket and extract structured information.\n\nTicket Description:\n{state.description}"
    
    # We use Gemini's structured output
    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=TicketAnalysis,
        ),
    )
    
    import json
    try:
        analysis_dict = json.loads(response.text)
        state.analysis = analysis_dict
    except Exception as e:
        state.error = f"Failed to parse analysis: {str(e)}"
    
    return state

async def embed_and_dedupe_node(state: TicketState) -> TicketState:
    if state.error: return state
    
    # Get embedding for the description + tags
    tags_str = ", ".join(state.analysis.get("tags", []))
    text_to_embed = f"{state.description} [Tags: {tags_str}]"
    
    vector = await aget_embedding(text_to_embed)
    
    # Upsert into Qdrant
    import uuid
    point_id = str(uuid.uuid4())
    from qdrant_client.models import PointStruct
    await qdrant_client.upsert(
        collection_name="ticket_embeddings",
        points=[
            PointStruct(
                id=point_id,
                vector=vector,
                payload={
                    "ticket_id": state.ticket_id,
                    "description": state.description,
                    "category": state.analysis.get("category"),
                    "priority": state.analysis.get("priority")
                }
            )
        ]
    )
    
    # Search for duplicates
    search_result = await qdrant_client.search(
        collection_name="ticket_embeddings",
        query_vector=vector,
        limit=3,
        score_threshold=0.88
    )
    
    similar = []
    for hit in search_result:
        if hit.payload.get("ticket_id") != state.ticket_id:
            similar.append(hit.payload)
    
    state.similar_tickets = similar
    return state

async def retrieve_kb_node(state: TicketState) -> TicketState:
    if state.error: return state
    
    vector = await aget_embedding(state.description)
    
    # Search KB
    search_result = await qdrant_client.search(
        collection_name="kb_embeddings",
        query_vector=vector,
        limit=3
    )
    
    kb_articles = []
    for hit in search_result:
        kb_articles.append(hit.payload)
    
    state.kb_articles = kb_articles
    return state

def suggest_node(state: TicketState) -> TicketState:
    if state.error: return state
    
    kb_context = "\n".join([f"- {kb.get('title', 'KB')}: {kb.get('content', '')}" for kb in (state.kb_articles or [])])
    prompt = f"""
You are an expert IT support engineer. Provide step-by-step resolution suggestions for the following ticket.
Use the provided knowledge base context if relevant.

Ticket: {state.description}
Analysis: {state.analysis}
Knowledge Base Context:
{kb_context}

Provide a markdown formatted response with troubleshooting steps.
"""
    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt
    )
    
    state.suggestions = response.text
    return state

async def create_jira_node(state: TicketState) -> TicketState:
    if state.error: return state
    
    jira_url = f"{settings.JIRA_DOMAIN.rstrip('/')}/rest/api/3/issue"
    auth = (settings.JIRA_USER_EMAIL, settings.JIRA_API_TOKEN)
    
    # Map priority (simplistic mapping)
    priority_map = {"critical": "Highest", "high": "High", "medium": "Medium", "low": "Low"}
    jira_priority = priority_map.get(state.analysis.get("priority", "low").lower(), "Medium")
    
    payload = {
        "fields": {
            "project": {"key": settings.JIRA_PROJECT_KEY},
            "summary": f"[{state.analysis.get('category', 'Issue')}] {state.description[:50]}...",
            "description": {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [{"type": "text", "text": state.description}]
                    }
                ]
            },
            "issuetype": {"name": "Task"}, # Assuming 'Task' exists in the project
        }
    }
    
    async with httpx.AsyncClient() as http_client:
        try:
            response = await http_client.post(jira_url, json=payload, auth=auth)
            response.raise_for_status()
            data = response.json()
            state.jira_key = data.get("key")
        except Exception as e:
            print(f"Jira creation failed: {e}")
            # Non-fatal error for the agent, we just won't have a jira_key
            pass
            
    return state

async def save_results_node(state: TicketState) -> TicketState:
    if state.error:
        print(f"Agent pipeline failed for ticket {state.ticket_id}: {state.error}")
        return state
        
    db = get_db()
    
    update_data = {
        "status": "open",
        "analysis": state.analysis,
        "suggestions": state.suggestions,
        "similar_tickets": [t.get("ticket_id") for t in state.similar_tickets] if state.similar_tickets else [],
        "jira_issue_key": state.jira_key
    }
    
    await db.tickets.update_one(
        {"_id": ObjectId(state.ticket_id)},
        {"$set": update_data}
    )
    
    return state


# Build the graph
graph = StateGraph(TicketState)
graph.add_node("analyze", analyze_node)
graph.add_node("embed_and_dedupe", embed_and_dedupe_node)
graph.add_node("retrieve_kb", retrieve_kb_node)
graph.add_node("suggest", suggest_node)
graph.add_node("save_results", save_results_node)

graph.set_entry_point("analyze")
graph.add_edge("analyze", "embed_and_dedupe")
graph.add_edge("embed_and_dedupe", "retrieve_kb")
graph.add_edge("retrieve_kb", "suggest")
graph.add_edge("suggest", "save_results")
graph.add_edge("save_results", END)

ticket_agent = graph.compile()
