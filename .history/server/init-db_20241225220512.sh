#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE postgress;
    GRANT ALL PRIVILEGES ON DATABASE postgress TO postgres;
EOSQL

echo "Database initialization completed"
