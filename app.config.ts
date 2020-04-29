import { PgConfig } from './src/controllers/data-controller/database/PgConfig';

export interface ApplicationConfig {
    PgConfig?: PgConfig;
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
};
