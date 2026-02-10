#!/bin/bash

echo "🚀 Starting Event Management System..."
echo "======================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start all services
echo "📦 Starting all containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check status
echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "======================================"
echo "✅ All services started!"
echo ""
echo "🌐 Access Points:"
echo "   Frontend:        http://localhost:3000"
echo "   API Gateway:     http://localhost:8080"
echo "   Eureka Dashboard: http://localhost:8761"
echo ""
echo "📝 View logs: docker-compose logs -f"
echo "🛑 Stop all:  docker-compose down"
echo "======================================"
