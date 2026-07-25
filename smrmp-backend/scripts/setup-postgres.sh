#!/usr/bin/env bash
# BE-SETUP-004 — Create local PostgreSQL for SMRMP
#
# Preferred (no sudo): Docker container on port 5435
#   docker run -d --name smrmp-postgres \
#     -e POSTGRES_DB=smrmp_db \
#     -e POSTGRES_USER=smrmp_user \
#     -e POSTGRES_PASSWORD=smrmp_pass \
#     -p 5435:5432 postgres:16-alpine
#   Then set DB_PORT=5435 in .env
#
# Alternative: local Postgres via this script (may require sudo)
set -euo pipefail

DB_NAME="${DB_NAME:-smrmp_db}"
DB_USER="${DB_USER:-smrmp_user}"
DB_PASSWORD="${DB_PASSWORD:-smrmp_pass}"
DB_PORT="${DB_PORT:-5432}"

if docker ps --format '{{.Names}}' 2>/dev/null | grep -qx 'smrmp-postgres'; then
  echo "smrmp-postgres container already running."
  echo "Use DB_PORT=5435 (mapped) in .env"
  docker exec smrmp-postgres pg_isready -U "$DB_USER" -d "$DB_NAME"
  exit 0
fi

if command -v docker >/dev/null 2>&1; then
  echo "Starting smrmp-postgres Docker container on host port 5435..."
  docker run -d --name smrmp-postgres \
    -e POSTGRES_DB="$DB_NAME" \
    -e POSTGRES_USER="$DB_USER" \
    -e POSTGRES_PASSWORD="$DB_PASSWORD" \
    -p 5435:5432 \
    postgres:16-alpine
  sleep 3
  docker exec smrmp-postgres pg_isready -U "$DB_USER" -d "$DB_NAME"
  echo "Done. Set in .env:"
  echo "  DB_HOST=localhost"
  echo "  DB_PORT=5435"
  echo "  DB_NAME=${DB_NAME}"
  echo "  DB_USER=${DB_USER}"
  echo "  DB_PASSWORD=${DB_PASSWORD}"
  exit 0
fi

echo "Docker not available; attempting local psql on port ${DB_PORT}..."

if command -v sudo >/dev/null 2>&1 && id postgres >/dev/null 2>&1; then
  sudo -u postgres psql -p "$DB_PORT" -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';
  ELSE
    ALTER ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL
else
  echo "Cannot create DB automatically. Install Docker or create role/db manually."
  exit 1
fi

echo "Done. Update .env DB_* values accordingly."
