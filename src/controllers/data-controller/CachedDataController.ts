import { DataController } from './DataController';

export abstract class CachedDataController<T> extends DataController<T> {
  cache: T[];
  abstract cacheAllRecords(): number;
  abstract commitAllRecords(): number;
}
