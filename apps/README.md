# 🎓 SchoolOS - Demo Setup Guide

> A comprehensive guide for teammates to run the SchoolOS demo environment from scratch.

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Prerequisites](#-prerequisites)
3. [Project Structure](#-project-structure)
4. [Quick Start (TL;DR)](#-quick-start-tldr)
5. [Detailed Setup Guide](#-detailed-setup-guide)
   - [Terminal 1: Backend Server (Port 8000)](#terminal-1-backend-server-port-8000)
   - [Terminal 2: Frontend Admin Web (Port 5173)](#terminal-2-frontend-admin-web-port-5173)
   - [Terminal 3: ADK Multi-Agent Chatbot (Port 8004)](#terminal-3-adk-multi-agent-chatbot-port-8004)
   - [Terminal 4: Timetable Backend Server (Port 8010)](#terminal-4-timetable-backend-server-port-8010)
   - [Terminal 5: Timetable Frontend (Port 3000)](#terminal-5-timetable-frontend-port-3000)
6. [Environment Variables](#-environment-variables)
7. [Using the Application](#-using-the-application)
8. [Troubleshooting](#-troubleshooting)
9. [Port Summary](#-port-summary)

---

## 🌟 Overview

SchoolOS is a comprehensive school management system with:

- **Admin Web Dashboard** - React-based frontend with mock data support
- **Backend API** - FastAPI server handling authentication and real API calls
- **ADK Multi-Agent Chatbot** - AI-powered assistant using Google Gemini
- **Timetable Generator** - Constraint-based scheduler with dedicated frontend/backend

**Demo Mode**: The application runs primarily on the frontend with mock data (MSW - Mock Service Worker). Only authentication and user role recognition require the real backend.

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Tool | Version | Check Command | Installation |
|------|---------|---------------|--------------|
| **Node.js** | 18+ | `node --version` | [nodejs.org](https://nodejs.org) |
| **pnpm** | 10+ | `pnpm --version` | `npm install -g pnpm` |
| **Python** | 3.10+ | `python3 --version` | [python.org](https://python.org) |
| **pip** | Latest | `pip3 --version` | Comes with Python |

### Verify Installation

```bash
# Run these commands to verify everything is installed
node --version      # Should show v18.x.x or higher
pnpm --version      # Should show 10.x.x or higher
python3 --version   # Should show 3.10.x or higher
pip3 --version      # Should show pip version
```

---

## 📁 Project Structure

```
School-OS/
├── apps/
│   └── admin-web/                    # Main Admin Dashboard (React + Vite)
│       ├── src/
│       │   └── app/
│       │       └── Timetable/
│       │           ├── server/       # Timetable Backend (FastAPI)
│       │           └── frontend/     # Timetable Frontend (React)
│       └── dummy-multi-agent/        # ADK Chatbot Server
├── backend/                          # Main Backend Server (FastAPI)
└── package.json                      # Root package.json (pnpm workspace)
```

---

## ⚡ Quick Start (TL;DR)

If you're in a hurry, here are all 5 terminals you need to run:

```bash
# Terminal 1: Backend (Port 8000)
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend (Port 5173)
cd apps/admin-web && pnpm dev

# Terminal 3: ADK Chatbot (Port 8004)
cd apps/admin-web/dummy-multi-agent && source venv/bin/activate && uvicorn api:app --reload --port 8004

# Terminal 4: Timetable Server (Port 8010)
cd apps/admin-web/src/app/Timetable/server && source venv/bin/activate && python -m app.main

# Terminal 5: Timetable Frontend (Port 3000)
cd apps/admin-web/src/app/Timetable/frontend && npm run dev
```

**First time setup?** Continue reading for detailed step-by-step instructions below.

---

## 📖 Detailed Setup Guide

### Step 0: Clone and Navigate to the Project

```bash
# If you haven't cloned the repo yet
git clone <repository-url>
cd School-OS

# Or if you already have it, make sure you're on the correct branch
git checkout final/demo
git pull origin final/demo
```

---

### Terminal 1: Backend Server (Port 8000)

The main backend server handles authentication, user roles, and real API calls.

#### First Time Setup

```bash
# Step 1: Navigate to the backend directory
cd backend

# Step 2: Create a Python virtual environment
python3 -m venv venv

# Step 3: Activate the virtual environment
source venv/bin/activate
# You should see (venv) at the beginning of your terminal prompt

# Step 4: Install all Python dependencies
pip install -r requirements.txt
# This might take a few minutes on first run

# Step 5: Verify the .env file exists in the root directory
# The .env file should already be configured. If not, check with your team lead.
ls -la ../.env
```

#### Running the Backend Server

```bash
# Make sure you're in the backend directory with venv activated
cd backend
source venv/bin/activate

# Start the server
uvicorn app.main:app --reload --port 8000
```

#### Expected Output

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx]
✅ Database engine initialized
✅ Supabase client initialized
INFO:     Application startup complete.
```

#### Verify It's Running

Open in browser: [http://localhost:8000/docs](http://localhost:8000/docs) - You should see the FastAPI Swagger documentation.

---

### Terminal 2: Frontend Admin Web (Port 5173)

The main React frontend dashboard.

#### First Time Setup

```bash
# Step 1: Navigate to the root directory (if not already there)
cd /path/to/School-OS

# Step 2: Install ALL dependencies for the entire monorepo
pnpm install
# This installs dependencies for all workspaces (may take a few minutes)
```

#### Running the Frontend

```bash
# Navigate to the admin-web directory
cd apps/admin-web

# Start the development server
pnpm dev
```

#### Expected Output

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

#### Verify It's Running

Open in browser: [http://localhost:5173](http://localhost:5173) - You should see the SchoolOS login page or dashboard.

---

### Terminal 3: ADK Multi-Agent Chatbot (Port 8004)

The AI-powered chatbot assistant using Google Gemini.

#### First Time Setup

```bash
# Step 1: Navigate to the dummy-multi-agent directory
cd apps/admin-web/dummy-multi-agent

# Step 2: Create a Python virtual environment
python3 -m venv venv

# Step 3: Activate the virtual environment
source venv/bin/activate

# Step 4: Install Python dependencies
pip install -r requirements.txt

# Step 5: Verify or create the .env file
# The .env file should contain your Google API key
cat .env
# Should show: GOOGLE_API_KEY=your_api_key_here

# If .env doesn't exist, create it:
echo "GOOGLE_API_KEY=your_google_api_key_here" > .env
```

> ⚠️ **Important**: You need a valid Google API key for the Gemini AI. Get one from [Google AI Studio](https://makersuite.google.com/app/apikey).

#### Running the ADK Chatbot Server

```bash
# Make sure you're in the dummy-multi-agent directory with venv activated
cd apps/admin-web/dummy-multi-agent
source venv/bin/activate

# Start the server
uvicorn api:app --reload --port 8004
```

#### Expected Output

```
INFO:     Uvicorn running on http://127.0.0.1:8004 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx]
INFO:     Application startup complete.
```

#### Verify It's Running

Open in browser: [http://localhost:8004/docs](http://localhost:8004/docs) - You should see the Multi-Agent API documentation.

---

### Terminal 4: Timetable Backend Server (Port 8010)

The constraint-based timetable generation backend using Google OR-Tools.

#### First Time Setup

```bash
# Step 1: Navigate to the timetable server directory
cd apps/admin-web/src/app/Timetable/server

# Step 2: Create a Python virtual environment
python3 -m venv venv

# Step 3: Activate the virtual environment
source venv/bin/activate

# Step 4: Install Python dependencies
pip install -r requirements.txt
# This includes OR-Tools which might take a few minutes

# Step 5: (Optional) Create a .env file if needed
# Copy from .env.example if it exists
cp .env.example .env
# Edit .env with your configuration if needed
```

#### Running the Timetable Server

```bash
# Make sure you're in the server directory with venv activated
cd apps/admin-web/src/app/Timetable/server
source venv/bin/activate

# Start the server
python -m app.main
# OR alternatively:
# uvicorn app.main:app --reload --port 8010
```

#### Expected Output

```
INFO:     Uvicorn running on http://0.0.0.0:8010 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx]
INFO:     Application startup complete.
```

#### Verify It's Running

Open in browser: [http://localhost:8010/docs](http://localhost:8010/docs) - You should see the Timetable Generator API documentation.

---

### Terminal 5: Timetable Frontend (Port 3000)

The React frontend for the timetable generator.

#### First Time Setup

```bash
# Step 1: Navigate to the timetable frontend directory
cd apps/admin-web/src/app/Timetable/frontend

# Step 2: Install npm dependencies
npm install
# This might take a few minutes

# Step 3: (Optional) Configure environment variables
# Create .env if it doesn't exist
echo "VITE_API_BASE_URL=http://localhost:8010" > .env
echo "VITE_USE_MOCK_API=false" >> .env
```

#### Running the Timetable Frontend

```bash
# Make sure you're in the frontend directory
cd apps/admin-web/src/app/Timetable/frontend

# Start the development server
npm run dev
```

#### Expected Output

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

#### Verify It's Running

Open in browser: [http://localhost:3000](http://localhost:3000) - You should see the Timetable Generator landing page.

---

## 🔐 Environment Variables

### Root `.env` (School-OS/.env)

This file should already exist with Supabase and API configurations:

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_supabase_key
DATABASE_URL=your_database_url

# API Keys
GOOGLE_API_KEY=your_google_api_key
```

### Admin Web `.env` (apps/admin-web/.env)

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Demo Mode - Set to true for mock data
VITE_DEMO_MODE=true

# Backend API
VITE_API_BASE_URL=http://localhost:8000/api/v1

# ADK Chatbot
VITE_ADK_API_URL=http://localhost:8004
```

### ADK Multi-Agent `.env` (apps/admin-web/dummy-multi-agent/.env)

```bash
# Google Gemini AI
GOOGLE_API_KEY=your_google_api_key
```

---

## 🎮 Using the Application

### Demo Mode Access

With `VITE_DEMO_MODE=true`, you can:

1. **Access the Dashboard** - Navigate to [http://localhost:5173](http://localhost:5173)
2. **Login** - Use GitHub OAuth or demo credentials (if configured)
3. **Explore Features** - Most features work with mock data
4. **Use the Chatbot** - Click the chat icon to interact with the AI assistant

### Available Roles

The application supports multiple roles:
- **Principal** - School-level administration
- **Super Admin** - Multi-school group management
- **Teacher** - Classroom management (separate app)
- **Parent** - Student monitoring (separate app)

### Key Features to Demo

1. **Dashboard** - Overview of school metrics
2. **AI Chatbot** - Ask about attendance, marks, fees, timetables, HR, budget
3. **Timetable Generator** - Create optimized schedules
4. **Attendance Management**
5. **Fee Management**
6. **Staff HR Management**

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Command not found: pnpm"

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version
```

#### 2. "Port already in use"

```bash
# Find what's using the port (e.g., 8000)
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use a different port
uvicorn app.main:app --reload --port 8001
```

#### 3. "Module not found" in Python

```bash
# Make sure you activated the virtual environment
source venv/bin/activate

# Check if you're in the correct directory
pwd

# Reinstall dependencies
pip install -r requirements.txt
```

#### 4. "venv not found"

```bash
# Create the virtual environment first
python3 -m venv venv

# Then activate it
source venv/bin/activate
```

#### 5. Frontend not connecting to backend

- Verify all servers are running (check each terminal)
- Check browser console for CORS errors
- Ensure `.env` files have correct URLs
- Try refreshing the page or clearing browser cache

#### 6. Chatbot not responding

- Verify Terminal 3 (ADK server) is running on port 8004
- Check if `GOOGLE_API_KEY` is set in `.env`
- Look for errors in the ADK terminal output

#### 7. Timetable generation failing

- Verify Terminal 4 (Timetable server) is running on port 8010
- Check Terminal 4 for error messages
- Ensure OR-Tools is properly installed

### Checking Server Health

```bash
# Backend health check
curl http://localhost:8000/api/v1/health

# ADK health check
curl http://localhost:8004/health

# Timetable health check
curl http://localhost:8010/health
```

---

## 🔌 Port Summary

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Backend API | 8000 | http://localhost:8000 | Authentication, real API calls |
| Admin Frontend | 5173 | http://localhost:5173 | Main dashboard |
| ADK Chatbot | 8004 | http://localhost:8004 | AI assistant backend |
| Timetable Server | 8010 | http://localhost:8010 | Timetable generation API |
| Timetable Frontend | 3000 | http://localhost:3000 | Timetable UI |

---

## 📞 Need Help?

If you encounter any issues not covered in this guide:

1. **Check the logs** in each terminal for error messages
2. **Search existing documentation** in the `docs/` folder
3. **Ask your team lead** for environment-specific configurations
4. **Check the Git history** for recent changes that might have broken something

---

## ✅ Checklist Before You Start

Use this checklist to ensure everything is set up correctly:

- [ ] Node.js 18+ installed
- [ ] pnpm installed globally
- [ ] Python 3.10+ installed
- [ ] Repository cloned and on `final/demo` branch
- [ ] Root `.env` file exists
- [ ] `apps/admin-web/.env` file configured
- [ ] `apps/admin-web/dummy-multi-agent/.env` file has `GOOGLE_API_KEY`
- [ ] All 5 terminals running without errors
- [ ] Can access http://localhost:5173 in browser

---

**Happy coding! 🚀**

*Last updated: February 2026*
