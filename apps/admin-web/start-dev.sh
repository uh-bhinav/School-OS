#!/bin/bash

# 🚀 SchoolOS ADK Integration - Development Startup Script
# This script starts both the frontend and backend servers

set -e

echo "🎓 Starting SchoolOS with ADK Multi-Agent Backend..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}📂 Project Root: ${NC}$PROJECT_ROOT"
echo ""

# Check if backend dependencies are installed
if [ ! -d "$SCRIPT_DIR/dummy-multi-agent/venv" ]; then
    echo -e "${YELLOW}⚠️  Backend virtual environment not found. Creating...${NC}"
    cd "$SCRIPT_DIR/dummy-multi-agent"
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    echo ""
fi

# Check if frontend dependencies are installed
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies not found. Installing...${NC}"
    cd "$SCRIPT_DIR"
    pnpm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    echo ""
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup EXIT INT TERM

# Start backend
echo -e "${BLUE}🤖 Starting ADK Backend (port 8000)...${NC}"
cd "$SCRIPT_DIR/dummy-multi-agent"
source venv/bin/activate
uvicorn api:app --reload --port 8000 > /tmp/schoolos-backend.log 2>&1 &
BACKEND_PID=$!
deactivate

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running at http://localhost:8000${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may not be ready yet. Check logs at /tmp/schoolos-backend.log${NC}"
fi

echo ""

# Start frontend
echo -e "${BLUE}🌐 Starting Frontend (port 5173)...${NC}"
cd "$SCRIPT_DIR"
pnpm dev > /tmp/schoolos-frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 3

echo -e "${GREEN}✅ Frontend is starting at http://localhost:5173${NC}"
echo ""

# Print status
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ SchoolOS is running!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${BLUE}Frontend:${NC}  http://localhost:5173"
echo -e "  ${BLUE}Backend:${NC}   http://localhost:8000"
echo -e "  ${BLUE}API Docs:${NC}  http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}📋 Logs:${NC}"
echo -e "  Backend:  tail -f /tmp/schoolos-backend.log"
echo -e "  Frontend: tail -f /tmp/schoolos-frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Keep script running and show logs
tail -f /tmp/schoolos-backend.log /tmp/schoolos-frontend.log
