import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SIZING_THRESHOLDS, RISK_THRESHOLDS } from '../domain/rules';
import { DEFAULT_PROMPT_TEMPLATES, type PromptTemplateConfig } from '../domain/prompts';
import type { GovernanceRuleConfig, RiskRuleConfig, ArchetypeTriggerConfig, TestPlanTemplate, CostDrivers } from '../domain/logicTypes';
import { DEFAULT_GOVERNANCE_RULES, DEFAULT_RISK_RULES, DEFAULT_ARCHETYPE_TRIGGERS, DEFAULT_TEST_PLAN_TEMPLATES, DEFAULT_COST_DRIVERS } from '../domain/defaults';
import { type CostAssumptions, DEFAULT_COST_ASSUMPTIONS } from '../domain/costs';
import { type BenefitAssumptions, DEFAULT_BENEFIT_ASSUMPTIONS } from '../domain/roi';

export interface RulesState {
  sizingThresholds: typeof SIZING_THRESHOLDS;
  riskThresholds: typeof RISK_THRESHOLDS;
  promptTemplates: Record<string, PromptTemplateConfig>;
  
  // New Logic Configs
  governanceRules: GovernanceRuleConfig[];
  riskRules: RiskRuleConfig[];
  archetypeTriggers: ArchetypeTriggerConfig[];
  costDrivers: CostDrivers;
  costAssumptions: CostAssumptions;
  benefitAssumptions: BenefitAssumptions;
  testPlanTemplates: TestPlanTemplate[];

  updateSizingThreshold: (key: keyof typeof SIZING_THRESHOLDS, value: number) => void;
  updateRiskThreshold: (key: keyof typeof RISK_THRESHOLDS, value: number) => void;
  updatePromptTemplate: (archetypeId: string, template: Partial<PromptTemplateConfig>) => void;
  
  // New Actions
  setGovernanceRules: (rules: GovernanceRuleConfig[]) => void;
  setRiskRules: (rules: RiskRuleConfig[]) => void;
  setArchetypeTriggers: (triggers: ArchetypeTriggerConfig[]) => void;
  setCostDrivers: (drivers: CostDrivers) => void;
  setCostAssumptions: (assumptions: CostAssumptions) => void;
  setBenefitAssumptions: (assumptions: BenefitAssumptions) => void;
  setTestPlanTemplates: (templates: TestPlanTemplate[]) => void;

  resetRules: () => void;
}

export const useRulesStore = create<RulesState>()(
  persist(
    (set) => ({
      sizingThresholds: SIZING_THRESHOLDS,
      riskThresholds: RISK_THRESHOLDS,
      promptTemplates: DEFAULT_PROMPT_TEMPLATES,
      
      governanceRules: DEFAULT_GOVERNANCE_RULES,
      riskRules: DEFAULT_RISK_RULES,
      archetypeTriggers: DEFAULT_ARCHETYPE_TRIGGERS,
      costDrivers: DEFAULT_COST_DRIVERS,
      costAssumptions: DEFAULT_COST_ASSUMPTIONS,
      benefitAssumptions: DEFAULT_BENEFIT_ASSUMPTIONS,
      testPlanTemplates: DEFAULT_TEST_PLAN_TEMPLATES,

      updateSizingThreshold: (key, value) => 
        set((state) => ({
          sizingThresholds: { ...state.sizingThresholds, [key]: value }
        })),

      updateRiskThreshold: (key, value) => 
        set((state) => ({
          riskThresholds: { ...state.riskThresholds, [key]: value }
        })),

      updatePromptTemplate: (archetypeId, template) =>
        set((state) => ({
          promptTemplates: {
            ...state.promptTemplates,
            [archetypeId]: { ...state.promptTemplates[archetypeId], ...template }
          }
        })),

      setGovernanceRules: (rules) => set({ governanceRules: rules }),
      setRiskRules: (rules) => set({ riskRules: rules }),
      setArchetypeTriggers: (triggers) => set({ archetypeTriggers: triggers }),
      setCostDrivers: (drivers) => set({ costDrivers: drivers }),
      setCostAssumptions: (assumptions) => set({ costAssumptions: assumptions }),
      setBenefitAssumptions: (assumptions) => set({ benefitAssumptions: assumptions }),
      setTestPlanTemplates: (templates) => set({ testPlanTemplates: templates }),

      resetRules: () => 
        set({
          sizingThresholds: SIZING_THRESHOLDS,
          riskThresholds: RISK_THRESHOLDS,
          promptTemplates: DEFAULT_PROMPT_TEMPLATES,
          governanceRules: DEFAULT_GOVERNANCE_RULES,
          riskRules: DEFAULT_RISK_RULES,
          archetypeTriggers: DEFAULT_ARCHETYPE_TRIGGERS,
          costDrivers: DEFAULT_COST_DRIVERS,
          costAssumptions: DEFAULT_COST_ASSUMPTIONS,
          benefitAssumptions: DEFAULT_BENEFIT_ASSUMPTIONS,
          testPlanTemplates: DEFAULT_TEST_PLAN_TEMPLATES
        })
    }),
    {
      name: 'agent-sizing-rules',
    }
  )
);
