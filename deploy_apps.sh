#!/bin/bash
export RESOURCE_GROUP="event-management-rg"
export ACR_NAME="eventmgmtacrsadeesha"
export ACA_ENV="event-app-env"

SERVICES=(
  "config-server:8888:internal"
  "eureka-server:8761:internal"
  "auth-service:8082:internal"
  "profile-service:8088:internal"
  "event-service:8081:internal"
  "payment-service:8083:internal"
  "ticket-service:8084:internal"
  "notification-service:8085:internal"
  "analytics-service:8086:internal"
  "admin-service:8087:internal"
  "review-service:8089:internal"
  "api-gateway:8080:external"
  "frontend:3000:external"
)

for config in "${SERVICES[@]}"; do
  IFS=':' read -r APP_NAME PORT INGRESS <<< "$config"
  echo "=========================================="
  echo "Deploying Container App: $APP_NAME"
  echo "Port: $PORT | Ingress: $INGRESS"
  echo "=========================================="
  
  az containerapp create \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --environment $ACA_ENV \
    --image $ACR_NAME.azurecr.io/$APP_NAME:latest \
    --target-port $PORT \
    --ingress $INGRESS \
    --registry-server $ACR_NAME.azurecr.io \
    --query "properties.configuration.ingress.fqdn" -o tsv
done
