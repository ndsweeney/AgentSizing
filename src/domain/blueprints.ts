import type { AgentSpec, SizingResult, AgentType } from './types';
import { generateAgentSpecs } from './generators';

export function generateAgentBlueprint(spec: AgentSpec, result: SizingResult): string {
  const dependencies = getDependencies(spec.type, result);
  
  return `# Agent Blueprint: ${spec.title}

## Purpose
${spec.purpose}

## Triggers / Inputs
${spec.inputs.map(i => `- ${i}`).join('\n')}

## Outputs
${spec.outputs.map(o => `- ${o}`).join('\n')}

## Key Steps
${spec.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

## Systems / Connectors
${spec.connectors.length > 0 ? spec.connectors.map(c => `- ${c}`).join('\n') : '- None specified'}

## Governance / Controls
${spec.governance.map(g => `- ${g}`).join('\n')}

## Dependencies
${dependencies.length > 0 ? dependencies.map(d => `- ${d}`).join('\n') : '- None identified'}
`;
}

function getDependencies(type: AgentType, result: SizingResult): string[] {
  const deps: string[] = [];
  
  // Basic dependency logic based on architecture hierarchy
  switch (type) {
    case "Experience Agents":
      deps.push("Authentication Service");
      if (result.agentArchitecture.some(a => a.type === "Value Stream Agents")) {
        deps.push("Value Stream Agents (for orchestration)");
      }
      break;
    case "Value Stream Agents":
      if (result.agentArchitecture.some(a => a.type === "Process Agents")) {
        deps.push("Process Agents (for execution)");
      }
      break;
    case "Process Agents":
      if (result.agentArchitecture.some(a => a.type === "Task Agents")) {
        deps.push("Task Agents (for atomic actions)");
      }
      deps.push("System Connectors");
      break;
    case "Function Agents":
      deps.push("Data Sources");
      break;
    case "Task Agents":
      deps.push("API Access / Permissions");
      break;
    case "Control Agents":
      deps.push("Logging Infrastructure");
      deps.push("Policy Definitions");
      break;
  }

  return deps;
}

export function generateAllBlueprints(result: SizingResult): { type: AgentType, title: string, markdown: string }[] {
  const specs = generateAgentSpecs(result);
  return specs.map(spec => ({
    type: spec.type,
    title: spec.title,
    markdown: generateAgentBlueprint(spec, result)
  }));
}
