import pool from "./PgPool";
import { Value, Result } from "ts-postgres";
import { CONFIG } from "@root/app.config";
import logger from "@root/src/logger";

export abstract class DataController<T> {}

export abstract class DatabaseController<T> extends DataController<T> {
  tableName: string;
  constructor(table: string) {
    super();
    this.tableName = table;
    logger.info(
      `Initializing DatabaseController for [${this.tableName}] (${CONFIG.PgConfig.login}@${CONFIG.PgConfig.host}:${CONFIG.PgConfig.port}/${CONFIG.PgConfig.database})`
    );
  }

  abstract readSelectResponse(values: Value[][]): T[];

  query(query?: string): Promise<Result> {
    try {
      return pool.query(query);
    } catch (error) {
      logger.error(error.message || error);
      throw error;
    }
  }

  delete(where?: string): Promise<Result> {
    return pool.query(
      `DELETE FROM ${CONFIG.PgConfig.schema}.${this.tableName} ${where}`
    );
  }

  select(where?: string, fields?: string): Promise<T[]> {
    return pool
      .query(
        `SELECT ${fields ? fields : "*"} FROM ${CONFIG.PgConfig.schema}.${
          this.tableName
        } ${where}`
      )
      .then((value) => {
        const { rows } = value;
        const categories = this.readSelectResponse(rows);
        return categories;
      });
  }

  count(where?: string): Promise<number> {
    return pool
      .query(
        `SELECT * FROM ${CONFIG.PgConfig.schema}.${this.tableName} ${
          where ? where : ""
        };`
      )
      .then((value) => {
        const { rows } = value;
        return rows.length;
      });
  }

  update(where?: string): Promise<Result> {
    return pool.query(
      `UPDATE ${CONFIG.PgConfig.schema}.${this.tableName} ${where}`
    );
  }

  insert(where?: string): Promise<Result> {
    return pool.query(
      `INSERT INTO ${CONFIG.PgConfig.schema}.${this.tableName} ${where}`
    );
  }
}
