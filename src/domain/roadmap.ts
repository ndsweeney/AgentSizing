import type { SizingResult } from './scoring';
import type { MaturityResult } from './maturity';

export type ImpactLevel = 'High' | 'Medium' | 'Low';
export type Horizon = 'Quick Win' | 'Medium Term' | 'Transformational';

export interface RoadmapInitiative {
  id: string;
  title: string;
  description: string;
  horizon: Horizon;
  impact: ImpactLevel;
  effort: string;
  timeline: string;
  prerequisites: string[];
}

export interface ValueRoadmap {
  initiatives: RoadmapInitiative[];
  summary: string;
}

export function generateValueRoadmap(sizing: SizingResult, maturity: MaturityResult): ValueRoadmap {
  const initiatives: RoadmapInitiative[] = [];
  
  // Helper to add initiatives
  const add = (item: Omit<RoadmapInitiative, 'id'>) => {
    initiatives.push({ ...item, id: crypto.randomUUID() });
  };

  const matScores = maturity.scores;
  const dataMaturity = matScores['dataQuality'] || 1;
  const integrationMaturity = matScores['integrationMaturity'] || 1;
  const aiLiteracy = matScores['aiLiteracy'] || 1;

  // --- Quick Wins (0-3 Months) ---
  // Always suggest a pilot or simple FAQ if maturity is low
  if (aiLiteracy === 1) {
    add({
      title: "AI Awareness Workshop & Pilot",
      description: "Conduct workshops to increase AI literacy and deploy a simple internal FAQ agent.",
      horizon: "Quick Win",
      impact: "Medium",
      effort: "Low",
      timeline: "Weeks 1-4",
      prerequisites: []
    });
  }

  if (dataMaturity >= 2) {
    add({
      title: "Knowledge Retrieval Agent",
      description: "Deploy an agent to search and summarize existing structured documentation.",
      horizon: "Quick Win",
      impact: "High",
      effort: "Low",
      timeline: "Weeks 4-8",
      prerequisites: ["SharePoint/Knowledge Base Access"]
    });
  }

  // --- Medium Term (3-9 Months) ---
  if (integrationMaturity >= 2) {
    add({
      title: "Transactional Self-Service Agent",
      description: "Agent capable of performing simple lookups (e.g., Order Status, Ticket Status) via API.",
      horizon: "Medium Term",
      impact: "High",
      effort: "Medium",
      timeline: "Months 3-6",
      prerequisites: ["API Gateway", "Service Account"]
    });
  } else {
    add({
      title: "Integration Layer Modernization",
      description: "Establish an API layer or wrappers for legacy systems to enable agent actions.",
      horizon: "Medium Term",
      impact: "High",
      effort: "High",
      timeline: "Months 3-9",
      prerequisites: []
    });
  }

  // --- Transformational (9-18 Months) ---
  if (sizing.tShirtSize === 'LARGE') {
    add({
      title: "Enterprise Orchestrator",
      description: "A master agent orchestrating multiple sub-agents across departments (HR, IT, Finance).",
      horizon: "Transformational",
      impact: "High",
      effort: "High",
      timeline: "Months 9-15",
      prerequisites: ["Governance Framework", "Multi-Agent Architecture"]
    });
  }

  if (matScores['automationMaturity'] >= 2) {
    add({
      title: "End-to-End Process Automation",
      description: "Fully autonomous agents handling complex, multi-step workflows with human-in-the-loop only for exceptions.",
      horizon: "Transformational",
      impact: "High",
      effort: "High",
      timeline: "Months 12+",
      prerequisites: ["Process Mining", "RPA Integration"]
    });
  }

  return {
    initiatives: initiatives.sort((a, b) => {
      const order = { 'Quick Win': 1, 'Medium Term': 2, 'Transformational': 3 };
      return order[a.horizon] - order[b.horizon];
    }),
    summary: `Based on your sizing (${sizing.tShirtSize}) and maturity level (${maturity.level}), we recommend a phased approach starting with ${initiatives.filter(i => i.horizon === 'Quick Win').length} quick wins.`
  };
}
