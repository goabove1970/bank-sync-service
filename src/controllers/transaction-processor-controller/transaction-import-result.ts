export interface TransactionImprtResult {
  parsed: number;
  duplicates: number;
  newTransactions: number;
  businessRecognized: number;
  multipleBusinessesMatched: number;
  unrecognized: number;
  unposted: number;
}
