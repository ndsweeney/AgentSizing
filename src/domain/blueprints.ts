import type { AgentSpec, SizingResult, AgentType } from './types';
import { generateAgentSpecs } from './generators';

export function generateAgentBlueprint(spec: AgentSpec, result: SizingResult): string {
  const dependencies = getDependencies(spec, result);
  
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

function getDependencies(spec: AgentSpec, result: SizingResult): string[] {
  const deps: string[] = [];
  
  // 1. Archetype-based dependencies
  if (spec.archetypeId) {
    switch (spec.archetypeId) {
      case "orchestrator":
        deps.push("Sub-Agents (for delegation)");
        deps.push("State Store (for context)");
        break;
      case "user-facing-copilot":
        deps.push("Authentication Service");
        deps.push("Orchestrator (if present)");
        break;
      case "connector-integration":
        deps.push("External API Credentials");
        deps.push("Network Access / Firewall Rules");
        break;
      case "specialist-domain":
        deps.push("Knowledge Base / Vector Store");
        break;
      case "toolsmith-action":
        deps.push("Plugin Registry");
        deps.push("Target System APIs");
        break;
      case "governance-guardrail":
        deps.push("Corporate Policy Documents");
        deps.push("Logging Infrastructure");
        break;
      case "logical-reasoning":
        deps.push("Context Data");
        break;
      case "memory-context":
        deps.push("Database (Cosmos DB / Redis)");
        break;
      case "simulation-planning":
        deps.push("Simulation Model / Digital Twin");
        break;
      case "meta-self-improving":
        deps.push("Feedback Loop / Telemetry");
        break;
    }
  }

  // 2. Fallback to legacy type-based logic if no specific archetype deps found
  if (deps.length === 0) {
    switch (spec.type) {
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
  }

  return deps;
}

export function generateAllBlueprints(result: SizingResult): { type: AgentType, title: string, markdown: string, archetypeId: string }[] {
  const specs = generateAgentSpecs(result);
  return specs.map(spec => ({
    type: spec.type,
    title: spec.title,
    markdown: generateAgentBlueprint(spec, result),
    archetypeId: spec.archetypeId
  }));
}
