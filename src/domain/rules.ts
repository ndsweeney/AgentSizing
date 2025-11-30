import { 
  DimensionId, 
  type ScoresRecord, 
  type SizingResult, 
  type RecommendationResult, 
  type AgentRecommendation, 
  type TShirtSize,
  type CopilotArchitectureSpec,
  type GovernanceItem,
  type RiskProfile
} from './types';
import type { PromptTemplateConfig } from './prompts';
import type { GovernanceRuleConfig, RiskRuleConfig, ArchetypeTriggerConfig, CostDrivers, TestPlanTemplate, RuleCondition } from './logicTypes';
import { DEFAULT_GOVERNANCE_RULES, DEFAULT_ARCHETYPE_TRIGGERS } from './defaults';
import { type CostAssumptions } from './costs';
import { type BenefitAssumptions } from './roi';

export interface RulesConfig {
  sizingThresholds: typeof SIZING_THRESHOLDS;
  riskThresholds: typeof RISK_THRESHOLDS;
  promptTemplates?: Record<string, PromptTemplateConfig>;
  governanceRules?: GovernanceRuleConfig[];
  riskRules?: RiskRuleConfig[];
  archetypeTriggers?: ArchetypeTriggerConfig[];
  costDrivers?: CostDrivers;
  costAssumptions?: CostAssumptions;
  benefitAssumptions?: BenefitAssumptions;
  testPlanTemplates?: TestPlanTemplate[];
}

export const SIZING_THRESHOLDS = {
  MEDIUM: 12,
  LARGE: 19
};

export const RISK_THRESHOLDS = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

export const RISK_RULES = [
  {
    level: "HIGH",
    condition: "Data Sensitivity = High (3)",
    reason: "High data sensitivity (PII/Financial) requires strict governance."
  },
  {
    level: "HIGH",
    condition: "Systems to Integrate = High (3)",
    reason: "Integration with legacy/complex systems increases failure surface."
  },
  {
    level: "HIGH",
    condition: "3+ Medium Risk Factors",
    reason: "Multiple medium risk factors combined elevate overall risk."
  },
  {
    level: "MEDIUM",
    condition: "Data Sensitivity = Medium (2)",
    reason: "Internal sensitive data requires access controls."
  },
  {
    level: "MEDIUM",
    condition: "Workflow Complexity = High (3)",
    reason: "Non-deterministic workflows require rigorous testing."
  },
  {
    level: "MEDIUM",
    condition: "User Reach = High (3)",
    reason: "External/Global user base requires strict content safety."
  }
];

export const GOVERNANCE_RULES = [
  {
    trigger: "Data Sensitivity = High (3) OR Risk Level = High",
    requirement: "DPIA (Data Protection Impact Assessment)",
    category: "Compliance"
  },
  {
    trigger: "Workflow Complexity >= Medium (2) OR Data Sensitivity >= Medium (2)",
    requirement: "Human-in-the-loop Handoff Points",
    category: "Oversight"
  },
  {
    trigger: "Always",
    requirement: "Comprehensive Conversation Logging",
    category: "Traceability"
  },
  {
    trigger: "Always",
    requirement: "User Feedback Loop",
    category: "Operations"
  },
  {
    trigger: "User Reach = High (3)",
    requirement: "Jailbreak & Prompt Injection Testing",
    category: "Safety"
  },
  {
    trigger: "Risk Level != Low",
    requirement: "Azure AI Content Safety Filters (High)",
    category: "Safety"
  }
];

export function getGovernanceChecklist(scores: ScoresRecord, riskProfile: RiskProfile, rulesConfig?: RulesConfig): GovernanceItem[] {
  const items: GovernanceItem[] = [];
  const rules = rulesConfig?.governanceRules || DEFAULT_GOVERNANCE_RULES;

  for (const rule of rules) {
    if (evaluateRule(rule.conditions, scores, riskProfile)) {
      items.push({
        id: rule.id,
        category: rule.category,
        question: rule.description,
        required: true // Simplified for now, or we could add 'required' to the rule config
      });
    }
  }

  return items;
}

