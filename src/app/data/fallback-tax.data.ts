import { FilingStatus, TaxRateResponse } from '../models/tax.model';

interface TaxBracket {
  rate: number;
  min: number;
  max: number | null;
}

/** 2026 single-filer state brackets — mirrors backend fallback data. */
const PROGRESSIVE_BRACKETS: Record<string, TaxBracket[]> = {
  CA: [
    { rate: 0.01, min: 0, max: 10756 },
    { rate: 0.02, min: 10757, max: 25499 },
    { rate: 0.04, min: 25500, max: 40245 },
    { rate: 0.06, min: 40246, max: 55866 },
    { rate: 0.08, min: 55867, max: 71006 },
    { rate: 0.093, min: 71007, max: 91505 },
    { rate: 0.103, min: 91506, max: 117013 },
    { rate: 0.113, min: 117014, max: 645751 },
    { rate: 0.123, min: 645752, max: 999999 },
    { rate: 0.133, min: 1000000, max: null },
  ],
  NY: [
    { rate: 0.04, min: 0, max: 8500 },
    { rate: 0.045, min: 8501, max: 11700 },
    { rate: 0.0525, min: 11701, max: 13900 },
    { rate: 0.055, min: 13901, max: 80650 },
    { rate: 0.06, min: 80651, max: 215400 },
    { rate: 0.0685, min: 215401, max: 1077550 },
    { rate: 0.0965, min: 1077551, max: 5000000 },
    { rate: 0.103, min: 5000001, max: 25000000 },
    { rate: 0.109, min: 25000001, max: null },
  ],
  NJ: [
    { rate: 0.014, min: 0, max: 20000 },
    { rate: 0.0175, min: 20001, max: 35000 },
    { rate: 0.035, min: 35001, max: 40000 },
    { rate: 0.05525, min: 40001, max: 75000 },
    { rate: 0.0637, min: 75001, max: 500000 },
    { rate: 0.0897, min: 500001, max: 1000000 },
    { rate: 0.1075, min: 1000001, max: null },
  ],
  OR: [
    { rate: 0.0475, min: 0, max: 4300 },
    { rate: 0.0675, min: 4301, max: 10750 },
    { rate: 0.0875, min: 10751, max: 125000 },
    { rate: 0.099, min: 125001, max: null },
  ],
  MN: [
    { rate: 0.0535, min: 0, max: 32570 },
    { rate: 0.068, min: 32571, max: 106990 },
    { rate: 0.0785, min: 106991, max: 198630 },
    { rate: 0.0985, min: 198631, max: null },
  ],
};

/** Flat-rate states (approximate single-filer marginal near median income). */
const FLAT_RATES: Record<string, number> = {
  AL: 0.05,
  AZ: 0.0259,
  AR: 0.044,
  CO: 0.0455,
  CT: 0.05,
  DE: 0.066,
  GA: 0.055,
  HI: 0.0725,
  ID: 0.058,
  IL: 0.0495,
  IN: 0.0315,
  IA: 0.057,
  KS: 0.057,
  KY: 0.04,
  LA: 0.0425,
  ME: 0.0715,
  MD: 0.05,
  MA: 0.05,
  MI: 0.0425,
  MS: 0.05,
  MO: 0.0495,
  MT: 0.059,
  NE: 0.0664,
  NM: 0.049,
  NC: 0.0475,
  ND: 0.025,
  OH: 0.035,
  OK: 0.0475,
  PA: 0.0307,
  RI: 0.0599,
  SC: 0.065,
  UT: 0.0465,
  VT: 0.066,
  VA: 0.0575,
  WV: 0.06,
  WI: 0.053,
};

const NO_INCOME_TAX_STATES = new Set(['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY']);

function marginalRateFromBrackets(income: number, brackets: TaxBracket[]): number {
  const taxableIncome = Math.max(income, 0);

  for (const bracket of brackets) {
    const upper = bracket.max ?? Number.POSITIVE_INFINITY;

    if (taxableIncome >= bracket.min && taxableIncome <= upper) {
      return bracket.rate;
    }
  }

  return brackets[brackets.length - 1]?.rate ?? 0;
}

function topMarginalRate(brackets: TaxBracket[]): number {
  return brackets[brackets.length - 1]?.rate ?? 0;
}

export function getFallbackTaxRate(
  stateCode: string,
  income: number,
  filingStatus: FilingStatus = 'single',
): TaxRateResponse {
  const normalizedIncome = Math.max(Number(income) || 0, 0);

  if (NO_INCOME_TAX_STATES.has(stateCode)) {
    return {
      stateCode,
      income: normalizedIncome,
      filingStatus,
      marginalRate: 0,
      marginalRateAtIncome: 0,
      topMarginalRate: 0,
      hasStateIncomeTax: false,
    };
  }

  const brackets = PROGRESSIVE_BRACKETS[stateCode];

  if (brackets) {
    const marginalRate = marginalRateFromBrackets(normalizedIncome, brackets);

    return {
      stateCode,
      income: normalizedIncome,
      filingStatus,
      marginalRate,
      marginalRateAtIncome: marginalRate,
      topMarginalRate: topMarginalRate(brackets),
      hasStateIncomeTax: marginalRate > 0,
    };
  }

  const marginalRate = FLAT_RATES[stateCode] ?? 0.05;

  return {
    stateCode,
    income: normalizedIncome,
    filingStatus,
    marginalRate,
    marginalRateAtIncome: marginalRate,
    topMarginalRate: marginalRate,
    hasStateIncomeTax: marginalRate > 0,
  };
}
