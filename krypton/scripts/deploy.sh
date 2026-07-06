#!/bin/bash

# Krypton Production Deployment Script
# This script sets up Krypton.com on a production server

set -e

echo "🚀 Krypton Production Deployment"
echo "================================"

# Check prerequisites
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker installed"

# Setup directories
mkdir -p /opt/krypton
mkdir -p /opt/krypton/data
mkdir -p /opt/krypton/logs
mkdir -p /opt/krypton/backups

echo "✅ Directories created"

# Clone or pull repository
if [ -d /opt/krypton/.git ]; then
    cd /opt/krypton
    git pull origin main
else
    cd /opt
    git clone https://github.com/R1r3Br33d/krypton.git
    cd krypton
fi

echo "✅ Repository updated"

# Setup environment
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  .env file created. Please update with production values."
    echo "    Edit: /opt/krypton/.env"
    exit 1
fi

echo "✅ Environment configured"

# Build and start services
echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T app npm run migrate

echo "🌱 Seeding initial data..."
docker-compose -f docker-compose.prod.yml exec -T app npm run seed

echo "✅ Database ready"

# Setup SSL (if using Certbot)
if [ ! -d /opt/krypton/ssl ]; then
    echo "🔒 Generating SSL certificates..."
    mkdir -p /opt/krypton/ssl
    # Note: Certbot setup should be done manually or via Docker
fi

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "Krypton is running at:"
echo "  Web: http://localhost:3000"
echo "  API: http://localhost:3000/api"
echo ""
echo "Next steps:"
echo "1. Update DNS to point to this server"
echo "2. Setup SSL certificates (certbot recommended)"
echo "3. Configure reverse proxy (nginx recommended)"
echo "4. Monitor logs: docker-compose logs -f"
echo "5. Backup database regularly"
echo ""
echo "Documentation: https://krypton.com/docs"
echo "Support: community@krypton.com"
echo ""
