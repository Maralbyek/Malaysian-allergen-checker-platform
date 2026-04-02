#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Full Development Server Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${BLUE}🐳 Starting Docker containers...${NC}"

# Start Docker containers in detached mode
docker-compose up -d

# Wait for MySQL to be ready
echo -e "${YELLOW}⏳ Waiting for MySQL to be ready...${NC}"
sleep 5

# Check if MySQL is healthy
until docker exec allergy-mysql-db mysqladmin ping -h localhost -u root -prootpassword --silent; do
    echo -e "${YELLOW}⏳ MySQL is still starting up...${NC}"
    sleep 2
done

echo -e "${GREEN}✅ MySQL is ready!${NC}"

# Check if .env exists, if not copy from .env.example
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created. Please update it with your credentials.${NC}"
fi

# Generate Prisma Client if needed
if [ ! -d "node_modules/.prisma" ]; then
    echo -e "${BLUE}📦 Generating Prisma Client...${NC}"
    npx prisma generate
fi

# Check if database needs migration
echo -e "${BLUE}🔄 Checking database migrations...${NC}"
npx prisma migrate dev --name init || echo -e "${YELLOW}⚠️  Migrations might already be applied${NC}"

# Seed the database
echo -e "${BLUE}🌱 Seeding database with demo data...${NC}"
npx prisma db seed || echo -e "${YELLOW}⚠️  Seeding failed or already seeded${NC}"

echo -e "${GREEN}✅ Everything is ready!${NC}"
echo ""
echo -e "${GREEN}📊 phpMyAdmin: ${NC}http://localhost:8081"
echo -e "${GREEN}🗄️  Database: ${NC}MySQL on localhost:3306"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Next step: Start your Next.js server${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Run: ${NC}pnpm dev"
echo ""
