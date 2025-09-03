#!/bin/bash

# CRUNEVO Docker Setup Script
# This script helps set up the Docker environment for CRUNEVO

set -e

echo "🚀 Setting up CRUNEVO Docker environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Docker and Docker Compose are installed ✓"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads logs nginx/ssl

# Copy environment file
if [ ! -f .env ]; then
    if [ -f .env.docker ]; then
        print_status "Copying .env.docker to .env..."
        cp .env.docker .env
        print_success "Environment file created"
    else
        print_warning "No .env.docker file found. Please create .env manually."
    fi
else
    print_warning ".env file already exists. Skipping copy."
fi

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Build and start services
print_status "Building and starting services..."
docker-compose up -d --build

# Wait for database to be ready
print_status "Waiting for PostgreSQL to be ready..."
while ! docker-compose exec -T postgres pg_isready -U postgres -d crunevo &>/dev/null; do
    echo -n "."
    sleep 2
done
echo
print_success "PostgreSQL is ready"

# Run Prisma migrations
print_status "Running Prisma migrations..."
docker-compose exec -T app npx prisma migrate deploy || {
    print_warning "Prisma migrate failed. Trying to push schema..."
    docker-compose exec -T app npx prisma db push --force-reset || {
        print_error "Failed to set up database schema"
    }
}

# Generate Prisma client
print_status "Generating Prisma client..."
docker-compose exec -T app npx prisma generate

# Seed database (optional)
read -p "Do you want to seed the database with sample data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Seeding database..."
    docker-compose exec -T app npm run db:seed || {
        print_warning "Database seeding failed. You can run it manually later."
    }
fi

# Show service status
print_status "Checking service status..."
docker-compose ps

echo
print_success "🎉 CRUNEVO Docker setup completed!"
echo
echo "📋 Service URLs:"
echo "   • Application: http://localhost:3000"
echo "   • pgAdmin: http://localhost:8080"
echo "   • PostgreSQL: localhost:5432"
echo "   • Redis: localhost:6379"
echo
echo "🔑 pgAdmin Credentials:"
echo "   • Email: admin@crunevo.com"
echo "   • Password: admin123"
echo
echo "💾 Database Credentials:"
echo "   • Host: localhost (or postgres from within containers)"
echo "   • Port: 5432"
echo "   • Database: crunevo"
echo "   • Username: postgres"
echo "   • Password: postgres"
echo
print_status "To view logs: docker-compose logs -f"
print_status "To stop services: docker-compose down"
print_status "To restart services: docker-compose restart"
echo