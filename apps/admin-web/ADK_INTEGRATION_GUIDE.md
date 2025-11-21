# 🤖 ADK Multi-Agent Backend Integration Guide

This document explains how the SchoolOS frontend chatbot integrates with the ADK (Google Agent Development Kit) multi-agent backend.

---

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    School-OS Monorepo                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐    HTTP REST    ┌──────────────┐ │
│  │   Frontend (React)   │◄──────────────► │   Backend    │ │
│  │                      │                 │   (FastAPI)  │ │
│  │  Port: 5173          │                 │   Port: 8000 │ │
│  │                      │                 │              │ │
│  │  • ChatDock          │                 │  • ADK Root  │ │
│  │  • InputBar          │                 │    Agent     │ │
│  │  • MessageList       │                 │  • Sub-agents│ │
│  │  • useChatStore      │                 │    - marks   │ │
│  │  • chatService       │                 │    - fees    │ │
│  │                      │                 │    - attend. │ │
│  └──────────────────────┘                 │    - timetbl │ │
│                                           └──────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Start the Backend (Terminal 1)

```bash
cd apps/admin-web/dummy-multi-agent
python -m venv venv
source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

Backend will be available at: **http://localhost:8000**

### 2. Start the Frontend (Terminal 2)

```bash
cd apps/admin-web
pnpm install
pnpm dev
```

Frontend will be available at: **http://localhost:5173**

### 3. Test the Integration

1. Open the browser at http://localhost:5173
2. Log in to SchoolOS
3. Click the chat launcher button (bottom-right)
4. Type a message like "Show Aarav's marks"
5. The ADK agents will respond!

---

## 📁 Key Files

### Frontend

| File | Purpose |
|------|---------|
| `src/app/services/chatService.ts` | ADK backend API client |
| `src/app/components/chatbot/InputBar.tsx` | Message input with backend integration |
| `src/app/stores/useChatStore.ts` | Chat state management (Zustand) |
| `src/app/components/chatbot/ChatDock.tsx` | Main chat UI container |
| `src/app/components/chatbot/MessageList.tsx` | Message rendering |
| `.env.example` | Environment configuration template |

### Backend

| File | Purpose |
|------|---------|
| `dummy-multi-agent/api.py` | FastAPI server with REST endpoints |
| `dummy-multi-agent/adk_router.py` | ADK agent orchestration logic |
| `dummy-multi-agent/sessions.py` | In-memory session management |
| `dummy-multi-agent/manager/agent.py` | Root agent + sub-agents |
| `dummy-multi-agent/manager/data/*.csv` | Embedded data for agents |

---

## 🔌 API Integration

### Frontend → Backend Flow

```typescript
// 1. User types message in InputBar.tsx
const handleSend = async (message: string) => {
  // 2. Add user message to UI immediately
  pushMessage(activeId, userMsg);

  // 3. Call ADK backend via chatService
  const response = await sendMessageToBackend(activeId, message);

  // 4. Add agent response to UI
  pushMessage(activeId, {
    role: "assistant",
    content: response.message,
    ts: new Date(response.timestamp).getTime(),
  });
};
```

### Backend Endpoints

#### 1. **POST /api/chat/new_session**

Creates a new chat session.

**Response:**
```json
{
  "session_id": "uuid-string"
}
```

#### 2. **POST /api/chat/send**

Sends a message and gets agent response.

**Request:**
```json
{
  "message": "Show Aarav's marks",
  "session_id": "uuid-string"
}
```

**Response:**
```json
{
  "message": "Here are Aarav's marks...",
  "agentId": "school_management_agent",
  "timestamp": "2025-11-20T10:30:00",
  "session_id": "uuid-string"
}
```

#### 3. **GET /api/health**

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-20T10:30:00"
}
```

---

## 🗂️ Session Management

### Frontend Session Strategy

The frontend uses **Zustand** to manage multiple chat sessions:

```typescript
interface Session {
  id: string;           // Frontend session ID
  title: string;
  createdAt: number;
  messages: Message[];
}
```

### Backend Session Mapping

The `chatService.ts` maintains a **Map** to link frontend sessions to backend sessions:

```typescript
// Frontend Session ID → Backend Session ID
sessionMap.set(frontendSessionId, backendSessionId);
```

**Why?**
- Frontend supports multiple concurrent chat sessions
- Backend maintains conversation history per session
- Mapping allows seamless multi-session support

---

## 🎯 Message Flow Example

### User Query: "What are Aarav's marks?"

```
1. User types in InputBar
   ↓
2. Frontend adds user message to UI (instant feedback)
   ↓
3. chatService.sendMessageToBackend() called
   ↓
4. Check if backend session exists
   - If NO → POST /api/chat/new_session
   - Store session mapping
   ↓
5. POST /api/chat/send with message + session_id
   ↓
6. Backend (api.py):
   - Retrieves session history
   - Calls adk_router.process_message()
   ↓
7. ADK Router:
   - Builds full conversation context
   - Sends to school_management_agent
   ↓
8. Root Agent:
   - Analyzes query → "This is about marks"
   - Delegates to marks_agent
   ↓
9. Marks Agent:
   - Reads embedded MARKS_DATA
   - Filters for "Aarav Sharma"
   - Formats response
   ↓
10. Response flows back:
    ADK → adk_router → api.py → chatService → InputBar → UI
```

---

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# ADK Backend URL
VITE_ADK_API_URL=http://localhost:8000

# Main API URL (existing backend)
VITE_API_BASE_URL=http://localhost:3000
```

### CORS Configuration

The backend already has CORS enabled in `api.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Note:** If your frontend runs on a different port (e.g., 5173), update `allow_origins`.

---

## 🐛 Troubleshooting

### Backend Not Starting

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
cd apps/admin-web/dummy-multi-agent
pip install -r requirements.txt
```

### CORS Errors

**Error:** `Access to fetch at 'http://localhost:8000' has been blocked by CORS policy`

**Solution:**
Update `api.py` to include your frontend URL:
```python
allow_origins=["http://localhost:5173"],  # Add your frontend port
```

### Session Not Found

**Error:** Backend returns session not found

**Solution:**
The frontend automatically creates sessions. Check console for errors in `chatService.ts`.

### Backend Not Responding

**Check:**
1. Is uvicorn running? (`http://localhost:8000` should show status page)
2. Is the correct port configured? (Default: 8000)
3. Check backend logs for errors

**Test manually:**
```bash
curl -X POST http://localhost:8000/api/chat/new_session
curl -X POST http://localhost:8000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "session_id": "your-session-id"}'
```

---

## 🧪 Testing

### Manual Testing Steps

1. **Health Check**
   ```bash
   curl http://localhost:8000/api/health
   ```
   Expected: `{"status": "healthy", ...}`

2. **Create Session**
   ```bash
   curl -X POST http://localhost:8000/api/chat/new_session
   ```
   Expected: `{"session_id": "..."}`

3. **Send Message**
   ```bash
   curl -X POST http://localhost:8000/api/chat/send \
     -H "Content-Type: application/json" \
     -d '{"message": "Show Aarav marks", "session_id": "SESSION_ID"}'
   ```

### Automated Testing

Backend includes test script:
```bash
cd apps/admin-web/dummy-multi-agent
python test_api.py
```

---

## 🎨 UI Components

### No Changes Required

The following components work **without modification**:

- `ChatDock.tsx` - Main chat container
- `MessageList.tsx` - Message rendering
- `SessionSidebar.tsx` - Session management
- `ContextChips.tsx` - Context chips display
- `ChatLauncher.tsx` - Chat open/close button

**Why?** They consume state from `useChatStore`, which is updated by `InputBar.tsx` after backend responses.

---

## 🔄 Future Enhancements

### Potential Improvements

1. **Streaming Responses**
   - Use Server-Sent Events (SSE) for real-time streaming
   - Show typing indicators during agent processing

2. **Context Chips Integration**
   - Pass contextChips to backend for contextual queries
   - Backend can use chips to filter data

3. **Error Recovery**
   - Retry failed requests
   - Offline mode with cached responses

4. **Multi-Agent Visibility**
   - Show which agent responded
   - Display agent confidence scores

5. **Production Deployment**
   - Replace `sessionMap` with Redis for persistence
   - Use environment-based API URLs
   - Add authentication/authorization

---

## 📚 Additional Resources

- **Backend README**: `dummy-multi-agent/BACKEND_README.md`
- **ADK Documentation**: `dummy-multi-agent/README.md`
- **Implementation Summary**: `dummy-multi-agent/IMPLEMENTATION_SUMMARY.md`

---

## ✅ Integration Checklist

- [x] Backend FastAPI server configured
- [x] CORS enabled for frontend origin
- [x] Session management implemented
- [x] Frontend chatService created
- [x] InputBar integrated with backend
- [x] Error handling implemented
- [x] Environment variables configured
- [x] Documentation complete

---

**Integration Status:** ✅ **COMPLETE**

The SchoolOS chatbot is now fully integrated with the ADK multi-agent backend!
