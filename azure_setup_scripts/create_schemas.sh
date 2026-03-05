#!/bin/bash
export PGPASSWORD='EventManagement123!'

psql "postgresql://postgresadmin@eventmgmt-pg-db:EventManagement123%21@eventmgmt-pg-db.postgres.database.azure.com:5432/postgres?sslmode=require" <<EOF
CREATE SCHEMA IF NOT EXISTS auth_schema;
CREATE SCHEMA IF NOT EXISTS profile_schema;
CREATE SCHEMA IF NOT EXISTS event_schema;
CREATE SCHEMA IF NOT EXISTS ticket_schema;
CREATE SCHEMA IF NOT EXISTS notification_schema;
CREATE SCHEMA IF NOT EXISTS analytics_schema;
CREATE SCHEMA IF NOT EXISTS admin_schema;
CREATE SCHEMA IF NOT EXISTS review_schema;
CREATE SCHEMA IF NOT EXISTS payment_schema;
EOF

echo "All schemas created."
