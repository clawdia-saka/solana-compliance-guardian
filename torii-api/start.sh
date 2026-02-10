#!/bin/bash
# Torii API Quick Start Script

set -e

cd "$(dirname "$0")"

echo "⛩️  Starting Torii API..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if port 3000 is available
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 3000 is already in use"
    echo "Attempting to kill existing process..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start server
echo "🚀 Starting server..."
npm start
