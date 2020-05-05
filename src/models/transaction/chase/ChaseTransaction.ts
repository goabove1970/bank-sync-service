import { ChaseTransactionOriginType } from './ChaseTransactionOriginType';
import { ChaseTransactionType, CreditCardTransactionType } from './ChaseTransactionType';

export interface ChaseTransaction {
    Details: ChaseTransactionOriginType;
    PostingDate: Date;
    Description: string;
    Amount?: number;
    Type?: ChaseTransactionType;
    Balance?: number;
    CheckOrSlip?: string;
    CreditCardTransactionType?: CreditCardTransactionType;
    BankDefinedCategory?: string;
}
