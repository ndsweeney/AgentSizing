import { 
  DimensionId, 
  type DimensionMetadata, 
  type ScoresRecord,
  type RiskProfile,
  type RiskLevel
} from './types';
export * from './types';
export { calculateSizingResult } from './rules';

export function calculateRiskProfile(scores: ScoresRecord): RiskProfile {
  const sensitivity = scores[DimensionId.DataSensitivity] || 1;
  const systems = scores[DimensionId.SystemsToIntegrate] || 1;
  const complexity = scores[DimensionId.WorkflowComplexity] || 1;
  const reach = scores[DimensionId.UserReach] || 1;

  const reasons: string[] = [];
  let level: RiskLevel = "LOW";

  // High Data Sensitivity is an immediate High Risk
  if (sensitivity === 3) {
    level = "HIGH";
    reasons.push("High data sensitivity (PII/Financial) requires strict governance.");
  } else if (sensitivity === 2) {
    level = "MEDIUM";
    reasons.push("Internal sensitive data requires access controls.");
  }

  // Complex Systems Integration
  if (systems === 3) {
    level = "HIGH";
    reasons.push("Integration with legacy/complex systems increases failure surface.");
  }

  // High Workflow Complexity
  if (complexity === 3) {
    if (level === "LOW") level = "MEDIUM";
    reasons.push("Non-deterministic workflows require rigorous testing.");
  }

  // Broad User Reach
  if (reach === 3) {
    if (level === "LOW") level = "MEDIUM";
    reasons.push("External/Global user base requires strict content safety.");
  }

  // If multiple medium factors, elevate to High
  if (level === "MEDIUM" && reasons.length >= 3) {
    level = "HIGH";
    reasons.push("Multiple medium risk factors combined elevate overall risk.");
  }

  return { level, reasons };
}

export const DIMENSIONS: DimensionMetadata[] = [
  {
    id: DimensionId.BusinessScope,
    label: "Business Scope",
    description: "Breadth of business processes covered.",
    options: {
      1: { title: "Single Task", description: "Personal productivity or single-turn tasks." },
      2: { title: "Department Process", description: "Workflow confined to a single department." },
      3: { title: "Enterprise Wide", description: "Cross-functional or enterprise-wide processes." }
    }
  },
  {
    id: DimensionId.AgentCountAndTypes,
    label: "Number & Types of Agents",
    description: "Quantity and variety of agents involved.",
    options: {
      1: { title: "Single Agent", description: "One agent handling all topics." },
      2: { title: "Multiple Agents", description: "Several specialized agents." },
      3: { title: "Complex Ecosystem", description: "Many agents with complex orchestration." }
    }
  },
  {
    id: DimensionId.SystemsToIntegrate,
    label: "Systems to Integrate",
    description: "Number and complexity of backend systems.",
    options: {
      1: { title: "None / Simple", description: "No integration or simple standard APIs." },
      2: { title: "Multiple APIs", description: "Several standard connectors or APIs." },
      3: { title: "Legacy / Complex", description: "Legacy systems, custom connectors, or on-prem." }
    }
  },
  {
    id: DimensionId.WorkflowComplexity,
    label: "Workflow Complexity",
    description: "Logic complexity of the conversations.",
    options: {
      1: { title: "Linear Q&A", description: "Simple questions and answers." },
      2: { title: "Multi-step", description: "Conditional logic and branching flows." },
      3: { title: "Dynamic", description: "Non-deterministic or highly complex logic." }
    }
  },
  {
    id: DimensionId.DataSensitivity,
    label: "Data Sensitivity & Governance",
    description: "Data privacy and compliance requirements.",
    options: {
      1: { title: "Public Data", description: "No sensitive data involved." },
      2: { title: "Internal Data", description: "Internal but non-sensitive business data." },
      3: { title: "Highly Regulated", description: "PII, PHI, or highly regulated data." }
    }
  },
  {
    id: DimensionId.UserReach,
    label: "User Reach",
    description: "Target audience size and distribution.",
    options: {
      1: { title: "Small Team", description: "Pilot group or single team." },
      2: { title: "Department", description: "Entire department or division." },
      3: { title: "Global / External", description: "All employees or external customers." }
    }
  },
  {
    id: DimensionId.ChangeAndAdoption,
    label: "Change & Adoption Needs",
    description: "Impact on user behavior and training needs.",
    options: {
      1: { title: "Low Impact", description: "Minimal training required." },
      2: { title: "Moderate", description: "Some training and change management needed." },
      3: { title: "Transformational", description: "Significant changes to ways of working." }
    }
  },
  {
    id: DimensionId.PlatformMix,
    label: "Platform Mix",
    description: "Technology stack involvement.",
    options: {
      1: { title: "Copilot Studio", description: "Standard Copilot Studio features only." },
      2: { title: "+ Azure AI", description: "Includes Azure AI Search or OpenAI services." },
      3: { title: "Full Stack", description: "Custom code, Azure functions, or complex architecture." }
    }
  }
];

