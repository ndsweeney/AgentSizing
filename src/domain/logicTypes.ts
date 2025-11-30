import { type TestCase } from './types';

export type Operator = '>=' | '>' | '<=' | '<' | '==' | '!=';

export interface RuleCondition {
  dimensionId: string; // DimensionId or 'RISK_LEVEL'
  operator: Operator;
  value: number;
}

export interface LogicRule {
  id: string;
  conditions: RuleCondition[]; // All must be true (AND)
}

export interface GovernanceRuleConfig extends LogicRule {
  title: string;
  description: string;
  category: string;
  priority: "Mandatory" | "Recommended";
  triggerDescription?: string;
}

export interface RiskRuleConfig extends LogicRule {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  conditionDescription?: string;
}

export interface ArchetypeTriggerConfig extends LogicRule {
  archetypeId: string;
  necessity: 'Definitely needed' | 'Recommended' | 'Optional';
  reason: string;
}

export interface TestPlanTemplate {
  archetypeId: string;
  cases: TestCase[];
}

export interface CostDrivers {
  tShirtSize: {
    SMALL: CostBracket;
    MEDIUM: CostBracket;
    LARGE: CostBracket;
  };
}

export interface CostBracket {
  implMin: number;
  implMax: number;
  licensing: number;
  azure: number;
  support: number;
}

export const LOGIC_OPERATORS: Operator[] = ['>=', '>', '<=', '<', '==', '!='];