export function getArchitectureRecommendations(scores: ScoresRecord): string[] {
  const recs: string[] = [];
  const complexity = scores[DimensionId.WorkflowComplexity] || 0;
  const systems = scores[DimensionId.SystemsToIntegrate] || 0;
  const reach = scores[DimensionId.UserReach] || 0;
  const platform = scores[DimensionId.PlatformMix] || 0;

  if (complexity === 3) {
    recs.push("Implement a Router-Solver pattern to manage non-deterministic flows.");
    recs.push("Use a dedicated State Management layer for long-running conversations.");
  }

  if (systems >= 2) {
    recs.push("Adopt an API Gateway pattern to abstract backend complexity.");
    recs.push("Implement Circuit Breakers for resilience against legacy system failures.");
  }

  if (reach === 3) {
    recs.push("Deploy a global CDN for static assets and edge caching.");
    recs.push("Implement multi-channel support (Teams, Web, Mobile) via Experience Agents.");
  }

  if (platform === 3) {
    recs.push("Hybrid architecture: Copilot Studio for orchestration, Azure Functions for complex logic.");
    recs.push("Use Azure AI Search for RAG (Retrieval Augmented Generation) over unstructured data.");
  }

  if (recs.length === 0) {
    recs.push("Standard Copilot Studio architecture is sufficient.");
    recs.push("Focus on prompt engineering and topic design.");
  }

  return recs;
}

export function getDeliveryEstimate(scores: ScoresRecord, rulesConfig?: RulesConfig): string[] {
  const estimates: string[] = [];
  const thresholds = rulesConfig?.sizingThresholds || SIZING_THRESHOLDS;
  let totalScore = 0;
  Object.values(scores).forEach(s => totalScore += (s || 0));

  if (totalScore >= thresholds.LARGE) {
    estimates.push("Timeline: 4-6 months for MVP.");
    estimates.push("Phase 1: Foundation & Core Integrations (8 weeks).");
    estimates.push("Phase 2: Agent Development & Testing (12 weeks).");
    estimates.push("Phase 3: Pilot & Tuning (4-6 weeks).");
  } else if (totalScore >= thresholds.MEDIUM) {
    estimates.push("Timeline: 2-3 months for MVP.");
    estimates.push("Phase 1: Design & Setup (4 weeks).");
    estimates.push("Phase 2: Build & Integrate (6 weeks).");
    estimates.push("Phase 3: UAT & Launch (2-3 weeks).");
  } else {
    estimates.push("Timeline: 4-6 weeks for MVP.");
    estimates.push("Sprint 1-2: Configuration & Content.");
    estimates.push("Sprint 3: Testing & Deployment.");
  }

  return estimates;
}

export function getTeamComposition(scores: ScoresRecord): string[] {
  const team: string[] = [];
  const complexity = scores[DimensionId.WorkflowComplexity] || 0;
  const data = scores[DimensionId.DataSensitivity] || 0;
  const adoption = scores[DimensionId.ChangeAndAdoption] || 0;
  const platform = scores[DimensionId.PlatformMix] || 0;

  team.push("Product Owner (100%)");
  
  if (complexity >= 2 || platform >= 2) {
    team.push("Solution Architect (50-100%)");
    team.push("Senior Power Platform Developer (100%)");
  } else {
    team.push("Power Platform Maker (100%)");
  }

  if (data >= 2) {
    team.push("Security/Compliance Officer (Part-time)");
  }

  if (adoption >= 2) {
    team.push("Change Manager (50%)");
  }

  if (platform === 3) {
    team.push("Azure Developer / Pro-Code Dev (100%)");
  }

  return team;
}

export function getRiskControls(scores: ScoresRecord): string[] {
  const risks: string[] = [];
  const data = scores[DimensionId.DataSensitivity] || 0;
  const complexity = scores[DimensionId.WorkflowComplexity] || 0;
  const reach = scores[DimensionId.UserReach] || 0;

  if (data === 3) {
    risks.push("Data Leakage: Implement DLP policies and PII masking.");
    risks.push("Compliance: Mandatory legal review of all prompts and outputs.");
  }

  if (complexity === 3) {
    risks.push("Hallucinations: Implement strict grounding checks and citation requirements.");
    risks.push("Looping: Add conversation turn limits and exit conditions.");
  }

  if (reach === 3) {
    risks.push("Reputational Risk: Red-teaming required before public launch.");
    risks.push("Cost Overrun: Implement token usage monitoring and budget alerts.");
  }

  if (risks.length === 0) {
    risks.push("Standard operational risks apply.");
    risks.push("Monitor conversation quality regularly.");
  }

  return risks;
}

