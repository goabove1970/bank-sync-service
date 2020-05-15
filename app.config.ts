import { PgConfig } from './src/controllers/data-controller/database/PgConfig';

export interface ApplicationConfig {
  PgConfig?: PgConfig;
}

export const CONFIG: ApplicationConfig = {
  PgConfig: {
    host: 'dinero-db.cmi7wgy95mjp.us-east-2.rds.amazonaws.com',
    port: 5432,
    login: 'postgres',
    password: 'G62LHttp9FF9',
    database: 'postgres',
    schema: 'public',
  },
};
