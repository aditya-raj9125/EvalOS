#!/usr/bin/env bash
# ─── EvalAI Monorepo Setup Script ─────────────────────────────────────────────
# Run this once after cloning the repository.
# Usage: chmod +x infra/scripts/setup.sh && ./infra/scripts/setup.sh

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔════════════════════════════════════════╗"
echo "║       EvalAI — Project Setup           ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# ─── 1. Check prerequisites ───────────────────────────────────────────────────
echo -e "${CYAN}[1/6] Checking prerequisites...${NC}"

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}✗ $1 is not installed or not in PATH.${NC}"
        echo "  Install it with: $2"
        exit 1
    else
        echo -e "${GREEN}✓ $1 found: $(${1} --version 2>&1 | head -1)${NC}"
    fi
}

check_command "node" "https://nodejs.org (v20+)"
check_command "npm" "Comes with Node.js"
check_command "python3" "https://python.org (3.11 exactly)"
check_command "docker" "https://docker.com/get-started"

# Check Node version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}✗ Node.js v20+ required. Found: $(node --version)${NC}"
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | grep -oP '\d+\.\d+')
if [[ "$PYTHON_VERSION" != "3.11" && "$PYTHON_VERSION" != "3.12" ]]; then
    echo -e "${YELLOW}⚠ Python 3.11 recommended. Found: $(python3 --version). Proceeding anyway...${NC}"
fi

echo ""

# ─── 2. Copy environment files ────────────────────────────────────────────────
echo -e "${CYAN}[2/6] Setting up environment files...${NC}"

if [ ! -f "apps/web/.env.local" ]; then
    cp "apps/web/.env.example" "apps/web/.env.local"
    echo -e "${GREEN}✓ Created apps/web/.env.local from example${NC}"
else
    echo -e "${YELLOW}⚠ apps/web/.env.local already exists — skipped${NC}"
fi

if [ ! -f "apps/api/.env" ]; then
    cp "apps/api/.env.example" "apps/api/.env"
    echo -e "${GREEN}✓ Created apps/api/.env from example${NC}"
else
    echo -e "${YELLOW}⚠ apps/api/.env already exists — skipped${NC}"
fi

echo ""

# ─── 3. Remind user to fill in API keys ──────────────────────────────────────
echo -e "${YELLOW}[IMPORTANT] Fill in your API keys before running the app:${NC}"
echo "  1. Edit apps/api/.env — add GEMINI_API_KEY, SUPABASE_URL, SUPABASE_KEY, SECRET_KEY"
echo "  2. Edit apps/web/.env.local — verify NEXT_PUBLIC_API_URL"
echo ""

# ─── 4. Install npm dependencies ─────────────────────────────────────────────
echo -e "${CYAN}[3/6] Installing npm dependencies...${NC}"
npm install
echo -e "${GREEN}✓ npm packages installed${NC}"
echo ""

# ─── 5. Create Python venv ───────────────────────────────────────────────────
echo -e "${CYAN}[4/6] Setting up Python virtual environment...${NC}"
cd apps/api
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo -e "${GREEN}✓ Virtual environment created at apps/api/.venv${NC}"
fi
source .venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
deactivate
cd ../..
echo -e "${GREEN}✓ Python packages installed${NC}"
echo ""

# ─── 6. Done ─────────────────────────────────────────────────────────────────
echo -e "${CYAN}[5/6] Setup complete!${NC}"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗"
echo "║  EvalAI is ready to run!                       ║"
echo "╠════════════════════════════════════════════════╣"
echo "║  Next steps:                                   ║"
echo "║  1. Fill in apps/api/.env with your keys       ║"
echo "║  2. Run: cd apps/api && alembic upgrade head   ║"
echo "║  3. Terminal 1: cd apps/api && uvicorn ...     ║"
echo "║  4. Terminal 2: cd apps/api && celery ...      ║"
echo "║  5. Terminal 3: cd apps/web && npm run dev     ║"
echo "║  OR: docker compose up --build                 ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}"
