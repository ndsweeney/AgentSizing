import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildReportModel } from './reportBuilder';
import { renderReportMarkdown } from './renderMarkdown';
import { renderReportJson } from './renderJson';
import { exportReportZip } from './exportZip';
import { useSizingStore } from '../state/sizingStore';
import JSZip from 'jszip';
import { DimensionId } from '../domain/types';

// Mock the store
vi.mock('../state/sizingStore', () => ({
  useSizingStore: {
    getState: vi.fn()
  }
}));

describe('Report Generator E2E', () => {
  const mockScenario = {
    id: 'test-scenario-id',
    name: 'Test Scenario',
    scores: {
      [DimensionId.BusinessScope]: 2,
      [DimensionId.AgentCountAndTypes]: 2,
      [DimensionId.SystemsToIntegrate]: 2,
      [DimensionId.WorkflowComplexity]: 2,
      [DimensionId.DataSensitivity]: 2,
      [DimensionId.UserReach]: 2,
      [DimensionId.ChangeAndAdoption]: 2,
      [DimensionId.PlatformMix]: 2
    },
    targetScores: {},
    maturityScores: {},
    systems: ['CRM', 'ERP'],
    mode: 'single',
    currentStep: 5,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    facilitatorName: 'Test Facilitator',
    customerName: 'Test Customer',
    workshopTitle: 'Test Workshop',
    industry: 'Tech',
    useCase: 'Support',
    notes: 'Test notes',
    dimensionComments: {},
    costAssumptions: {
      copilotStudioLicensePerMonth: 200,
      copilotStudioMessagePackCost: 50,
      messagesIncludedInBase: 25000,
      azureOpenAIInputTokenRate: 0.005,
      azureOpenAIOutputTokenRate: 0.015,
      averageTokensPerMessage: 1000,
      storageCostPerGB: 0.15,
      apiCallCost: 0.002,
      blendedHourlyRate: 150,
      hoursPerSprint: 80,
      teamSize: 3,
      estimatedUsers: 500,
      messagesPerUserPerMonth: 20,
    },
    benefitAssumptions: {
      timeSavingMinutesPerTx: 30,
      txPerMonth: 1000,
      automationRate: 0.8,
      hourlyRate: 50,
      adoptionRate: 0.5
    }
  };

  const mockState = {
    scenarios: [mockScenario],
    activeScenarioId: 'test-scenario-id'
  };

  beforeEach(() => {
    (useSizingStore.getState as any).mockReturnValue(mockState);
  });

  it('should generate a complete report with metadata', () => {
    const report = buildReportModel('test-scenario-id');

    if (!report) throw new Error('Report generation failed');

    // Verify core structure
    expect(report.scenario.id).toBe('test-scenario-id');
    expect(report.generatedAt).toBeDefined();
    expect(report.appVersion).toBeDefined();
    expect(report.scenarioHash).toBeDefined();
    
    // Verify metadata hash stability (same input -> same hash)
    const report2 = buildReportModel('test-scenario-id');
    expect(report.scenarioHash).toBe(report2?.scenarioHash);
  });

  it('should render markdown with metadata footer', () => {
    const report = buildReportModel('test-scenario-id');
    if (!report) throw new Error('Report generation failed');
    
    const markdown = renderReportMarkdown(report);

    expect(markdown).toContain('# Agent Sizing & Architecture Report');
    expect(markdown).toContain('## Executive Summary');
    expect(markdown).toContain(`*Report ID: ${report.scenario.id}*`);
    expect(markdown).toContain(`*Scenario Hash: ${report.scenarioHash}*`);
  });

  it('should render valid JSON', () => {
    const report = buildReportModel('test-scenario-id');
    if (!report) throw new Error('Report generation failed');

    const jsonString = renderReportJson(report);
    const parsed = JSON.parse(jsonString);

    expect(parsed.appVersion).toBeDefined();
    expect(parsed.scenario.id).toBe('test-scenario-id');
  });

  it('should generate a valid ZIP file', async () => {
    const report = buildReportModel('test-scenario-id');
    if (!report) throw new Error('Report generation failed');

    const zipBlob = await exportReportZip(report);

    expect(zipBlob).toBeDefined();
    expect(zipBlob.size).toBeGreaterThan(0);

    // Verify ZIP contents
    const arrayBuffer = await zipBlob.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Check for core files
    expect(Object.keys(zip.files)).toContain('report.md');
    expect(Object.keys(zip.files)).toContain('report.json');
    
    // Check content of report.md inside zip
    const mdContent = await zip.file('report.md')?.async('string');
    expect(mdContent).toContain(`*Report ID: ${report.scenario.id}*`);
  });
});
