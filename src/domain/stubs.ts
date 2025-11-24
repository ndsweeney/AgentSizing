export function generateDataverseSchema(tableName: string) {
  return JSON.stringify({
    SchemaName: tableName,
    DisplayName: tableName,
    Attributes: [
      { LogicalName: `${tableName}id`, DisplayName: "Primary Key", Type: "Uniqueidentifier" },
      { LogicalName: "cr56_name", DisplayName: "Name", Type: "String" },
      { LogicalName: "cr56_status", DisplayName: "Status", Type: "Picklist" },
      { LogicalName: "cr56_description", DisplayName: "Description", Type: "Memo" }
    ]
  }, null, 2);
}

export function generatePowerAutomateStub(flowName: string) {
  return JSON.stringify({
    "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
      "flowName": {
        "defaultValue": flowName,
        "type": "String"
      }
    },
    "triggers": {
      "manual": {
        "type": "Request",
        "kind": "Http",
        "inputs": {
          "schema": {
            "type": "object",
            "properties": {
              "text": { "type": "string" }
            }
          }
        }
      }
    },
    "actions": {
      "Initialize_Variable": {
        "type": "InitializeVariable",
        "inputs": {
          "variables": [{ "name": "Output", "type": "String", "value": "Hello World" }]
        }
      }
    }
  }, null, 2);
}

export function generatePromptFlowStub(promptName: string) {
  return `
# Prompt Flow Stub: ${promptName}
# Inputs:
#   question: string
#   context: string

system:
You are a helpful assistant designed to answer questions based on the provided context.

user:
Context: {{context}}
Question: {{question}}

assistant:
`;
}

export function generateOpenApiStub(apiName: string) {
  return JSON.stringify({
    "openapi": "3.0.1",
    "info": {
      "title": apiName,
      "version": "1.0.0"
    },
    "paths": {
      "/api/resource": {
        "get": {
          "operationId": "GetResource",
          "responses": {
            "200": {
              "description": "Success",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, null, 2);
}

export function generateReactShell(appName: string) {
  return `
import React, { useState } from 'react';

export default function ${appName.replace(/\s+/g, '')}App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
    // Call your agent API here
    setResponse('Simulated agent response...');
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">${appName}</h1>
      <div className="space-y-4">
        <textarea
          className="w-full p-2 border rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your agent..."
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleSubmit}
        >
          Send
        </button>
        {response && (
          <div className="p-4 bg-gray-100 rounded">
            <strong>Agent:</strong> {response}
          </div>
        )}
      </div>
    </div>
  );
}
`;
}
