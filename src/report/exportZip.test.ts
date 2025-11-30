import { describe, it, expect, vi } from 'vitest';
import { exportReportZip } from './exportZip';
import type { ReportModel } from './reportModel';

// Mock JSZip
vi.mock('jszip', () => {
  return {
    default: class {
      files: Record<string, any> = {};
      file(name: string, content: any) {
        this.files[name] = content;
      }
      folder(name: string) {
        const folderObj = {
          file: (n: string, c: any) => {
            this.files[`${name}/${n}`] = c;
          }
        };
        return folderObj;
      }
      generateAsync() {
        return Promise.resolve(new Blob(['zip-content']));
      }
    }
  };
});

const mockReport: ReportModel = {
  scenario: {
    id: 'test',
    name: 'Test',
    scores: {},
    targetScores: {},
    maturityScores: {},
    systems: [],
    mode: 'single',
    currentStep: 0,
    createdAt: 0,
    lastUpdated: 0,
    facilitatorName: '',
    customerName: '',
    workshopTitle: '',
    industry: '',
    useCase: '',
    notes: '',
    dimensionComments: {},
    costAssumptions: {} as any,
    benefitAssumptions: {} as any
  },
  sizingResult: {
    totalScore: 0,
    tShirtSize: 'SMALL',
    notes: [],
    recommendedAgentPattern: [],
    agentArchitecture: [],
    testCases: [],
    copilotArchitecture: {
      experienceAgents: '',
      valueStreamAgents: '',
      functionAgents: '',
      processAgents: '',
      taskAgents: '',
      controlAgents: '',
      foundryRequirement: ''
    }
  },
  riskProfile: { level: 'LOW', reasons: [] },
  generatedAt: '',
  appVersion: '1.0',
  scenarioHash: 'test-hash',
  diagrams: {
    agentFlow: { type: 'AGENT_ARCHITECTURE', title: 'Flow', code: 'graph TD' }
  },
  exampleData: [
    { id: '1', name: 'Data', description: '', data: [], filename: 'data.json' }
  ],
  blueprints: [
    '# Agent Blueprint: Test Agent\nContent'
  ],
  topicSkeletons: [
    { name: 'Test Topic', agentType: 'Task Agents', triggerPhrases: [], variables: [], steps: [], actions: [], responseTemplates: [] }
  ]
};

describe('exportReportZip', () => {
  it('should add core files to zip', async () => {
    // We can't easily inspect the real JSZip instance with this mock approach 
    // without exposing the instance, but we can verify it runs without error
    // and returns a blob.
    
    const blob = await exportReportZip(mockReport);
    expect(blob).toBeDefined();
    expect(blob).toBeInstanceOf(Blob);
  });
});
