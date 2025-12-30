# Database Setup for Bank Sync Service

This directory contains SQL scripts for setting up the database schema required by the Bank Sync Service.

## Files

- `schema.sql` - Complete database schema definition with table creation and indexes
- `setup.sh` - Automated setup script that creates the database schema
- `bank-connections.sql` - Legacy schema file (kept for reference)
- `common.sql` - Common SQL queries (reference only, not for setup)
- `copy-transactions.sql` - Transaction copying utility (reference only)

## Quick Setup

### Option 1: Using the Setup Script (Recommended)

The easiest way to set up the database is using the provided shell script:

```bash
cd database
chmod +x setup.sh
./setup.sh
```

The script will prompt you for database credentials. You can also set them as environment variables:

```bash
DB_HOST=localhost \
DB_PORT=5432 \
DB_NAME=postgres \
DB_USER=postgres \
DB_PASSWORD=yourpassword \
./setup.sh
```

### Option 2: Manual Setup with psql

If you prefer to run the SQL manually:

```bash
psql -h localhost -U postgres -d postgres -f schema.sql
```

You will be prompted for the database password.

### Option 3: Using Environment Variables

You can set database connection details as environment variables and the script will use them:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=bank_sync_db
export DB_USER=bank_sync_user
export DB_PASSWORD=yourpassword

./setup.sh
```

## Database Requirements

- PostgreSQL 9.5 or higher
- A database (default: `postgres`)
- A user with CREATE TABLE permissions
- Access to the `public` schema (or modify schema in `app.config.ts`)

## Schema Details

The setup creates the following:

### Table: `bank_connections`

Stores bank connection credentials and synchronization status.

**Columns:**
- `connection_id` (VARCHAR, PRIMARY KEY) - Unique identifier for the connection
- `user_id` (VARCHAR, NOT NULL) - User identifier
- `bank_name` (VARCHAR, NOT NULL) - Bank name (e.g., CHASE, BANK_OF_AMERICA)
- `login` (VARCHAR, NOT NULL) - Bank account login username
- `password` (VARCHAR, NOT NULL) - Bank account password
- `date_added` (TIMESTAMP WITH TIME ZONE, NOT NULL) - When connection was added
- `status` (INTEGER) - Bitwise status flags
- `last_poll_date` (TIMESTAMP WITH TIME ZONE) - Last synchronization timestamp
- `last_polls_stats` (VARCHAR) - JSON statistics from last sync

**Indexes:**
- Primary key on `connection_id`
- Index on `user_id` for fast user lookups
- Index on `bank_name` for bank-specific queries
- Index on `status` for filtering by status
- Composite index on `(user_id, bank_name)` for common queries

**Status Flags:**
The `status` column uses bitwise flags:
- `1` = Active
- `2` = BankActivationRequired
- `4` = CouldNotConnect
- `8` = Suspended
- `16` = Validated

## Configuration

After setting up the database, make sure your `app.config.ts` file has the correct database connection settings:

```typescript
PgConfig: {
  host: "localhost",
  port: 5432,
  login: "postgres",
  password: "yourpassword",
  database: "postgres",
  schema: "public",
}
```

## Verification

After running the setup, verify the table was created:

```sql
\dt public.bank_connections
\d public.bank_connections
```

Or using psql:

```bash
psql -h localhost -U postgres -d postgres -c "\d public.bank_connections"
```

## Troubleshooting

### Error: relation "public.bank_connections" does not exist

This means the table hasn't been created yet. Run the setup script:

```bash
cd database
./setup.sh
```

### Error: permission denied for schema public

Make sure your database user has CREATE privileges:

```sql
GRANT CREATE ON SCHEMA public TO your_user;
```

### Error: password authentication failed

Double-check your database credentials in the setup script or environment variables.

## Notes

- The schema file is idempotent - it drops and recreates the table. For production, you may want to modify it to use `CREATE TABLE IF NOT EXISTS`.
- Passwords are stored in plain text in the database. In production, implement encryption at the application level.
- The `last_polls_stats` column stores JSON as a string. PostgreSQL 9.5+ supports JSONB, which could be used for better performance if needed.

