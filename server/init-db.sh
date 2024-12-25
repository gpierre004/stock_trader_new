#!/bin/sh

echo "Waiting for PostgreSQL..."

# Wait for PostgreSQL to be ready using pg_isready with password from environment
export PGPASSWORD="${DB_PASSWORD:-1215}"

until pg_isready -h postgres -p 5432 -U postgres -d stock_trader
do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - executing migrations"

# Run migrations
npx sequelize-cli db:migrate

echo "Running seeders..."
# Run seeders
npx sequelize-cli db:seed:all

echo "Database initialization complete"
