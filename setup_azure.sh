#!/bin/bash
# Azure Container Apps Setup Script for Event Management System
# Make sure you have installed the Azure CLI and run 'az login' before running this script.

export RESOURCE_GROUP="event-management-rg"
export LOCATION="eastus"
export ACR_NAME="eventmgmtacr"
export ACA_ENV="event-app-env"

echo "1. Current Azure Subscription ID:"
export SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo $SUBSCRIPTION_ID

echo "2. Creating Resource Group: $RESOURCE_GROUP"
az group create --name $RESOURCE_GROUP --location $LOCATION

echo "3. Creating Azure Container Registry (ACR): $ACR_NAME"
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic

echo "4. Creating Azure Container Apps Environment: $ACA_ENV"
az containerapp env create \
  --name $ACA_ENV \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

echo "5. Generating Azure Credentials for GitHub Actions (save this output!)"
az ad sp create-for-rbac --name "event-management-sp" --role contributor \
    --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP \
    --sdk-auth

echo "6. Creating target Container Apps..."
# NOTE: To create the container app successfully, the images must exist in your ACR.
# Run the GitHub Actions CI/CD to build and push the images FIRST before running this step!
# This script prepares the commands for you.

SERVICES=(
  "auth-service:8082:internal"
  "profile-service:8081:internal"
  "event-service:8083:internal"
  "ticket-service:8084:internal"
  "notification-service:8085:internal"
  "analytics-service:8086:internal"
  "review-service:8089:internal"
  "api-gateway:8080:external"
  "frontend:3000:external"
)

# Loop and print out exactly what commands you need to run to attach each microservice:
for config in "${SERVICES[@]}"; do
  IFS=':' read -r APP_NAME PORT INGRESS <<< "$config"
  echo "--- Creating Container App for $APP_NAME (Port: $PORT, Ingress: $INGRESS) ---"
  
  echo "az containerapp create \\"
  echo "  --name $APP_NAME \\"
  echo "  --resource-group $RESOURCE_GROUP \\"
  echo "  --environment $ACA_ENV \\"
  echo "  --image $ACR_NAME.azurecr.io/$APP_NAME:latest \\"
  echo "  --target-port $PORT \\"
  echo "  --ingress $INGRESS \\"
  echo "  --registry-server $ACR_NAME.azurecr.io"
  echo ""
done

echo "Setup complete!"
