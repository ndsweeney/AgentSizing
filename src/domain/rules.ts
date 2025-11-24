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

export function getGovernanceChecklist(scores: ScoresRecord, riskProfile: RiskProfile): GovernanceItem[] {
  const items: GovernanceItem[] = [];
  const sensitivity = scores[DimensionId.DataSensitivity] || 1;
  const reach = scores[DimensionId.UserReach] || 1;
  const complexity = scores[DimensionId.WorkflowComplexity] || 1;

  // DPIA/FRIA
  if (sensitivity === 3 || riskProfile.level === "HIGH") {
    items.push({
      id: "dpia",
      category: "Compliance",
      question: "Has a Data Protection Impact Assessment (DPIA) been completed?",
      required: true
    });
  }

  // Human Oversight
  if (complexity >= 2 || sensitivity >= 2) {
    items.push({
      id: "human-loop",
      category: "Oversight",
      question: "Are there defined 'Human-in-the-loop' handoff points?",
      required: riskProfile.level === "HIGH"
    });
  }

  // Logging
  items.push({
    id: "logging",
    category: "Traceability",
    question: "Is comprehensive conversation logging enabled for auditing?",
    required: true
  });

  // Monitoring
  items.push({
    id: "monitoring",
    category: "Operations",
    question: "Is there a feedback loop for users to report issues?",
    required: true
  });

  // LLM Safety
  if (reach === 3) {
    items.push({
      id: "jailbreak",
      category: "Safety",
      question: "Have jailbreak and prompt injection tests been performed?",
      required: true
    });
  }

  if (riskProfile.level !== "LOW") {
    items.push({
      id: "content-safety",
      category: "Safety",
      question: "Are Azure AI Content Safety filters configured to 'High'?",
      required: riskProfile.level === "HIGH"
    });
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

export function getDeliveryEstimate(scores: ScoresRecord): string[] {
  const estimates: string[] = [];
  let totalScore = 0;
  Object.values(scores).forEach(s => totalScore += (s || 0));

  if (totalScore >= 20) {
    estimates.push("Timeline: 4-6 months for MVP.");
    estimates.push("Phase 1: Foundation & Core Integrations (8 weeks).");
    estimates.push("Phase 2: Agent Development & Testing (12 weeks).");
    estimates.push("Phase 3: Pilot & Tuning (4-6 weeks).");
  } else if (totalScore >= 12) {
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

export function calculateSizingResult(scores: ScoresRecord): SizingResult {
  let totalScore = 0;
  const notes: string[] = [];
  const recommendedAgentPattern: string[] = [];

  // Calculate total score
  Object.values(scores).forEach(score => {
    totalScore += (score || 0);
  });

  // Determine T-Shirt Size
  let tShirtSize: TShirtSize = "SMALL";
  if (totalScore >= 19) {
    tShirtSize = "LARGE";
  } else if (totalScore >= 12) {
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
  const businessScope = scores[DimensionId.BusinessScope] || 0;
  const agentCount = scores[DimensionId.AgentCountAndTypes] || 0;

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
  const agentArchitecture: AgentRecommendation[] = [
    {
      type: "Experience Agents",
      necessity: userReach >= 2 ? "Definitely needed" : "Recommended",
      reason: userReach >= 2 ? "High user reach requires dedicated experience handling." : "Good for consistent user interface."
    },
    {
      type: "Value Stream Agents",
      necessity: (tShirtSize === "LARGE" || businessScope === 3) ? "Definitely needed" : "Recommended",
      reason: (tShirtSize === "LARGE" || businessScope === 3) ? "Complex business scope requires value stream alignment." : "Helps organize capabilities by business value."
    },
    {
      type: "Function Agents",
      necessity: (agentCount >= 2 || systemsToIntegrate >= 2) ? "Definitely needed" : "Optional",
      reason: (agentCount >= 2 || systemsToIntegrate >= 2) ? "Needed to encapsulate specific system capabilities." : "May be overkill for simple agents."
    },
    {
      type: "Process Agents",
      necessity: workflowComplexity >= 2 ? "Definitely needed" : "Optional",
      reason: workflowComplexity >= 2 ? "Required to manage multi-step stateful processes." : "Simple Q&A doesn't need process management."
    },
    {
      type: "Task Agents",
      necessity: "Recommended",
      reason: "Fundamental building blocks for specific actions."
    },
    {
      type: "Control Agents",
      necessity: (dataSensitivity >= 2 || workflowComplexity === 3) ? "Definitely needed" : "Optional",
      reason: (dataSensitivity >= 2 || workflowComplexity === 3) ? "Critical for governance and complex routing." : "Only needed for high compliance or complexity."
    }
  ];

  const copilotArchitecture = getCopilotArchitectureSpec(scores);

  return {
    totalScore,
    tShirtSize,
    notes,
    recommendedAgentPattern,
    agentArchitecture,
    copilotArchitecture
  };
}