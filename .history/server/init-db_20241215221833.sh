#!/bin/sh

echo "Waiting for PostgreSQL..."

# Wait for PostgreSQL to be ready
while ! nc -z postgres 5432; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is up - executing migrations"

# Run migrations
npx sequelize-cli db:migrate

# Start the application
echo "Starting the application..."
npm start
