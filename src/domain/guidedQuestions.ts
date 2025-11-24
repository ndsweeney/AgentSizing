import { DimensionId, type ScoreValue } from './scoring';

export interface GuidedAnswer {
  id: string;
  text: string;
  nextQuestionId?: string;
  resultScore?: ScoreValue;
  explanation?: string;
}

export interface GuidedQuestion {
  id: string;
  text: string;
  description?: string;
  answers: GuidedAnswer[];
}

export interface DimensionDecisionTree {
  dimensionId: DimensionId;
  rootQuestionId: string;
  questions: Record<string, GuidedQuestion>;
}

export const GUIDED_TREES: Record<string, DimensionDecisionTree> = {
  [DimensionId.BusinessScope]: {
    dimensionId: DimensionId.BusinessScope,
    rootQuestionId: 'scope_q1',
    questions: {
      'scope_q1': {
        id: 'scope_q1',
        text: 'Who is the primary audience for this agent?',
        description: 'Understanding the target audience helps define the scope boundaries.',
        answers: [
          { id: 'a1', text: 'Myself or my immediate team', nextQuestionId: 'scope_q2_small' },
          { id: 'a2', text: 'A specific department or business unit', nextQuestionId: 'scope_q2_med' },
          { id: 'a3', text: 'The entire organization or external customers', resultScore: 3, explanation: 'Enterprise-wide or external facing agents inherently have a Large business scope.' }
        ]
      },
      'scope_q2_small': {
        id: 'scope_q2_small',
        text: 'How many distinct tasks will the agent perform?',
        answers: [
          { id: 'a1', text: 'One specific task (e.g., "Book a meeting")', resultScore: 1, explanation: 'Single-purpose productivity agents are Small scope.' },
          { id: 'a2', text: 'Multiple related tasks', resultScore: 2, explanation: 'Handling multiple tasks pushes the scope to Medium even for small teams.' }
        ]
      },
      'scope_q2_med': {
        id: 'scope_q2_med',
        text: 'Does the process cross into other departments?',
        answers: [
          { id: 'a1', text: 'No, it stays within one department', resultScore: 2, explanation: 'Department-level processes are typically Medium scope.' },
          { id: 'a2', text: 'Yes, it involves handoffs to other depts', resultScore: 3, explanation: 'Cross-departmental workflows increase scope to Large.' }
        ]
      }
    }
  },
  [DimensionId.AgentCountAndTypes]: {
    dimensionId: DimensionId.AgentCountAndTypes,
    rootQuestionId: 'agent_q1',
    questions: {
      'agent_q1': {
        id: 'agent_q1',
        text: 'Do you envision one agent doing everything, or multiple specialized agents?',
        answers: [
          { id: 'a1', text: 'Just one agent', resultScore: 1, explanation: 'Single agent architecture is Small.' },
          { id: 'a2', text: 'Maybe 2-3 specialized agents', resultScore: 2, explanation: 'A small mesh of agents is Medium complexity.' },
          { id: 'a3', text: 'A complex ecosystem of many agents', resultScore: 3, explanation: 'Large multi-agent ecosystems require orchestration.' }
        ]
      }
    }
  },
  [DimensionId.SystemsToIntegrate]: {
    dimensionId: DimensionId.SystemsToIntegrate,
    rootQuestionId: 'sys_q1',
    questions: {
      'sys_q1': {
        id: 'sys_q1',
        text: 'Does the agent need to fetch or write data to external systems?',
        answers: [
          { id: 'a1', text: 'No, it just uses uploaded files or static info', resultScore: 1, explanation: 'No integrations keeps system complexity Small.' },
          { id: 'a2', text: 'Yes, it connects to other apps', nextQuestionId: 'sys_q2' }
        ]
      },
      'sys_q2': {
        id: 'sys_q2',
        text: 'How many systems, and are they standard?',
        answers: [
          { id: 'a1', text: '1-2 standard systems (e.g. SharePoint, Outlook)', resultScore: 1, explanation: 'Standard M365 connectors are low complexity.' },
          { id: 'a2', text: '3+ systems or custom APIs', resultScore: 2, explanation: 'Multiple systems or custom APIs increase complexity to Medium.' },
          { id: 'a3', text: 'Legacy on-prem systems or complex ERPs', resultScore: 3, explanation: 'Legacy/On-prem integration is High complexity.' }
        ]
      }
    }
  },
  [DimensionId.WorkflowComplexity]: {
    dimensionId: DimensionId.WorkflowComplexity,
    rootQuestionId: 'flow_q1',
    questions: {
      'flow_q1': {
        id: 'flow_q1',
        text: 'How linear is the conversation flow?',
        answers: [
          { id: 'a1', text: 'Simple Q&A or linear steps', resultScore: 1, explanation: 'Linear flows are Small complexity.' },
          { id: 'a2', text: 'It has some branches based on user choices', nextQuestionId: 'flow_q2' },
          { id: 'a3', text: 'Highly dynamic, non-deterministic', resultScore: 3, explanation: 'Dynamic/Non-deterministic flows are Large complexity.' }
        ]
      },
      'flow_q2': {
        id: 'flow_q2',
        text: 'Does the agent need to remember context from previous days or handle complex state?',
        answers: [
          { id: 'a1', text: 'No, just the current conversation', resultScore: 2, explanation: 'Branching logic without long-term state is Medium.' },
          { id: 'a2', text: 'Yes, long-running processes', resultScore: 3, explanation: 'Long-running state management is High complexity.' }
        ]
      }
    }
  },
  [DimensionId.DataSensitivity]: {
    dimensionId: DimensionId.DataSensitivity,
    rootQuestionId: 'data_q1',
    questions: {
      'data_q1': {
        id: 'data_q1',
        text: 'What kind of data will the agent handle?',
        answers: [
          { id: 'a1', text: 'Public or non-sensitive internal data', resultScore: 1, explanation: 'General data is Low sensitivity.' },
          { id: 'a2', text: 'Confidential internal documents', resultScore: 2, explanation: 'Confidential internal data is Medium sensitivity.' },
          { id: 'a3', text: 'PII, Financial, or Highly Restricted data', resultScore: 3, explanation: 'PII/Financial data is High sensitivity.' }
        ]
      }
    }
  },
  [DimensionId.UserReach]: {
    dimensionId: DimensionId.UserReach,
    rootQuestionId: 'reach_q1',
    questions: {
      'reach_q1': {
        id: 'reach_q1',
        text: 'How many users will have access?',
        answers: [
          { id: 'a1', text: 'Small pilot group (<50)', resultScore: 1, explanation: 'Small pilot groups are Low reach.' },
          { id: 'a2', text: 'Department or Business Unit (50-500)', resultScore: 2, explanation: 'Departmental scale is Medium reach.' },
          { id: 'a3', text: 'Enterprise (500+) or External Public', resultScore: 3, explanation: 'Enterprise/Public scale is High reach.' }
        ]
      }
    }
  },
  [DimensionId.ChangeAndAdoption]: {
    dimensionId: DimensionId.ChangeAndAdoption,
    rootQuestionId: 'change_q1',
    questions: {
      'change_q1': {
        id: 'change_q1',
        text: 'How much will this change how people work?',
        answers: [
          { id: 'a1', text: 'Minor convenience, no process change', resultScore: 1, explanation: 'Minor improvements require Low change management.' },
          { id: 'a2', text: 'Replaces an existing tool or process', resultScore: 2, explanation: 'Replacing tools requires Medium change management.' },
          { id: 'a3', text: 'Fundamentally new way of working', resultScore: 3, explanation: 'Transformational change requires High change management.' }
        ]
      }
    }
  },
  [DimensionId.PlatformMix]: {
    dimensionId: DimensionId.PlatformMix,
    rootQuestionId: 'plat_q1',
    questions: {
      'plat_q1': {
        id: 'plat_q1',
        text: 'Will you use only Copilot Studio, or extend with Azure?',
        answers: [
          { id: 'a1', text: 'Copilot Studio only (Low Code)', resultScore: 1, explanation: 'Low-code only is Small platform mix.' },
          { id: 'a2', text: 'Some Azure Functions or Power Automate', resultScore: 2, explanation: 'Adding pro-code extensions is Medium platform mix.' },
          { id: 'a3', text: 'Heavy Azure AI / Custom Code', resultScore: 3, explanation: 'Heavy custom code/Azure is Large platform mix.' }
        ]
      }
    }
  }
};
