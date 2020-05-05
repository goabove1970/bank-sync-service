import { CachedDataController } from './CachedDataController';
import { Parser } from '../parser-controller/Parser';
import * as fs from 'fs';

export class FileController<T> extends CachedDataController<T> {
  private filename: string;
  private readonly parser: Parser<T>;
  constructor(filename: string, parser: Parser<T>) {
    super();
    this.filename = filename;
    this.parser = parser;
    this.touchFile();
    this.cacheAllRecords();
  }
  touchFile() {
    if (!fs.existsSync(this.filename)) {
      fs.writeFileSync(this.filename, '', 'utf8');
    }
  }
  cacheAllRecords(): number {
    const data = fs.readFileSync(this.filename, 'utf8');
    this.cache = this.parser.parseFile(data);
    return this.cache.length;
  }
  commitAllRecords(): number {
    const csvTransactions = this.parser.itemsToFileString(this.cache || []);
    fs.writeFileSync(this.filename, csvTransactions, 'utf8');
    return this.cache.length;
  }
}
