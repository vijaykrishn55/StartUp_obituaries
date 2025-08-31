#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up Startup Obituaries Project...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v16 or higher.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js version 16 or higher is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) is installed${NC}"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠️ MySQL is not installed or not in PATH. Please install MySQL Server.${NC}"
fi

# Setup Backend
echo -e "${GREEN}📦 Setting up Backend...${NC}"
cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️ Please edit backend/.env file with your database credentials${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Create uploads directory
mkdir -p uploads
echo -e "${GREEN}✅ Uploads directory created${NC}"

cd ..

# Setup Frontend
echo -e "${GREEN}🎨 Setting up Frontend...${NC}"
cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

cd ..

# Instructions
echo -e "${GREEN}🎉 Setup completed!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Edit backend/.env file with your database credentials"
echo "2. Create MySQL database: 'startup_obituaries'"
echo "3. Import the schema: mysql -u username -p startup_obituaries < backend/schema.sql"
echo "4. Start backend: cd backend && npm start"
echo "5. Start frontend: cd frontend && npm run dev"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"