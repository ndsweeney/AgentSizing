import type { SizingResult, TestCase } from './types';
import type { RulesConfig } from './rules';
import { DEFAULT_TEST_PLAN_TEMPLATES } from './defaults';

export interface TestPlan {
  summary: string;
  cases: TestCase[];
}

export function generateTestPlan(result: SizingResult, rulesConfig?: RulesConfig): TestPlan {
  const cases: TestCase[] = [];
  const agents = result.agentArchitecture.filter(a => a.necessity !== 'Optional');
  const templates = rulesConfig?.testPlanTemplates || DEFAULT_TEST_PLAN_TEMPLATES;
  
  const processedArchetypes = new Set<string>();

  for (const agent of agents) {
    if (processedArchetypes.has(agent.archetypeId)) continue;
    processedArchetypes.add(agent.archetypeId);

    const template = templates.find(t => t.archetypeId === agent.archetypeId);
    if (template) {
      // Clone cases to avoid mutating the template if we were to modify them
      // Also ensure the agentType matches the actual agent if needed, 
      // though the template has a default.
      cases.push(...template.cases.map(c => ({
        ...c,
        agentType: agent.type // Override with actual agent type name from recommendation
      })));
    }
  }

  return {
    summary: `Generated ${cases.length} test cases based on ${agents.length} active agent types.`,
    cases
  };
}
