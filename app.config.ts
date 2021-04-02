import { PgConfig } from './src/controllers/data-controller/database/PgConfig';

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
    host: '127.0.0.1',
    port: 5432,
    login: 'postgres',
    password: 'admin',
    database: 'postgres',
    schema: 'public',
  },
  // ApiServiceConfig: {
  //   url: 'https://dinero-app.com/sessions',
  //   port: undefined,
  // },
  ApiServiceConfig: {
    url: '127.0.0.1',
    port: 9000,
  }
};
