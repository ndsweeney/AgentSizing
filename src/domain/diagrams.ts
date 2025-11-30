import type { SizingResult, ScoresRecord } from './scoring';
import { DimensionId } from './scoring';
import type { DeliveryPlan } from './delivery';

export const DiagramType = {
  AGENT_ARCHITECTURE: "AGENT_ARCHITECTURE",
  SYSTEM_INTEGRATION: "SYSTEM_INTEGRATION",
  GOVERNANCE: "GOVERNANCE"
} as const;

export type DiagramType = typeof DiagramType[keyof typeof DiagramType];

export interface DiagramDefinition {
  type: DiagramType;
  title: string;
  description?: string;
  code: string;
  imageUrl?: string;
  width?: number;
  height?: number;
}

export function buildSystemIntegrationMermaid(result: SizingResult, systems: string[]): DiagramDefinition {
  const { agentArchitecture } = result;
  const hasSystems = systems.length > 0;
  
  const activeAgents = agentArchitecture.filter(a => a.necessity !== 'Optional');
  const archetypes = new Set(activeAgents.map(a => a.archetypeId));

  let mermaidCode = 'graph TD\n';
  mermaidCode += '  classDef agent fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0c4a6e;\n';
  mermaidCode += '  classDef system fill:#f3f4f6,stroke:#6b7280,stroke-width:1px,color:#374151,shape:cylinder;\n';

  // Agent Layers (Simplified)
  mermaidCode += '  subgraph Agents["Copilot Agents"]\n';
  mermaidCode += '    Exp[Experience Layer]:::agent\n';
  
  let parentNode = 'Exp';

  if (archetypes.has('orchestrator')) {
    mermaidCode += '    Orch[Orchestrator]:::agent\n';
    mermaidCode += '    Exp --> Orch\n';
    parentNode = 'Orch';
  }
  
  if (archetypes.has('specialist-domain') || archetypes.has('logical-reasoning')) {
    mermaidCode += '    Domain[Domain Layer]:::agent\n';
    mermaidCode += `    ${parentNode} --> Domain\n`;
    parentNode = 'Domain';
  }

  if (archetypes.has('connector-integration') || archetypes.has('toolsmith-action')) {
    mermaidCode += '    Task[Task Layer]:::agent\n';
    mermaidCode += `    ${parentNode} --> Task\n`;
    parentNode = 'Task';
  }
  
  mermaidCode += '  end\n';

  // Systems
  if (hasSystems) {
    mermaidCode += '  subgraph Systems["External Systems"]\n';
    systems.forEach((sys, idx) => {
      const safeId = `Sys${idx}`;
      const safeLabel = sys.replace(/["\n]/g, '');
      mermaidCode += `    ${safeId}[("${safeLabel}")]:::system\n`;
    });
    mermaidCode += '  end\n';

    // Connections
    // Connect lowest available agent layer to systems
    systems.forEach((_, idx) => {
      mermaidCode += `  ${parentNode} -.-> Sys${idx}\n`;
    });
  } else {
    mermaidCode += '  Note[No external systems defined]:::system\n';
    mermaidCode += `  ${parentNode} -.-> Note\n`;
  }

  return {
    type: DiagramType.SYSTEM_INTEGRATION,
    title: "System Integration Diagram",
    description: hasSystems 
      ? `Integration flow between agents and ${systems.length} external system(s).`
      : "No external systems have been defined for this scenario.",
    code: mermaidCode
  };
}

export function buildAgentArchitectureMermaid(result: SizingResult): DiagramDefinition {
  const { tShirtSize, agentArchitecture } = result;
  
  let mermaidCode = 'graph TD\n';
  mermaidCode += '  classDef agent fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0c4a6e;\n';
  mermaidCode += '  classDef control fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f;\n';
  mermaidCode += '  classDef system fill:#f3f4f6,stroke:#6b7280,stroke-width:1px,color:#374151;\n';

  const activeAgents = agentArchitecture.filter(a => a.necessity !== 'Optional');
  const archetypes = new Set(activeAgents.map(a => a.archetypeId));

  // 1. Experience Layer
  mermaidCode += '  subgraph Experience["Experience Layer"]\n';
  if (archetypes.has('user-facing-copilot')) {
    mermaidCode += '    Exp1[User-Facing Copilot]:::agent\n';
  } else {
    mermaidCode += '    Exp1[Standard Chat Interface]:::agent\n';
  }
  if (archetypes.has('memory-context')) {
    mermaidCode += '    Mem[Memory Agent]:::agent\n';
    mermaidCode += '    Exp1 -.-> Mem\n';
  }
  mermaidCode += '  end\n';

  // 2. Value Stream / Orchestration Layer
  let orchestratorNode = 'Exp1'; // Default parent if no orchestrator
  if (archetypes.has('orchestrator') || archetypes.has('simulation-planning')) {
    mermaidCode += '  subgraph Orchestration["Orchestration Layer"]\n';
    if (archetypes.has('orchestrator')) {
      mermaidCode += '    Orch[Orchestrator Agent]:::agent\n';
      mermaidCode += '    Exp1 --> Orch\n';
      orchestratorNode = 'Orch';
    }
    if (archetypes.has('simulation-planning')) {
      mermaidCode += '    Sim[Simulation Agent]:::agent\n';
      mermaidCode += '    Orch -.-> Sim\n';
    }
    mermaidCode += '  end\n';
  }

  // 3. Domain / Function Layer
  if (archetypes.has('specialist-domain') || archetypes.has('logical-reasoning')) {
    mermaidCode += '  subgraph Domain["Domain Layer"]\n';
    if (archetypes.has('specialist-domain')) {
      mermaidCode += '    Spec[Specialist Agent]:::agent\n';
      mermaidCode += `    ${orchestratorNode} --> Spec\n`;
    }
    if (archetypes.has('logical-reasoning')) {
      mermaidCode += '    Logic[Reasoning Agent]:::agent\n';
      mermaidCode += `    ${orchestratorNode} --> Logic\n`;
    }
    mermaidCode += '  end\n';
  }

  // 4. Task / Integration Layer
  if (archetypes.has('connector-integration') || archetypes.has('toolsmith-action')) {
    mermaidCode += '  subgraph Task["Task Layer"]\n';
    const parent = (archetypes.has('specialist-domain')) ? 'Spec' : orchestratorNode;
    
    if (archetypes.has('connector-integration')) {
      mermaidCode += '    Conn[Integration Agent]:::agent\n';
      mermaidCode += `    ${parent} --> Conn\n`;
    }
    if (archetypes.has('toolsmith-action')) {
      mermaidCode += '    Tool[Toolsmith Agent]:::agent\n';
      mermaidCode += `    ${parent} --> Tool\n`;
    }
    mermaidCode += '  end\n';
  }

  // 5. Control Layer
  if (archetypes.has('governance-guardrail') || archetypes.has('meta-self-improving')) {
    mermaidCode += '  subgraph Control["Control Layer"]\n';
    if (archetypes.has('governance-guardrail')) {
      mermaidCode += '    Gov[Governance Agent]:::control\n';
      mermaidCode += '    Gov -.-> Exp1\n'; // Monitors entry
      if (orchestratorNode !== 'Exp1') mermaidCode += `    Gov -.-> ${orchestratorNode}\n`;
    }
    if (archetypes.has('meta-self-improving')) {
      mermaidCode += '    Meta[Meta-Agent]:::control\n';
      mermaidCode += `    Meta -.-> ${orchestratorNode}\n`;
    }
    mermaidCode += '  end\n';
  }

  return {
    type: DiagramType.AGENT_ARCHITECTURE,
    title: "Agent Architecture Diagram",
    description: `Visual representation of the ${tShirtSize.toLowerCase()} sizing architecture using specific agent archetypes.`,
    code: mermaidCode
  };
}

export function buildGovernanceMermaid(result: SizingResult, scores: ScoresRecord): DiagramDefinition {
  const { agentArchitecture } = result;
  const dataSensitivity = scores[DimensionId.DataSensitivity] || 0;
  const userReach = scores[DimensionId.UserReach] || 0;
  const isHighRisk = dataSensitivity >= 3 || userReach >= 3;

  const activeAgents = agentArchitecture.filter(a => a.necessity !== 'Optional');
  const archetypes = new Set(activeAgents.map(a => a.archetypeId));
  const hasGovernance = archetypes.has('governance-guardrail') || isHighRisk;

  let mermaidCode = 'graph TD\n';
  mermaidCode += '  classDef user fill:#f3f4f6,stroke:#6b7280,stroke-width:1px,color:#374151,shape:circle;\n';
  mermaidCode += '  classDef agent fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0c4a6e;\n';
  mermaidCode += '  classDef control fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f;\n';
  mermaidCode += '  classDef log fill:#f0fdf4,stroke:#16a34a,stroke-width:1px,color:#14532d,shape:database;\n';

  mermaidCode += '  User((User)):::user\n';
  mermaidCode += '  Agent[Copilot Agent]:::agent\n';
  
  // Control Layer
  if (hasGovernance) {
    mermaidCode += '  Control[Governance Agent]:::control\n';
    mermaidCode += '  User --> Control\n';
    mermaidCode += '  Control --> Agent\n';
    mermaidCode += '  Agent -.-> Control\n';
  } else {
    mermaidCode += '  User --> Agent\n';
  }

  // Logging & Monitoring
  mermaidCode += '  Logs[(Audit Logs)]:::log\n';
  mermaidCode += '  Agent -.-> Logs\n';
  
  if (isHighRisk) {
    mermaidCode += '  Monitor[Risk Monitor]:::control\n';
    mermaidCode += '  Logs -.-> Monitor\n';
  }

  // Annotations based on risk
  if (dataSensitivity >= 3) {
    mermaidCode += '  note1[High Data Sensitivity Checks]:::control\n';
    mermaidCode += '  Control -.- note1\n';
  }
  
  if (userReach >= 3) {
    mermaidCode += '  note2[Rate Limiting & Auth Checks]:::control\n';
    mermaidCode += '  Control -.- note2\n';
  }

  return {
    type: DiagramType.GOVERNANCE,
    title: "Governance & Control Flow",
    description: "Oversight and compliance checkpoints within the agent flow.",
    code: mermaidCode
  };
}

export function getExperienceAgentDiagram(result: SizingResult): string {
  const { agentArchitecture } = result;
  const archetypes = new Set(agentArchitecture.map(a => a.archetypeId));
  const hasMemory = archetypes.has('memory-context');
  
  let code = 'sequenceDiagram\n';
  code += '  actor User\n';
  code += '  participant Exp as User-Facing Copilot\n';
  
  if (hasMemory) {
    code += '  participant Mem as Memory Agent\n';
  }
  
  code += '  participant Orch as Orchestrator\n';
  
  code += '  User->>Exp: Sends Query\n';
  if (hasMemory) {
    code += '  Exp->>Mem: Retrieve Context\n';
    code += '  Mem-->>Exp: Context Object\n';
  }
  
  code += '  Exp->>Orch: Delegate Intent\n';
  code += '  Orch-->>Exp: Return Result\n';
  
  if (hasMemory) {
    code += '  Exp->>Mem: Update Context\n';
  }
  
  code += '  Exp->>User: Format & Send Response\n';
  
  return code;
}

export function getValueStreamAgentDiagram(result: SizingResult): string {
  const { agentArchitecture } = result;
  const archetypes = new Set(agentArchitecture.map(a => a.archetypeId));
  const hasSimulation = archetypes.has('simulation-planning');

  let code = 'graph TD\n';
  code += '  Start((Start)) --> Init[Initialize Context]\n';
  code += '  Init --> Plan{Orchestrator Planning}\n';
  
  if (hasSimulation) {
    code += '  Plan -->|High Stakes| Sim[Run Simulation]\n';
    code += '  Sim --> Eval{Evaluate Risk}\n';
    code += '  Eval -- Safe --> Exec[Execute Plan]\n';
    code += '  Eval -- Risky --> Replan[Adjust Plan]\n';
    code += '  Replan --> Sim\n';
  } else {
    code += '  Plan -->|Standard| Exec[Execute Plan]\n';
  }
  
  code += '  Exec --> Review[Review Output]\n';
  code += '  Review --> End((End))\n';
  
  return code;
}

export function getFunctionAgentDiagram(result: SizingResult): string {
  const { agentArchitecture } = result;
  const archetypes = new Set(agentArchitecture.map(a => a.archetypeId));
  const hasReasoning = archetypes.has('logical-reasoning');

  let code = 'graph LR\n';
  code += '  Input[Structured Input] --> Validate{Validate}\n';
  code += '  Validate -- Invalid --> Error[Return Error]\n';
  
  if (hasReasoning) {
    code += '  Validate -- Valid --> CoT[Chain of Thought]\n';
    code += '  CoT --> Step1[Step 1: Analyze]\n';
    code += '  Step1 --> Step2[Step 2: Deduce]\n';
    code += '  Step2 --> Output[Return Conclusion]\n';
  } else {
    code += '  Validate -- Valid --> Retrieve[Retrieve Knowledge]\n';
    code += '  Retrieve --> Output[Return Answer]\n';
  }
  return code;
}

export function getProcessAgentDiagram(result: SizingResult): string {
  const { agentArchitecture } = result;
  const archetypes = new Set(agentArchitecture.map(a => a.archetypeId));
  const isComplex = archetypes.has('orchestrator') || result.tShirtSize === 'LARGE';

  let code = 'stateDiagram-v2\n';
  code += '  [*] --> Idle\n';
  code += '  Idle --> Active: Trigger Received\n';
  code += '  state Active {\n';
  code += '    Validate --> Execute\n';
  
  if (isComplex) {
    code += '    Execute --> Wait: Async Task\n';
    code += '    Wait --> Execute: Callback\n';
  }
  
  code += '    Execute --> Complete\n';
  code += '  }\n';
  code += '  Active --> [*]: Success\n';
  code += '  Active --> Error: Failure\n';
  return code;
}

export function getTaskAgentDiagram(result: SizingResult): string {
  const { agentArchitecture } = result;
  const archetypes = new Set(agentArchitecture.map(a => a.archetypeId));
  const isToolsmith = archetypes.has('toolsmith-action');

  let code = 'graph TD\n';
  code += '  Req[Request] --> ';
  
  if (isToolsmith) {
    code += 'Select{Select Tool}\n';
    code += '  Select --> ToolA[Tool A]\n';
    code += '  Select --> ToolB[Tool B]\n';
    code += '  ToolA --> Exec[Execute]\n';
    code += '  ToolB --> Exec\n';
  } else {
    code += 'Map[Map Parameters]\n';
    code += '  Map --> API[Call External API]\n';
    code += '  API --> Exec[Parse Response]\n';
  }
  
  code += '  Exec --> Resp[Return Data]\n';
  return code;
}

export function getControlAgentDiagram(result: SizingResult): string {
  const { agentArchitecture } = result;
  const archetypes = new Set(agentArchitecture.map(a => a.archetypeId));
  const hasMeta = archetypes.has('meta-self-improving');

  let code = 'sequenceDiagram\n';
  code += '  participant Agent as Source Agent\n';
  code += '  participant Gov as Governance Agent\n';
  
  if (hasMeta) {
    code += '  participant Meta as Meta-Agent\n';
  }
  
  code += '  Agent->>Gov: Submit Content\n';
  code += '  Gov->>Gov: Check PII & Safety\n';
  
  code += '  alt Violation\n';
  code += '    Gov-->>Agent: Blocked\n';
  code += '  else Safe\n';
  code += '    Gov-->>Agent: Approved\n';
  if (hasMeta) {
    code += '    Gov->>Meta: Log Interaction\n';
    code += '    Meta->>Meta: Analyze Performance\n';
  }
  code += '  end\n';
  return code;
}

export function buildDeliveryGanttMermaid(plan: DeliveryPlan): DiagramDefinition {
  let mermaidCode = 'gantt\n';
  mermaidCode += '    title Project Delivery Timeline\n';
  mermaidCode += '    dateFormat  YYYY-MM-DD\n';
  mermaidCode += '    axisFormat  Sprint %W\n';
  mermaidCode += '    tickInterval 1week\n';
  mermaidCode += '    todayMarker off\n';

  // We'll simulate dates since Mermaid Gantt needs dates or relative time.
  // We'll use relative time "after [id]" or just raw sprint numbers if we map them to dates.
  // Easier approach: Use "Sprint X" as section and map tasks to relative days.
  // Actually, Mermaid Gantt supports "Sprint 1" as a date if we define the format, but standard dates are safer.
  // Let's assume Sprint 1 starts at 2024-01-01 and each sprint is 2 weeks (14 days).

  const SPRINT_DAYS = 14;
  const BASE_DATE = new Date('2024-01-01');

  const getSprintDate = (sprintNum: number) => {
    const daysToAdd = (sprintNum - 1) * SPRINT_DAYS;
    const date = new Date(BASE_DATE);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
  };

  const getEndDate = (startSprint: number, durationSprints: number) => {
    const startDays = (startSprint - 1) * SPRINT_DAYS;
    const durationDays = durationSprints * SPRINT_DAYS;
    const date = new Date(BASE_DATE);
    date.setDate(date.getDate() + startDays + durationDays);
    return date.toISOString().split('T')[0];
  };

  plan.phases.forEach(phase => {
    mermaidCode += `    section ${phase.name}\n`;
    
    phase.epics.forEach(epic => {
      epic.tasks.forEach(task => {
        const startDate = getSprintDate(task.startSprint);
        const endDate = getEndDate(task.startSprint, task.durationSprints);
        
        // Use Task ID as the label for cleaner chart
        // Sanitize ID for Mermaid (replace dots with hyphens)
        const safeId = task.id.replace(/\./g, '-');
        mermaidCode += `    ${task.id} :${safeId}, ${startDate}, ${endDate}\n`;
      });
    });
  });

  return {
    type: "DELIVERY_GANTT" as any, // Cast to any to avoid updating the const enum for now if strict
    title: "Delivery Timeline",
    description: "Gantt chart showing the estimated timeline for each task across sprints.",
    code: mermaidCode
  };
}
