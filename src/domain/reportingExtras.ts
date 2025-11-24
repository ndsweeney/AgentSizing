import type { SizingResult } from './types';

export interface PromptDefinition {
  role: string;
  content: string;
  variables: string[];
}

export interface TestPlanItem {
  category: string;
  testCase: string;
  expectedResult: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface StarterPackItem {
  filename: string;
  description: string;
  type: 'code' | 'config' | 'doc';
}

export interface DebuggerConfig {
  traceEnabled: boolean;
  logLevel: string;
  monitoredEvents: string[];
}

export function generatePrompts(result: SizingResult): PromptDefinition[] {
  const prompts: PromptDefinition[] = [];

  // System Prompt
  prompts.push({
    role: 'System',
    content: `You are an AI assistant designed to help with ${result.tShirtSize} complexity tasks. Your primary goal is to assist users efficiently and accurately.`,
    variables: ['user_context', 'history']
  });

  // Intent Classification Prompt
  if (result.totalScore > 15) {
    prompts.push({
      role: 'Classifier',
      content: `Analyze the user's input and classify the intent into one of the following categories: [Support, Sales, Info, Complaint].`,
      variables: ['user_input']
    });
  }

  return prompts;
}

export function generateTestPlan(result: SizingResult): TestPlanItem[] {
  const plan: TestPlanItem[] = [
    {
      category: 'Functional',
      testCase: 'Verify basic greeting and intent recognition',
      expectedResult: 'Agent responds with appropriate greeting and identifies intent correctly.',
      priority: 'High'
    },
    {
      category: 'Safety',
      testCase: 'Attempt jailbreak / prompt injection',
      expectedResult: 'Agent refuses to engage and redirects to safe topics.',
      priority: 'High'
    }
  ];

  if (result.tShirtSize === 'LARGE') {
    plan.push({
      category: 'Performance',
      testCase: 'Load test with 50 concurrent users',
      expectedResult: 'Response time remains under 2 seconds.',
      priority: 'Medium'
    });
  }

  return plan;
}

export function generateStarterPack(result: SizingResult): StarterPackItem[] {
  const items: StarterPackItem[] = [
    {
      filename: 'agent_config.json',
      description: `Configuration file for the ${result.tShirtSize.toLowerCase()} agent runtime.`,
      type: 'config'
    },
    {
      filename: 'main.py',
      description: 'Entry point for the agent application.',
      type: 'code'
    },
    {
      filename: 'README.md',
      description: 'Setup and deployment instructions.',
      type: 'doc'
    }
  ];
  
  return items;
}

export function generateDebuggerConfig(result: SizingResult): DebuggerConfig {
  return {
    traceEnabled: true,
    logLevel: result.tShirtSize === 'LARGE' ? 'DEBUG' : 'INFO',
    monitoredEvents: ['turn_start', 'llm_call', 'tool_usage', 'turn_end']
  };
}
