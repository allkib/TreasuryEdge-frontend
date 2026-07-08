import { LadderDashboard, LadderHolding, TaxSettings } from '../models/ladder.model';

export const DEMO_HOLDINGS: LadderHolding[] = [
  {
    id: 'demo-1',
    cusip: '912796XX0',
    term: '4-Week',
    parValue: 25_000,
    pricePaid: 24_875,
    issueDate: '2026-06-10',
    maturityDate: '2026-07-15',
    rate: 4.28,
  },
  {
    id: 'demo-2',
    cusip: '912796XY1',
    term: '13-Week',
    parValue: 50_000,
    pricePaid: 49_520,
    issueDate: '2026-04-15',
    maturityDate: '2026-07-17',
    rate: 4.35,
  },
  {
    id: 'demo-3',
    cusip: '912796XZ2',
    term: '26-Week',
    parValue: 75_000,
    pricePaid: 73_800,
    issueDate: '2026-02-01',
    maturityDate: '2026-08-01',
    rate: 4.41,
  },
  {
    id: 'demo-4',
    cusip: '912810TM4',
    term: '52-Week',
    parValue: 100_000,
    pricePaid: 96_200,
    issueDate: '2025-07-10',
    maturityDate: '2026-07-10',
    rate: 4.52,
  },
];

export const DEMO_DASHBOARD: LadderDashboard = {
  totalInvested: 244_395,
  valueAtMaturity: 251_842,
  nextMaturity: {
    date: '2026-07-15',
    holding: DEMO_HOLDINGS[0],
  },
  annualizedYield: 4.38,
  estimatedTaxesDueThisQuarter: 418.5,
};

export const DEMO_TAX_SETTINGS: TaxSettings = {
  marginalTaxRate: 0.24,
  paysEstimatedTaxes: true,
};
