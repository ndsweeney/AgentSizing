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
  const { tShirtSize, copilotArchitecture } = result;
  const hasSystems = systems.length > 0;

  let mermaidCode = 'graph TD\n';
  mermaidCode += '  classDef agent fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0c4a6e;\n';
  mermaidCode += '  classDef system fill:#f3f4f6,stroke:#6b7280,stroke-width:1px,color:#374151,shape:cylinder;\n';

  // Agent Layers (Simplified)
  mermaidCode += '  subgraph Agents["Copilot Agents"]\n';
  mermaidCode += '    Exp[Experience Layer]:::agent\n';
  
  if (copilotArchitecture.valueStreamAgents.includes("Required") || tShirtSize === 'LARGE') {
    mermaidCode += '    VS[Value Stream Layer]:::agent\n';
    mermaidCode += '    Exp --> VS\n';
  }
  
  mermaidCode += '    Func[Function Layer]:::agent\n';
  const funcParent = (copilotArchitecture.valueStreamAgents.includes("Required") || tShirtSize === 'LARGE') ? 'VS' : 'Exp';
  mermaidCode += `    ${funcParent} --> Func\n`;

  if (copilotArchitecture.processAgents !== "0") {
    mermaidCode += '    Proc[Process Layer]:::agent\n';
    mermaidCode += '    Func --> Proc\n';
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
    let connector = 'Func';
    if (copilotArchitecture.processAgents !== "0") connector = 'Proc';
    
    systems.forEach((_, idx) => {
      mermaidCode += `  ${connector} -.-> Sys${idx}\n`;
    });
  } else {
    mermaidCode += '  Note[No external systems defined]:::system\n';
    mermaidCode += '  Func -.-> Note\n';
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
  const { tShirtSize, copilotArchitecture } = result;
  
  let mermaidCode = 'graph TD\n';
  mermaidCode += '  classDef agent fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0c4a6e;\n';
  mermaidCode += '  classDef control fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f;\n';
  mermaidCode += '  classDef system fill:#f3f4f6,stroke:#6b7280,stroke-width:1px,color:#374151;\n';

  // Experience Layer
  if (copilotArchitecture.experienceAgents.includes("2+")) {
    mermaidCode += '  subgraph Experience["Experience Layer"]\n';
    mermaidCode += '    Exp1[Web Agent]:::agent\n';
    mermaidCode += '    Exp2[Teams Agent]:::agent\n';
    mermaidCode += '  end\n';
  } else {
    mermaidCode += '  Exp1[Experience Agent]:::agent\n';
  }

  // Value Stream Layer (Only for Large/Complex)
  if (copilotArchitecture.valueStreamAgents.includes("Required") || tShirtSize === 'LARGE') {
    mermaidCode += '  VS[Value Stream Agent]:::agent\n';
    if (copilotArchitecture.experienceAgents.includes("2+")) {
      mermaidCode += '  Exp1 --> VS\n';
      mermaidCode += '  Exp2 --> VS\n';
    } else {
      mermaidCode += '  Exp1 --> VS\n';
    }
  }

  // Function Layer
  mermaidCode += '  subgraph Function["Function Layer"]\n';
  if (copilotArchitecture.functionAgents.includes("3-5+") || tShirtSize === 'LARGE') {
    mermaidCode += '    Func1[HR Function]:::agent\n';
    mermaidCode += '    Func2[IT Function]:::agent\n';
    mermaidCode += '    Func3[Finance Function]:::agent\n';
  } else if (copilotArchitecture.functionAgents.includes("2-3") || tShirtSize === 'MEDIUM') {
    mermaidCode += '    Func1[Primary Function]:::agent\n';
    mermaidCode += '    Func2[Secondary Function]:::agent\n';
  } else {
    mermaidCode += '    Func1[Core Function]:::agent\n';
  }
  mermaidCode += '  end\n';

  // Connect Value Stream (or Experience) to Function
  const parentNode = (copilotArchitecture.valueStreamAgents.includes("Required") || tShirtSize === 'LARGE') ? 'VS' : 'Exp1';
  mermaidCode += `  ${parentNode} --> Func1\n`;
  if (tShirtSize !== 'SMALL') {
    mermaidCode += `  ${parentNode} --> Func2\n`;
    if (tShirtSize === 'LARGE') mermaidCode += `  ${parentNode} --> Func3\n`;
  }

  // Process Layer
  if (copilotArchitecture.processAgents !== "0") {
    mermaidCode += '  subgraph Process["Process Layer"]\n';
    mermaidCode += '    Proc1[Process Agent]:::agent\n';
    if (tShirtSize === 'LARGE') mermaidCode += '    Proc2[Complex Process]:::agent\n';
    mermaidCode += '  end\n';
    
    mermaidCode += '  Func1 --> Proc1\n';
    if (tShirtSize === 'LARGE') mermaidCode += '  Func2 --> Proc2\n';
  }

  // Task Layer
  mermaidCode += '  subgraph Task["Task Layer"]\n';
  mermaidCode += '    Task1[Task Agent]:::agent\n';
  mermaidCode += '    Task2[Task Agent]:::agent\n';
  if (tShirtSize === 'LARGE') mermaidCode += '    Task3[Task Agent]:::agent\n';
  mermaidCode += '  end\n';

  // Connect Process (or Function) to Task
  const taskParent = copilotArchitecture.processAgents !== "0" ? 'Proc1' : 'Func1';
  mermaidCode += `  ${taskParent} --> Task1\n`;
  mermaidCode += `  ${taskParent} --> Task2\n`;
  if (tShirtSize === 'LARGE' && copilotArchitecture.processAgents !== "0") mermaidCode += '  Proc2 --> Task3\n';

  // Control Layer
  if (copilotArchitecture.controlAgents.includes("Required") || copilotArchitecture.controlAgents.includes("Recommended")) {
    mermaidCode += '  Control[Control Agent]:::control\n';
    // Control monitors Experience and Value Stream
    mermaidCode += '  Control -.-> Exp1\n';
    if (copilotArchitecture.valueStreamAgents.includes("Required") || tShirtSize === 'LARGE') {
      mermaidCode += '  Control -.-> VS\n';
    }
  }

  return {
    type: DiagramType.AGENT_ARCHITECTURE,
    title: "Agent Architecture Diagram",
    description: `Visual representation of the ${tShirtSize.toLowerCase()} sizing architecture.`,
    code: mermaidCode
  };
}

