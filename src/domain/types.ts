export const DimensionId = {
  BusinessScope: "businessScope",
  AgentCountAndTypes: "agentCountAndTypes",
  SystemsToIntegrate: "systemsToIntegrate",
  WorkflowComplexity: "workflowComplexity",
  DataSensitivity: "dataSensitivity",
  UserReach: "userReach",
  ChangeAndAdoption: "changeAndAdoption",
  PlatformMix: "platformMix"
} as const;

export type DimensionId = typeof DimensionId[keyof typeof DimensionId];

export type TShirtSize = "SMALL" | "MEDIUM" | "LARGE";

export type ScoreValue = 1 | 2 | 3;

export type ScoresRecord = Partial<Record<DimensionId, ScoreValue>>;

export interface DimensionOption {
  title: string;
  description: string;
}

export interface DimensionMetadata {
  id: DimensionId;
  label: string;
  description: string;
  options: {
    1: DimensionOption;
    2: DimensionOption;
    3: DimensionOption;
  };
}

export interface DimensionScore extends DimensionMetadata {
  value: ScoreValue | null;
}

export type AgentType = string;
// | "Experience Agents"
// | "Value Stream Agents"
// | "Function Agents"
// | "Process Agents"
// | "Task Agents"
// | "Control Agents";

export type AgentNecessity = "Definitely needed" | "Recommended" | "Optional";

export interface AgentRecommendation {
  type: AgentType;
  archetypeId: string;
  necessity: AgentNecessity;
  reason: string;
}

export interface TestCase {
  id: string;
  title: string;
  agentType: AgentType;
  description: string;
  input: string;
  expectedOutput: string;
  edgeCases: string[];
}

export interface CopilotArchitectureSpec {
  experienceAgents: string;
  valueStreamAgents: string;
  functionAgents: string;
  processAgents: string;
  taskAgents: string;
  controlAgents: string;
  foundryRequirement: string;
}

export interface SizingResult {
  totalScore: number;
  tShirtSize: TShirtSize;
  notes: string[];
  recommendedAgentPattern: string[];
  agentArchitecture: AgentRecommendation[];
  copilotArchitecture: CopilotArchitectureSpec;
  testCases: TestCase[];
}

export interface RecommendationResult {
  architecture: string[];
  delivery: string[];
  team: string[];
  risks: string[];
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface GovernanceItem {
  id: string;
  category: string;
  question: string;
  required: boolean;
}

export interface RiskProfile {
  level: RiskLevel;
  reasons: string[];
}

export interface AgentSpec {
  type: AgentType;
  archetypeId: string;
  title: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  steps: string[];
  connectors: string[];
  governance: string[];
}

export interface TopicSkeleton {
  name: string;
  agentType: AgentType;
  triggerPhrases: string[];
  variables: string[];
  steps: string[];
  actions: string[];
  responseTemplates: string[];
  guardrailNotes?: string[];
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  stories: UserStory[];
}

export interface BuildPlan {
  epics: Epic[];
}
