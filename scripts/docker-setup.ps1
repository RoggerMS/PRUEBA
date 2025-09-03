# CRUNEVO Docker Setup Script for Windows PowerShell
# This script helps set up the Docker environment for CRUNEVO on Windows

# Enable strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Colors.Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

Write-Host "🚀 Setting up CRUNEVO Docker environment..." -ForegroundColor $Colors.Green

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Status "Docker is installed: $dockerVersion"
} catch {
    Write-Error "Docker is not installed or not in PATH. Please install Docker Desktop first."
    exit 1
}

# Check if Docker Compose is available
try {
    $composeVersion = docker-compose --version
    Write-Status "Docker Compose is available: $composeVersion"
} catch {
    Write-Error "Docker Compose is not available. Please ensure Docker Desktop is properly installed."
    exit 1
}

Write-Success "Docker and Docker Compose are ready ✓"

# Create necessary directories
Write-Status "Creating necessary directories..."
$directories = @("uploads", "logs", "nginx", "nginx/ssl")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Status "Created directory: $dir"
    }
}

# Copy environment file
if (!(Test-Path ".env")) {
    if (Test-Path ".env.docker") {
        Write-Status "Copying .env.docker to .env..."
        Copy-Item ".env.docker" ".env"
        Write-Success "Environment file created"
    } else {
        Write-Warning "No .env.docker file found. Please create .env manually."
    }
} else {
    Write-Warning ".env file already exists. Skipping copy."
}

# Stop any existing containers
Write-Status "Stopping existing containers..."
try {
    docker-compose down --remove-orphans 2>$null
} catch {
    # Ignore errors if no containers are running
}

# Build and start services
Write-Status "Building and starting services..."
try {
    docker-compose up -d --build
    Write-Success "Services started successfully"
} catch {
    Write-Error "Failed to start services. Check Docker logs for details."
    exit 1
}

# Wait for database to be ready
Write-Status "Waiting for PostgreSQL to be ready..."
$maxAttempts = 30
$attempt = 0
do {
    $attempt++
    try {
        docker-compose exec -T postgres pg_isready -U postgres -d crunevo 2>$null | Out-Null
        $dbReady = $true
        break
    } catch {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
} while ($attempt -lt $maxAttempts)

if ($dbReady) {
    Write-Host ""
    Write-Success "PostgreSQL is ready"
} else {
    Write-Host ""
    Write-Error "PostgreSQL failed to start within expected time"
    exit 1
}

# Run Prisma migrations
Write-Status "Running Prisma migrations..."
try {
    docker-compose exec -T app npx prisma migrate deploy
    Write-Success "Prisma migrations completed"
} catch {
    Write-Warning "Prisma migrate failed. Trying to push schema..."
    try {
        docker-compose exec -T app npx prisma db push --force-reset
        Write-Success "Database schema pushed successfully"
    } catch {
        Write-Error "Failed to set up database schema"
    }
}

# Generate Prisma client
Write-Status "Generating Prisma client..."
try {
    docker-compose exec -T app npx prisma generate
    Write-Success "Prisma client generated"
} catch {
    Write-Warning "Failed to generate Prisma client"
}

# Seed database (optional)
$seedResponse = Read-Host "Do you want to seed the database with sample data? (y/N)"
if ($seedResponse -match "^[Yy]$") {
    Write-Status "Seeding database..."
    try {
        docker-compose exec -T app npm run db:seed
        Write-Success "Database seeded successfully"
    } catch {
        Write-Warning "Database seeding failed. You can run it manually later."
    }
}

# Show service status
Write-Status "Checking service status..."
docker-compose ps

Write-Host ""
Write-Success "🎉 CRUNEVO Docker setup completed!"
Write-Host ""
Write-Host "📋 Service URLs:" -ForegroundColor $Colors.Yellow
Write-Host "   • Application: http://localhost:3000"
Write-Host "   • pgAdmin: http://localhost:8080"
Write-Host "   • PostgreSQL: localhost:5432"
Write-Host "   • Redis: localhost:6379"
Write-Host ""
Write-Host "🔑 pgAdmin Credentials:" -ForegroundColor $Colors.Yellow
Write-Host "   • Email: admin@crunevo.com"
Write-Host "   • Password: admin123"
Write-Host ""
Write-Host "💾 Database Credentials:" -ForegroundColor $Colors.Yellow
Write-Host "   • Host: localhost (or postgres from within containers)"
Write-Host "   • Port: 5432"
Write-Host "   • Database: crunevo"
Write-Host "   • Username: postgres"
Write-Host "   • Password: postgres"
Write-Host ""
Write-Status "To view logs: docker-compose logs -f"
Write-Status "To stop services: docker-compose down"
Write-Status "To restart services: docker-compose restart"
Write-Host ""