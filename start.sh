#!/usr/bin/env bash
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}  ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗${NC}"
echo -e "${CYAN}${BOLD}  ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝${NC}"
echo -e "${CYAN}${BOLD}  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗${NC}"
echo -e "${CYAN}${BOLD}  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║${NC}"
echo -e "${CYAN}${BOLD}  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║${NC}"
echo -e "${CYAN}${BOLD}  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝${NC}"
echo -e "${DIM}  Organizational Nervous System${NC}"
echo ""

cd "$(dirname "$0")"

# --- Check Node.js ---
if ! command -v node &>/dev/null; then
  echo -e "${RED}Node.js not found.${NC} Install it from https://nodejs.org"
  exit 1
fi

NODE_V=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_V" -lt 18 ]; then
  echo -e "${RED}Node.js v18+ required${NC} (found v$(node -v))"
  exit 1
fi
echo -e "  ${GREEN}✓${NC} Node.js $(node -v)"

# --- Install dependencies ---
if [ ! -d "node_modules" ]; then
  echo -e "  ${YELLOW}→${NC} Installing dependencies..."
  npm install --silent
  echo -e "  ${GREEN}✓${NC} Dependencies installed"
else
  echo -e "  ${GREEN}✓${NC} Dependencies present"
fi

# --- Check .env ---
if [ -f ".env" ] && grep -q "VITE_OPENAI_API_KEY=." .env 2>/dev/null; then
  KEY=$(grep "VITE_OPENAI_API_KEY" .env | cut -d= -f2)
  if [ "$KEY" != "your-api-key-here" ] && [ -n "$KEY" ]; then
    echo -e "  ${GREEN}✓${NC} OpenAI API key configured — ${BOLD}live AI mode${NC}"
  else
    echo -e "  ${YELLOW}⚠${NC} No API key — running in ${BOLD}demo mode${NC} (pre-cached responses)"
    echo -e "    ${DIM}Set VITE_OPENAI_API_KEY in .env for live AI${NC}"
  fi
else
  echo -e "  ${YELLOW}⚠${NC} No .env file — running in ${BOLD}demo mode${NC} (pre-cached responses)"
  echo -e "    ${DIM}Create .env with VITE_OPENAI_API_KEY=sk-... for live AI${NC}"
fi

echo ""
echo -e "  ${CYAN}${BOLD}Starting NEXUS...${NC}"
echo -e "  ${DIM}Press Ctrl+C to stop${NC}"
echo ""

exec npm run dev
