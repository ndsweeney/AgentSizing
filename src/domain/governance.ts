import { DimensionId, type ScoresRecord, type RiskProfile } from './types';
import { evaluateRule, type RulesConfig } from './rules';
import { DEFAULT_GOVERNANCE_RULES } from './defaults';

export type ImpactLevel = "LOW" | "MODERATE" | "HIGH";

export interface GovernanceRequirement {
  category: string;
  title: string;
  description: string;
  priority: "Mandatory" | "Recommended";
}

export interface GovernancePack {
  impactLevel: ImpactLevel;
  riskProfile: RiskProfile;
  requirements: GovernanceRequirement[];
  oversightPoints: string[];
  monitoringCadence: string;
}

export function calculateImpactLevel(scores: ScoresRecord): ImpactLevel {
  const sensitivity = scores[DimensionId.DataSensitivity] || 1;
  const reach = scores[DimensionId.UserReach] || 1;
  const complexity = scores[DimensionId.WorkflowComplexity] || 1;

  // High Impact Criteria (EU AI Act "High Risk" proxy)
  // - Sensitive data (3) AND (Broad reach (3) OR Complex logic (3))
  if (sensitivity === 3 && (reach === 3 || complexity === 3)) {
    return "HIGH";
  }

  // Moderate Impact
  // - Sensitive data (3) OR Broad reach (3) OR (Medium sensitivity (2) AND Medium reach (2))
  if (sensitivity === 3 || reach === 3 || (sensitivity === 2 && reach === 2)) {
    return "MODERATE";
  }

  return "LOW";
}

export function generateGovernancePack(scores: ScoresRecord, riskProfile: RiskProfile, rulesConfig?: RulesConfig): GovernancePack {
  const impactLevel = calculateImpactLevel(scores);
  const requirements: GovernanceRequirement[] = [];
  const oversightPoints: string[] = [];

  const rules = rulesConfig?.governanceRules || DEFAULT_GOVERNANCE_RULES;

  for (const rule of rules) {
    if (evaluateRule(rule.conditions, scores)) {
      requirements.push({
        category: rule.category,
        title: rule.title,
        description: rule.description,
        priority: rule.priority
      });
    }
  }

  // Legacy hardcoded logic for oversightPoints and monitoringCadence
  // 2. Human Oversight
  if (impactLevel === "HIGH") {
    oversightPoints.push("Approval of high-value transactions");
    oversightPoints.push("Review of flagged toxic/unsafe conversations");
  } else if (impactLevel === "MODERATE") {
    oversightPoints.push("Weekly review of low-confidence responses");
  } else {
    oversightPoints.push("Ad-hoc review of user feedback");
  }

  // 3. Monitoring & Review
  let monitoringCadence = "Quarterly review of performance and safety metrics.";
  
  if (impactLevel === "HIGH") {
    monitoringCadence = "Continuous real-time monitoring with Daily stand-ups on safety incidents.";
  } else if (impactLevel === "MODERATE") {
    monitoringCadence = "Weekly review of safety dashboards and user feedback.";
  }

  return {
    impactLevel,
    riskProfile,
    requirements,
    oversightPoints,
    monitoringCadence
  };
}
