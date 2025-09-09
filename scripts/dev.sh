#!/bin/bash

# Planner & Reminder App - Development Script

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_status "Starting Planner & Reminder App in development mode..."

# Check if .env files exist
if [ ! -f .env ]; then
    print_status "Creating .env from template..."
    cp .env.example .env
fi

if [ ! -f frontend/.env ]; then
    print_status "Creating frontend/.env from template..."
    cp frontend/.env.example frontend/.env
fi

if [ ! -f backend/.env ]; then
    print_status "Creating backend/.env from template..."
    cp backend/.env.example backend/.env
fi

# Start both frontend and backend
print_success "Starting development servers..."
npm run dev