#!/bin/bash

echo "🛑 Stopping Event Management System..."
echo "======================================"

# Stop all services
docker-compose down

echo ""
echo "✅ All services stopped!"
echo ""
echo "💡 To remove volumes as well: docker-compose down -v"
echo "======================================"
