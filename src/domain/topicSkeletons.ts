import type { SizingResult, TopicSkeleton } from './types';

export function generateTopicSkeletons(result: SizingResult): TopicSkeleton[] {
  const skeletons: TopicSkeleton[] = [];
  const agents = result.agentArchitecture.filter(a => a.necessity !== 'Optional');

  // 1. Process Agents (Primary Focus)
  if (agents.some(a => a.type === 'Process Agents')) {
    skeletons.push(createProcessAgentSkeleton(result));
  }

  // 2. Experience Agents (Example)
  if (agents.some(a => a.type === 'Experience Agents')) {
    skeletons.push(createExperienceAgentSkeleton());
  }

  // 3. Function Agents (Example)
  if (agents.some(a => a.type === 'Function Agents')) {
    skeletons.push(createFunctionAgentSkeleton());
  }

  return skeletons;
}

function createProcessAgentSkeleton(result: SizingResult): TopicSkeleton {
  const isHighComplexity = (result.totalScore || 0) > 20;

  return {
    name: "Standard Business Process Flow",
    agentType: "Process Agents",
    triggerPhrases: [
      "I need to submit a request",
      "Start the approval process",
      "Check status of my application",
      "Initiate a new workflow"
    ],
    variables: [
      "User.Id",
      "Request.Type",
      "Request.Details",
      "Request.Urgency"
    ],
    steps: [
      "1. Authenticate user via Entra ID",
      "2. Ask for Request Type (Adaptive Card)",
      "3. Collect Details based on Type",
      "4. Validate inputs against business rules",
      "5. Call Power Automate flow 'SubmitRequest'",
      "6. Return Reference ID to user"
    ],
    actions: [
      "GetUserDetails",
      "ValidateEligibility",
      "SubmitToERP",
      "SendEmailNotification"
    ],
    responseTemplates: [
      "Hi {User.DisplayName}, I can help you with that request.",
      "I've submitted your request. Your reference number is {Request.RefId}.",
      "I need a bit more information before proceeding."
    ],
    guardrailNotes: isHighComplexity ? [
      "Ensure strict input validation for free-text fields.",
      "Log all validation failures to App Insights.",
      "Require human handover if validation fails 3 times."
    ] : [
      "Log successful submissions."
    ]
  };
}

function createExperienceAgentSkeleton(): TopicSkeleton {
  return {
    name: "Triage & Routing Logic",
    agentType: "Experience Agents",
    triggerPhrases: [
      "I have a problem",
      "Connect me to support",
      "Who can help with X?"
    ],
    variables: [
      "User.Intent",
      "User.Sentiment",
      "Target.Agent"
    ],
    steps: [
      "1. Analyze user input for intent and sentiment",
      "2. Check user profile for VIP status",
      "3. Determine best sub-agent (Process, Function, or Support)",
      "4. Hand off conversation context to sub-agent"
    ],
    actions: [
      "AnalyzeSentiment",
      "LookupUserProfile",
      "RouteConversation"
    ],
    responseTemplates: [
      "I understand you're asking about {User.Intent}. Let me connect you to the right specialist.",
      "I'm transferring you to the HR Agent now."
    ]
  };
}

function createFunctionAgentSkeleton(): TopicSkeleton {
  return {
    name: "Data Lookup & Calculation",
    agentType: "Function Agents",
    triggerPhrases: [
      "Calculate my remaining leave",
      "What is the price of X?",
      "Convert this currency"
    ],
    variables: [
      "Input.Value",
      "Input.Unit",
      "Output.Result"
    ],
    steps: [
      "1. Extract entities (Number, Unit, Item)",
      "2. Call external API or Database",
      "3. Perform calculation",
      "4. Format result for display"
    ],
    actions: [
      "QueryDatabase",
      "ExecuteCalculation"
    ],
    responseTemplates: [
      "The result is {Output.Result}.",
      "Based on current rates, that is {Output.Result}."
    ]
  };
}
