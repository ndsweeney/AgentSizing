import type { SizingResult } from './types';

export interface CostEstimate {
  implementation: {
    min: number;
    max: number;
  };
  annualRun: {
    licensing: number;
    azure: number;
    support: number;
  };
  totalFirstYear: {
    min: number;
    max: number;
  };
}

export function calculateEstimatedCosts(result: SizingResult): CostEstimate {
  let implMin = 0;
  let implMax = 0;
  let licensing = 0;
  let azure = 0;
  let support = 0;

  // Base estimates on T-Shirt Size
  switch (result.tShirtSize) {
    case 'SMALL':
      implMin = 40000;
      implMax = 80000;
      licensing = 12000; // ~$1k/mo
      azure = 6000;      // ~$500/mo
      support = 10000;
      break;
    case 'MEDIUM':
      implMin = 120000;
      implMax = 250000;
      licensing = 60000; // ~$5k/mo
      azure = 24000;     // ~$2k/mo
      support = 40000;
      break;
    case 'LARGE':
      implMin = 400000;
      implMax = 800000;
      licensing = 180000; // ~$15k/mo
      azure = 60000;      // ~$5k/mo
      support = 120000;
      break;
  }

  // Adjust based on specific complexity drivers
  // High complexity increases implementation cost
  // @ts-ignore - scoreBreakdown is not in the type definition but is available at runtime or we need to pass scores
  // Actually, let's use the result properties that are derived from scores if possible, or just assume standard sizing
  // For now, we will stick to T-Shirt size as the primary driver to avoid type errors, 
  // or we can update the SizingResult type. 
  // Let's update SizingResult type in types.ts to include scoreBreakdown or pass scores directly.
  
  // Instead of modifying types now, let's use the T-Shirt size logic which is robust enough for this estimation.
  
  return {
    implementation: {
      min: Math.round(implMin / 1000) * 1000,
      max: Math.round(implMax / 1000) * 1000
    },
    annualRun: {
      licensing: Math.round(licensing / 1000) * 1000,
      azure: Math.round(azure / 1000) * 1000,
      support: Math.round(support / 1000) * 1000
    },
    totalFirstYear: {
      min: Math.round((implMin + licensing + azure + support) / 1000) * 1000,
      max: Math.round((implMax + licensing + azure + support) / 1000) * 1000
    }
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumSignificantDigits: 3
  }).format(amount);
}

import { DimensionId, type ScoresRecord } from './types';

export interface CostAssumptions {
  // Licensing
  copilotStudioLicensePerMonth: number; // e.g., $200 per tenant/month (base)
  copilotStudioMessagePackCost: number; // e.g., $50 per 25k messages
  messagesIncludedInBase: number; // e.g., 25000

  // Azure AI Foundry
  azureOpenAIInputTokenRate: number; // per 1k tokens
  azureOpenAIOutputTokenRate: number; // per 1k tokens
  averageTokensPerMessage: number; // e.g., 1000 (input + output)

  // Infrastructure
  storageCostPerGB: number; // e.g., $0.10
  apiCallCost: number; // Average cost per external API call

  // Labour (Implementation)
  blendedHourlyRate: number; // e.g., $150/hr
  hoursPerSprint: number; // e.g., 80 (2 weeks * 1 person) - usually team size * hours
  teamSize: number; // e.g., 3

  // Usage
  estimatedUsers: number;
  messagesPerUserPerMonth: number;
}

export const DEFAULT_COST_ASSUMPTIONS: CostAssumptions = {
  copilotStudioLicensePerMonth: 200,
  copilotStudioMessagePackCost: 50,
  messagesIncludedInBase: 25000,

  azureOpenAIInputTokenRate: 0.005, // GPT-3.5/4 mix approx
  azureOpenAIOutputTokenRate: 0.015,
  averageTokensPerMessage: 1000,

  storageCostPerGB: 0.15,
  apiCallCost: 0.002,

  blendedHourlyRate: 150,
  hoursPerSprint: 80, 
  teamSize: 3,

  estimatedUsers: 500,
  messagesPerUserPerMonth: 20,
};

export interface CostItem {
  category: 'Licensing' | 'Infrastructure' | 'Implementation' | 'Maintenance';
  name: string;
  monthlyCost: number;
  oneTimeCost: number;
  description: string;
}

export interface CostBreakdown {
  items: CostItem[];
  totalOneTime: number;
  totalMonthly: number;
  totalAnnual: number;
  sprintsEstimate: number;
  implementationCost: {
    min: number;
    max: number;
  };
}

