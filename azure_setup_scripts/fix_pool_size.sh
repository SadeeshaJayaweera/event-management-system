#!/bin/bash
RESOURCE_GROUP="event-management-rg"

SERVICES=(
  "auth-service"
  "profile-service"
  "event-service"
  "ticket-service"
  "notification-service"
  "analytics-service"
  "admin-service"
  "review-service"
  "payment-service"
)

# We hit the max connection limit on Standard_B1ms Postgres (which is ~50).
# 9 microservices * 10 (default Hikari pool) = 90 connections -> crash.
# Fix: Limit each microservice to exactly 3 connections per pool (max total 27 connections).
for service in "${SERVICES[@]}"; do
  echo "Updating $service connection pool size..."
  az containerapp update \
    -n "$service" \
    -g "$RESOURCE_GROUP" \
    --set-env-vars SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=3 > /dev/null 2>&1 &
done

wait
echo "✅ All microservices updated with max pool size = 3."