export function buildGovernanceMermaid(result: SizingResult, scores: ScoresRecord): DiagramDefinition {
  const { copilotArchitecture } = result;
  const dataSensitivity = scores[DimensionId.DataSensitivity] || 0;
  const userReach = scores[DimensionId.UserReach] || 0;
  const isHighRisk = dataSensitivity >= 3 || userReach >= 3;

  let mermaidCode = 'graph TD\n';
  mermaidCode += '  classDef user fill:#f3f4f6,stroke:#6b7280,stroke-width:1px,color:#374151,shape:circle;\n';
  mermaidCode += '  classDef agent fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0c4a6e;\n';
  mermaidCode += '  classDef control fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f;\n';
  mermaidCode += '  classDef log fill:#f0fdf4,stroke:#16a34a,stroke-width:1px,color:#14532d,shape:database;\n';

  mermaidCode += '  User((User)):::user\n';
  mermaidCode += '  Agent[Copilot Agent]:::agent\n';
  
  // Control Layer
  if (copilotArchitecture.controlAgents.includes("Required") || isHighRisk) {
    mermaidCode += '  Control[Control Agent / Guardrails]:::control\n';
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
  const isComplex = result.tShirtSize === 'LARGE';
  let code = 'sequenceDiagram\n';
  code += '  actor User\n';
  code += '  participant Exp as Experience Agent\n';
  
  if (isComplex) {
    code += '  participant Router as Topic Router\n';
    code += '  participant Auth as Auth Service\n';
  }
  
  code += '  participant VS as Value Stream Agent\n';
  
  code += '  User->>Exp: Sends Query\n';
  if (isComplex) {
    code += '  Exp->>Auth: Validate Session\n';
    code += '  Auth-->>Exp: Session Valid\n';
    code += '  Exp->>Router: Analyze Intent\n';
    code += '  Router-->>Exp: Intent: "Order Status"\n';
  }
  code += '  Exp->>VS: Delegate "Order Status"\n';
  code += '  VS-->>Exp: Return Status Details\n';
  code += '  Exp->>User: Format & Send Response\n';
  
  return code;
}

export function getValueStreamAgentDiagram(result: SizingResult): string {
  const isComplex = result.tShirtSize === 'LARGE';
  let code = 'graph TD\n';
  code += '  Start((Start)) --> Init[Initialize Context]\n';
  code += '  Init --> Plan{Planning}\n';
  
  if (isComplex) {
    code += '  Plan -->|Complex| Decomp[Decompose Request]\n';
    code += '  Decomp --> Coord[Coordinate Sub-Agents]\n';
    code += '  Coord --> Agg[Aggregate Results]\n';
  } else {
    code += '  Plan -->|Simple| Exec[Execute Logic]\n';
  }
  
  code += '  Agg --> Review[Review Output]\n';
  code += '  Exec --> Review\n';
  code += '  Review --> End((End))\n';
  
  return code;
}

export function getFunctionAgentDiagram(result: SizingResult): string {
  const isComplex = result.tShirtSize === 'LARGE';
  let code = 'graph LR\n';
  code += '  Input[Structured Input] --> Validate{Validate}\n';
  code += '  Validate -- Invalid --> Error[Return Error]\n';
  code += '  Validate -- Valid --> Calc[Perform Calculation]\n';
  
  if (isComplex) {
    code += '  Calc --> Enrich[Enrich Data]\n';
    code += '  Enrich --> Output[Return Result]\n';
  } else {
    code += '  Calc --> Output[Return Result]\n';
  }
  return code;
}

export function getProcessAgentDiagram(result: SizingResult): string {
  const isComplex = result.tShirtSize === 'LARGE';
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
  const needsAuth = result.tShirtSize !== 'SMALL';
  let code = 'graph TD\n';
  code += '  Req[Request] --> ';
  
  if (needsAuth) {
    code += 'Auth{Authorized?}\n';
    code += '  Auth -- No --> Deny[Deny Access]\n';
    code += '  Auth -- Yes --> API[Call External API]\n';
  } else {
    code += 'API[Call External API]\n';
  }
  
  code += '  API --> Parse[Parse Response]\n';
  code += '  Parse --> Resp[Return Data]\n';
  return code;
}

export function getControlAgentDiagram(result: SizingResult): string {
  const strict = result.tShirtSize === 'LARGE';
  let code = 'sequenceDiagram\n';
  code += '  participant Agent as Source Agent\n';
  code += '  participant Control as Control Agent\n';
  code += '  participant Policy as Policy Engine\n';
  code += '  participant Audit as Audit Log\n';
  
  code += '  Agent->>Control: Submit Content for Review\n';
  code += '  Control->>Policy: Check Compliance Rules\n';
  code += '  Policy-->>Control: Rule Result (Pass/Fail)\n';
  
  if (strict) {
    code += '  Control->>Audit: Log Event (Detailed)\n';
  } else {
    code += '  Control->>Audit: Log Event\n';
  }
  
  code += '  alt Passed\n';
  code += '    Control-->>Agent: Approved\n';
  code += '  else Failed\n';
  code += '    Control-->>Agent: Rejected (Reason)\n';
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