export function getRecommendations(scores: ScoresRecord): RecommendationResult {
  return {
    architecture: getArchitectureRecommendations(scores),
    delivery: getDeliveryEstimate(scores),
    team: getTeamComposition(scores),
    risks: getRiskControls(scores)
  };
}

export function getCopilotArchitectureSpec(scores: ScoresRecord): CopilotArchitectureSpec {
  const reach = scores[DimensionId.UserReach] || 0;
  const complexity = scores[DimensionId.WorkflowComplexity] || 0;
  const systems = scores[DimensionId.SystemsToIntegrate] || 0;
  const data = scores[DimensionId.DataSensitivity] || 0;
  const platform = scores[DimensionId.PlatformMix] || 0;
  const business = scores[DimensionId.BusinessScope] || 0;

  // Experience Agents
  let experienceAgents = "None (Direct Channel)";
  if (reach === 3) experienceAgents = "2+ (Multi-channel)";
  else if (reach === 2) experienceAgents = "1 (Unified Front-end)";

  // Value Stream Agents
  let valueStreamAgents = "Optional";
  if (business === 3) valueStreamAgents = "Required (Domain Separation)";
  else if (business === 2) valueStreamAgents = "Recommended";

  // Function Agents
  let functionAgents = "0-1";
  if (systems === 3) functionAgents = "3-5+ (Complex Backend)";
  else if (systems === 2) functionAgents = "2-3";

  // Process Agents
  let processAgents = "0";
  if (complexity === 3) processAgents = "3+ (Stateful Flows)";
  else if (complexity === 2) processAgents = "1-2";

  // Task Agents
  let taskAgents = "1-5";
  if (complexity >= 2 || systems >= 2) taskAgents = "5-10+";
  if (complexity === 3 && systems === 3) taskAgents = "10+";

  // Control Agents
  let controlAgents = "Not Required";
  if (data === 3 || complexity === 3) controlAgents = "Required (Governance/Routing)";
  else if (data === 2) controlAgents = "Recommended";

  // Foundry
  let foundryRequirement = "Standard Copilot Studio";
  if (platform === 3) foundryRequirement = "Required (Azure AI Foundry + Custom)";
  else if (platform === 2) foundryRequirement = "Recommended (Azure AI Search)";

  return {
    experienceAgents,
    valueStreamAgents,
    functionAgents,
    processAgents,
    taskAgents,
    controlAgents,
    foundryRequirement
  };
}

