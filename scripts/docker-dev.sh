#!/bin/bash
# Start development environment with Docker

set -e

echo "🐳 Starting Docker development environment..."

# Start services
docker-compose up -d

echo "⏳ Waiting for services to be ready..."

# Wait for PostgreSQL
until docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; do
    echo -n "."
    sleep 1
done
echo " PostgreSQL ready!"

# Wait for Redis
until docker-compose exec -T redis redis-cli ping &> /dev/null; do
    echo -n "."
    sleep 1
done
echo " Redis ready!"

# Set environment variables
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ethos_analytics"
export REDIS_URL="redis://localhost:6379"

echo ""
echo "✅ Development environment ready!"
echo ""
echo "Environment variables:"
echo "  DATABASE_URL=$DATABASE_URL"
echo "  REDIS_URL=$REDIS_URL"
echo ""
echo "Next steps:"
echo "  1. Copy to .env.local: cp .env.example .env.local"
echo "  2. Start dev server: npm run dev"
echo "  3. Start worker: npm run worker"
echo ""
echo "Stop services: docker-compose down"

