import type { SizingResult } from './types';

export interface DeliveryTask {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  startSprint: number;
  durationSprints: number;
  dependencies: string[]; // Task IDs
  raci: {
    responsible: string[];
    accountable: string[];
    consulted: string[];
    informed: string[];
  };
}

export interface DeliveryEpic {
  id: string;
  title: string;
  description: string;
  tasks: DeliveryTask[];
}

export interface DeliveryPhase {
  id: string;
  name: string;
  startSprint: number;
  endSprint: number;
  duration: string; // e.g. "Sprint 1-2"
  epics: DeliveryEpic[];
}

export interface ResourceEstimate {
  role: string;
  count: number;
  allocation: number; // Percentage
  ratePerHour: number;
  totalHours: number;
  totalCost: number;
}

export interface DeliveryPlan {
  totalSprints: number;
  phases: DeliveryPhase[];
  raciMatrix: Record<string, string>; // Role description
  resources: ResourceEstimate[];
  totalEstimatedCost: number;
}

const ROLES = {
  PO: "Product Owner",
  ARCH: "Solution Architect",
  DEV: "Copilot Developer",
  SME: "Subject Matter Expert",
  GOV: "Governance Lead",
  QA: "QA Engineer"
};

export function generateDeliveryPlan(result: SizingResult): DeliveryPlan {
  const size = result.tShirtSize;
  
  let totalSprints = 2;
  if (size === 'MEDIUM') totalSprints = 4;
  if (size === 'LARGE') totalSprints = 8;

  const phases: DeliveryPhase[] = [];

  // Phase 1: Foundation & Design
  phases.push({
    id: "PHASE-1",
    name: "Foundation & Design",
    startSprint: 1,
    endSprint: 1,
    duration: "Sprint 1",
    epics: [
      {
        id: "EPIC-1",
        title: "Agent Architecture & Design",
        description: "Define the core architecture, agent personas, and integration patterns.",
        tasks: [
          {
            id: "TASK-1.1",
            title: "Define Agent Personas & Tone",
            description: "Document the system instructions and personality for each agent.",
            acceptanceCriteria: ["System prompts drafted", "Tone guidelines approved"],
            startSprint: 1,
            durationSprints: 0.5,
            dependencies: [],
            raci: {
              responsible: [ROLES.ARCH, ROLES.DEV],
              accountable: [ROLES.PO],
              consulted: [ROLES.SME],
              informed: [ROLES.GOV]
            }
          },
          {
            id: "TASK-1.2",
            title: "Technical Architecture Setup",
            description: "Set up the Azure/Copilot Studio environment and connections.",
            acceptanceCriteria: ["Environment provisioned", "Access rights granted"],
            startSprint: 1,
            durationSprints: 0.5,
            dependencies: [],
            raci: {
              responsible: [ROLES.DEV],
              accountable: [ROLES.ARCH],
              consulted: [ROLES.GOV],
              informed: [ROLES.PO]
            }
          }
        ]
      }
    ]
  });

  // Phase 2: Build & Integrate
  const buildStart = 2;
  
  // Determine concurrency based on size (proxy for team size)
  const concurrentTracks = size === 'SMALL' ? 1 : size === 'MEDIUM' ? 2 : 3;
  const trackAvailability = new Array(concurrentTracks).fill(buildStart);

  // Core Agent Build Epic
  const agentTasks: DeliveryTask[] = result.agentArchitecture
    .filter(a => a.necessity !== 'Optional')
    .map((agent, idx) => {
      // Find the earliest available track
      let trackIdx = 0;
      for (let i = 1; i < concurrentTracks; i++) {
        if (trackAvailability[i] < trackAvailability[trackIdx]) {
          trackIdx = i;
        }
      }

      const startSprint = trackAvailability[trackIdx];
      const duration = size === 'LARGE' ? 2 : 1;
      
      // Update track availability
      trackAvailability[trackIdx] += duration;

      return {
        id: `TASK-2.${idx + 1}`,
        title: `Build ${agent.type}`,
        description: `Implement the topics and logic for ${agent.type}.`,
        acceptanceCriteria: ["Topics implemented", "Entities defined", "Unit tests passed"],
        startSprint: startSprint,
        durationSprints: duration,
        dependencies: ["TASK-1.1", "TASK-1.2"],
        raci: {
          responsible: [ROLES.DEV],
          accountable: [ROLES.ARCH],
          consulted: [ROLES.SME],
          informed: [ROLES.PO]
        }
      };
    });

  // Calculate actual build end based on tasks
  const maxTaskEnd = Math.max(...trackAvailability);
  // Ensure build phase is at least 1 sprint long and fits within reasonable bounds
  const buildEnd = Math.max(maxTaskEnd, size === 'SMALL' ? 2 : size === 'MEDIUM' ? 3 : 6);
  const buildDuration = `Sprint ${buildStart}-${buildEnd}`;

  const buildEpics: DeliveryEpic[] = [];

  buildEpics.push({
    id: "EPIC-2",
    title: "Core Agent Build",
    description: "Development of the primary agents and conversation flows.",
    tasks: agentTasks
  });

  // Integration Epic (if needed)
  if (size !== 'SMALL') {
    // Integrations run in parallel with build, usually starting early
    const integrationDuration = size === 'LARGE' ? 2 : 1;
    
    buildEpics.push({
      id: "EPIC-3",
      title: "Integrations & Data",
      description: "Connect agents to backend systems and knowledge sources.",
      tasks: [
        {
          id: "TASK-3.1",
          title: "Connector Implementation",
          description: "Implement and test custom connectors or API wrappers.",
          acceptanceCriteria: ["Connectors deployed", "Authentication working", "Data flow verified"],
          startSprint: buildStart,
          durationSprints: integrationDuration,
          dependencies: ["TASK-1.2"],
          raci: {
            responsible: [ROLES.DEV],
            accountable: [ROLES.ARCH],
            consulted: [ROLES.GOV],
            informed: [ROLES.PO]
          }
        }
      ]
    });
  }

  phases.push({
    id: "PHASE-2",
    name: "Build & Integrate",
    startSprint: buildStart,
    endSprint: buildEnd,
    duration: buildDuration,
    epics: buildEpics
  });

  // Phase 3: Harden & Deploy
  // Start hardening after the main build phase ends
  const hardenStart = buildEnd; 
  // Adjust total sprints if build took longer than expected
  if (hardenStart >= totalSprints) {
    totalSprints = hardenStart + (size === 'LARGE' ? 2 : 1);
  }
  
  const hardenEnd = totalSprints;
  const hardenDuration = `Sprint ${hardenStart}-${hardenEnd}`;
  
  phases.push({
    id: "PHASE-3",
    name: "Harden & Deploy",
    startSprint: hardenStart,
    endSprint: hardenEnd,
    duration: hardenDuration,
    epics: [
      {
        id: "EPIC-4",
        title: "Governance & Controls",
        description: "Implement safety checks, logging, and compliance controls.",
        tasks: [
          {
            id: "TASK-4.1",
            title: "Implement Guardrails",
            description: "Configure content filters and topic blocks.",
            acceptanceCriteria: ["PII redaction active", "Jailbreak protection verified"],
            startSprint: hardenStart,
            durationSprints: 0.5,
            dependencies: ["TASK-2.1"],
            raci: {
              responsible: [ROLES.DEV],
              accountable: [ROLES.GOV],
              consulted: [ROLES.ARCH],
              informed: [ROLES.PO]
            }
          }
        ]
      },
      {
        id: "EPIC-5",
        title: "Testing & UAT",
        description: "End-to-end testing and user acceptance.",
        tasks: [
          {
            id: "TASK-5.1",
            title: "User Acceptance Testing",
            description: "SMEs and stakeholders validate the agent.",
            acceptanceCriteria: ["UAT sign-off received", "Critical bugs fixed"],
            startSprint: hardenStart,
            durationSprints: size === 'LARGE' ? 1 : 0.5,
            dependencies: ["TASK-4.1"],
            raci: {
              responsible: [ROLES.SME, ROLES.QA],
              accountable: [ROLES.PO],
              consulted: [ROLES.DEV],
              informed: [ROLES.ARCH]
            }
          }
        ]
      }
    ]
  });

  // Resource Estimation
  const resources: ResourceEstimate[] = [];
  const sprintWeeks = 2;
  const hoursPerSprint = 40 * sprintWeeks; // 80 hours per sprint per person

  // Base team
  resources.push({
    role: ROLES.PO,
    count: 1,
    allocation: 50,
    ratePerHour: 150,
    totalHours: totalSprints * hoursPerSprint * 0.5,
    totalCost: 0
  });

  resources.push({
    role: ROLES.ARCH,
    count: 1,
    allocation: size === 'SMALL' ? 20 : 50,
    ratePerHour: 200,
    totalHours: totalSprints * hoursPerSprint * (size === 'SMALL' ? 0.2 : 0.5),
    totalCost: 0
  });

  resources.push({
    role: ROLES.DEV,
    count: size === 'SMALL' ? 1 : size === 'MEDIUM' ? 2 : 4,
    allocation: 100,
    ratePerHour: 175,
    totalHours: totalSprints * hoursPerSprint * (size === 'SMALL' ? 1 : size === 'MEDIUM' ? 2 : 4),
    totalCost: 0
  });

  // Calculate costs
  let totalEstimatedCost = 0;
  resources.forEach(r => {
    r.totalCost = r.totalHours * r.ratePerHour;
    totalEstimatedCost += r.totalCost;
  });

  return {
    totalSprints,
    phases,
    raciMatrix: ROLES,
    resources,
    totalEstimatedCost
  };
}
