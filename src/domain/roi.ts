export interface BenefitAssumptions {
  // Time Savings
  timeSavingMinutesPerTx: number;
  txPerMonth: number;
  automationRate: number; // 0.0 to 1.0
  hourlyRate: number; // Cost of human labor being saved

  // Optional: Error Reduction
  currentErrorRate?: number; // 0.0 to 1.0 (e.g. 0.05 for 5%)
  targetErrorRate?: number; // 0.0 to 1.0 (e.g. 0.01 for 1%)
  costPerError?: number;

  // Optional: Revenue Uplift
  upliftPercent?: number; // 0.0 to 1.0 (e.g. 0.02 for 2%)
  baseRevenuePerMonth?: number;

  // Adoption
  adoptionRate: number; // 0.0 to 1.0 (Year 1 avg)
}

export const DEFAULT_BENEFIT_ASSUMPTIONS: BenefitAssumptions = {
  timeSavingMinutesPerTx: 5,
  txPerMonth: 1000,
  automationRate: 0.8,
  hourlyRate: 50,
  adoptionRate: 0.5,
  currentErrorRate: 0,
  targetErrorRate: 0,
  costPerError: 0,
  upliftPercent: 0,
  baseRevenuePerMonth: 0
};

export interface RoiResult {
  annualTimeSavingBenefit: number;
  annualErrorBenefit: number;
  annualRevenueBenefit: number;
  annualTotalBenefit: number;
  annualCost: number;
  netBenefit: number;
  roiPercent: number;
  paybackMonths: number;
  oneYear: { totalBenefit: number; totalCost: number; netBenefit: number; roiPercent: number };
  threeYear: { totalBenefit: number; totalCost: number; netBenefit: number; roiPercent: number };
  fiveYear: { totalBenefit: number; totalCost: number; netBenefit: number; roiPercent: number };
}

export function calculateRoi(assumptions: BenefitAssumptions, oneTimeCost: number, monthlyCost: number): RoiResult {
  // 1. Time Savings Benefit
  // Transactions handled by agent = Total Tx * Automation Rate * Adoption Rate
  const automatedTxPerMonth = assumptions.txPerMonth * assumptions.automationRate * assumptions.adoptionRate;
  const hoursSavedPerMonth = (automatedTxPerMonth * assumptions.timeSavingMinutesPerTx) / 60;
  const monthlyTimeSavingBenefit = hoursSavedPerMonth * assumptions.hourlyRate;
  const annualTimeSavingBenefit = monthlyTimeSavingBenefit * 12;

  // 2. Error Reduction Benefit (Optional)
  let annualErrorBenefit = 0;
  if (assumptions.currentErrorRate && assumptions.costPerError) {
    // We assume the agent makes fewer errors, or we only count errors on the automated portion?
    // Usually, ROI models assume the agent has 0 errors or a much lower error rate on the automated portion.
    // Let's assume the "Target Error Rate" applies to the automated portion, 
    // or that the automated portion replaces human work which had the "Current Error Rate".
    
    // Errors avoided = Automated Tx * (Current Rate - Target Rate)
    // If target rate is undefined, assume 0 for automated tasks.
    const targetRate = assumptions.targetErrorRate || 0;
    const errorDelta = Math.max(0, (assumptions.currentErrorRate - targetRate));
    const errorsAvoidedPerMonth = automatedTxPerMonth * errorDelta;
    annualErrorBenefit = errorsAvoidedPerMonth * assumptions.costPerError * 12;
  }

  // 3. Revenue Uplift (Optional)
  let annualRevenueBenefit = 0;
  if (assumptions.upliftPercent && assumptions.baseRevenuePerMonth) {
    // Revenue increase due to better availability/upsell on the automated portion?
    // Or just general uplift? Let's apply uplift to the share of business touched by the agent.
    // Proxy: Adoption Rate * Base Revenue * Uplift
    const monthlyRevenueBenefit = assumptions.baseRevenuePerMonth * assumptions.adoptionRate * assumptions.upliftPercent;
    annualRevenueBenefit = monthlyRevenueBenefit * 12;
  }

  const annualTotalBenefit = annualTimeSavingBenefit + annualErrorBenefit + annualRevenueBenefit;
  const annualRunCost = monthlyCost * 12;
  const firstYearCost = oneTimeCost + annualRunCost;
  const netBenefit = annualTotalBenefit - firstYearCost;
  
  // ROI % (First Year)
  const roiPercent = firstYearCost > 0 ? (netBenefit / firstYearCost) * 100 : 0;

  // Payback Period (Months)
  // Cost / (Monthly Benefit)
  // We need to cover the One-Time Cost + Monthly Costs.
  // Net Monthly Cashflow = Monthly Benefit - Monthly Cost
  const monthlyBenefit = annualTotalBenefit / 12;
  const netMonthlyCashflow = monthlyBenefit - monthlyCost;
  
  // If we are losing money every month, we never pay back.
  // If we make money, Payback = OneTimeCost / NetMonthlyCashflow
  const paybackMonths = netMonthlyCashflow > 0 ? oneTimeCost / netMonthlyCashflow : 0;

  // Multi-year projections
  // Note: This is a simplified model assuming constant benefits and costs over time.
  // In reality, adoption might ramp up, costs might change, etc.
  
  const calculatePeriod = (years: number) => {
    const totalBenefit = annualTotalBenefit * years;
    const totalCost = oneTimeCost + (annualRunCost * years);
    const net = totalBenefit - totalCost;
    const roi = totalCost > 0 ? (net / totalCost) * 100 : 0;
    return { totalBenefit, totalCost, netBenefit: net, roiPercent: roi };
  };

  return {
    annualTimeSavingBenefit,
    annualErrorBenefit,
    annualRevenueBenefit,
    annualTotalBenefit,
    annualCost: firstYearCost,
    netBenefit,
    roiPercent,
    paybackMonths,
    oneYear: calculatePeriod(1),
    threeYear: calculatePeriod(3),
    fiveYear: calculatePeriod(5)
  };
}
