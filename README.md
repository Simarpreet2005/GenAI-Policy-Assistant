# GenAI Policy Assistant

An AI-powered multi-agent policy compliance assistant built using FastAPI, LangGraph, ChromaDB, Groq LLMs, and React.

The platform enables students to query university placement and internship policies using natural language and receive structured compliance decisions, semantic policy retrieval, citation-supported reasoning, and professional AI-generated responses.

The system demonstrates production-oriented Generative AI engineering concepts including:

* Retrieval-Augmented Generation (RAG)
* semantic vector search
* multi-agent orchestration
* structured AI workflows
* cloud deployment infrastructure
* real-time frontend-backend integration

---

# Overview

University placement and internship policies are often lengthy, difficult to navigate, and manually interpreted by students and placement coordinators.

This project solves that problem by building an intelligent AI assistant capable of:

* retrieving relevant placement policy clauses
* evaluating policy compliance scenarios
* performing semantic policy search
* generating structured AI-based responses
* displaying explainable AI workflow execution

The platform combines a modern React frontend with a FastAPI + LangGraph backend deployed on Google Cloud Run.

---

# Key Features

* Multi-Agent AI Workflow
* Retrieval-Augmented Generation (RAG)
* ChromaDB Semantic Vector Search
* Policy-Based Compliance Evaluation
* Citation-Supported Responses
* Real-Time Workflow Visualization
* FastAPI REST Backend
* Enterprise React Frontend
* Dockerized Cloud Deployment
* Google Cloud Run Integration
* Vercel Frontend Deployment

---

# System Architecture

```txt
User Query
    ↓
Frontend Dashboard (React)
    ↓
FastAPI Backend
    ↓
LangGraph Workflow
    ↓
Searcher Agent
    ↓
Judge Agent
    ↓
Writer Agent
    ↓
Structured AI Response
```

---

# Multi-Agent Workflow

## 1. Searcher Agent

Responsible for semantic retrieval of university placement policy clauses.

### Responsibilities

* generate semantic embeddings
* perform ChromaDB vector search
* retrieve relevant policy chunks
* provide contextual evidence

### Technologies Used

* ChromaDB
* SentenceTransformers
* all-MiniLM-L6-v2 embeddings

---

## 2. Judge Agent

Responsible for compliance evaluation and policy validation.

### Responsibilities

* interpret university placement rules
* validate user scenarios
* determine compliance status
* generate structured verdicts

### Technologies Used

* Groq API
* llama-3.1-8b-instant
* Pydantic schemas

---

## 3. Writer Agent

Responsible for generating professional structured responses.

### Responsibilities

* generate final AI response
* summarize policy reasoning
* include citations and explanations
* structure readable output

---

# Retrieval-Augmented Generation (RAG)

The platform uses a semantic retrieval pipeline to improve factual grounding and reduce hallucinations.

## Retrieval Pipeline

```txt
User Query
    ↓
Sentence Embedding
    ↓
ChromaDB Vector Search
    ↓
Policy Chunk Retrieval
    ↓
Judge Evaluation
    ↓
Writer Response Generation
```

### Retrieval Stack

* ChromaDB
* SentenceTransformers
* semantic vector embeddings
* PDF chunking pipeline
* policy citation retrieval

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Framer Motion
* Lucide React

---

## Backend

* FastAPI
* Python
* Uvicorn
* LangGraph
* Pydantic

---

## AI & Retrieval

* Groq API
* ChromaDB
* SentenceTransformers
* RAG Pipeline
* Semantic Search

---

## Deployment

* Docker
* Google Cloud Run
* Vercel

---

# Project Structure

```txt
genai-policy-assistant/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── assets/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── agents/
│   ├── searcher.py
│   ├── judge.py
│   ├── writer.py
│   └── vector_search.py
│
├── chroma_db/
├── data/
├── build_vector_db.py
├── agent_workflow.py
├── main.py
├── Dockerfile
├── requirements.txt
└── README.md
```

---

# Prerequisites

Before running the project, install:

| Tool    | Version |
| ------- | ------- |
| Python  | 3.9+    |
| Node.js | 18+     |
| npm     | latest  |
| Git     | latest  |

---

# Backend Setup

## 1. Clone Repository

```bash
git clone <your-repository-url>
cd genai-policy-assistant
```

---

## 2. Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Configure Environment Variables

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
```

---

## 5. Build Vector Database

```bash
python build_vector_db.py
```

This generates the ChromaDB vector index from the university placement policy document.

---

## 6. Run Backend Server

```bash
uvicorn main:app --reload
```

Backend runs at:

```txt
http://127.0.0.1:8000
```

---

# Frontend Setup

## Install Dependencies

```bash
cd frontend
npm install
```

---

## Start Frontend

```bash
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

---

# API Documentation

FastAPI Swagger UI:

```txt
http://127.0.0.1:8000/docs
```

---

# Example API Request

## POST `/chat`

### Request

```json
{
  "message": "Can I reject a placement offer?"
}
```

---

### Response

```json
{
  "query": "Can I reject a placement offer?",
  "is_compliant": false,
  "reasoning": "Student cannot reject placement offer without valid reason.",
  "final_response": "Structured compliance response generated.",
  "error": null
}
```

---

# Deployment Links

## Frontend (Vercel)

```txt
https://gen-ai-policy-assistant.vercel.app
```

---

## Backend API (Google Cloud Run)

```txt
https://genai-policy-backend-424955378865.asia-south1.run.app/docs
```

---

# Current Capabilities

* Real-time policy question answering
* Semantic policy retrieval
* Multi-agent reasoning workflow
* Citation-supported responses
* Cloud-hosted backend API
* Frontend-backend live integration

---
# Evaluation & Grounding

The backend includes a lightweight retrieval-evaluation layer to improve response reliability and transparency.

## Current Evaluation Signals

* Semantic retrieval similarity scoring using ChromaDB vector distances
* Grounded-response metadata validation
* Retrieval-context-based reasoning generation

These evaluation signals are exposed through the backend API and help estimate how strongly the generated response aligns with retrieved university policy context.

Example backend metadata:

```json
{
  "confidence_score": 93,
  "retrieval_similarity": 0.93,
  "grounded_response": true
}
```

Future iterations may expand this into a dedicated evaluation dashboard and advanced response verification pipeline.

# Contributors

## Backend & AI Workflow Engineering

* LangGraph orchestration
* FastAPI backend
* Groq integration
* compliance evaluation workflow

---

## Vector Database & Cloud Infrastructure

* ChromaDB integration
* semantic retrieval pipeline
* vector embeddings
* Docker deployment
* Google Cloud Run deployment

---

## Frontend & Product Engineering

* React enterprise dashboard
* workflow visualization
* responsive UI
* frontend-backend integration
* Vercel deployment

---

# Future Improvements

* Conversation persistence
* Authentication system
* Policy upload management
* Real-time streaming responses
* Advanced analytics dashboard
* Human approval workflows

---

# License

This project was developed for educational and academic purposes as part of an AI Engineering coursework project.
