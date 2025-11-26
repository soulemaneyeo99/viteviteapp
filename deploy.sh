#!/bin/bash

# ========================================
# ViteviteApp - Production Deployment Script
# ========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running in production mode
if [ "$ENVIRONMENT" != "production" ]; then
    log_warn "ENVIRONMENT is not set to 'production'. Continue? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        log_info "Deployment cancelled."
        exit 0
    fi
fi

log_info "========================================="
log_info "ViteviteApp Production Deployment"
log_info "========================================="

# Step 1: Check prerequisites
log_info "Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    log_error "Python 3 is not installed"
    exit 1
fi

if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed"
    exit 1
fi

log_info "✓ Prerequisites check passed"

# Step 2: Backend setup
log_info "\n📦 Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    log_info "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
log_info "Installing Python dependencies..."
pip install -r requirements.txt --quiet

# Run database migrations
log_info "Running database migrations..."
alembic upgrade head

# Seed production data
log_info "Seeding production data..."
python scripts/seed_production.py

if [ $? -ne 0 ]; then
    log_error "Data seeding failed"
    exit 1
fi

log_info "✓ Backend setup complete"

# Step 3: Frontend setup
log_info "\n🎨 Setting up frontend..."
cd ../frontend

# Install dependencies
log_info "Installing Node dependencies..."
npm install --silent

# Build frontend
log_info "Building frontend for production..."
npm run build

if [ $? -ne 0 ]; then
    log_error "Frontend build failed"
    exit 1
fi

log_info "✓ Frontend setup complete"

# Step 4: Health check
log_info "\n🏥 Running health checks..."

# Start backend in background for health check
cd ../backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Check backend health
if curl -f http://localhost:8000/health &> /dev/null; then
    log_info "✓ Backend health check passed"
else
    log_error "Backend health check failed"
    kill $BACKEND_PID
    exit 1
fi

# Kill test backend
kill $BACKEND_PID

log_info "\n========================================="
log_info "✅ Deployment completed successfully!"
log_info "========================================="
log_info "\nNext steps:"
log_info "1. Configure your production environment variables"
log_info "2. Set up your domain and SSL certificates"
log_info "3. Configure your reverse proxy (nginx/caddy)"
log_info "4. Start the application with: ./start_production.sh"
log_info "========================================="
