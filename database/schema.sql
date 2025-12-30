-- Bank Sync Service Database Schema
-- This script creates the required database tables for the Bank Sync Service
-- Run this script to set up the database schema
--
-- Usage:
--   psql -h localhost -U postgres -d postgres -f schema.sql
--   Or use the setup.sh script: ./database/setup.sh

-- Ensure we're using the correct schema
SET search_path TO public;

-- Drop existing table if it exists (for clean reinstall)
-- Note: This will delete all existing data. Comment out for production use.
-- DROP TABLE IF EXISTS public.bank_connections CASCADE;

-- Create bank_connections table
CREATE TABLE public.bank_connections
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

-- Create indexes for better query performance
CREATE INDEX idx_bank_connections_user_id ON public.bank_connections(user_id);
CREATE INDEX idx_bank_connections_bank_name ON public.bank_connections(bank_name);
CREATE INDEX idx_bank_connections_status ON public.bank_connections(status);
CREATE INDEX idx_bank_connections_user_bank ON public.bank_connections(user_id, bank_name);

-- Add comments for documentation
COMMENT ON TABLE public.bank_connections IS 'Stores bank connection credentials and synchronization status for users';
COMMENT ON COLUMN public.bank_connections.connection_id IS 'Unique identifier for the bank connection';
COMMENT ON COLUMN public.bank_connections.user_id IS 'User identifier that owns this bank connection';
COMMENT ON COLUMN public.bank_connections.bank_name IS 'Name of the bank (e.g., CHASE, BANK_OF_AMERICA)';
COMMENT ON COLUMN public.bank_connections.login IS 'Login username for the bank account';
COMMENT ON COLUMN public.bank_connections.password IS 'Password for the bank account (should be encrypted in production)';
COMMENT ON COLUMN public.bank_connections.date_added IS 'Timestamp when the connection was added';
COMMENT ON COLUMN public.bank_connections.status IS 'Bitwise status flags (Active=1, BankActivationRequired=2, CouldNotConnect=4, Suspended=8, Validated=16)';
COMMENT ON COLUMN public.bank_connections.last_poll_date IS 'Timestamp of the last successful synchronization';
COMMENT ON COLUMN public.bank_connections.last_polls_stats IS 'JSON string containing statistics from the last synchronization';

