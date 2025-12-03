# SchoolOS - Dashboard & Multi-Agent Setup Guide

This guide will help you set up and run the SchoolOS admin dashboard (frontend) and the multi-agent chatbot system (backend) from scratch.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Multi-Agent System Setup](#multi-agent-system-setup)
4. [Frontend Dashboard Setup](#frontend-dashboard-setup)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)
7. [Architecture Overview](#architecture-overview)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Python 3.10+** - For the multi-agent backend
- **Node.js 18+** - For the frontend dashboard
- **pnpm** - Package manager for the frontend
- **Poetry** - Python dependency manager
- **Git** - Version control

---

## System Requirements

### Operating System
- macOS (recommended)
- Linux
- Windows (with WSL2)

### Hardware
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 2GB free space
- **Internet**: Required for initial setup and Google Gemini API calls

---

## Multi-Agent System Setup

The multi-agent system is an AI-powered chatbot orchestration using Google Gemini 2.0-flash, running on port **8004**.

### Step 1: Install Python

Check if Python is installed:
```bash
python3 --version
```

If not installed, download from [python.org](https://www.python.org/downloads/) or use a package manager:

**macOS (using Homebrew):**
```bash
brew install python@3.10
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3.10 python3.10-venv python3-pip
```

### Step 2: Install Poetry

Poetry is used for Python dependency management.

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

Add Poetry to your PATH (add to `~/.zshrc` or `~/.bashrc`):
```bash
export PATH="$HOME/.local/bin:$PATH"
```

Reload your shell:
```bash
source ~/.zshrc  # or source ~/.bashrc
```

Verify installation:
```bash
poetry --version
```

### Step 3: Set Up Google Gemini API Key

The agents use Google Gemini 2.0-flash model. You need an API key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Set it as an environment variable:

```bash
export GOOGLE_API_KEY="your-api-key-here"
```

To make it permanent, add to `~/.zshrc` or `~/.bashrc`:
```bash
echo 'export GOOGLE_API_KEY="your-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

### Step 4: Navigate to Backend Directory

```bash
cd /Applications/Projects/SchoolOS/School-OS/backend
```

### Step 5: Install Python Dependencies

Poetry will create a virtual environment and install all dependencies:

```bash
poetry install
```

This will install:
- FastAPI
- Uvicorn
- Google Generative AI SDK
- Pydantic
- All other required packages

### Step 6: Verify Agent Files

Ensure the following files exist in the multi-agent directory:

```bash
ls /Applications/Projects/SchoolOS/School-OS/apps/admin-web/dummy-multi-agent/
```

You should see:
- `api.py` - FastAPI server
- `agents.py` - Agent definitions and logic
- `agent_router.py` - Session management and routing
- `requirements.txt` - Python dependencies
- `README.md` - Agent documentation

### Step 7: Test the Setup

Start the agent server:

```bash
cd /Applications/Projects/SchoolOS/School-OS/backend
PYTHONPATH=/Applications/Projects/SchoolOS/School-OS/apps/admin-web/dummy-multi-agent:$PYTHONPATH poetry run uvicorn dummy_multi_agent.api:app --reload --port 8004
```

You should see:
```
🎓 SchoolOS Multi-Agent API Server
📍 Running on: http://localhost:8004
📚 API Docs: http://localhost:8004/docs

🤖 Available Agents:
   • Attendance Agent
   • Marks Agent
   • Fees Agent
   • Timetable Agent
   • HR Agent
   • Budget Agent
   • Email Agent
```

Test the API:
```bash
curl http://localhost:8004/health
```

---

## Frontend Dashboard Setup

The frontend is built with React, TypeScript, Vite, and Tailwind CSS.

### Step 1: Install Node.js

Check if Node.js is installed:
```bash
node --version
```

If not installed, download from [nodejs.org](https://nodejs.org/) (LTS version recommended) or use a package manager:

**macOS (using Homebrew):**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify installation:
```bash
node --version  # Should be v18.x or higher
npm --version
```

### Step 2: Install pnpm

pnpm is a fast, disk space-efficient package manager.

```bash
npm install -g pnpm
```

Verify installation:
```bash
pnpm --version
```

### Step 3: Navigate to Frontend Directory

```bash
cd /Applications/Projects/SchoolOS/School-OS/apps/admin-web
```

### Step 4: Install Frontend Dependencies

This will install all required packages (React, TypeScript, Vite, Tailwind, Zustand, etc.):

```bash
pnpm install
```

This may take a few minutes. pnpm will:
- Read `package.json`
- Download all dependencies
- Create `node_modules/` directory
- Generate `pnpm-lock.yaml`

### Step 5: Configure Environment Variables

Create a `.env` file in the `admin-web` directory:

```bash
cd /Applications/Projects/SchoolOS/School-OS/apps/admin-web
touch .env
```

Add the following content to `.env`:
```env
# Multi-Agent API URL
VITE_ADK_API_URL=http://localhost:8004

# Backend API URL (if using main backend)
VITE_API_URL=http://localhost:8000
```

### Step 6: Verify Frontend Structure

Ensure the following directories exist:
```bash
ls -la /Applications/Projects/SchoolOS/School-OS/apps/admin-web/src/
```

You should see:
- `app/` - Main application code
- `components/` - React components
- `stores/` - State management (Zustand)
- `services/` - API services
- `mockDataProviders/` - Mock data for testing

---

## Running the Application

### Full Stack Startup

You'll need **two terminal windows/tabs**:

#### Terminal 1: Start Multi-Agent Backend

```bash
cd /Applications/Projects/SchoolOS/School-OS/backend
PYTHONPATH=/Applications/Projects/SchoolOS/School-OS/apps/admin-web/dummy-multi-agent:$PYTHONPATH poetry run uvicorn dummy_multi_agent.api:app --reload --port 8004
```

**Expected output:**
```
🎓 SchoolOS Multi-Agent API Server
============================================================
📍 Running on: http://localhost:8004
📚 API Docs: http://localhost:8004/docs
============================================================

🤖 Available Agents:
   • Attendance Agent - Track student attendance
   • Marks Agent - Academic performance insights
   • Fees Agent - Payment status & dues
   • Timetable Agent - Class schedules
   • HR Agent - Staff management & leaves
   • Budget Agent - Expense tracking & approvals
   • Email Agent - Send notifications
============================================================

INFO:     Uvicorn running on http://0.0.0.0:8004 (Press CTRL+C to quit)
INFO:     Started reloader process
```

#### Terminal 2: Start Frontend Dashboard

```bash
cd /Applications/Projects/SchoolOS/School-OS/apps/admin-web
pnpm run dev
```

**Expected output:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Access the Application

1. **Frontend Dashboard**: Open browser to `http://localhost:5173`
2. **Agent API Docs**: `http://localhost:8004/docs` (interactive API documentation)
3. **Agent Health Check**: `http://localhost:8004/health`

---

## Troubleshooting

### Multi-Agent Issues

#### Problem: `ModuleNotFoundError: No module named 'google.generativeai'`
**Solution:**
```bash
cd /Applications/Projects/SchoolOS/School-OS/backend
poetry install
```

#### Problem: `google.api_core.exceptions.PermissionDenied: API key not valid`
**Solution:**
```bash
export GOOGLE_API_KEY="your-valid-api-key"
# Restart the agent server
```

#### Problem: `Port 8004 already in use`
**Solution:**
```bash
# Kill the process using port 8004
lsof -ti:8004 | xargs kill -9
# Restart the server
```

#### Problem: `ImportError: No module named 'agents'`
**Solution:** Ensure `PYTHONPATH` is set correctly:
```bash
PYTHONPATH=/Applications/Projects/SchoolOS/School-OS/apps/admin-web/dummy-multi-agent:$PYTHONPATH poetry run uvicorn dummy_multi_agent.api:app --reload --port 8004
```

### Frontend Issues

#### Problem: `command not found: pnpm`
**Solution:**
```bash
npm install -g pnpm
```

#### Problem: `command not found: node`
**Solution:** Install Node.js (see Step 1 in Frontend Setup)

#### Problem: Port 5173 already in use
**Solution:**
```bash
# Kill the process
lsof -ti:5173 | xargs kill -9
# Or use a different port
pnpm run dev --port 5174
```

#### Problem: Frontend can't connect to agents
**Solution:**
1. Verify agents are running: `curl http://localhost:8004/health`
2. Check `.env` file has correct `VITE_ADK_API_URL=http://localhost:8004`
3. Restart frontend: `Ctrl+C` then `pnpm run dev`

#### Problem: `Module not found` errors
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Problem: TypeScript errors
**Solution:**
```bash
# Clear TypeScript cache
pnpm run clean
pnpm run dev
```

### General Issues

#### Problem: Changes not reflecting
**Solution:**
- Both servers run with hot-reload enabled
- Agent server: Save Python files to auto-reload
- Frontend: Save TypeScript/React files to auto-reload
- Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

#### Problem: API returns 500 errors
**Solution:**
1. Check agent server logs in Terminal 1
2. Verify Google API key is valid
3. Check `/tmp/agent.log` if running with nohup
4. Visit `http://localhost:8004/docs` to test endpoints manually

---

## Architecture Overview

### Multi-Agent System (Port 8004)

```
┌─────────────────────────────────────────────────────────┐
│                   FastAPI Server (api.py)               │
│                     Port: 8004                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Agent Router (agent_router.py)             │
│          Session Management & Message Routing           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Agents (agents.py)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │ • school_management_agent (orchestrator)          │  │
│  │ • attendance_agent (attendance tracking)          │  │
│  │ • marks_agent (exam results & performance)        │  │
│  │ • fees_agent (payment management)                 │  │
│  │ • timetable_agent (scheduling)                    │  │
│  │ • hr_agent (staff management)                     │  │
│  │ • budget_agent (expense tracking)                 │  │
│  │ • email_agent (notifications via Gmail SMTP)      │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
          Google Gemini 2.0-flash API
```

### Frontend Dashboard (Port 5173)

```
┌─────────────────────────────────────────────────────────┐
│               React + TypeScript + Vite                 │
│                     Port: 5173                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Components:                                       │  │
│  │  • ChatDock.tsx (main chat interface)            │  │
│  │  • InputBar.tsx (message input)                  │  │
│  │  • MessageBubble.tsx (chat messages)             │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ State Management (Zustand):                      │  │
│  │  • useChatStore.ts (chat sessions & messages)    │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Services:                                        │  │
│  │  • chatService.ts (API communication)            │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼ HTTP REST API
┌─────────────────────────────────────────────────────────┐
│           Multi-Agent Backend (Port 8004)               │
└─────────────────────────────────────────────────────────┘
```

### Agent Capabilities

| Agent | Domain | Example Queries |
|-------|--------|-----------------|
| **School Management** | Orchestrator & routing | "Route to attendance", "Show all modules" |
| **Attendance** | Student attendance tracking | "Who has low attendance in 5B?", "Show absentees today" |
| **Marks** | Exam results & performance | "Who scored lowest in Maths?", "Top 3 students in 9C" |
| **Fees** | Payment management | "Who hasn't paid fees?", "Show pending dues for Grade 1" |
| **Timetable** | Class scheduling | "Show 8A's timetable", "Which teacher has most classes?" |
| **HR** | Staff management | "List Science teachers", "Staff on leave this week" |
| **Budget** | Expense tracking | "Show Annual Day budget", "Pending approvals" |
| **Email** | Send notifications | "Email fee reminders", "Send attendance report" |

### Data Flow

1. **User sends message** → Frontend (`InputBar.tsx`)
2. **Store updates** → `useChatStore` (Zustand)
3. **API call** → `chatService.ts` → `POST http://localhost:8004/api/chat/send`
4. **Backend receives** → `api.py` → `agent_router.py`
5. **Agent detection** → `detect_agent()` identifies relevant agent
6. **Agent processes** → `get_agent_response()` queries Google Gemini with context
7. **Response flows back** → Backend → Frontend → UI update

---

## Quick Reference Commands

### Start Everything (Copy-Paste Ready)

**Terminal 1 - Agents:**
```bash
cd /Applications/Projects/SchoolOS/School-OS/backend && PYTHONPATH=/Applications/Projects/SchoolOS/School-OS/apps/admin-web/dummy-multi-agent:$PYTHONPATH poetry run uvicorn dummy_multi_agent.api:app --reload --port 8004
```

**Terminal 2 - Frontend:**
```bash
cd /Applications/Projects/SchoolOS/School-OS/apps/admin-web && pnpm run dev
```

### Useful Commands

```bash
# Check if ports are in use
lsof -i :8004  # Agent backend
lsof -i :5173  # Frontend

# Kill processes on ports
lsof -ti:8004 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# View agent logs (if using nohup)
tail -f /tmp/agent.log

# Reinstall dependencies
cd /Applications/Projects/SchoolOS/School-OS/backend && poetry install
cd /Applications/Projects/SchoolOS/School-OS/apps/admin-web && pnpm install

# Clear caches
cd /Applications/Projects/SchoolOS/School-OS/apps/admin-web && rm -rf node_modules pnpm-lock.yaml && pnpm install
```

---

## Environment Variables Reference

### Backend (`~/.zshrc` or `~/.bashrc`)
```bash
export GOOGLE_API_KEY="your-google-gemini-api-key"
export PYTHONPATH="/Applications/Projects/SchoolOS/School-OS/apps/admin-web/dummy-multi-agent:$PYTHONPATH"
```

### Frontend (`.env` file in `apps/admin-web/`)
```env
VITE_ADK_API_URL=http://localhost:8004
VITE_API_URL=http://localhost:8000
```

---

## Additional Resources

- **Google Gemini API**: [https://ai.google.dev/](https://ai.google.dev/)
- **FastAPI Docs**: [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
- **React Docs**: [https://react.dev/](https://react.dev/)
- **Vite Docs**: [https://vitejs.dev/](https://vitejs.dev/)
- **pnpm Docs**: [https://pnpm.io/](https://pnpm.io/)
- **Poetry Docs**: [https://python-poetry.org/docs/](https://python-poetry.org/docs/)

---

## Support

If you encounter issues not covered in this guide:

1. Check the terminal logs for error messages
2. Visit API docs at `http://localhost:8004/docs`
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed
5. Try clearing caches and reinstalling dependencies

---

**Version**: 2.0.0
**Last Updated**: 28 November 2025
**Maintained by**: SchoolOS Team
