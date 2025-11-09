# AI Chat Portal - Architecture & System Design

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Frontend (Vite)                        │  │
│  │  - Chat Interface    - Dashboard    - Query Page         │  │
│  │  - Tailwind CSS      - React Router  - Axios             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
           │                              │
           │ HTTP/REST                    │ WebSocket
           │                              │
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           Django REST Framework Backend                 │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │    │
│  │  │   REST API   │  │   WebSocket  │  │  Admin UI   │ │    │
│  │  │   Endpoints  │  │   Consumers  │  │             │ │    │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │    │
│  │                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │    │
│  │  │ Conversation │  │   Message    │  │ OpenAPI     │ │    │
│  │  │   ViewSets   │  │   Handlers   │  │ Docs        │ │    │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
           │                              │
           │                              │ Redis Channel Layer
┌─────────────────────────────────────────────────────────────────┐
│                      AI/ML LAYER                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  AI Module                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │    │
│  │  │  LLM Client  │  │  Embeddings  │  │  Semantic   │ │    │
│  │  │ (OpenAI/     │  │  Generator   │  │   Search    │ │    │
│  │  │  Claude/     │  │  (Sentence   │  │             │ │    │
│  │  │  Gemini/     │  │ Transformers)│  │             │ │    │
│  │  │  LM Studio)  │  │              │  │             │ │    │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │    │
│  │                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐                   │    │
│  │  │ Conversation │  │   Summary    │                   │    │
│  │  │   Analyzer   │  │  Generator   │                   │    │
│  │  └──────────────┘  └──────────────┘                   │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
           │                              │
           │                              │
┌─────────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                   │
│  ┌────────────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   PostgreSQL       │  │    Redis     │  │  External    │   │
│  │   Database         │  │   Message    │  │  LLM APIs    │   │
│  │                    │  │   Broker     │  │              │   │
│  │  - Conversations   │  │              │  │  - OpenAI    │   │
│  │  - Messages        │  │  - Channel   │  │  - Anthropic │   │
│  │  - Embeddings      │  │    Layer     │  │  - Google    │   │
│  │                    │  │  - Cache     │  │  - LM Studio │   │
│  └────────────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Real-Time Chat Flow

```
User Types Message
      │
      ▼
React Component (MessageInput)
      │
      ▼
WebSocket Connection
      │
      ▼
Django Channels Consumer (ChatConsumer)
      │
      ├──────────────────┐
      │                  │
      ▼                  ▼
Save to Database    Send to LLM
(Message Model)     (LLM Client)
      │                  │
      │                  ▼
      │           Stream Response
      │                  │
      │                  ▼
      └──────────► WebSocket Send
                        │
                        ▼
                   React Component
                        │
                        ▼
                   Display Message
```

### 2. Conversation End & Summarization Flow

```
User Clicks "End Conversation"
         │
         ▼
POST /api/conversations/{id}/end_conversation/
         │
         ▼
Update Conversation Status = 'ended'
         │
         ▼
Fetch All Messages
         │
         ▼
ConversationAnalyzer.generate_summary()
         │
         ▼
LLM generates summary
         │
         ▼
Save summary to Conversation.summary
         │
         ▼
EmbeddingGenerator.generate_embedding()
         │
         ▼
Store in ConversationEmbedding table
         │
         ▼
Return updated Conversation object
```

### 3. Semantic Search Flow

```
User Enters Search Query
         │
         ▼
POST /api/conversations/query_past/
         │
         ▼
Generate Query Embedding
(Sentence Transformers)
         │
         ▼
Fetch Conversation Embeddings from DB
         │
         ▼
Calculate Cosine Similarities
         │
         ▼
Rank Results by Score
         │
         ▼
Apply Filters (date, top_k)
         │
         ▼
Fetch Full Conversation Objects
         │
         ▼
Return Ranked Results with Scores
```

## Component Interaction Map

### Backend Components

```
┌─────────────────────────────────────────────────────────┐
│                    Django Project                        │
│                                                          │
│  ┌────────────────────────────────────────────────┐   │
│  │           conversations (Django App)            │   │
│  │                                                  │   │
│  │  models.py ──────► Conversation, Message,       │   │
│  │                    ConversationEmbedding         │   │
│  │                                                  │   │
│  │  serializers.py ─► REST serialization           │   │
│  │                                                  │   │
│  │  views.py ────────► ConversationViewSet,        │   │
│  │                     MessageViewSet               │   │
│  │                                                  │   │
│  │  consumers.py ────► ChatConsumer (WebSocket)    │   │
│  │                                                  │   │
│  │  routing.py ──────► WebSocket URL patterns      │   │
│  └────────────────────────────────────────────────┘   │
│                                                          │
│  ┌────────────────────────────────────────────────┐   │
│  │              ai_module (Package)                │   │
│  │                                                  │   │
│  │  llm_client.py ───► LLMClient,                 │   │
│  │                     ConversationSummarizer      │   │
│  │                                                  │   │
│  │  embeddings.py ───► EmbeddingGenerator         │   │
│  │                                                  │   │
│  │  semantic_search.py ► SemanticSearch           │   │
│  │                                                  │   │
│  │  conversation_analyzer.py ► ConversationAnalyzer│   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Frontend Components

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
│                                                          │
│  App.jsx                                                │
│    │                                                     │
│    ├──► Layout.jsx (Sidebar Navigation)                │
│    │                                                     │
│    ├──► Pages/                                          │
│    │      ├──► DashboardPage.jsx                       │
│    │      ├──► ChatPage.jsx                            │
│    │      └──► QueryPage.jsx                           │
│    │                                                     │
│    └──► Components/                                     │
│           ├──► ChatInterface.jsx                       │
│           ├──► MessageList.jsx                         │
│           ├──► MessageInput.jsx                        │
│           ├──► ConversationCard.jsx                    │
│           └──► QueryInterface.jsx                      │
│                                                          │
│  Hooks/                                                 │
│    ├──► useWebSocket.js (WebSocket management)         │
│    └──► useConversations.js (Data fetching)            │
│                                                          │
│  API Services/                                          │
│    ├──► axios-config.js (HTTP client setup)            │
│    ├──► conversationService.js (CRUD operations)       │
│    └──► queryService.js (Semantic search)              │
└─────────────────────────────────────────────────────────┘
```

