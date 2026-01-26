#!/bin/bash
# Setup script for Exam Period Scheduling System

echo "🎓 School OS - Exam Period Scheduling Setup"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend directory exists
if [ ! -d "/Users/apple/School-OS/backend" ]; then
    echo -e "${RED}Error: Backend directory not found${NC}"
    exit 1
fi

cd /Users/apple/School-OS/backend

echo "Step 1: Installing Python dependencies..."
echo "=========================================="
poetry install || {
    echo -e "${RED}Failed to install dependencies${NC}"
    exit 1
}

echo ""
echo "Step 2: Running database migrations..."
echo "======================================="
# Run Alembic migrations
poetry run alembic upgrade head || {
    echo -e "${RED}Migration failed${NC}"
    echo -e "${YELLOW}Please ensure your database is running and connection details are correct in .env${NC}"
    exit 1
}

echo ""
echo "Step 3: Seeding Indian holidays (2026)..."
echo "=========================================="
# Start the backend temporarily to seed holidays
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Seed holidays
curl -X POST "http://localhost:8000/api/v1/exam-periods/holidays/seed?year=2026" \
    -H "Content-Type: application/json" || {
    echo -e "${YELLOW}Warning: Failed to seed holidays. You can do this manually later.${NC}"
}

# Stop the backend
kill $BACKEND_PID

echo ""
echo -e "${GREEN}✅ Backend setup complete!${NC}"
echo ""

# Frontend setup
echo "Step 4: Setting up frontend..."
echo "==============================="
cd /Users/apple/School-OS/apps/admin-web

if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Frontend package.json not found${NC}"
    exit 1
fi

echo "Installing frontend dependencies..."
pnpm install || {
    echo -e "${RED}Failed to install frontend dependencies${NC}"
    exit 1
}

echo ""
echo -e "${GREEN}✅ Frontend setup complete!${NC}"
echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Start the backend:"
echo "   cd /Users/apple/School-OS/backend"
echo "   poetry run uvicorn app.main:app --reload"
echo ""
echo "2. Start the frontend (in a new terminal):"
echo "   cd /Users/apple/School-OS/apps/admin-web"
echo "   pnpm dev"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "4. Test the new exam scheduler:"
echo "   - Navigate to Exams section"
echo "   - Click 'Schedule Exam Period'"
echo "   - Follow the 3-step wizard"
echo ""
echo "📚 Documentation:"
echo "   /Users/apple/School-OS/backend/docs/EXAM_PERIOD_SCHEDULING_IMPLEMENTATION.md"
echo ""
echo -e "${GREEN}Happy scheduling! 🎓${NC}"
