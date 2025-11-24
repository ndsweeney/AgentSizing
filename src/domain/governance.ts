import { DimensionId, type ScoresRecord, type RiskProfile } from './types';

export type ImpactLevel = "LOW" | "MODERATE" | "HIGH";

export interface GovernanceRequirement {
  category: "Logging & Traceability" | "Human Oversight" | "Monitoring & Review" | "Compliance";
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

export function generateGovernancePack(scores: ScoresRecord, riskProfile: RiskProfile): GovernancePack {
  const impactLevel = calculateImpactLevel(scores);
  const requirements: GovernanceRequirement[] = [];
  const oversightPoints: string[] = [];

  // 1. Logging & Traceability
  requirements.push({
    category: "Logging & Traceability",
    title: "Conversation Logging",
    description: "Log all user inputs and agent outputs for audit trails.",
    priority: "Mandatory"
  });

  if (impactLevel !== "LOW") {
    requirements.push({
      category: "Logging & Traceability",
      title: "Decision Traceability",
      description: "Record the 'Chain of Thought' or reasoning steps for all agent actions.",
      priority: "Mandatory"
    });
    requirements.push({
      category: "Logging & Traceability",
      title: "Data Access Logs",
      description: "Log every access to backend systems with user context and timestamp.",
      priority: "Mandatory"
    });
  }

  // 2. Human Oversight
  if (impactLevel === "HIGH") {
    requirements.push({
      category: "Human Oversight",
      title: "Human-in-the-loop (HITL)",
      description: "Critical actions (e.g., financial transactions > $1k) require explicit human approval.",
      priority: "Mandatory"
    });
    oversightPoints.push("Approval of high-value transactions");
    oversightPoints.push("Review of flagged toxic/unsafe conversations");
  } else if (impactLevel === "MODERATE") {
    requirements.push({
      category: "Human Oversight",
      title: "Human-on-the-loop (HOTL)",
      description: "Humans can intervene or review sampled interactions post-hoc.",
      priority: "Recommended"
    });
    oversightPoints.push("Weekly review of low-confidence responses");
  } else {
    oversightPoints.push("Ad-hoc review of user feedback");
  }

  // 3. Monitoring & Review
  let monitoringCadence = "Quarterly review of performance and safety metrics.";
  
  if (impactLevel === "HIGH") {
    monitoringCadence = "Continuous real-time monitoring with Daily stand-ups on safety incidents.";
    requirements.push({
      category: "Monitoring & Review",
      title: "Real-time Alerting",
      description: "Automated alerts for drift, toxicity, or PII leakage.",
      priority: "Mandatory"
    });
  } else if (impactLevel === "MODERATE") {
    monitoringCadence = "Weekly review of safety dashboards and user feedback.";
  }

  // 4. Compliance (EU AI Act / ISO 42001 alignment)
  requirements.push({
    category: "Compliance",
    title: "Transparency Disclosure",
    description: "Users must be informed they are interacting with an AI system.",
    priority: "Mandatory"
  });

  if (scores[DimensionId.DataSensitivity] === 3) {
    requirements.push({
      category: "Compliance",
      title: "Data Residency & Sovereignty",
      description: "Ensure data processing remains within required legal jurisdictions.",
      priority: "Mandatory"
    });
  }

  return {
    impactLevel,
    riskProfile,
    requirements,
    oversightPoints,
    monitoringCadence
  };
}
