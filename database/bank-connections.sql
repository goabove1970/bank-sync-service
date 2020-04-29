-- Table: public.bank_connections

-- DROP TABLE public.bank_connections;

CREATE TABLE public.bank_connections
(
    connection_id character varying COLLATE pg_catalog."default" NOT NULL,
    user_id character varying COLLATE pg_catalog."default" NOT NULL,
    bank_name character varying COLLATE pg_catalog."default" NOT NULL,
    login character varying COLLATE pg_catalog."default" NOT NULL,
    password character varying COLLATE pg_catalog."default" NOT NULL,
    date_added timestamp with time zone NOT NULL,
    status integer,
    last_poll_date timestamp with time zone,
    last_polls_stats character varying COLLATE pg_catalog."default",
    CONSTRAINT bank_connections_pkey PRIMARY KEY (connection_id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.bank_connections
    OWNER to postgres;