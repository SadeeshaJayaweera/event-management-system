#!/bin/bash

# Event Management System - Complete Startup Script
# This script starts all services in the correct order

echo "================================================"
echo "  Event Management System - Starting All Services"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kill any existing processes on our ports
echo "${YELLOW}Cleaning up existing processes...${NC}"
lsof -ti:8761 | xargs kill -9 2>/dev/null || true
lsof -ti:8888 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:8082 | xargs kill -9 2>/dev/null || true
lsof -ti:8083 | xargs kill -9 2>/dev/null || true
lsof -ti:8084 | xargs kill -9 2>/dev/null || true
lsof -ti:8085 | xargs kill -9 2>/dev/null || true
lsof -ti:8086 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Start Discovery Server
echo "${GREEN}[1/10] Starting Discovery Server...${NC}"
cd discovery
mvn spring-boot:run > ../logs/discovery.log 2>&1 &
DISCOVERY_PID=$!
echo "Discovery Server PID: $DISCOVERY_PID"
cd ..
sleep 35

# Start Config Server
echo "${GREEN}[2/10] Starting Config Server...${NC}"
cd config-server
mvn spring-boot:run > ../logs/config-server.log 2>&1 &
CONFIG_PID=$!
echo "Config Server PID: $CONFIG_PID"
cd ..
sleep 35

# Start API Gateway
echo "${GREEN}[3/10] Starting API Gateway...${NC}"
cd gateway
mvn spring-boot:run > ../logs/gateway.log 2>&1 &
GATEWAY_PID=$!
echo "API Gateway PID: $GATEWAY_PID"
cd ..
sleep 25

# Start Event Service
echo "${GREEN}[4/10] Starting Event Service...${NC}"
cd backend/event-service
mvn spring-boot:run > ../../logs/event-service.log 2>&1 &
EVENT_PID=$!
echo "Event Service PID: $EVENT_PID"
cd ../..
sleep 5

# Start User Service
echo "${GREEN}[5/10] Starting User Service...${NC}"
cd backend/user-service
mvn spring-boot:run > ../../logs/user-service.log 2>&1 &
USER_PID=$!
echo "User Service PID: $USER_PID"
cd ../..
sleep 5

# Start Booking Service
echo "${GREEN}[6/10] Starting Booking Service...${NC}"
cd backend/booking-service
mvn spring-boot:run > ../../logs/booking-service.log 2>&1 &
BOOKING_PID=$!
echo "Booking Service PID: $BOOKING_PID"
cd ../..
sleep 5

# Start Notification Service
echo "${GREEN}[7/10] Starting Notification Service...${NC}"
cd backend/notification-service
mvn spring-boot:run > ../../logs/notification-service.log 2>&1 &
NOTIF_PID=$!
echo "Notification Service PID: $NOTIF_PID"
cd ../..
sleep 5

# Start Payment Service
echo "${GREEN}[8/10] Starting Payment Service...${NC}"
cd backend/payment-service
mvn spring-boot:run > ../../logs/payment-service.log 2>&1 &
PAYMENT_PID=$!
echo "Payment Service PID: $PAYMENT_PID"
cd ../..
sleep 5

# Start Review Service
echo "${GREEN}[9/10] Starting Review Service...${NC}"
cd backend/review-service
mvn spring-boot:run > ../../logs/review-service.log 2>&1 &
REVIEW_PID=$!
echo "Review Service PID: $REVIEW_PID"
cd ../..
sleep 5

# Start Frontend
echo "${GREEN}[10/10] Starting Frontend...${NC}"
cd frontend
npm install > ../logs/frontend-install.log 2>&1
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..
sleep 10

echo ""
echo "================================================"
echo "${GREEN}  All Services Started!${NC}"
echo "================================================"
echo ""
echo "Service Status:"
echo "  Discovery (8761):    $(lsof -ti:8761 > /dev/null 2>&1 && echo '✓ Running' || echo '✗ Failed')"
echo "  Config (8888):       $(lsof -ti:8888 > /dev/null 2>&1 && echo '✓ Running' || echo '✗ Failed')"
echo "  Gateway (8080):      $(lsof -ti:8080 > /dev/null 2>&1 && echo '✓ Running' || echo '✗ Failed')"
echo "  Event (8081):        $(lsof -ti:8081 > /dev/null 2>&1 && echo '✓ Running' || echo '✗ Failed')"
echo "  User (8082):         $(lsof -ti:8082 > /dev/null 2>&1 && echo '✓ Running' || echo '✗ Failed')"
echo "  Booking (8083):      $(lsof -ti:8083 > /dev/null 2>&1 && echo '✓ Running' || echo '✗ Failed')"
echo "  Notification (8084): $(lsof -ti:8084 > /dev/null 2>&1 && echo '✓ Running' || echo '✗ Failed')"
echo "  Payment (8085):      $(lsof -ti:8085 > /dev/null 2>&1 && echo '✓ Running' || echo '✗ Failed')"
echo "  Review (8086):       $(lsof -ti:8086 > /dev/null 2>&1 && echo '✓ Running' || echo '✗ Failed')"
echo "  Frontend (3000):     $(lsof -ti:3000 > /dev/null 2>&1 && echo '✓ Running' || echo '✗ Failed')"
echo ""
echo "Access URLs:"
echo "  Frontend:         http://localhost:3000"
echo "  API Gateway:      http://localhost:8080"
echo "  Eureka Dashboard: http://localhost:8761"
echo ""
echo "Logs are available in the 'logs' directory"
echo ""
echo "To stop all services, run: ./stop-all.sh"
echo "================================================"
