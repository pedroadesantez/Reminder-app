#!/bin/bash

# Planner & Reminder App - Setup Script

set -e

echo "🚀 Setting up Planner & Reminder App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_success "npm $(npm -v) detected"

# Install root dependencies
print_status "Installing root dependencies..."
npm install

# Setup frontend
print_status "Setting up frontend..."
cd frontend
npm install
cd ..
print_success "Frontend setup complete"

# Setup backend
print_status "Setting up backend..."
cd backend
npm install

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

cd ..
print_success "Backend setup complete"

# Create environment files if they don't exist
if [ ! -f .env ]; then
    print_status "Creating root .env file from template..."
    cp .env.example .env
    print_warning "Please update .env with your configuration"
fi

if [ ! -f frontend/.env ]; then
    print_status "Creating frontend .env file from template..."
    cp frontend/.env.example frontend/.env
    print_warning "Please update frontend/.env with your configuration"
fi

if [ ! -f backend/.env ]; then
    print_status "Creating backend .env file from template..."
    cp backend/.env.example backend/.env
    print_warning "Please update backend/.env with your database configuration"
fi

print_success "Setup complete! 🎉"
print_status "Next steps:"
echo "1. Update your environment files (.env) with proper configuration"
echo "2. Set up your PostgreSQL database"
echo "3. Run 'npm run db:migrate' to set up the database schema"
echo "4. Run 'npm run dev' to start both frontend and backend in development mode"

print_status "Useful commands:"
echo "- npm run dev          # Start both frontend and backend"
echo "- npm run dev:frontend # Start only frontend"
echo "- npm run dev:backend  # Start only backend"
echo "- npm run db:studio    # Open Prisma database studio"
echo "- npm run db:migrate   # Run database migrations"