import type { Scenario } from '../state/sizingStore';
import type { SizingResult, RiskProfile, CopilotArchitectureSpec, TopicSkeleton } from '../domain/types';
import type { MaturityResult } from '../domain/maturity';
import type { DiagramDefinition } from '../domain/diagrams';
import type { DatasetMetadata } from '../domain/exampleData';
import type { ConnectorDefinition } from '../domain/connectors';
import type { GovernancePack } from '../domain/governance';
import type { CostBreakdown } from '../domain/costs';
import type { RoiResult } from '../domain/roi';
import type { ValueRoadmap } from '../domain/roadmap';
import type { DeliveryPlan } from '../domain/delivery';
import type { KnowledgeItem } from '../domain/knowledge';
import type { TestPlanItem, StarterPackItem, DebuggerConfig } from '../domain/reportingExtras';
import type { PromptTemplate } from '../domain/prompts';

export interface ReportModel {
  scenario: Scenario;
  sizingResult: SizingResult;
  riskProfile: RiskProfile;
  
  // Optional sections based on availability
  maturity?: MaturityResult;
  architecture?: {
    l1?: DiagramDefinition;
    l2?: DiagramDefinition;
    l3?: DiagramDefinition;
    copilotSpec: CopilotArchitectureSpec;
  };
  blueprints?: string[]; // Markdown content
  topicSkeletons?: TopicSkeleton[];
  prompts?: PromptTemplate[];
  diagrams?: {
    agentFlow?: DiagramDefinition;
    systemIntegration?: DiagramDefinition;
    governance?: DiagramDefinition;
  };
  exampleData?: DatasetMetadata[];
  connectors?: ConnectorDefinition[];
  starterPack?: StarterPackItem[];
  governance?: GovernancePack;
  costs?: CostBreakdown;
  roi?: RoiResult;
  valueRoadmap?: ValueRoadmap;
  deliveryPlan?: DeliveryPlan;
  testPlan?: TestPlanItem[];
  debuggerConfig?: DebuggerConfig;
  knowledgeHub?: KnowledgeItem[];
  
  // Metadata
  generatedAt: string;
  appVersion: string;
  scenarioHash: string;
}
