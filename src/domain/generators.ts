import { 
  type SizingResult, 
  type AgentSpec, 
  type BuildPlan, 
  type Epic, 
  type UserStory,
  type AgentRecommendation
} from './types';

export function generateAgentSpecs(result: SizingResult): AgentSpec[] {
  return result.agentArchitecture
    .filter(a => a.necessity !== 'Optional')
    .map(agent => createSpecForAgent(agent, result));
}

function createSpecForAgent(agent: AgentRecommendation, result: SizingResult): AgentSpec {
  const isHighRisk = result.totalScore > 20; // Simplified risk check
  
  const baseSpec: AgentSpec = {
    type: agent.type,
    title: `${agent.type} Specification`,
    purpose: agent.reason,
    inputs: ["User Query", "Context Variables"],
    outputs: ["Response", "Action Result"],
    steps: ["Receive Input", "Validate Intent", "Execute Logic", "Format Output"],
    connectors: [],
    governance: ["Log all interactions"]
  };

  switch (agent.type) {
    case "Experience Agents":
      baseSpec.inputs.push("User Profile", "Channel Context");
      baseSpec.steps = ["Identify User", "Determine Intent", "Route to Sub-Agent", "Synthesize Response"];
      baseSpec.connectors.push("CRM", "Knowledge Base");
      break;
    case "Value Stream Agents":
      baseSpec.purpose = "Orchestrate end-to-end business value delivery.";
      baseSpec.steps = ["Initialize Workflow", "Coordinate Task Agents", "Monitor Progress", "Handle Exceptions"];
      baseSpec.connectors.push("Core Business System", "Workflow Engine");
      break;
    case "Function Agents":
      baseSpec.purpose = "Provide specific capabilities or calculations.";
      baseSpec.inputs.push("Structured Data");
      baseSpec.steps = ["Validate Input Data", "Perform Calculation/Lookup", "Return Result"];
      baseSpec.connectors.push("Calculation Engine", "External API");
      break;
    case "Process Agents":
      baseSpec.purpose = "Execute defined business processes.";
      baseSpec.steps = ["Check Pre-conditions", "Execute Step 1", "Execute Step 2", "Update State"];
      baseSpec.connectors.push("ERP", "Database");
      break;
    case "Task Agents":
      baseSpec.purpose = "Perform atomic tasks.";
      baseSpec.steps = ["Receive Command", "Execute Action", "Confirm Completion"];
      baseSpec.connectors.push("Task API");
      break;
    case "Control Agents":
      baseSpec.purpose = "Ensure compliance and safety.";
      baseSpec.inputs.push("Draft Response", "User Prompt");
      baseSpec.outputs.push("Approval/Rejection", "Modified Response");
      baseSpec.steps = ["Analyze Content", "Check against Policy", "Approve or Reject"];
      baseSpec.governance.push("Strict Audit Logging", "Human Oversight Escalation");
      break;
  }

  if (isHighRisk) {
    baseSpec.governance.push("Requires Human-in-the-loop for high-stakes actions");
  }

  return baseSpec;
}

export function generateBuildPlan(result: SizingResult): BuildPlan {
  const size = result.tShirtSize;
  const epics: Epic[] = [];

  // Foundation Epic
  epics.push({
    id: "EPIC-1",
    title: "Foundation & Setup",
    description: "Setup Copilot Studio environment and core governance.",
    stories: [
      {
        id: "STORY-1.1",
        title: "Environment Provisioning",
        description: "Create environments in Power Platform.",
        acceptanceCriteria: ["Dev/Test/Prod environments created", "DLP policies applied"]
      },
      {
        id: "STORY-1.2",
        title: "Security Configuration",
        description: "Configure authentication and access control.",
        acceptanceCriteria: ["Entra ID configured", "Security Groups defined"]
      }
    ]
  });

  // Core Agents Epic
  const agentStories: UserStory[] = result.agentArchitecture
    .filter(a => a.necessity === 'Definitely needed')
    .map((a, idx) => ({
      id: `STORY-2.${idx + 1}`,
      title: `Build ${a.type}`,
      description: `Implement the ${a.type} based on the architecture spec.`,
      acceptanceCriteria: ["Agent created", "Topics defined", "Connectors configured"]
    }));

  epics.push({
    id: "EPIC-2",
    title: "Core Agent Development",
    description: "Development of the primary agents identified in the architecture.",
    stories: agentStories
  });

  // Integration Epic (if Large)
  if (size === 'LARGE' || size === 'MEDIUM') {
    epics.push({
      id: "EPIC-3",
      title: "System Integration",
      description: "Connect agents to backend systems.",
      stories: [
        {
          id: "STORY-3.1",
          title: "API Gateway Setup",
          description: "Configure API Management or Custom Connectors.",
          acceptanceCriteria: ["Connectors built", "Authentication handles"]
        }
      ]
    });
  }

  // Governance Epic
  epics.push({
    id: "EPIC-4",
    title: "Governance & Compliance",
    description: "Implement logging, monitoring, and safety controls.",
    stories: [
      {
        id: "STORY-4.1",
        title: "Audit Logging",
        description: "Enable conversation transcripts and custom telemetry.",
        acceptanceCriteria: ["Logs flowing to App Insights"]
      }
    ]
  });

  return { epics };
}
