export type LadderTerm = '4-Week' | '8-Week' | '13-Week' | '17-Week' | '26-Week' | '52-Week';

export interface LadderHolding {
  id: string;
  cusip?: string;
  term: LadderTerm;
  parValue: number;
  pricePaid: number;
  issueDate: string;
  maturityDate: string;
  rate: number;
}

export interface CreateLadderHoldingRequest {
  cusip?: string;
  term: LadderTerm;
  parValue: number;
  pricePaid: number;
  issueDate: string;
  maturityDate: string;
  rate: number;
}

export interface LadderNextMaturity {
  date: string;
  holding: LadderHolding;
}

export interface LadderDashboard {
  totalInvested: number;
  valueAtMaturity: number;
  nextMaturity: LadderNextMaturity | null;
  annualizedYield: number;
  estimatedTaxesDueThisQuarter: number;
}

export interface TaxSettings {
  marginalTaxRate: number;
  paysEstimatedTaxes: boolean;
}
