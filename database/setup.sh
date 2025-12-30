#!/bin/bash

# Database Setup Script for Bank Sync Service
# This script sets up the database schema for the Bank Sync Service

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration (can be overridden by environment variables)
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres}"
DB_SCHEMA="${DB_SCHEMA:-public}"
SCHEMA_FILE="${SCHEMA_FILE:-$(dirname "$0")/schema.sql}"

echo -e "${GREEN}Bank Sync Service - Database Setup${NC}"
echo "=========================================="
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Schema: $DB_SCHEMA"
echo "Schema File: $SCHEMA_FILE"
echo ""

# Check if schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
    echo -e "${RED}Error: Schema file not found: $SCHEMA_FILE${NC}"
    exit 1
fi

# Prompt for password if not set
if [ -z "$DB_PASSWORD" ]; then
    echo -n "Enter database password for user $DB_USER: "
    read -s DB_PASSWORD
    echo ""
fi

# Export password for psql
export PGPASSWORD="$DB_PASSWORD"

# Test database connection
echo -e "${YELLOW}Testing database connection...${NC}"
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to database${NC}"
    echo "Please check your database configuration and credentials"
    exit 1
fi
echo -e "${GREEN}Database connection successful${NC}"
echo ""

# Create schema if it doesn't exist
echo -e "${YELLOW}Ensuring schema exists...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "CREATE SCHEMA IF NOT EXISTS $DB_SCHEMA;" > /dev/null 2>&1
echo -e "${GREEN}Schema ready${NC}"
echo ""

# Run schema file
echo -e "${YELLOW}Creating database tables...${NC}"
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_FILE"; then
    echo -e "${GREEN}Database setup completed successfully!${NC}"
else
    echo -e "${RED}Error: Database setup failed${NC}"
    exit 1
fi

# Unset password
unset PGPASSWORD

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo "You can now start the Bank Sync Service"

