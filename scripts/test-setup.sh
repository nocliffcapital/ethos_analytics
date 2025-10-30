#!/bin/bash
# Test setup script - verifies all services are running

set -e

echo "🔍 Testing Ethos Analytics setup..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Found $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    exit 1
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ Found v$NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check .env.local
echo -n "Checking .env.local... "
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ Found${NC}"
else
    echo -e "${YELLOW}⚠ Not found (copy from .env.example)${NC}"
fi

# Check PostgreSQL connection
echo -n "Checking PostgreSQL... "
if [ -n "$DATABASE_URL" ]; then
    if psql "$DATABASE_URL" -c "SELECT 1" &> /dev/null; then
        echo -e "${GREEN}✓ Connected${NC}"
    else
        echo -e "${RED}✗ Cannot connect${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ DATABASE_URL not set${NC}"
fi

# Check Redis connection
echo -n "Checking Redis... "
if [ -n "$REDIS_URL" ]; then
    if redis-cli -u "$REDIS_URL" ping &> /dev/null; then
        echo -e "${GREEN}✓ Connected${NC}"
    else
        echo -e "${RED}✗ Cannot connect${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ REDIS_URL not set${NC}"
fi

# Check dependencies
echo -n "Checking dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${YELLOW}⚠ Run 'npm install'${NC}"
fi

echo ""
echo -e "${GREEN}✓ Setup looks good!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start dev server: npm run dev"
echo "  2. Start worker: npm run worker"
echo "  3. Visit http://localhost:3000"

