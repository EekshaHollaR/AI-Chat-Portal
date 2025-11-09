# AI Chat Portal

Welcome to the AI Chat Portal! This project is an all-in-one platform that lets users chat with powerful AI models, stores the conversation history, and allows you to search or analyze your old chats in smart ways.

## 🚩 What is this Project?

The AI Chat Portal is a web app where users can:
- Start real-time chats with an AI (powered by OpenAI, Claude, Gemini, or local LLMs)
- Automatically save all their conversations and get AI-generated summaries at the end
- Search and ask questions about anything discussed in previous chats, even by topic or date
- See conversation stats, insights, and more—all from a modern, user-friendly dashboard

This project is ideal for anyone building an intelligent AI chat assistant, knowledge base, or a dashboard for LLM-powered support.

## 🛠️ Tech Stack

- Backend: Django REST Framework & Django Channels (Python)
- Frontend: React (with Vite) + Tailwind CSS
- Database: PostgreSQL (NO Supabase or MongoDB)
- Real-Time Messaging: WebSocket & Redis
- AI Integration: OpenAI API, Anthropic Claude, Google Gemini, or locally with LM Studio
- Analysis and Search: Sentence Transformers and vector embeddings

## ✨ Features

- Real-time AI Chat: Type messages and get instant, streaming responses from the AI.
- Smart Archiving: Every conversation is stored, timestamped, and organized by topic/date.
- AI Summaries: When you end a chat, the system auto-generates a summary with main points and action items.
- Semantic Search: Search all chats using meaning—not just keywords.
- Query Mode: Ask the AI questions about your chat history and get relevant excerpts/answers.
- Responsive UI: Looks great on mobile and desktop. Bonus: includes dark mode!

## 🐣 Getting Started (Development & Testing)

### 1. Clone the repository:

- git clone https://github.com/your-username/ai-chat-portal.git
- cd ai-chat-portal

### 2. Backend Setup

```
cd backend
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
redis-server # start this in another terminal

```

Start the backend:
daphne -b 0.0.0.0 -p 8000 chat_portal.asgi:application


### 3. Frontend Setup

```
cd ../frontend
npm install
cp .env.example .env # Edit URLs if needed
npm run dev

```


Now, visit [http://localhost:5173](http://localhost:5173/) in your browser!

## 🖥️ Main Pages & UI

- Chat: Modern chat panel, real-time with streaming AI, typing indicator, nice message bubbles.
- Dashboard: See all your old chats, with date/title/summary, search or filter by status.
- Conversation Intelligence: Ask anything about your history! Powerful semantic search and AI answers with context.

## 📚 API Overview

All API endpoints are well-documented (Swagger at `/api/docs/`). Core endpoints:

- `GET /api/conversations/` — List all conversations
- `POST /api/conversations/` — Start a new conversation
- `GET /api/conversations/<id>/` — Retrieve conversation + messages
- `POST /api/conversations/<id>/end_conversation/` — End and get summary
- `POST /api/conversations/query_past/` — Query or search past conversations
- `POST /api/messages/` — Send message (HTTP fallback)
- `ws://localhost:8000/ws/chat/<conversation_id>/` — Real-time chat (WebSocket)

## 🌟 Screenshots

Add your screenshots of the UI here (dashboard, chat, semantic query, summary view, etc.) to make your project stand out!

## 🧠 Advanced Features (And Bonus Ideas!)

- Semantic vector search using sentence-transformers for accurate chat retrieval
- AI-powered extraction of main topics, decisions, and action items
- LLM model switcher for OpenAI, Anthropic, Google, or LM Studio
- Conversation export (PDF/JSON), conversation sharing, analytics dashboard (suggested as bonus)
- Modern responsive design with dark/light mode toggle
- Optimistic UI, loading states, error boundaries, and friendly notifications

## 🚀 Deployment Notes

- Production backend: run with Daphne/Uvicorn and HTTPS
- Production frontend: run `npm run build`, serve via Vercel/Netlify or static hosting
- All .env production variables should be set securely in the cloud environment

## 🏗️ Project Structure

See the `/backend`, `/frontend`, and `/architecture-design.md` for more details about the project layout and code organization.

## 🤝 Contributing

- Fork the repo
- Create a feature branch
- Commit with clear messages
- PRs are welcome! Tests and docs appreciated.

## 📞 Support

If you get stuck, contact: devgods99@gmail.com. For documentation, check Swagger UI at `/api/docs/` or explore the codebase!

## 📄 License

MIT - do what you want for learning/sharing.

Enjoy building with your own AI and making chat history intelligent! 🚀
