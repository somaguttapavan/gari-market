#!/usr/bin/env bash
# Start both backend and frontend together (cross-platform helper)
echo "Starting AgriGrowth backend + frontend..."
cd "$(dirname "$0")"

# Start Python backend in background
(cd backend && python main.py) &
BACKEND_PID=$!

echo "Backend started (PID $BACKEND_PID) — waiting 2s for it to boot..."
sleep 2

# Start Vite frontend
npm run dev

# On exit, also kill the backend
kill $BACKEND_PID 2>/dev/null
