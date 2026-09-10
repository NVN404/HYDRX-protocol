#!/usr/bin/env bash

# HydrX Protocol - Service Terminator
# Cleanly terminates Relayer (3005), Dashboard (4005), and Frontend (3000)

echo "=================================================================="
echo "HYDRX PROTOCOL - STOPPING ALL LOCAL SERVICES"
echo "=================================================================="

PORTS=(3000 3003 3005 4005)

for PORT in "${PORTS[@]}"; do
  PIDS=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "[*] Killing process on port $PORT (PIDs: $PIDS)..."
    kill -9 $PIDS 2>/dev/null || true
  else
    echo "[ ] Port $PORT is already free."
  fi
done

# Also kill any orphaned node processes for relayer/dashboard/iot-simulator
pkill -f "node relayer/server.js" 2>/dev/null || true
pkill -f "node dashboard/server.js" 2>/dev/null || true
pkill -f "node iot-simulator/index.js" 2>/dev/null || true

echo "------------------------------------------------------------------"
echo "[OK] All HydrX background processes have been terminated."
echo "=================================================================="
