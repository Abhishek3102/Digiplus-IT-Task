# DigiPlus AI-Powered Service Desk

Welcome to the **DigiPlus AI-Powered Service Desk**, a modern, intelligent IT support platform designed to streamline issue resolution. This application leverages advanced AI agents, vector-based knowledge retrieval, and a seamless full-stack architecture to provide automated IT assistance, ticket routing, and a dedicated worker dashboard for specific IT departments.

---

## 🏗️ Architecture

Below is the high-level architecture diagram of the DigiPlus Service Desk:

```mermaid
graph TD
    %% Define Styles
    classDef frontend fill:#3178c6,stroke:#fff,stroke-width:2px,color:#fff
    classDef backend fill:#009688,stroke:#fff,stroke-width:2px,color:#fff
    classDef database fill:#f4a261,stroke:#fff,stroke-width:2px,color:#fff
    classDef ai fill:#9c27b0,stroke:#fff,stroke-width:2px,color:#fff
    classDef external fill:#e9c46a,stroke:#333,stroke-width:2px,color:#333

    %% Components
    User((User / Worker))
    
    subgraph "Frontend (Next.js)"
        UI[User Interface & Dashboard]:::frontend
        Auth[Clerk Authentication]:::external
        ChatWidget[AI Chat Widget]:::frontend
    end
    
    subgraph "Backend (FastAPI)"
        API[FastAPI Router]:::backend
        AuthMiddle[JWT Verification]:::backend
        AgentGraph[LangGraph AI Workflow]:::ai
    end
    
    subgraph "Data Storage"
        MongoDB[(MongoDB\nTickets & Users)]:::database
        Qdrant[(Qdrant\nVector Knowledge Base)]:::database
    end
    
    subgraph "AI Services"
        Gemini[Google Gemini LLM]:::ai
        Embeddings[Google GenAI Embeddings]:::ai
    end

    %% Connections
    User -->|Logs in| Auth
    User -->|Interacts| UI
    User -->|Chats with bot| ChatWidget
    
    UI -->|API Requests| API
    ChatWidget -->|WebSocket / HTTP| API
    
    API --> AuthMiddle
    AuthMiddle -->|Validates Token| Auth
    
    API -->|Reads/Writes| MongoDB
    API -->|Routes Queries| AgentGraph
    
    AgentGraph -->|Vector Search| Qdrant
    AgentGraph -->|Generates Responses| Gemini
    Qdrant -.->|Powered by| Embeddings
```

---

## 💻 Tech Stack & Usage

### Frontend
* **Next.js 16 (App Router)**: Powers the entire frontend application, providing server-side rendering, secure server actions, and dynamic routing for both user and worker dashboards.
* **Clerk**: Handles all user authentication, session management, and role-based access control (RBAC), ensuring that only authorized IT staff can access department-specific queues.
* **Tailwind CSS & Framer Motion**: Provides a highly responsive, modern, dark-themed user interface with fluid animations and glassmorphism design aesthetics.

### Backend
* **FastAPI**: Serves as the core, asynchronous Python backend framework, providing high-performance RESTful APIs to handle ticket creation, chat streams, and data retrieval.
* **MongoDB (Motor)**: Acts as the primary NoSQL database, storing ticket metadata, status updates, user associations, and department assignments in a flexible, scalable format.
* **Qdrant**: A high-performance vector database used to store and retrieve IT troubleshooting FAQs and knowledge base articles via semantic similarity search.

### AI & Agents
* **Google Gemini (gemini-1.5-flash)**: The primary Large Language Model that powers the IT Support Chatbot, enabling intelligent conversation, issue analysis, and automated responses.
* **Google Generative AI Embeddings**: Converts text from the IT knowledge base into high-dimensional vectors, allowing the Qdrant database to perform accurate semantic searches for relevant solutions.
* **LangChain & LangGraph**: Orchestrates the multi-agent workflow, managing the state between the conversational agent, the vector retriever, and the ticket-routing logic seamlessly.
