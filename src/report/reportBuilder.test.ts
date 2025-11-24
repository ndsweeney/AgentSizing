import { describe, it, expect, beforeEach } from 'vitest';
import { buildReportModel } from './reportBuilder';
import { useSizingStore } from '../state/sizingStore';

// Note: This test assumes Vitest is installed and configured.
// If not, you may need to install it: npm install -D vitest

describe('buildReportModel', () => {
  beforeEach(() => {
    // Reset store if possible, or just create new scenarios
    useSizingStore.setState({
      scenarios: [],
      activeScenarioId: '',
      isReadOnly: false,
      isCoachMode: false,
      currentView: 'intro'
    });
  });

  it('should return null if scenario does not exist', () => {
    const report = buildReportModel('non-existent-id');
    expect(report).toBeNull();
  });

  it('should build a complete report for a valid scenario', () => {
    const store = useSizingStore.getState();
    
    // Create a test scenario
    store.createScenario('Test Scenario');
    const scenarios = useSizingStore.getState().scenarios;
    const scenario = scenarios[scenarios.length - 1];
    
    // Add some scores
    store.setActiveScenario(scenario.id);
    store.setScore('workflowComplexity', 3);
    store.setScore('dataSensitivity', 2);
    store.setSystems(['d365-sales']);
    
    // Build report
    const report = buildReportModel(scenario.id);
    
    expect(report).not.toBeNull();
    if (!report) return;

    expect(report.scenario.id).toBe(scenario.id);
    expect(report.sizingResult).toBeDefined();
    expect(report.riskProfile).toBeDefined();
    expect(report.architecture).toBeDefined();
    expect(report.costs).toBeDefined();
    expect(report.roi).toBeDefined();
    
    // Check specific values
    expect(report.sizingResult.tShirtSize).toBeDefined();
    // We added d365-sales, so we expect connectors
    expect(report.connectors).toBeDefined();
    expect(report.connectors?.length).toBeGreaterThan(0);
    expect(report.connectors?.[0].id).toBe('d365-sales');
  });
});
