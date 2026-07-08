import { BankRate, ComparisonResponse, TBillRate } from '../models/rates.model';

const BASE_TBILLS: TBillRate[] = [
  {
    cusip: '912796XX0',
    securityType: 'Bill',
    securityTerm: '4-Week',
    highInvestmentRate: 4.28,
  },
  {
    cusip: '912796XY1',
    securityType: 'Bill',
    securityTerm: '8-Week',
    highInvestmentRate: 4.31,
  },
  {
    cusip: '912796XZ2',
    securityType: 'Bill',
    securityTerm: '13-Week',
    highInvestmentRate: 4.35,
  },
  {
    cusip: '912796ZA3',
    securityType: 'Bill',
    securityTerm: '26-Week',
    highInvestmentRate: 4.41,
  },
  {
    cusip: '912810TM4',
    securityType: 'Bill',
    securityTerm: '52-Week',
    highInvestmentRate: 4.52,
  },
];

const BASE_BANKS: BankRate[] = [
  { bankName: 'Marcus by Goldman Sachs', accountType: 'Savings', apy: 4.5 },
  { bankName: 'Ally Bank', accountType: 'Savings', apy: 4.2 },
  { bankName: 'Capital One', accountType: 'Savings', apy: 4.0 },
  { bankName: 'Discover Bank', accountType: 'Savings', apy: 4.0 },
  { bankName: 'Chase', accountType: 'Savings', apy: 0.01 },
  { bankName: 'Bank of America', accountType: 'Savings', apy: 0.01 },
  { bankName: 'Wells Fargo', accountType: 'Savings', apy: 0.01 },
  { bankName: 'Citibank', accountType: 'Savings', apy: 0.05 },
  { bankName: 'Chase', accountType: 'CD', apy: 0.05 },
  { bankName: 'Bank of America', accountType: 'CD', apy: 0.03 },
];

function withTaxEquivalentYield(tbills: TBillRate[], stateTaxRate: number): TBillRate[] {
  const divisor = 1 - stateTaxRate;

  return tbills.map((bill) => ({
    ...bill,
    taxEquivalentYield:
      divisor > 0 ? bill.highInvestmentRate / divisor : bill.highInvestmentRate,
  }));
}

export function getFallbackComparison(stateTaxRate: number): ComparisonResponse {
  return {
    stateTaxRate,
    tbills: withTaxEquivalentYield(BASE_TBILLS, stateTaxRate),
    banks: [...BASE_BANKS],
  };
}
