#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting local sync setup...${NC}\n"

# Check if categories are seeded
echo -e "${BLUE}1. Checking database...${NC}"
CATEGORIES=$(sqlite3 "apps/jobs/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/620144a4112044e893e18deb703ab416f4251b9350437cf41d528bd572a8ab37.sqlite" "SELECT COUNT(*) FROM categories" 2>/dev/null)

if [ "$CATEGORIES" = "0" ] || [ -z "$CATEGORIES" ]; then
  echo -e "${YELLOW}   ⚠️  Database needs seeding...${NC}"
  node seed-jobs-db-direct.js
  echo ""
else
  echo -e "${GREEN}   ✅ Database already seeded ($CATEGORIES categories)${NC}\n"
fi

# Start the server
echo -e "${BLUE}2. Starting dev server...${NC}"
echo -e "${GREEN}   📍 http://localhost:8787/sync${NC}\n"

cd apps/jobs
npm run serve