## Database Schema Diagram

```sql
┌────────────────────────┐
│   Conversations        │
├────────────────────────┤
│ id (UUID) PK          │
│ title (VARCHAR)        │
│ status (VARCHAR)       │
│ summary (TEXT)         │
│ start_timestamp        │
│ end_timestamp          │
│ created_at             │
│ updated_at             │
└────────────────────────┘
         │
         │ 1:N
         │
         ▼
┌────────────────────────┐
│      Messages          │
├────────────────────────┤
│ id (BIGINT) PK        │
│ conversation_id FK     │◄──┐
│ content (TEXT)         │   │
│ sender (VARCHAR)       │   │
│ timestamp              │   │
│ created_at             │   │
└────────────────────────┘   │
                             │
┌────────────────────────┐   │
│ ConversationEmbeddings │   │
├────────────────────────┤   │
│ id (BIGINT) PK        │   │
│ conversation_id FK     │───┘
│ embedding_vector       │
│ (FLOAT ARRAY[768])     │
│ metadata (JSONB)       │
│ created_at             │
└────────────────────────┘
```

## API Endpoint Architecture

### REST Endpoints
```
/api/
├── conversations/
│   ├── GET     /                    # List all conversations
│   ├── POST    /                    # Create conversation
│   ├── GET     /{id}/               # Get conversation detail
│   ├── PATCH   /{id}/               # Update conversation
│   ├── DELETE  /{id}/               # Delete conversation
│   ├── POST    /{id}/end_conversation/  # End & summarize
│   └── POST    /query_past/         # Semantic search
│
├── messages/
│   └── POST    /                    # Send message (HTTP fallback)
│
├── schema/                          # OpenAPI schema
├── docs/                            # Swagger UI
└── redoc/                           # ReDoc documentation
```

### WebSocket Endpoints
```
ws://
└── ws/chat/{conversation_id}/      # Real-time chat connection
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Security Layers                        │
│                                                          │
│  Frontend                                               │
│  ├── HTTPS enforcement (production)                     │
│  ├── XSS protection (React escaping)                    │
│  ├── CSRF token validation                              │
│  └── Secure WebSocket (WSS)                             │
│                                                          │
│  Backend                                                │
│  ├── Django security middleware                         │
│  ├── CORS configuration                                 │
│  ├── SQL injection protection (ORM)                     │
│  ├── Rate limiting (optional)                           │
│  └── API key validation (LLM providers)                 │
│                                                          │
│  Database                                               │
│  ├── Encrypted connections                              │
│  ├── User authentication                                │
│  └── Role-based access control                          │
└─────────────────────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling
```
Load Balancer
     │
     ├──► Django Instance 1 ──┐
     │                         │
     ├──► Django Instance 2 ──┼──► Redis (Shared)
     │                         │
     └──► Django Instance N ──┘
                              │
                              └──► PostgreSQL (Shared)
```

### Caching Strategy
```
Request Flow with Caching:
User Request
     │
     ▼
Redis Cache Check
     │
     ├──► Cache Hit ──► Return Cached Data
     │
     └──► Cache Miss
            │
            ▼
     Database Query
            │
            ▼
     Store in Cache
            │
            ▼
     Return Data
```

## Deployment Architecture (Production)

```
┌──────────────────────────────────────────────────────┐
│                    Cloud Provider                     │
│                (AWS/GCP/Azure/Railway)                │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Frontend   │  │   Backend    │  │  Database │ │
│  │   (Vercel/   │  │   (Railway/  │  │  (Managed │ │
│  │   Netlify)   │  │   Render)    │  │    PG)    │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│         │                 │                 │        │
│         │                 │                 │        │
│         └─────────────────┴─────────────────┘        │
│                           │                          │
│                  ┌────────▼────────┐                │
│                  │  Redis Cloud    │                │
│                  │  (Upstash/      │                │
│                  │   Redis Labs)   │                │
│                  └─────────────────┘                │
└──────────────────────────────────────────────────────┘
```

## Performance Optimization

### Backend Optimizations
- Database indexing on frequently queried fields
- Connection pooling for database
- Async/await for non-blocking operations
- Pagination for large datasets
- Caching with Redis

### Frontend Optimizations
- Code splitting with React.lazy()
- Memoization with useMemo/useCallback
- Virtual scrolling for long message lists
- Debouncing for search inputs
- Optimistic UI updates

### AI/ML Optimizations
- Batch processing for embeddings
- Model caching in memory
- Streaming responses from LLM
- Vector search indexing

---

This architecture provides a scalable, maintainable, and performant system for AI-powered conversations with intelligent querying capabilities.
