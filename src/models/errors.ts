import { ErrorCode } from './error-codes';

class ErrorBase {
  constructor(errorMesage?: string, errorCode?: ErrorCode) {
    this.errorMessage = errorMesage;
    this.errorCode = errorCode;
  }
  errorMessage?: string;
  errorCode?: number;
}

export class DatabaseError extends ErrorBase {
  constructor(errorMesage?: string) {
    super(errorMesage || 'could not process database request', ErrorCode.DATABASE_ERROR);
  }
}

export class BankConnectionError extends ErrorBase {
  constructor(errorMesage?: string) {
    super(errorMesage || 'could not process bank connection request', ErrorCode.INTERNAL_ERROR);
  }
}
