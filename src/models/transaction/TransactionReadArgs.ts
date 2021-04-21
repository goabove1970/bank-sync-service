export type CategorizationType = 'all' | 'uncategorized' | 'categorized';

export interface TransactionReadArg {
    transactionId?: string;
    startDate?: Date;
    endDate?: Date;
    accountId?: string;
    accountIds?: string[];
    readCount?: number;
    offset?: number;
    order?: SortOrder;
    countOnly?: boolean;
    categorization?: CategorizationType;
}

export enum SortOrder {
    accending,
    descending,
}
