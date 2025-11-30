import { useRulesStore } from '../state/rulesStore';
import type { RulesConfig } from '../domain/rules';

export function useRulesConfig(): RulesConfig {
  const { 
    sizingThresholds, 
    riskThresholds, 
    governanceRules, 
    riskRules,
    archetypeTriggers,
    costDrivers,
    costAssumptions,
    benefitAssumptions,
    testPlanTemplates,
    promptTemplates
  } = useRulesStore();

  return { 
    sizingThresholds, 
    riskThresholds,
    governanceRules,
    riskRules,
    archetypeTriggers,
    costDrivers,
    costAssumptions,
    benefitAssumptions,
    testPlanTemplates,
    promptTemplates
  };
}