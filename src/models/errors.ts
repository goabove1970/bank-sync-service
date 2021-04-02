class ErrorBase {
  constructor(errorMesage?: string) {
    this.errorMessage = errorMesage;
  }
  errorMessage?: string;
  errorCode?: number;
}

export class DatabaseError extends ErrorBase {
  constructor(errorMesage?: string) {
    super(errorMesage || 'could not process database request');
  }
}

export class BankConnectionError extends ErrorBase {
  constructor(errorMesage?: string) {
    super(errorMesage || 'could not process bank connection request');
  }
}