export function calculateSizingResult(scores: ScoresRecord, rulesConfig?: RulesConfig): SizingResult {
  let totalScore = 0;
  const notes: string[] = [];
  const recommendedAgentPattern: string[] = [];
  const thresholds = rulesConfig?.sizingThresholds || SIZING_THRESHOLDS;

  // Calculate total score
  Object.values(scores).forEach(score => {
    totalScore += (score || 0);
  });

  // Determine T-Shirt Size
  let tShirtSize: TShirtSize = "SMALL";
  if (totalScore >= thresholds.LARGE) {
    tShirtSize = "LARGE";
  } else if (totalScore >= thresholds.MEDIUM) {
    tShirtSize = "MEDIUM";
  } else {
    tShirtSize = "SMALL";
  }

  // Generate Rules & Recommendations
  const workflowComplexity = scores[DimensionId.WorkflowComplexity] || 0;
  const dataSensitivity = scores[DimensionId.DataSensitivity] || 0;
  const systemsToIntegrate = scores[DimensionId.SystemsToIntegrate] || 0;
  const platformMix = scores[DimensionId.PlatformMix] || 0;
  const userReach = scores[DimensionId.UserReach] || 0;

  // Rule 1: Control Agents
  if (workflowComplexity === 3 || dataSensitivity === 3) {
    recommendedAgentPattern.push("Strong need for Control Agents to manage complex logic and governance.");
  }

  // Rule 2: Azure Involvement
  if (systemsToIntegrate >= 2 && platformMix >= 2) {
    notes.push("High integration complexity suggests Azure / Azure AI Foundry involvement is likely required.");
  }

  // Rule 3: Experience Agents
  if (userReach >= 2) {
    recommendedAgentPattern.push("Emphasis on Experience Agents and multi-channel support for broad user reach.");
  }

  // Default recommendations based on size if no specific rules triggered
  if (recommendedAgentPattern.length === 0) {
    if (tShirtSize === "SMALL") {
      recommendedAgentPattern.push("Standard Copilot Studio implementation.");
    } else if (tShirtSize === "MEDIUM") {
      recommendedAgentPattern.push("Orchestrator pattern with specialized sub-agents.");
    } else {
      recommendedAgentPattern.push("Enterprise-grade multi-agent ecosystem.");
    }
  }

  // Calculate Agent Architecture Recommendations
  const agentArchitecture: AgentRecommendation[] = [];
  const triggers = rulesConfig?.archetypeTriggers || DEFAULT_ARCHETYPE_TRIGGERS;

  // Helper to map archetypeId to type (simplified mapping for now, ideally this comes from archetype definition)
  const getAgentType = (id: string): string => {
    if (['orchestrator'].includes(id)) return 'Value Stream Agents';
    if (['user-facing-copilot', 'memory-context'].includes(id)) return 'Experience Agents';
    if (['connector-integration', 'toolsmith-action'].includes(id)) return 'Task Agents';
    if (['specialist-domain', 'logical-reasoning', 'simulation-planning'].includes(id)) return 'Function Agents';
    if (['governance-guardrail', 'meta-self-improving'].includes(id)) return 'Control Agents';
    return 'Other Agents';
  };

  for (const trigger of triggers) {
    if (evaluateRule(trigger.conditions, scores)) {
      // Check if already added with higher necessity?
      // For simplicity, we just add it. The UI might show duplicates if multiple rules trigger.
      // Or we can dedupe here.
      const existing = agentArchitecture.find(a => a.archetypeId === trigger.archetypeId);
      if (existing) {
        // Upgrade necessity if needed
        if (trigger.necessity === 'Definitely needed') {
          existing.necessity = 'Definitely needed';
          existing.reason += ` Also: ${trigger.reason}`;
        } else if (trigger.necessity === 'Recommended' && existing.necessity === 'Optional') {
          existing.necessity = 'Recommended';
          existing.reason += ` Also: ${trigger.reason}`;
        }
      } else {
        agentArchitecture.push({
          type: getAgentType(trigger.archetypeId),
          archetypeId: trigger.archetypeId,
          necessity: trigger.necessity,
          reason: trigger.reason
        });
      }
    }
  }

  const copilotArchitecture = getCopilotArchitectureSpec(scores);

  return {
    totalScore,
    tShirtSize,
    notes,
    recommendedAgentPattern: recommendedAgentPattern,
    agentArchitecture,
    copilotArchitecture,
    testCases: []
  };
}

export function evaluateRule(conditions: RuleCondition[], scores: ScoresRecord, riskProfile?: RiskProfile): boolean {
  if (conditions.length === 0) return true; // Always true if no conditions
  return conditions.every(c => evaluateCondition(c, scores, riskProfile));
}

function evaluateCondition(condition: RuleCondition, scores: ScoresRecord, riskProfile?: RiskProfile): boolean {
  // Special case for Risk Level check
  if (condition.dimensionId === 'RISK_LEVEL') {
    if (!riskProfile) return false;
    // Map levels to numbers for comparison: LOW=1, MEDIUM=2, HIGH=3
    const riskValue = riskProfile.level === 'HIGH' ? 3 : riskProfile.level === 'MEDIUM' ? 2 : 1;
    return compare(riskValue, condition.operator, condition.value);
  }

  const score = scores[condition.dimensionId as DimensionId] || 0;
  return compare(score, condition.operator, condition.value);
}

function compare(a: number, op: string, b: number): boolean {
  switch (op) {
    case '>=': return a >= b;
    case '>': return a > b;
    case '<=': return a <= b;
    case '<': return a < b;
    case '==': return a === b;
    case '!=': return a !== b;
    default: return false;
  }
}
