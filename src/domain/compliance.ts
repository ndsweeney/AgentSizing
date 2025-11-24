import type { SizingResult } from './scoring';

export interface ComplianceControl {
  id: string;
  name: string;
  category: 'Security' | 'Privacy' | 'Operational' | 'Ethical';
  description: string;
}

export interface AgentComplianceScore {
  agentType: string;
  scores: Record<string, 'green' | 'yellow' | 'red'>; // controlId -> status
}

export interface ComplianceHeatmapData {
  controls: ComplianceControl[];
  agentScores: AgentComplianceScore[];
  overallScore: number; // 0-100
}

export const COMPLIANCE_CONTROLS: ComplianceControl[] = [
  { id: 'c1', name: 'Authentication', category: 'Security', description: 'User identity verification' },
  { id: 'c2', name: 'Authorization', category: 'Security', description: 'Role-based access control' },
  { id: 'c3', name: 'Data Encryption', category: 'Security', description: 'Encryption at rest and transit' },
  { id: 'c4', name: 'PII Masking', category: 'Privacy', description: 'Redaction of sensitive data' },
  { id: 'c5', name: 'Consent Management', category: 'Privacy', description: 'User consent tracking' },
  { id: 'c6', name: 'Audit Logging', category: 'Operational', description: 'Traceability of actions' },
  { id: 'c7', name: 'Rate Limiting', category: 'Operational', description: 'API usage control' },
  { id: 'c8', name: 'Bias Detection', category: 'Ethical', description: 'Monitoring for output bias' },
  { id: 'c9', name: 'Hallucination Check', category: 'Ethical', description: 'Fact-checking outputs' },
];

export function generateComplianceHeatmap(_result: SizingResult): ComplianceHeatmapData {
  const agentTypes = [
    'Experience Agent',
    'Process Agent',
    'Function Agent',
    'Task Agent',
    'Control Agent'
  ];

  const agentScores: AgentComplianceScore[] = agentTypes.map(agent => {
    const scores: Record<string, 'green' | 'yellow' | 'red'> = {};
    
    COMPLIANCE_CONTROLS.forEach(control => {
      // Simulation logic for scoring based on agent type and control category
      // In a real app, this would be more complex or user-defined
      
      let status: 'green' | 'yellow' | 'red' = 'green';

      if (agent === 'Experience Agent') {
        if (control.category === 'Ethical') status = 'yellow'; // High risk of hallucination/bias
        if (control.id === 'c1') status = 'green'; // Auth is critical but usually handled well
      }

      if (agent === 'Process Agent') {
        if (control.category === 'Operational') status = 'yellow'; // Complex flows need logging
        if (control.id === 'c6') status = 'red'; // Audit logging is critical and often missing
      }

      if (agent === 'Function Agent') {
        if (control.category === 'Security') status = 'red'; // Direct system access is high risk
      }

      // Randomize slightly for demo purposes if not strictly defined above
      if (Math.random() > 0.8) status = 'yellow';
      if (Math.random() > 0.95) status = 'red';

      scores[control.id] = status;
    });

    return { agentType: agent, scores };
  });

  // Calculate overall score
  let totalPoints = 0;
  let maxPoints = agentTypes.length * COMPLIANCE_CONTROLS.length * 3; // 3 points for green

  agentScores.forEach(agent => {
    Object.values(agent.scores).forEach(status => {
      if (status === 'green') totalPoints += 3;
      if (status === 'yellow') totalPoints += 2;
      if (status === 'red') totalPoints += 1;
    });
  });

  const overallScore = Math.round((totalPoints / maxPoints) * 100);

  return {
    controls: COMPLIANCE_CONTROLS,
    agentScores,
    overallScore
  };
}
