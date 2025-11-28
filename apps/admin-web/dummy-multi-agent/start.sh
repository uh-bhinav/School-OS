#!/bin/bash
# SchoolOS Multi-Agent Server Start Script

echo ""
echo "=============================================="
echo "🎓 Starting SchoolOS Multi-Agent Server..."
echo "=============================================="
echo ""

# Check if dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
fi

# Start the server
echo "🚀 Starting server on port 8004..."
echo ""
python api.py
