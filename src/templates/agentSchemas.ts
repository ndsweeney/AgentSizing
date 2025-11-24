export const AGENT_SCHEMAS = {
  experienceAgent: {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Experience Agent",
    type: "object",
    properties: {
      name: { type: "string" },
      channel: { type: "string", enum: ["Teams", "Web", "WhatsApp", "Email"] },
      tone: { type: "string" },
      capabilities: {
        type: "array",
        items: { type: "string" }
      },
      handoffProtocols: {
        type: "object",
        properties: {
          escalationTarget: { type: "string" },
          conditions: { type: "array", items: { type: "string" } }
        }
      }
    }
  },
  processAgent: {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Process Agent",
    type: "object",
    properties: {
      processName: { type: "string" },
      trigger: { type: "string" },
      steps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            action: { type: "string" },
            system: { type: "string" }
          }
        }
      },
      errorHandling: { type: "string" }
    }
  },
  functionAgent: {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Function Agent",
    type: "object",
    properties: {
      functionName: { type: "string" },
      inputs: { type: "object" },
      outputs: { type: "object" },
      apiEndpoint: { type: "string" },
      authentication: { type: "string", enum: ["OAuth2", "API Key", "None"] }
    }
  }
};