export function calculateDetailedCosts(
  result: SizingResult, 
  scores: ScoresRecord, 
  assumptions: CostAssumptions
): CostBreakdown {
  const items: CostItem[] = [];

  // --- 1. Licensing (Copilot Studio) ---
  const totalMessages = assumptions.estimatedUsers * assumptions.messagesPerUserPerMonth;
  const additionalMessages = Math.max(0, totalMessages - assumptions.messagesIncludedInBase);
  const packsNeeded = Math.ceil(additionalMessages / 25000);
  const messagePackCost = packsNeeded * assumptions.copilotStudioMessagePackCost;

  items.push({
    category: 'Licensing',
    name: 'Copilot Studio Base Tenant',
    monthlyCost: assumptions.copilotStudioLicensePerMonth,
    oneTimeCost: 0,
    description: 'Base tenant license for Copilot Studio.'
  });

  if (messagePackCost > 0) {
    items.push({
      category: 'Licensing',
      name: `Message Packs (${packsNeeded})`,
      monthlyCost: messagePackCost,
      oneTimeCost: 0,
      description: `Additional capacity for ${additionalMessages.toLocaleString()} messages.`
    });
  }

  // --- 2. Azure AI Foundry (Token Usage) ---
  // Estimate GenAI usage based on complexity
  const complexityScore = scores[DimensionId.WorkflowComplexity] || 1;
  const genAiRatio = complexityScore === 3 ? 0.8 : complexityScore === 2 ? 0.5 : 0.2; // % of messages using GenAI
  
  const genAiMessages = totalMessages * genAiRatio;
  const totalTokens = genAiMessages * assumptions.averageTokensPerMessage;
  // Simplified: assume 1/3 input, 2/3 output for cost calc
  const inputTokens = totalTokens * 0.33;
  const outputTokens = totalTokens * 0.67;
  
  const azureCost = (inputTokens / 1000 * assumptions.azureOpenAIInputTokenRate) + 
                    (outputTokens / 1000 * assumptions.azureOpenAIOutputTokenRate);

  items.push({
    category: 'Infrastructure',
    name: 'Azure AI Foundry (Tokens)',
    monthlyCost: azureCost,
    oneTimeCost: 0,
    description: `Est. ${genAiMessages.toLocaleString()} GenAI messages/mo.`
  });

  // --- 3. Infrastructure (Storage & API) ---
  const systemsScore = scores[DimensionId.SystemsToIntegrate] || 1;
  const apiCallsPerMessage = systemsScore; // Rough proxy
  const totalApiCalls = totalMessages * apiCallsPerMessage;
  const apiCost = totalApiCalls * assumptions.apiCallCost;

  items.push({
    category: 'Infrastructure',
    name: 'API & Connector Usage',
    monthlyCost: apiCost,
    oneTimeCost: 0,
    description: `Est. ${totalApiCalls.toLocaleString()} API calls/mo.`
  });

  // --- 4. Implementation (Labour) ---
  // Sprints based on T-Shirt size + specific complexity drivers
  let baseSprints = 0;
  switch (result.tShirtSize) {
    case 'SMALL': baseSprints = 2; break;
    case 'MEDIUM': baseSprints = 6; break;
    case 'LARGE': baseSprints = 12; break;
  }
  
  // Adjust for specific high scores
  if ((scores[DimensionId.ChangeAndAdoption] || 0) >= 3) baseSprints += 2;
  if ((scores[DimensionId.DataSensitivity] || 0) >= 3) baseSprints += 1;

  const totalHours = baseSprints * assumptions.hoursPerSprint * assumptions.teamSize; // Total man-hours
  const implCost = totalHours * assumptions.blendedHourlyRate;

  items.push({
    category: 'Implementation',
    name: 'Initial Development',
    monthlyCost: 0,
    oneTimeCost: implCost,
    description: `Est. ${baseSprints} sprints, team of ${assumptions.teamSize}.`
  });

  // --- 5. Maintenance ---
  const maintenanceCost = implCost * 0.15 / 12; // 15% of impl cost annually, divided by 12
  items.push({
    category: 'Maintenance',
    name: 'Support & Maintenance',
    monthlyCost: maintenanceCost,
    oneTimeCost: 0,
    description: '15% of implementation cost annually.'
  });

  const totalOneTime = items.reduce((sum, item) => sum + item.oneTimeCost, 0);
  const totalMonthly = items.reduce((sum, item) => sum + item.monthlyCost, 0);

  return {
    items,
    totalOneTime,
    totalMonthly,
    totalAnnual: totalOneTime + (totalMonthly * 12),
    sprintsEstimate: baseSprints,
    implementationCost: {
      min: implCost * 0.8,
      max: implCost * 1.2
    }
  };
}
