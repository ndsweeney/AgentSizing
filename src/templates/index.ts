import { DimensionId, type ScoreValue } from '../domain/scoring';

export interface IndustryTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  recommendedUseCases: string[];
  defaultScores: Partial<Record<DimensionId, ScoreValue>>;
  agentMeshSummary: string;
}

export const retailTemplate: IndustryTemplate = {
  id: 'retail',
  name: 'Retail & E-commerce',
  description: 'Focus on customer experience, order management, and personalized shopping assistants.',
  industry: 'Retail',
  recommendedUseCases: ['Customer Support', 'Personal Shopper', 'Order Tracking', 'Inventory Management'],
  defaultScores: {
    [DimensionId.BusinessScope]: 2,
    [DimensionId.AgentCountAndTypes]: 2,
    [DimensionId.UserReach]: 3,
    [DimensionId.DataSensitivity]: 2,
    [DimensionId.SystemsToIntegrate]: 2,
    [DimensionId.WorkflowComplexity]: 2,
    [DimensionId.ChangeAndAdoption]: 1,
    [DimensionId.PlatformMix]: 1
  },
  agentMeshSummary: 'A mix of Experience Agents for customer interaction and Process Agents for order fulfillment. High volume, medium complexity.'
};

export const fsiTemplate: IndustryTemplate = {
  id: 'fsi',
  name: 'Financial Services (FSI)',
  description: 'High security and compliance requirements with complex backend integrations for banking and insurance.',
  industry: 'Financial Services',
  recommendedUseCases: ['Claims Processing', 'Fraud Detection', 'Financial Advisory', 'Compliance Checks'],
  defaultScores: {
    [DimensionId.BusinessScope]: 3,
    [DimensionId.AgentCountAndTypes]: 3,
    [DimensionId.UserReach]: 2,
    [DimensionId.DataSensitivity]: 3,
    [DimensionId.SystemsToIntegrate]: 3,
    [DimensionId.WorkflowComplexity]: 3,
    [DimensionId.ChangeAndAdoption]: 2,
    [DimensionId.PlatformMix]: 2
  },
  agentMeshSummary: 'Heavy reliance on Control Agents and secure Value Stream Agents. Strict governance and audit trails required.'
};

export const manufacturingTemplate: IndustryTemplate = {
  id: 'manufacturing',
  name: 'Manufacturing & Supply Chain',
  description: 'Optimizing supply chain logistics, predictive maintenance, and factory floor operations.',
  industry: 'Manufacturing',
  recommendedUseCases: ['Supply Chain Optimization', 'Predictive Maintenance', 'Quality Control', 'Vendor Management'],
  defaultScores: {
    [DimensionId.BusinessScope]: 2,
    [DimensionId.AgentCountAndTypes]: 2,
    [DimensionId.UserReach]: 1,
    [DimensionId.DataSensitivity]: 2,
    [DimensionId.SystemsToIntegrate]: 3,
    [DimensionId.WorkflowComplexity]: 3,
    [DimensionId.ChangeAndAdoption]: 3,
    [DimensionId.PlatformMix]: 2
  },
  agentMeshSummary: 'Integration-heavy architecture connecting ERP, IoT, and logistics systems. Focus on Process and Task Agents.'
};

export const consultingTemplate: IndustryTemplate = {
  id: 'consulting',
  name: 'Professional Services',
  description: 'Knowledge management, proposal generation, and expert systems for consultants.',
  industry: 'Professional Services',
  recommendedUseCases: ['Knowledge Base Search', 'Proposal Generator', 'Expert Finder', 'Project Management'],
  defaultScores: {
    [DimensionId.BusinessScope]: 1,
    [DimensionId.AgentCountAndTypes]: 2,
    [DimensionId.UserReach]: 2,
    [DimensionId.DataSensitivity]: 2,
    [DimensionId.SystemsToIntegrate]: 1,
    [DimensionId.WorkflowComplexity]: 2,
    [DimensionId.ChangeAndAdoption]: 2,
    [DimensionId.PlatformMix]: 1
  },
  agentMeshSummary: 'Knowledge-centric agents (Experience & Function Agents) leveraging RAG patterns. Lower integration complexity.'
};

export const publicSectorTemplate: IndustryTemplate = {
  id: 'publicsector',
  name: 'Public Sector / Gov',
  description: 'Citizen services, case management, and regulatory compliance with accessibility focus.',
  industry: 'Public Sector',
  recommendedUseCases: ['Citizen Services Portal', 'Permit Application', 'Policy Q&A', 'Case Management'],
  defaultScores: {
    [DimensionId.BusinessScope]: 3,
    [DimensionId.AgentCountAndTypes]: 2,
    [DimensionId.UserReach]: 3,
    [DimensionId.DataSensitivity]: 3,
    [DimensionId.SystemsToIntegrate]: 2,
    [DimensionId.WorkflowComplexity]: 2,
    [DimensionId.ChangeAndAdoption]: 3,
    [DimensionId.PlatformMix]: 2
  },
  agentMeshSummary: 'High accessibility and security requirements. Experience Agents for citizen interaction backed by secure Process Agents.'
};

export const TEMPLATES = [
  retailTemplate,
  fsiTemplate,
  manufacturingTemplate,
  consultingTemplate,
  publicSectorTemplate
];
