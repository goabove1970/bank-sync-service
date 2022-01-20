import { PgConfig } from "./src/models/database/PgConfig";

interface ApplicationConfig {
  PgConfig?: PgConfig;
  ApiServiceConfig: ServiceConfig;
}

export interface ServiceConfig {
  url?: string;
  port?: number;
}

const CONFIG: ApplicationConfig = {
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

const LOCAL_CONFIG: ApplicationConfig = {
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

export const getConfig = (): ApplicationConfig => {
  if (process.env.NODE_ENV === "development") {
    return LOCAL_CONFIG;
  }
  return CONFIG;
};
