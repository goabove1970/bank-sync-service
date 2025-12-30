#!/usr/bin/env node

/**
 * Database Setup Script for Bank Sync Service
 * This script creates the required database tables using Node.js
 * Works without requiring psql to be installed
 */

const { Client } = require('ts-postgres');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuration from environment or defaults (matching LOCAL_CONFIG in app.config.ts)
const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || process.env.DB_LOGIN || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'postgres',
  schema: process.env.DB_SCHEMA || 'public',
};

async function setupDatabase() {
  log('Bank Sync Service - Database Setup', 'green');
  log('==========================================', 'green');
  log(`Host: ${config.host}`);
  log(`Port: ${config.port}`);
  log(`Database: ${config.database}`);
  log(`User: ${config.user}`);
  log(`Schema: ${config.schema}`);
  log('');

  const schemaFile = path.join(__dirname, 'schema.sql');
  
  // Check if schema file exists
  if (!fs.existsSync(schemaFile)) {
    log(`Error: Schema file not found: ${schemaFile}`, 'red');
    process.exit(1);
  }

  // Read schema file
  const schemaSQL = fs.readFileSync(schemaFile, 'utf8');
  
  let client;
  
  try {
    log('Connecting to database...', 'yellow');
    client = new Client({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
    });

    await client.connect();
    log('Database connection successful!', 'green');
    log('');

    // Ensure schema exists
    log('Ensuring schema exists...', 'yellow');
    try {
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${config.schema};`);
      log('Schema ready', 'green');
    } catch (error) {
      log(`Warning: Could not create schema (may already exist): ${error.message}`, 'yellow');
    }
    log('');

    // Set search path
    await client.query(`SET search_path TO ${config.schema};`);
    
    // Execute the schema creation
    log('Creating database tables...', 'yellow');
    
    // Check if table already exists
    const tableExistsResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = '${config.schema}' 
        AND table_name = 'bank_connections'
      ) as exists;
    `);
    
    let tableExists = false;
    for (const row of tableExistsResult) {
      tableExists = row.get('exists') === true;
      break;
    }
    
    if (tableExists) {
      log('  ⚠ Table bank_connections already exists', 'yellow');
      log('  Skipping table creation. If you need to recreate it, drop it first.', 'yellow');
    } else {
      // Create the table
      const createTableSQL = `
        CREATE TABLE ${config.schema}.bank_connections
        (
            connection_id character varying COLLATE pg_catalog."default" NOT NULL,
            user_id character varying COLLATE pg_catalog."default" NOT NULL,
            bank_name character varying COLLATE pg_catalog."default" NOT NULL,
            login character varying COLLATE pg_catalog."default" NOT NULL,
            password character varying COLLATE pg_catalog."default" NOT NULL,
            date_added timestamp with time zone NOT NULL DEFAULT NOW(),
            status integer DEFAULT 0,
            last_poll_date timestamp with time zone,
            last_polls_stats character varying COLLATE pg_catalog."default",
            CONSTRAINT bank_connections_pkey PRIMARY KEY (connection_id)
        )
        WITH (
            OIDS = FALSE
        )
        TABLESPACE pg_default;
      `;
      
      await client.query(createTableSQL);
      log('  ✓ Created table: bank_connections', 'green');
      
      // Create indexes
      const indexes = [
        { name: 'idx_bank_connections_user_id', sql: `CREATE INDEX idx_bank_connections_user_id ON ${config.schema}.bank_connections(user_id);` },
        { name: 'idx_bank_connections_bank_name', sql: `CREATE INDEX idx_bank_connections_bank_name ON ${config.schema}.bank_connections(bank_name);` },
        { name: 'idx_bank_connections_status', sql: `CREATE INDEX idx_bank_connections_status ON ${config.schema}.bank_connections(status);` },
        { name: 'idx_bank_connections_user_bank', sql: `CREATE INDEX idx_bank_connections_user_bank ON ${config.schema}.bank_connections(user_id, bank_name);` },
      ];
      
      for (const idx of indexes) {
        try {
          await client.query(idx.sql);
          log(`  ✓ Created index: ${idx.name}`, 'green');
        } catch (error) {
          if (error.message.includes('already exists')) {
            log(`  ⚠ Index already exists: ${idx.name}`, 'yellow');
          } else {
            throw error;
          }
        }
      }
    }

    log('');
    log('Database setup completed successfully!', 'green');
    log('');
    log('You can now start the Bank Sync Service', 'green');
    
  } catch (error) {
    log('');
    log(`Error: ${error.message}`, 'red');
    if (error.stack) {
      log(`Stack: ${error.stack}`, 'red');
    }
    log('');
    log('Please check:');
    log('  1. PostgreSQL server is running', 'yellow');
    log('  2. Database credentials are correct', 'yellow');
    log('  3. User has CREATE TABLE permissions', 'yellow');
    log('');
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// Run the setup
setupDatabase().catch((error) => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
