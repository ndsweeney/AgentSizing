export type MaturityLevel = 1 | 2 | 3; // 1=Low, 2=Medium, 3=High

export interface MaturityDimension {
  id: string;
  label: string;
  description: string;
  options: {
    1: { title: string; description: string };
    2: { title: string; description: string };
    3: { title: string; description: string };
  };
  recommendations: {
    low: string;
    medium: string;
    high: string;
  };
}

export const MATURITY_DIMENSIONS: MaturityDimension[] = [
  {
    id: 'dataQuality',
    label: 'Data Quality',
    description: 'Availability, accuracy, and structure of data sources.',
    options: {
      1: { title: 'Ad-hoc / Siloed', description: 'Data is fragmented, unstructured, or unreliable.' },
      2: { title: 'Managed', description: 'Key datasets are defined but may lack consistent governance.' },
      3: { title: 'Optimized', description: 'High-quality, cataloged, and API-ready data estate.' }
    },
    recommendations: {
      low: 'Prioritize a data cleanup and cataloging initiative before scaling agents.',
      medium: 'Implement stricter data governance and master data management.',
      high: 'Leverage your strong data foundation for advanced reasoning agents.'
    }
  },
  {
    id: 'integrationMaturity',
    label: 'Integration Maturity',
    description: 'Readiness of systems to connect via APIs.',
    options: {
      1: { title: 'Legacy / Manual', description: 'No APIs, heavy reliance on UI automation or manual entry.' },
      2: { title: 'Hybrid', description: 'Mix of modern APIs and legacy systems requiring wrappers.' },
      3: { title: 'API-First', description: 'Microservices or robust API gateway in place.' }
    },
    recommendations: {
      low: 'Focus on building wrapper APIs or using RPA for legacy system access.',
      medium: 'Standardize API patterns and implement an API Gateway.',
      high: 'Utilize custom connectors and zero-trust security for integrations.'
    }
  },
  {
    id: 'governanceMaturity',
    label: 'Governance Maturity',
    description: 'Policies and controls for AI and software delivery.',
    options: {
      1: { title: 'None', description: 'No formal AI or software governance policies.' },
      2: { title: 'Developing', description: 'Basic policies exist but enforcement is manual.' },
      3: { title: 'Automated', description: 'Automated policy enforcement and comprehensive AI guardrails.' }
    },
    recommendations: {
      low: 'Establish an AI Center of Excellence (CoE) to define basic policies.',
      medium: 'Automate compliance checks in your CI/CD pipelines.',
      high: 'Focus on continuous monitoring and adaptive governance.'
    }
  },
  {
    id: 'aiLiteracy',
    label: 'AI Literacy',
    description: 'Workforce understanding and readiness for AI.',
    options: {
      1: { title: 'Low', description: 'Skepticism or lack of understanding about AI capabilities.' },
      2: { title: 'Mixed', description: 'Some champions, but general workforce needs upskilling.' },
      3: { title: 'High', description: 'Workforce is AI-fluent and actively seeks automation.' }
    },
    recommendations: {
      low: 'Run "Art of the Possible" workshops and basic AI training.',
      medium: 'Identify and empower "AI Champions" within business units.',
      high: 'Encourage citizen development and advanced prompt engineering.'
    }
  },
  {
    id: 'automationMaturity',
    label: 'Automation Maturity',
    description: 'Existing footprint of process automation.',
    options: {
      1: { title: 'Manual', description: 'Processes are largely manual and undocumented.' },
      2: { title: 'Partial', description: 'Some RPA or workflow automation in place.' },
      3: { title: 'Hyper-automated', description: 'Extensive use of RPA, DPA, and orchestration.' }
    },
    recommendations: {
      low: 'Start by documenting and standardizing processes (SOPs).',
      medium: 'Connect existing automations to agents as skills.',
      high: 'Orchestrate complex end-to-end processes using agents.'
    }
  },
  {
    id: 'securityPosture',
    label: 'Security Posture',
    description: 'Security controls and identity management.',
    options: {
      1: { title: 'Basic', description: 'Perimeter security only, shared accounts, or weak MFA.' },
      2: { title: 'Standard', description: 'SSO, MFA, and basic RBAC in place.' },
      3: { title: 'Zero Trust', description: 'Identity-centric security, least privilege, and continuous verification.' }
    },
    recommendations: {
      low: 'Upgrade identity management (Entra ID) before deploying agents.',
      medium: 'Implement Data Loss Prevention (DLP) policies for AI.',
      high: 'Apply fine-grained access controls to agent knowledge sources.'
    }
  }
];

export interface MaturityResult {
  scores: Record<string, MaturityLevel>;
  overallScore: number; // 0-100
  level: 'Initial' | 'Managed' | 'Defined' | 'Quantitatively Managed' | 'Optimizing';
  recommendations: string[];
}

export function calculateMaturityResult(scores: Record<string, MaturityLevel>): MaturityResult {
  const totalDimensions = MATURITY_DIMENSIONS.length;
  let totalScore = 0;
  const recommendations: string[] = [];

  MATURITY_DIMENSIONS.forEach(dim => {
    const score = scores[dim.id] || 1;
    totalScore += score;

    if (score === 1) recommendations.push(dim.recommendations.low);
    else if (score === 2) recommendations.push(dim.recommendations.medium);
    else if (score === 3) recommendations.push(dim.recommendations.high);
  });

  // Max score per dimension is 3.
  // Normalized score = (Total Score - Min Score) / (Max Score - Min Score) * 100
  // Min total = 6 * 1 = 6
  // Max total = 6 * 3 = 18
  // Range = 12
  
  const normalizedScore = Math.round(((totalScore - totalDimensions) / (totalDimensions * 2)) * 100);

  let level: MaturityResult['level'] = 'Initial';
  if (normalizedScore >= 80) level = 'Optimizing';
  else if (normalizedScore >= 60) level = 'Quantitatively Managed';
  else if (normalizedScore >= 40) level = 'Defined';
  else if (normalizedScore >= 20) level = 'Managed';

  return {
    scores,
    overallScore: normalizedScore,
    level,
    recommendations
  };
}
