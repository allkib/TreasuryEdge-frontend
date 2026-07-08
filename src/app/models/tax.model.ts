export type FilingStatus = 'single' | 'married' | 'married_separate' | 'head_of_household';

export interface TaxRateResponse {
  stateCode: string;
  income: number | null;
  filingStatus?: string;
  marginalRate: number;
  marginalRateAtIncome: number | null;
  topMarginalRate: number;
  hasStateIncomeTax: boolean;
}

export interface CompareSelection {
  stateCode: string;
  stateName: string;
  income: number;
  marginalRate: number;
  hasStateIncomeTax: boolean;
  isFallbackTax?: boolean;
}
