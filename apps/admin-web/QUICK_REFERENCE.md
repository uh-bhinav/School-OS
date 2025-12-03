# 🚀 ADK Integration - Quick Reference

## Start Services

### Automated (Recommended)
```bash
cd apps/admin-web
./start-dev.sh
```

### Manual
```bash
# Terminal 1 - Backend
cd apps/admin-web/dummy-multi-agent
source venv/bin/activate  # Create venv first if needed
uvicorn api:app --reload --port 8000

# Terminal 2 - Frontend
cd apps/admin-web
pnpm dev
```

## Test Backend Health
```bash
cd apps/admin-web/dummy-multi-agent
./test-health.sh
```

## URLs
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Example Queries
- "Show Aarav's marks"
- "What is the attendance for class 5A?"
- "Show pending fees for Diya Patel"
- "Display timetable for Monday"

## Troubleshooting

### Backend not starting?
```bash
cd apps/admin-web/dummy-multi-agent
pip install -r requirements.txt
```

### Port already in use?
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### CORS errors?
Check `api.py` includes:
```python
allow_origins=["http://localhost:5173"]
```

## File Structure
```
apps/admin-web/
├── src/app/
│   ├── services/chatService.ts        ← Backend API client
│   └── components/chatbot/
│       └── InputBar.tsx               ← Modified for integration
├── dummy-multi-agent/
│   ├── api.py                         ← FastAPI server
│   ├── adk_router.py                  ← ADK orchestration
│   └── manager/agent.py               ← Root + sub-agents
├── start-dev.sh                       ← Automated startup
├── ADK_INTEGRATION_GUIDE.md           ← Full documentation
└── INTEGRATION_STATUS.md              ← Quick start guide
```

## Documentation
- **Full Guide**: `ADK_INTEGRATION_GUIDE.md`
- **Changes**: `CODE_CHANGES_SUMMARY.md`
- **Status**: `INTEGRATION_STATUS.md`

---

**Status**: ✅ Ready to run!
