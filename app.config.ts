import { PgConfig } from "./src/models/database/PgConfig";

interface ApplicationConfig {
  PgConfig?: PgConfig;
  ApiServiceConfig: ServiceConfig;
}

export interface ServiceConfig {
  url?: string;
  port?: number;
}

export const CONFIG: ApplicationConfig = {
  PgConfig: {
    host: "134.122.16.140",
    port: 5432,
    login: "zhenia",
    password: "a84hg7dT!!a",
    database: "postgres",
    schema: "public",
  },
  ApiServiceConfig: {
    url: "127.0.0.1",
    port: 9000,
  },
};

export const CONFIG_LOCAL: ApplicationConfig = {
  PgConfig: {
    host: "127.0.0.1",
    port: 5432,
    login: "postgres",
    password: "admin",
    database: "postgres",
    schema: "public",
  },
  ApiServiceConfig: {
    url: "127.0.0.1",
    port: 9000,
  },
};
