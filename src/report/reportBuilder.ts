import { useSizingStore } from '../state/sizingStore';
import { useRulesStore } from '../state/rulesStore';
import { calculateSizingResult, calculateRiskProfile } from '../domain/scoring';
import { calculateMaturityResult } from '../domain/maturity';
import { 
  buildAgentArchitectureMermaid, 
  buildSystemIntegrationMermaid, 
  buildGovernanceMermaid 
} from '../domain/diagrams';
import { generateAgentSpecs } from '../domain/generators';
import { generateAgentBlueprint } from '../domain/blueprints';
import { generateTopicSkeletons } from '../domain/topicSkeletons';
import { datasets } from '../domain/exampleData';
import { getConnectorsForSystem } from '../domain/connectors';
import { generateGovernancePack } from '../domain/governance';
import { calculateDetailedCosts, DEFAULT_COST_ASSUMPTIONS } from '../domain/costs';
import { calculateRoi, DEFAULT_BENEFIT_ASSUMPTIONS } from '../domain/roi';
import { generateValueRoadmap } from '../domain/roadmap';
import { generateDeliveryPlan } from '../domain/delivery';
import { KNOWLEDGE_BASE } from '../domain/knowledge';
import { generatePrompts } from '../domain/prompts';
import { generateTestPlan, generateStarterPack, generateDebuggerConfig } from '../domain/reportingExtras';
import type { ReportModel } from './reportModel';
import type { ConnectorDefinition } from '../domain/connectors';

export function buildReportModel(scenarioId: string): ReportModel | null {
  const state = useSizingStore.getState();
  const rulesState = useRulesStore.getState();
  const rulesConfig = { 
    sizingThresholds: rulesState.sizingThresholds, 
    riskThresholds: rulesState.riskThresholds,
    promptTemplates: rulesState.promptTemplates,
    governanceRules: rulesState.governanceRules,
    riskRules: rulesState.riskRules,
    archetypeTriggers: rulesState.archetypeTriggers,
    costDrivers: rulesState.costDrivers,
    costAssumptions: rulesState.costAssumptions,
    benefitAssumptions: rulesState.benefitAssumptions,
    testPlanTemplates: rulesState.testPlanTemplates
  };
  const scenario = state.scenarios.find(s => s.id === scenarioId);

  if (!scenario) {
    return null;
  }

  const sizingResult = calculateSizingResult(scenario.scores, rulesConfig);
  const riskProfile = calculateRiskProfile(scenario.scores, rulesConfig);
  const maturityResult = calculateMaturityResult(scenario.maturityScores);

  // Architecture Diagrams
  const l1Diagram = buildAgentArchitectureMermaid(sizingResult);
  const l2Diagram = buildSystemIntegrationMermaid(sizingResult, scenario.systems);
  const l3Diagram = buildGovernanceMermaid(sizingResult, scenario.scores);

  // Blueprints
  const agentSpecs = generateAgentSpecs(sizingResult);
  const blueprints = agentSpecs.map(spec => generateAgentBlueprint(spec, sizingResult));

  // Topic Skeletons
  const topicSkeletons = generateTopicSkeletons(sizingResult);

  // Prompts
  const prompts = generatePrompts(sizingResult, rulesConfig.promptTemplates);

  // Connectors
  const connectors = (scenario.systems || [])
    .map(sys => getConnectorsForSystem(sys))
    .filter((c): c is ConnectorDefinition => c !== null)
    // Deduplicate by ID
    .filter((c, index, self) => index === self.findIndex(t => t.id === c.id));

  // Governance
  const governancePack = generateGovernancePack(scenario.scores, riskProfile, rulesConfig);

  // Costs
  const costAssumptions = scenario.costAssumptions || rulesConfig.costAssumptions || DEFAULT_COST_ASSUMPTIONS;
  const costs = calculateDetailedCosts(sizingResult, scenario.scores, costAssumptions);

  // ROI
  const benefitAssumptions = scenario.benefitAssumptions || rulesConfig.benefitAssumptions || DEFAULT_BENEFIT_ASSUMPTIONS;
  const roi = calculateRoi(benefitAssumptions, costs.totalOneTime, costs.totalMonthly);

  // Roadmap
  const valueRoadmap = generateValueRoadmap(sizingResult, maturityResult);

  // Delivery Plan
  const deliveryPlan = generateDeliveryPlan(sizingResult);

  // Testing & Operate
  const testPlan = generateTestPlan(sizingResult);
  const starterPack = generateStarterPack(sizingResult);
  const debuggerConfig = generateDebuggerConfig(sizingResult);

  // Metadata
  const appVersion = '1.0.0';
  const scenarioHash = simpleHash(JSON.stringify(scenario));

  return {
    scenario,
    sizingResult,
    riskProfile,
    maturity: maturityResult,
    architecture: {
      l1: l1Diagram,
      l2: l2Diagram,
      l3: l3Diagram,
      copilotSpec: sizingResult.copilotArchitecture
    },
    blueprints,
    topicSkeletons,
    prompts,
    diagrams: {
      agentFlow: l1Diagram,
      systemIntegration: l2Diagram,
      governance: l3Diagram
    },
    exampleData: datasets, // We could filter this based on industry or use case if we had that mapping
    connectors,
    starterPack,
    governance: governancePack,
    costs,
    roi,
    valueRoadmap,
    deliveryPlan,
    testPlan,
    debuggerConfig,
    knowledgeHub: KNOWLEDGE_BASE,
    generatedAt: new Date().toISOString(),
    appVersion,
    scenarioHash
  };
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}
