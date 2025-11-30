import { describe, it, expect } from 'vitest';
import { renderReportMarkdown } from './renderMarkdown';
import { renderReportJson } from './renderJson';
import type { ReportModel } from './reportModel';
import { DEFAULT_COST_ASSUMPTIONS } from '../domain/costs';
import { DEFAULT_BENEFIT_ASSUMPTIONS } from '../domain/roi';

// Mock minimal report for testing
const mockReport: ReportModel = {
  scenario: {
    id: 'test-id',
    name: 'Test Scenario',
    scores: {},
    targetScores: {},
    maturityScores: {},
    systems: [],
    mode: 'single',
    currentStep: 0,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    facilitatorName: 'Test Facilitator',
    customerName: 'Test Customer',
    workshopTitle: 'Test Workshop',
    industry: 'Retail',
    useCase: 'Customer Service',
    notes: 'Test notes',
    dimensionComments: {},
    costAssumptions: DEFAULT_COST_ASSUMPTIONS,
    benefitAssumptions: DEFAULT_BENEFIT_ASSUMPTIONS
  },
  sizingResult: {
    totalScore: 10,
    tShirtSize: 'SMALL',
    notes: ['Note 1'],
    recommendedAgentPattern: ['Pattern 1'],
    agentArchitecture: [],
    testCases: [],
    copilotArchitecture: {
      experienceAgents: 'Required',
      valueStreamAgents: 'Optional',
      functionAgents: 'Optional',
      processAgents: 'Optional',
      taskAgents: 'Optional',
      controlAgents: 'Optional',
      foundryRequirement: 'None'
    }
  },
  riskProfile: {
    level: 'LOW',
    reasons: ['Reason 1']
  },
  generatedAt: new Date().toISOString(),
  appVersion: '1.0.0',
  scenarioHash: 'test-hash'
};

describe('renderReportMarkdown', () => {
  it('should render basic sections', () => {
    const md = renderReportMarkdown(mockReport);
    expect(md).toContain('# Agent Sizing & Architecture Report');
    expect(md).toContain('Test Workshop');
    expect(md).toContain('Test Customer');
    expect(md).toContain('## Executive Summary');
    expect(md).toContain('SMALL');
    expect(md).toContain('## Scenario Overview');
    expect(md).toContain('Retail');
  });

  it('should handle missing optional sections gracefully', () => {
    const md = renderReportMarkdown(mockReport);
    expect(md).not.toContain('## Cost Analysis');
    expect(md).not.toContain('## ROI Analysis');
    expect(md).not.toContain('## Technical Diagrams');
  });
});

describe('renderReportJson', () => {
  it('should return valid JSON string', () => {
    const json = renderReportJson(mockReport);
    const parsed = JSON.parse(json);
    expect(parsed.scenario.id).toBe('test-id');
    expect(parsed.sizingResult.tShirtSize).toBe('SMALL');
  });
});
