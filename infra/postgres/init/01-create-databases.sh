#!/usr/bin/env bash
# Crée une base de données par microservice (DB-per-service).
# Exécuté automatiquement par l'image postgres au premier boot.

set -euo pipefail

create_db_if_missing() {
  local db="$1"
  if ! psql -tAc "SELECT 1 FROM pg_database WHERE datname='${db}'" | grep -q 1; then
    echo "Creating database ${db}";
    psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${db} OWNER ${POSTGRES_USER}";
  else
    echo "Database ${db} already exists";
  fi
}

for DB in keycloak users exams gradings notifications; do
  create_db_if_missing "${DB}"
done
