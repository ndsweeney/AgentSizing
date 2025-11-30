import type { AgentArchetype, ArchetypeTier } from '../types/agentArchetype';
import { type RulesConfig, RISK_THRESHOLDS } from '../domain/rules';

/**
 * Agent Archetypes Data
 * 
 * How to add a new archetype:
 * 1. Add a new object to the `agentArchetypes` array below.
 * 2. Ensure the `id` is unique and kebab-case.
 * 3. Set the `tier` to one of the allowed values in `ArchetypeTier`.
 * 
 * How to add a new tier:
 * 1. Update the `ArchetypeTier` type definition in `src/types/agentArchetype.ts`.
 * 2. Add archetypes with the new tier here.
 * 3. Update `AgentArchetypeSelector` to render the new tier group if needed.
 */

export function getAgentArchetypes(rulesConfig?: RulesConfig): AgentArchetype[] {
  const thresholds = rulesConfig?.riskThresholds || RISK_THRESHOLDS;
  
  return [
  // --- Core ---
  {
    id: "orchestrator",
    name: "Orchestrator",
    tier: "core",
    shortDescription: "Coordinates multiple agents and workflows to achieve a complex goal.",
    longDescription: "Acts as the central brain, breaking down user requests into sub-tasks and delegating them to specialized agents. It manages state, handles errors, and synthesizes the final response.",
    triggerCondition: `Always recommended. Critical when Workflow Complexity >= Medium (${thresholds.MEDIUM}) or Business Scope >= Medium (${thresholds.MEDIUM}).`,
    exampleMicrosoftFit: "Azure AI Agent Service, Semantic Kernel (Planner)"
  },
  {
    id: "logical-reasoning",
    name: "Logical / Reasoning",
    tier: "core",
    shortDescription: "Handles complex problem-solving and decision-making tasks.",
    longDescription: "Focuses on analyzing data, applying business logic, and deriving conclusions without necessarily taking external actions. It excels at multi-step reasoning chains.",
    triggerCondition: `Recommended when Workflow Complexity is Large (${thresholds.HIGH}).`,
    exampleMicrosoftFit: "Azure OpenAI (o1/o3 models), Prompt Flow"
  },
  {
    id: "specialist-domain",
    name: "Specialist / Domain",
    tier: "core",
    shortDescription: "Possesses deep knowledge in a specific vertical or subject matter.",
    longDescription: "Trained or prompted with specific domain expertise (e.g., legal, medical, HR) to provide highly accurate and context-aware responses. It often uses RAG patterns.",
    triggerCondition: `Recommended when Business Scope >= Medium (${thresholds.MEDIUM}) or Agent Count >= Medium (${thresholds.MEDIUM}).`,
    exampleMicrosoftFit: "Copilot Studio (Custom Copilots), Azure AI Search (RAG)"
  },
  {
    id: "connector-integration",
    name: "Connector / Integration",
    tier: "core",
    shortDescription: "Bridges the gap between the AI system and external APIs or databases.",
    longDescription: "Responsible for executing actions in external systems, fetching real-time data, and formatting inputs/outputs for other agents. It abstracts the complexity of API calls.",
    triggerCondition: `Required when Systems to Integrate >= Medium (${thresholds.MEDIUM}).`,
    exampleMicrosoftFit: "Power Automate, Azure Logic Apps, Custom Connectors"
  },
  {
    id: "user-facing-copilot",
    name: "User-Facing / Copilot",
    tier: "core",
    shortDescription: "Interacts directly with end-users via chat or voice interfaces.",
    longDescription: "Manages the conversation flow, maintains persona, and ensures a smooth user experience. It routes intent to backend agents while keeping the user informed.",
    triggerCondition: `Always recommended. Critical when User Reach >= Medium (${thresholds.MEDIUM}).`,
    exampleMicrosoftFit: "Microsoft Copilot (M365), Copilot Studio"
  },
  {
    id: "governance-guardrail",
    name: "Governance / Guardrail",
    tier: "core",
    shortDescription: "Ensures safety, compliance, and adherence to policies.",
    longDescription: "Monitors inputs and outputs for toxicity, sensitive data leakage, or policy violations. It acts as a filter or validator for other agents.",
    triggerCondition: `Required when Data Sensitivity >= Medium (${thresholds.MEDIUM}) or Workflow Complexity is Large (${thresholds.HIGH}).`,
    exampleMicrosoftFit: "Azure AI Content Safety, Purview"
  },
  {
    id: "meta-self-improving",
    name: "Meta / Self-Improving",
    tier: "core",
    shortDescription: "Analyzes system performance and optimizes other agents.",
    longDescription: "Observes execution traces to identify bottlenecks or errors and can update prompts or configurations to improve future performance.",
    triggerCondition: `Optional. Suggested when both Agent Count and Workflow Complexity are Large (${thresholds.HIGH}).`,
    exampleMicrosoftFit: "Azure AI Foundry (Evaluation), Prompt Flow (Evaluation)"
  },
  // --- Extended ---
  {
    id: "memory-context",
    name: "Memory / Context",
    tier: "extended",
    shortDescription: "Manages long-term state and user context across sessions.",
    longDescription: "Stores and retrieves relevant information from past interactions to provide personalized and continuous experiences. It handles vector databases and knowledge graphs.",
    triggerCondition: `Optional. Suggested when Workflow Complexity >= Medium (${thresholds.MEDIUM}) or User Reach is Large (${thresholds.HIGH}).`,
    exampleMicrosoftFit: "Cosmos DB, Azure AI Search (Vector Store)"
  },
  {
    id: "toolsmith-action",
    name: "Toolsmith / Action",
    tier: "extended",
    shortDescription: "Dynamically selects or constructs tools for specific tasks.",
    longDescription: "Identifies the right tool for a job from a library or even generates code to create a new tool on the fly. It bridges reasoning with execution.",
    triggerCondition: `Recommended when Systems to Integrate >= Small (${thresholds.LOW}).`,
    exampleMicrosoftFit: "Semantic Kernel (Plugins), Azure Functions"
  },
  {
    id: "simulation-planning",
    name: "Simulation / Planning",
    tier: "extended",
    shortDescription: "Simulates outcomes or creates detailed plans before execution.",
    longDescription: "Runs 'what-if' scenarios to predict results or generates comprehensive project plans. It helps in risk assessment and strategic decision-making.",
    triggerCondition: `Optional. Suggested when both Workflow Complexity and Business Scope are Large (${thresholds.HIGH}).`,
    exampleMicrosoftFit: "Azure Digital Twins, Azure OpenAI (Reasoning models)"
  }
];
}

export const agentArchetypes = getAgentArchetypes();

export function getArchetypeById(id: string, rulesConfig?: RulesConfig): AgentArchetype | undefined {
  return getAgentArchetypes(rulesConfig).find(a => a.id === id);
}

export function getArchetypesByTier(tier: ArchetypeTier, rulesConfig?: RulesConfig): AgentArchetype[] {
  return getAgentArchetypes(rulesConfig).filter(a => a.tier === tier);
}
