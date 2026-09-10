#!/usr/bin/env bash
set -e

# ==============================================================================
# HydrX Protocol - Unified Local Runner
# Single command to launch: Relayer (3005) + Dashboard (4005) + Frontend (3000)
# ==============================================================================

# Script directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Text styling
BOLD="\033[1m"
CYAN="\033[36m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

echo -e "${CYAN}${BOLD}==================================================================${RESET}"
echo -e "${CYAN}${BOLD}           HYDRX PROTOCOL - UNIFIED LOCAL SYSTEM RUNNER           ${RESET}"
echo -e "${CYAN}${BOLD}==================================================================${RESET}"

# 1. Check Node.js and npm
if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] Node.js is not installed or not in PATH.${RESET}"
  exit 1
fi

NODE_VER=$(node -v)
echo -e "${GREEN}[OK] Node.js detected: ${NODE_VER}${RESET}"

# 2. Keypair Verification
if [ ! -f "wallet-keypair.json" ]; then
  if [ -f "wallet-keypair.json.example" ]; then
    echo -e "${YELLOW}[WARN] wallet-keypair.json not found. Creating from wallet-keypair.json.example...${RESET}"
    cp wallet-keypair.json.example wallet-keypair.json
  else
    echo -e "${YELLOW}[WARN] No wallet-keypair.json found. The relayer will generate an ephemeral session keypair.${RESET}"
  fi
fi

# 3. Terminate any previous lingering processes on target ports
echo -e "${CYAN}[*] Checking for port conflicts (3000, 3005, 4005)...${RESET}"
for PORT in 3000 3003 3005 4005; do
  OLD_PIDS=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
  if [ -n "$OLD_PIDS" ]; then
    echo -e "${YELLOW}[*] Clearing existing process on port $PORT (PIDs: $OLD_PIDS)...${RESET}"
    kill -9 $OLD_PIDS 2>/dev/null || true
  fi
done

# 4. Dependency check
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}[*] Root node_modules missing. Installing root dependencies...${RESET}"
  npm install
fi

if [ ! -d "frontend/node_modules" ]; then
  echo -e "${YELLOW}[*] Frontend node_modules missing. Installing frontend dependencies...${RESET}"
  (cd frontend && npm install)
fi

if [ ! -d "relayer/node_modules" ]; then
  echo -e "${YELLOW}[*] Relayer node_modules missing. Installing relayer dependencies...${RESET}"
  (cd relayer && npm install)
fi

if [ ! -d "dashboard/node_modules" ]; then
  echo -e "${YELLOW}[*] Dashboard node_modules missing. Installing dashboard dependencies...${RESET}"
  (cd dashboard && npm install)
fi

# 5. Create logs directory
mkdir -p logs
touch logs/relayer.log logs/frontend.log logs/dashboard.log

# Process tracking array
CHILD_PIDS=()

cleanup() {
  echo -e "\n${YELLOW}------------------------------------------------------------------${RESET}"
  echo -e "${YELLOW}[*] Shutting down all HydrX services...${RESET}"
  for PID in "${CHILD_PIDS[@]}"; do
    if kill -0 "$PID" 2>/dev/null; then
      kill "$PID" 2>/dev/null || true
    fi
  done
  # Secondary cleanup to ensure ports are freed
  for PORT in 3000 3005 4005; do
    PIDS=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
      kill -9 $PIDS 2>/dev/null || true
    fi
  done
  echo -e "${GREEN}[OK] All services stopped cleanly.${RESET}"
  echo -e "${CYAN}==================================================================${RESET}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# 6. Start Relayer Proxy (Port 3005)
echo -e "${CYAN}[1/3] Starting Relayer Proxy on port 3005...${RESET}"
node relayer/server.js > logs/relayer.log 2>&1 &
RELAYER_PID=$!
CHILD_PIDS+=("$RELAYER_PID")

# Wait up to 10 seconds for relayer health check
READY=0
for i in {1..20}; do
  if curl -s http://localhost:3005/health >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 0.5
done

if [ "$READY" -eq 1 ]; then
  echo -e "${GREEN}[OK] Relayer Proxy is online at http://localhost:3005${RESET}"
else
  echo -e "${YELLOW}[WARN] Relayer did not respond immediately. Check logs/relayer.log${RESET}"
fi

# 7. Start Performance Dashboard (Port 4005)
echo -e "${CYAN}[2/3] Starting Standalone Performance Dashboard on port 4005...${RESET}"
node dashboard/server.js > logs/dashboard.log 2>&1 &
DASHBOARD_PID=$!
CHILD_PIDS+=("$DASHBOARD_PID")
sleep 1
echo -e "${GREEN}[OK] Dashboard is online at http://localhost:4005${RESET}"

# 8. Start Frontend Next.js App (Port 3000)
echo -e "${CYAN}[3/3] Starting Next.js Frontend on port 3000...${RESET}"
(cd frontend && npm run dev -- -p 3000) > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
CHILD_PIDS+=("$FRONTEND_PID")

# Optional Simulator
SIM_PID=""
if [[ "$*" == *"--with-simulator"* ]] || [[ "$*" == *"--sim"* ]]; then
  echo -e "${CYAN}[+] Starting Multi-Node IoT Simulator in background...${RESET}"
  node iot-simulator/index.js > logs/simulator.log 2>&1 &
  SIM_PID=$!
  CHILD_PIDS+=("$SIM_PID")
  echo -e "${GREEN}[OK] IoT Simulator streaming pulses to relayer${RESET}"
fi

echo -e "\n${GREEN}${BOLD}==================================================================${RESET}"
echo -e "${GREEN}${BOLD}           ALL HYDRX SERVICES ARE RUNNING SUCCESSFULLY!           ${RESET}"
echo -e "${GREEN}${BOLD}==================================================================${RESET}"
echo -e "  • ${BOLD}Next.js Web App:${RESET}        ${CYAN}http://localhost:3000${RESET}"
echo -e "  • ${BOLD}CyberDeck Monitor:${RESET}      ${CYAN}http://localhost:3000/cyberdeck${RESET} (also http://localhost:4005)"
echo -e "  • ${BOLD}Relayer Proxy API:${RESET}      ${CYAN}http://localhost:3005${RESET}"
echo -e "  • ${BOLD}Relayer Health Probe:${RESET}   ${CYAN}http://localhost:3005/health${RESET}"
echo -e "  • ${BOLD}Log Directory:${RESET}          ${CYAN}${ROOT_DIR}/logs/${RESET}"
echo -e "------------------------------------------------------------------"
echo -e "  ${BOLD}Commands:${RESET}"
echo -e "  • Run IoT Simulator:        ${YELLOW}npm run simulator${RESET} (in another terminal)"
echo -e "  • Stop All Services:        ${YELLOW}Press Ctrl+C${RESET} or run ${YELLOW}./stop.sh${RESET}"
echo -e "${GREEN}${BOLD}==================================================================${RESET}\n"

echo -e "${CYAN}[*] Streaming active logs (press Ctrl+C to stop all services)...${RESET}\n"

# Tail logs to terminal until Ctrl+C
tail -n 20 -f logs/relayer.log logs/frontend.log &
TAIL_PID=$!
CHILD_PIDS+=("$TAIL_PID")

# Wait indefinitely until interrupted
wait
