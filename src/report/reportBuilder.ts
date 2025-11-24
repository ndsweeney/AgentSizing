import { useSizingStore } from '../state/sizingStore';
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
import type { ReportModel } from './reportModel';
import type { ConnectorDefinition } from '../domain/connectors';

export function buildReportModel(scenarioId: string): ReportModel | null {
  const state = useSizingStore.getState();
  const scenario = state.scenarios.find(s => s.id === scenarioId);

  if (!scenario) {
    return null;
  }

  const sizingResult = calculateSizingResult(scenario.scores);
  const riskProfile = calculateRiskProfile(scenario.scores);
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

  // Connectors
  const connectors = (scenario.systems || [])
    .map(sys => getConnectorsForSystem(sys))
    .filter((c): c is ConnectorDefinition => c !== null)
    // Deduplicate by ID
    .filter((c, index, self) => index === self.findIndex(t => t.id === c.id));

  // Governance
  const governancePack = generateGovernancePack(scenario.scores, riskProfile);

  // Costs
  const costAssumptions = scenario.costAssumptions || DEFAULT_COST_ASSUMPTIONS;
  const costs = calculateDetailedCosts(sizingResult, scenario.scores, costAssumptions);

  // ROI
  const benefitAssumptions = scenario.benefitAssumptions || DEFAULT_BENEFIT_ASSUMPTIONS;
  const roi = calculateRoi(benefitAssumptions, costs.totalOneTime, costs.totalMonthly);

  // Roadmap
  const valueRoadmap = generateValueRoadmap(sizingResult, maturityResult);

  // Delivery Plan
  const deliveryPlan = generateDeliveryPlan(sizingResult);

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
    diagrams: {
      agentFlow: l1Diagram,
      systemIntegration: l2Diagram,
      governance: l3Diagram
    },
    exampleData: datasets, // We could filter this based on industry or use case if we had that mapping
    connectors,
    governance: governancePack,
    costs,
    roi,
    valueRoadmap,
    deliveryPlan,
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
