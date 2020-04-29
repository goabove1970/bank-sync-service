import { Client, Configuration, Result } from 'ts-postgres';
import { PgConfig } from './PgConfig';
import { CONFIG } from '@root/app.config';
import logger from '@root/src/logger';

export class PgPool {
  private client: Client;
  private _config: PgConfig;

  get connected(): boolean {
    return !this.client.closed;
  }

  get config(): PgConfig {
    return this._config;
  }

  constructor(config: PgConfig) {
    this._config = config;
    const clientConfiguration: Configuration = {
      database: this._config.database,
      host: this._config.host,
      port: this._config.port,
      user: this._config.login,
      password: this._config.password,
      keepAlive: true,
    };
    this.client = new Client(clientConfiguration);
    this.client
      .connect()
      .then(() => {
        this.client.on('error', console.error);
      })
      .then(() => {
        if (!this.client.closed) {
          logger.info(`Conneted to the database: ${this.client.config.database}:${this.client.config.port}`);
        }
      });
  }

  query(query?: string): Promise<Result> {
    logger.debug(`Running database query: [${query}]`);
    return this.client
      .query(query)
      .then((r) => {
        logger.debug(`Got database result [${JSON.stringify(r, null, 4)}]`);
        return r;
      })
      .catch((error) => {
        throw error;
      });
  }
}

const pool = new PgPool(CONFIG.PgConfig);
export default pool;
