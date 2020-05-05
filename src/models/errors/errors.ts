export class ErrorBase {
  constructor(errorMesage?: string) {
    this.errorMessage = errorMesage;
  }
  errorMessage?: string;
  errorCode?: number;
}

export class SessionError extends ErrorBase {
  constructor(errorMesage?: string) {
    super(errorMesage || 'could not process session request');
  }
}

export class DatabaseError extends ErrorBase {
  constructor(errorMesage?: string) {
    super(errorMesage || 'could not process database request');
  }
}

export class TransactionError extends ErrorBase {
  constructor(errorMesage?: string) {
    super(errorMesage || 'could not process transaction request');
  }
}

export class UserError extends ErrorBase {
  constructor(errorMesage?: string) {
    super(errorMesage || 'could not process user request');
  }
}

export class AccountError extends ErrorBase {
  constructor(errorMesage?: string) {
    super(errorMesage || 'could not process account request');
  }
}

export class SpendingRequestError extends ErrorBase {
  constructor(errorMesage?: string) {
    super(errorMesage || 'could not process spendings request');
  }
}

export class CategoryError extends ErrorBase {
  constructor(errorMesage?: string) {
    super(errorMesage || 'could not process category request');
  }
}

export class BusinessError extends ErrorBase {
  constructor(errorMesage?: string) {
    super(errorMesage || 'could not process business request');
  }
}
