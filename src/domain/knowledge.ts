export type KnowledgeCategory = 'glossary' | 'pattern' | 'governance' | 'example';

export interface KnowledgeItem {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  tags: string[];
  relatedIds?: string[];
}

export const KNOWLEDGE_BASE: KnowledgeItem[] = [
  // Glossary
  {
    id: 'g-1',
    category: 'glossary',
    title: 'Topic',
    content: 'A discrete conversation path within a Copilot Studio agent that handles a specific user intent or workflow.',
    tags: ['core', 'definition']
  },
  {
    id: 'g-2',
    category: 'glossary',
    title: 'Entity',
    content: 'A piece of information that the agent extracts from the user\'s input, such as a date, email address, or product name.',
    tags: ['core', 'nlu']
  },
  {
    id: 'g-3',
    category: 'glossary',
    title: 'Generative Answers',
    content: 'A feature that allows the agent to generate responses based on a knowledge source (like a website or SharePoint) without pre-defined topics.',
    tags: ['ai', 'rag']
  },
  
  // Architecture Patterns
  {
    id: 'p-1',
    category: 'pattern',
    title: 'Orchestrator Pattern',
    content: 'A design where a main "parent" agent routes user requests to specialized "child" agents or skills based on intent, allowing for modular development.',
    tags: ['architecture', 'scaling']
  },
  {
    id: 'p-2',
    category: 'pattern',
    title: 'Human Handoff',
    content: 'The mechanism by which an agent transfers a conversation to a live agent (via Omnichannel or other hubs) when it cannot resolve the user\'s issue.',
    tags: ['integration', 'support']
  },
  {
    id: 'p-3',
    category: 'pattern',
    title: 'RAG (Retrieval-Augmented Generation)',
    content: 'Connecting the agent to enterprise data sources to ground generative AI responses in company-specific knowledge.',
    tags: ['ai', 'data']
  },

  // Governance Controls
  {
    id: 'gov-1',
    category: 'governance',
    title: 'DLP Policies',
    content: 'Data Loss Prevention policies in the Power Platform admin center that control which connectors can be used by agents to prevent data exfiltration.',
    tags: ['security', 'admin']
  },
  {
    id: 'gov-2',
    category: 'governance',
    title: 'Environment Strategy',
    content: 'Using separate environments for Dev, Test, and Prod to ensure safe lifecycle management (ALM) of agents.',
    tags: ['alm', 'deployment']
  },
  {
    id: 'gov-3',
    category: 'governance',
    title: 'Authentication',
    content: 'Configuring Azure Entra ID (formerly Azure AD) to ensure only authorized users can access the agent and that the agent acts on their behalf.',
    tags: ['security', 'identity']
  },

  // Example Agents
  {
    id: 'ex-1',
    category: 'example',
    title: 'IT Helpdesk Agent',
    content: 'An agent designed to handle common IT requests like password resets, software installation, and ticket creation in ServiceNow.',
    tags: ['internal', 'support']
  },
  {
    id: 'ex-2',
    category: 'example',
    title: 'HR Benefits Assistant',
    content: 'An internal agent that answers employee questions about health insurance, leave policies, and payroll using generative answers over HR documents.',
    tags: ['internal', 'hr']
  },
  {
    id: 'ex-3',
    category: 'example',
    title: 'Customer Service Concierge',
    content: 'An external-facing agent on the company website that helps customers track orders, find products, and answer FAQs.',
    tags: ['external', 'sales']
  }
];
