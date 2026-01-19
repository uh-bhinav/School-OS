# 🚀 Running SchoolOS with ADK Multi-Agent Backend

## Quick Start

### Option 1: Automated Startup (Recommended)

```bash
cd apps/admin-web
./start-dev.sh
```

This script will:
- ✅ Install dependencies if needed
- ✅ Start backend on port 8000
- ✅ Start frontend on port 5173
- ✅ Display logs in real-time

### Option 2: Manual Startup

**Terminal 1 - Backend:**
```bash
cd apps/admin-web/dummy-multi-agent
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd apps/admin-web
pnpm install
pnpm dev
```

---

## 🧪 Testing the Integration

1. **Open your browser**: http://localhost:5173
2. **Log in** to SchoolOS
3. **Click the chat icon** (bottom-right corner)
4. **Try these queries**:
   - "Show Aarav's marks"
   - "What is the attendance for class 5A?"
   - "Show pending fees for Diya Patel"
   - "Display timetable for Monday"

---

## 🎯 What's Integrated?

### ✅ Backend (ADK Multi-Agent System)

- **Root Agent**: `school_management_agent` - Routes queries to specialists
- **Sub-Agents**:
  - `attendance_agent` - Handles attendance queries
  - `marks_agent` - Handles marks/grades queries
  - `fees_agent` - Handles fee-related queries
  - `timetable_agent` - Handles schedule queries

### ✅ Frontend (React + Zustand)

- **Chat UI**: Full-featured chatbot interface
- **Session Management**: Multiple concurrent conversations
- **Real-time Messaging**: Instant user feedback
- **Error Handling**: Graceful error messages

### ✅ Communication Layer

- **API Service**: `src/app/services/chatService.ts`
- **REST Integration**: HTTP fetch-based communication
- **Session Mapping**: Frontend ↔ Backend session sync

---

## 📁 File Changes Summary

### Created Files

1. **`src/app/services/chatService.ts`**
   - ADK backend API client
   - Session management
   - Error handling

2. **`ADK_INTEGRATION_GUIDE.md`**
   - Complete integration documentation
   - Architecture diagrams
   - Troubleshooting guide

3. **`start-dev.sh`**
   - Automated startup script
   - Dependency checking
   - Log management

### Modified Files

1. **`src/app/components/chatbot/InputBar.tsx`**
   - Replaced mock API with ADK backend
   - Added async message handling
   - Improved error messages

2. **`dummy-multi-agent/api.py`**
   - Added CORS for port 5173
   - Existing endpoints unchanged

3. **`.env.example`**
   - Added `VITE_ADK_API_URL` configuration

---

## 🔍 Verification Checklist

### Backend Health Check
```bash
curl http://localhost:8000/api/health
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-20T..."
}
```

### Create Session
```bash
curl -X POST http://localhost:8000/api/chat/new_session
```
Expected response:
```json
{
  "session_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### Send Message
```bash
curl -X POST http://localhost:8000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show Aarav marks",
    "session_id": "YOUR_SESSION_ID"
  }'
```

---

## 🐛 Common Issues

### Port Already in Use

**Error**: `Address already in use: 8000`

**Solution**:
```bash
lsof -ti:8000 | xargs kill -9
```

### CORS Error

**Error**: `Access to fetch blocked by CORS policy`

**Solution**: Check that `api.py` includes your frontend port:
```python
allow_origins=["http://localhost:5173"]
```

### Module Not Found

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
cd apps/admin-web/dummy-multi-agent
pip install -r requirements.txt
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────┐
│                  User Browser                   │
│            http://localhost:5173                │
└────────────────────┬────────────────────────────┘
                     │
                     │ HTTP REST
                     │
        ┌────────────▼────────────┐
        │   React Frontend        │
        │   • ChatDock            │
        │   • InputBar            │
        │   • chatService         │
        └────────────┬────────────┘
                     │
                     │ fetch()
                     │
        ┌────────────▼────────────┐
        │   FastAPI Backend       │
        │   http://localhost:8000 │
        │   • /api/chat/send      │
        │   • Sessions            │
        └────────────┬────────────┘
                     │
                     │ Agent Delegation
                     │
        ┌────────────▼────────────┐
        │   ADK Root Agent        │
        │   school_management_*   │
        └────────┬────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
   ┌────▼───┐       ┌────▼───┐
   │ Marks  │  ...  │ Fees   │
   │ Agent  │       │ Agent  │
   └────────┘       └────────┘
```

---

## 🎉 Success Indicators

When everything is working correctly:

1. ✅ Backend shows: `INFO:     Uvicorn running on http://0.0.0.0:8000`
2. ✅ Frontend shows: `Local:   http://localhost:5173/`
3. ✅ Chat icon appears in bottom-right of dashboard
4. ✅ Clicking chat icon opens chat interface
5. ✅ Sending "Show Aarav's marks" returns actual data
6. ✅ No CORS errors in browser console

---

## 📚 Documentation

- **Full Integration Guide**: `ADK_INTEGRATION_GUIDE.md`
- **Backend Details**: `dummy-multi-agent/BACKEND_README.md`
- **Agent Architecture**: `dummy-multi-agent/README.md`

---

## 🚧 Next Steps

The integration is **COMPLETE** and ready to use!

Optional enhancements:
- Add streaming responses (SSE)
- Integrate context chips with backend
- Add authentication to backend endpoints
- Deploy to production environment

---

**Status**: ✅ **PRODUCTION READY** for development testing

For questions or issues, see `ADK_INTEGRATION_GUIDE.md` troubleshooting section.
