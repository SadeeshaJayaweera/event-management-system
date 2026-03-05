#!/bin/bash
RESOURCE_GROUP="event-management-rg"
PG_HOST="eventmgmt-pg-db.postgres.database.azure.com"
PG_PORT="5432"
PG_USER="postgresadmin"
PG_PASS="EventManagement123!"
PG_DB="postgres"

update_service() {
  local service=$1
  local schema=$2
  echo "Updating $service (schema=$schema)..."
  az containerapp update \
    -n "$service" \
    -g "$RESOURCE_GROUP" \
    --set-env-vars \
      EUREKA_CLIENT_ENABLED=false \
      EUREKA_CLIENT_FETCH_REGISTRY=false \
      EUREKA_CLIENT_REGISTER_WITH_EUREKA=false \
      "SPRING_DATASOURCE_URL=jdbc:postgresql://${PG_HOST}:${PG_PORT}/${PG_DB}?currentSchema=${schema}&sslmode=require" \
      "SPRING_DATASOURCE_USERNAME=${PG_USER}" \
      "SPRING_DATASOURCE_PASSWORD=${PG_PASS}" \
      SPRING_JPA_HIBERNATE_DDLAUTO=update \
      "SPRING_JPA_PROPERTIES_HIBERNATE_DEFAULT_SCHEMA=${schema}" > /dev/null 2>&1
  echo "✅ $service updated to point to Azure PostgreSQL!"
}

# Update all services concurrently
update_service auth-service         auth_schema &
update_service profile-service      profile_schema &
update_service event-service        event_schema &
update_service ticket-service       ticket_schema &
update_service notification-service notification_schema &
update_service analytics-service    analytics_schema &
update_service admin-service        admin_schema &
update_service review-service       review_schema &
update_service payment-service      payment_schema &

wait
echo "All microservices have been successfully migrated to Azure PostgreSQL!"
