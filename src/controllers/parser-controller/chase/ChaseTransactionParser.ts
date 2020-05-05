import { parseAmount, parseBalance } from '@controllers/parser-controller/helper';
import { Parser } from '../Parser';
import { parseChaseTransDetails, parseChaseTransactionType, parseCreditCardTransactionType } from './ChaseParseHelper';
import * as moment from 'moment';
import { ChaseTransaction } from '@models/transaction/chase/ChaseTransaction';
import { ParseError } from '@models/errors/parse-error';
import { ChaseTransactionOriginType } from '@root/src/models/transaction/chase/ChaseTransactionOriginType';

export class ChaseTransactionParser implements Parser<ChaseTransaction> {
    private chaseCsvHeader = 'Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #';
    private lineSeparator = '\n\r';
    getFileHeader(): string {
        return this.chaseCsvHeader;
    }
    itemToCsv(t: ChaseTransaction): string {
        const line = `${t.Details!.toString()},${moment(t.PostingDate).toString()},${t.Description},${
            t.Amount ? t.Amount!.toString() : undefined
        },${t.Type!.toString()},${t.Balance ? t.Balance!.toString() : undefined},${t.CheckOrSlip}`;
        return line;
    }
    itemsToFileString(transactions: ChaseTransaction[]): string {
        const csvLines: string[] = [this.getFileHeader()];
        transactions.forEach((t) => csvLines.push(this.itemToCsv(t)));
        return csvLines.join(this.lineSeparator).concat(this.lineSeparator);
    }
    parseDebitLine(line: string): ChaseTransaction | undefined {
        try {
            const parts = line.split(',');
            if (parts.length >= 7) {
                return {
                    Details: parseChaseTransDetails(parts[0]),
                    PostingDate: new Date(parts[1]),
                    Description: parts[2],
                    Amount: parseAmount(parts[3]),
                    Type: parseChaseTransactionType(parts[4]),
                    Balance: parseBalance(parts[5]),
                    CheckOrSlip: parts[6],
                } as ChaseTransaction;
            } else {
                throw {
                    message: 'Not enough parts in passed string, at least 7 expected',
                    originalString: line,
                };
            }
        } catch (error) {
            const parseError = error as ParseError;
            if (parseError !== undefined) {
                parseError.originalString = line;
                console.log(`ParseError: ${JSON.stringify(error, null, 4)}`);
                throw parseError;
            }
            console.log(error);
            throw {
                message: `Error Parsing ransaction: ${error.message}`,
                originalString: line,
            };

            return undefined;
        }
    }
    parseCreditLine(line: string): ChaseTransaction | undefined {
        try {
            const parts = line.split(',');
            if (parts.length == 6) {
                return {
                    Details: ChaseTransactionOriginType.Credit,
                    PostingDate: new Date(parts[1]),
                    Description: parts[2],
                    BankDefinedCategory: parts[3],
                    CreditCardTransactionType: parseCreditCardTransactionType(parts[4]),
                    Amount: parseAmount(parts[5]),
                } as ChaseTransaction;
            } else {
                throw {
                    message: 'Wrong parts number in passed string, 6 expected',
                    originalString: line,
                };
            }
        } catch (error) {
            const parseError = error as ParseError;
            if (parseError !== undefined) {
                parseError.originalString = line;
                console.log(`ParseError: ${JSON.stringify(error, null, 4)}`);
                throw parseError;
            }
            console.log(error);
            throw {
                message: `Error Parsing ransaction: ${error.message}`,
                originalString: line,
            };

            return undefined;
        }
    }
    parseDebitLines(lines: string[]): ChaseTransaction[] {
        return lines
            .map((m) => m.replace('\r', '').replace('\r', ''))
            .filter((s) => !!s && s.length > 0)
            .map((line: string) => {
                return this.parseDebitLine(line);
            })
            .filter((r) => (r as ChaseTransaction) !== undefined)
            .map((r) => r as ChaseTransaction);
    }
    parseCreditLines(lines: string[]): ChaseTransaction[] {
        return lines
            .map((m) => m.replace('\r', '').replace('\r', ''))
            .filter((s) => !!s && s.length > 0)
            .map((line: string) => {
                return this.parseCreditLine(line);
            })
            .filter((r) => (r as ChaseTransaction) !== undefined)
            .map((r) => r as ChaseTransaction);
    }
    parseFile(file: string): ChaseTransaction[] {
        let lines = file.split(/\n/);
        if (lines.length && lines.length > 0) {
            const csvHeader = lines[0];
            if (csvHeader.indexOf('Details,Posting Date,Description,Amount,Type,Balance,Check') === 0) {
                return this.parseDebitChunk(lines.splice(1));
            } else if (csvHeader === 'Transaction Date,Post Date,Description,Category,Type,Amount') {
                return this.parseCreditChunk(lines.splice(1));
            }
        }
        return [];
    }
    private parseDebitChunk = (lines: string[]): ChaseTransaction[] => {
        return this.parseDebitLines(lines);
    };
    private parseCreditChunk = (lines: string[]): ChaseTransaction[] => {
        return this.parseCreditLines(lines);
    };
}
