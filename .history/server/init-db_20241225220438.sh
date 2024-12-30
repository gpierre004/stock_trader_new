#!/bin/bash

set -e

# Function to create database if it doesn't exist
create_database() {
    local database=$1
    echo "Creating database '$database'"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        SELECT 'CREATE DATABASE $database' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$database')\gexec
        GRANT ALL PRIVILEGES ON DATABASE $database TO postgres;
EOSQL
}

# Create the additional postgress database
create_database "postgress"

echo "Database initialization completed"
