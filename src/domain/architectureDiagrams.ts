import type { SizingResult } from './types';

export interface ArchitectureContext {
  scenarioName: string;
  industry: string;
  systems: string[];
}

export interface DiagramDefinition {
  title: string;
  description: string;
  code: string;
}

export function getL1OverviewDiagram(context: ArchitectureContext, result: SizingResult): DiagramDefinition {
  const hasExperience = result.agentArchitecture.some(a => a.type === 'Experience Agents');
  const hasValueStream = result.agentArchitecture.some(a => a.type === 'Value Stream Agents');
  
  const code = `graph TD
    %% Styles
    classDef user fill:#e0e7ff,stroke:#4338ca,stroke-width:2px,color:#1e1b4b
    classDef copilot fill:#f0fdf4,stroke:#15803d,stroke-width:2px,color:#14532d
    classDef system fill:#f3f4f6,stroke:#4b5563,stroke-width:2px,color:#1f2937
    classDef boundary fill:none,stroke:#94a3b8,stroke-width:2px,stroke-dasharray: 5 5

    %% Nodes
    User((User / Channel)):::user
    
    subgraph "Copilot Studio Platform"
        direction TB
        Orchestrator[Orchestrator / Router]:::copilot
        ${hasExperience ? 'ExpAgent[Experience Agents]:::copilot' : ''}
        ${hasValueStream ? 'ValueAgent[Value Stream Agents]:::copilot' : ''}
        TaskAgent[Task & Process Agents]:::copilot
    end

    subgraph "Enterprise Systems"
        Systems[(${context.systems.length > 0 ? context.systems.join('\\n') : 'Backend Systems'})]:::system
    end

    %% Connections
    User <--> Orchestrator
    ${hasExperience ? 'Orchestrator <--> ExpAgent' : ''}
    ${hasExperience ? 'ExpAgent <--> ValueAgent' : 'Orchestrator <--> ValueAgent'}
    ${hasValueStream ? 'ValueAgent <--> TaskAgent' : 'Orchestrator <--> TaskAgent'}
    TaskAgent <--> Systems
`;

  return {
    title: "L1: High-Level Overview",
    description: "Conceptual view of the solution showing the flow from user to backend systems.",
    code
  };
}

export function getL2AgentMeshDiagram(_context: ArchitectureContext, result: SizingResult): DiagramDefinition {
  const agents = result.agentArchitecture.filter(a => a.necessity !== 'Optional');
  
  // Helper to check presence
  const has = (type: string) => agents.some(a => a.type === type);

  let code = `graph TD
    classDef exp fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef val fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef func fill:#f3e8ff,stroke:#9333ea,color:#581c87
    classDef proc fill:#ffedd5,stroke:#ea580c,color:#7c2d12
    classDef task fill:#f1f5f9,stroke:#475569,color:#0f172a
    classDef ctrl fill:#fee2e2,stroke:#dc2626,color:#7f1d1d

    User((User))
`;

  if (has('Experience Agents')) {
    code += `    Exp[Experience Agents]:::exp\n    User --> Exp\n`;
  } else {
    code += `    Router[Orchestrator]:::exp\n    User --> Router\n`;
  }

  if (has('Value Stream Agents')) {
    code += `    Val[Value Stream Agents]:::val\n`;
    code += has('Experience Agents') ? `    Exp --> Val\n` : `    Router --> Val\n`;
  }

  // Middle Layer
  code += `    subgraph "Execution Layer"\n`;
  if (has('Process Agents')) code += `        Proc[Process Agents]:::proc\n`;
  if (has('Function Agents')) code += `        Func[Function Agents]:::func\n`;
  code += `    end\n`;

  // Connections to Middle
  const source = has('Value Stream Agents') ? 'Val' : (has('Experience Agents') ? 'Exp' : 'Router');
  if (has('Process Agents')) code += `    ${source} --> Proc\n`;
  if (has('Function Agents')) code += `    ${source} --> Func\n`;

  // Task Layer
  if (has('Task Agents')) {
    code += `    Task[Task Agents]:::task\n`;
    if (has('Process Agents')) code += `    Proc --> Task\n`;
    if (has('Function Agents')) code += `    Func --> Task\n`;
    // Fallback if no middle layer
    if (!has('Process Agents') && !has('Function Agents')) code += `    ${source} --> Task\n`;
  }

  // Control Layer (Sidecar)
  if (has('Control Agents')) {
    code += `    Ctrl[Control Agents]:::ctrl\n`;
    code += `    Ctrl -.-> ${source}\n`;
  }

  return {
    title: "L2: Agent Mesh Architecture",
    description: "Logical composition of agents showing delegation and orchestration paths.",
    code
  };
}

export function getL3SystemFlowDiagram(context: ArchitectureContext, _result: SizingResult): DiagramDefinition {
  const systems = context.systems.length > 0 ? context.systems : ['Core System', 'Database'];
  
  let code = `sequenceDiagram
    participant U as User
    participant O as Orchestrator
    participant A as Agent Mesh
`;

  systems.forEach((sys, i) => {
    code += `    participant S${i} as ${sys}\n`;
  });

  code += `
    U->>O: Ask question / Request
    O->>A: Delegate intent
    A->>A: Resolve logic / Plan
`;

  systems.forEach((sys, i) => {
    code += `    A->>S${i}: Query/Action (${sys})\n`;
    code += `    S${i}-->>A: Data/Confirmation\n`;
  });

  code += `    A-->>O: Synthesized Response
    O-->>U: Final Answer
`;

  return {
    title: "L3: System & Data Flow",
    description: "Sequence of interactions between the user, agents, and specific backend systems.",
    code
  };
}

export function getAllArchitectureDiagrams(context: ArchitectureContext, result: SizingResult): DiagramDefinition[] {
  return [
    getL1OverviewDiagram(context, result),
    getL2AgentMeshDiagram(context, result),
    getL3SystemFlowDiagram(context, result)
  ];
}
