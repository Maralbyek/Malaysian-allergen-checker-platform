#!/bin/bash

# Colors for output
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Stopping Docker containers...${NC}"

# Stop Docker containers
docker-compose down

echo -e "${RED}✅ Docker containers stopped!${NC}"
echo ""
echo -e "${BLUE}ℹ️  To remove volumes (delete database data), run:${NC}"
echo -e "   docker-compose down -v"
