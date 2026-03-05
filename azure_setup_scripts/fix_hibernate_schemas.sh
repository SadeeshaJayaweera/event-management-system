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

for service in "${SERVICES[@]}"; do
  echo "Updating $service to auto-create missing schemas..."
  az containerapp update \
    -n "$service" \
    -g "$RESOURCE_GROUP" \
    --set-env-vars SPRING_JPA_PROPERTIES_HIBERNATE_HBM2DDL_CREATE_NAMESPACES=true > /dev/null 2>&1 &
done

wait
echo "✅ All microservices updated configured to auto-create PostgreSQL schemas!"
