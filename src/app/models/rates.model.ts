export interface TBillRate {
  cusip?: string;
  securityType?: string;
  securityTerm: string;
  auctionDate?: string;
  highInvestmentRate: number;
  taxEquivalentYield?: number;
}

export interface BankRate {
  bankName: string;
  accountType: 'Savings' | 'CD' | string;
  apy: number;
  state?: string;
}

export interface ComparisonResponse {
  stateTaxRate: number;
  state?: string;
  tbills: TBillRate[];
  banks: BankRate[];
}
