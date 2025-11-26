#!/bin/bash

# ========================================
# ViteviteApp - Production Startup Script
# ========================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}ViteviteApp - Starting Production${NC}"
echo -e "${GREEN}=========================================${NC}"

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Warning: backend/.env not found${NC}"
    echo "Creating from template..."
    cp backend/env.production.template backend/.env
    echo -e "${YELLOW}Please edit backend/.env with your production values${NC}"
    exit 1
fi

if [ ! -f "frontend/.env.production.local" ]; then
    echo -e "${YELLOW}Warning: frontend/.env.production.local not found${NC}"
    echo "Creating from template..."
    cp frontend/env.production.template frontend/.env.production.local
    echo -e "${YELLOW}Please edit frontend/.env.production.local with your production values${NC}"
    exit 1
fi

# Choose deployment method
echo ""
echo "Select deployment method:"
echo "1) Docker Compose (Recommended)"
echo "2) Manual (systemd/pm2)"
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        echo -e "\n${GREEN}Starting with Docker Compose...${NC}"
        docker-compose -f docker-compose.prod.yml up -d
        echo ""
        echo -e "${GREEN}✅ Application started successfully!${NC}"
        echo ""
        echo "Services:"
        echo "  - Frontend: http://localhost:3000"
        echo "  - Backend API: http://localhost:8000"
        echo "  - API Docs: http://localhost:8000/docs"
        echo ""
        echo "To view logs:"
        echo "  docker-compose -f docker-compose.prod.yml logs -f"
        echo ""
        echo "To stop:"
        echo "  docker-compose -f docker-compose.prod.yml down"
        ;;
    2)
        echo -e "\n${GREEN}Starting manually...${NC}"
        
        # Start backend
        echo "Starting backend..."
        cd backend
        source venv/bin/activate
        uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 &
        BACKEND_PID=$!
        echo "Backend PID: $BACKEND_PID"
        
        # Start frontend
        echo "Starting frontend..."
        cd ../frontend
        npm start &
        FRONTEND_PID=$!
        echo "Frontend PID: $FRONTEND_PID"
        
        echo ""
        echo -e "${GREEN}✅ Application started successfully!${NC}"
        echo ""
        echo "Services:"
        echo "  - Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
        echo "  - Backend API: http://localhost:8000 (PID: $BACKEND_PID)"
        echo ""
        echo "To stop:"
        echo "  kill $BACKEND_PID $FRONTEND_PID"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
