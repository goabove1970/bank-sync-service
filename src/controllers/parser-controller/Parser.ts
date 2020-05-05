export abstract class Parser<T> {
    abstract getFileHeader(): string;
    abstract parseDebitLine(line: string): T | undefined;
    abstract parseDebitLines(lines: string[]): T[];
    abstract parseFile(flie: string): T[];
    abstract itemToCsv(item: T): string;
    abstract itemsToFileString(items: T[]): string;
}
