import { useState } from 'react';
import { Download, Package, FileCode, FileJson, Code, Archive } from 'lucide-react';
import JSZip from 'jszip';
import { useActiveScenario } from '../state/sizingStore';
import { AGENT_SCHEMAS } from '../templates/agentSchemas';
import { buildReportModel } from '../report/reportBuilder';
import { exportReportZip } from '../report/exportZip';
import { 
  generateDataverseSchema, 
  generatePowerAutomateStub, 
  generatePromptFlowStub, 
  generateOpenApiStub, 
  generateReactShell 
} from '../domain/stubs';

export function StarterPackView() {
  const { scenario } = useActiveScenario();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<'starter' | 'solution' | null>(null);

  const handleDownload = async () => {
    setIsGenerating(true);
    setGeneratingType('starter');
    try {
      const zip = new JSZip();
      const folderName = `StarterPack-${scenario.name.replace(/\s+/g, '-')}`;
      const root = zip.folder(folderName);

      if (!root) return;

      // 1. Agent Templates (JSON Schemas)
      const templatesFolder = root.folder("templates");
      if (templatesFolder) {
        templatesFolder.file("experience-agent.schema.json", JSON.stringify(AGENT_SCHEMAS.experienceAgent, null, 2));
        templatesFolder.file("process-agent.schema.json", JSON.stringify(AGENT_SCHEMAS.processAgent, null, 2));
        templatesFolder.file("function-agent.schema.json", JSON.stringify(AGENT_SCHEMAS.functionAgent, null, 2));
      }

      // 2. Code Stubs
      const stubsFolder = root.folder("code-stubs");
      if (stubsFolder) {
        // Dataverse
        stubsFolder.file("dataverse-table.json", generateDataverseSchema("AgentMemory"));
        
        // Power Automate
        stubsFolder.file("power-automate-flow.json", generatePowerAutomateStub("AgentHandlerFlow"));
        
        // Prompt Flow
        stubsFolder.file("prompt-flow.yaml", generatePromptFlowStub("StandardRAG"));
        
        // OpenAPI
        stubsFolder.file("connector-api.json", generateOpenApiStub("LegacySystemAPI"));
        
        // React Shell
        stubsFolder.file("AgentChatInterface.tsx", generateReactShell("AgentChat"));
      }

      // 3. Readme
      root.file("README.md", `# Agent Starter Pack for ${scenario.name}
      
This starter pack contains templates and code stubs to accelerate your development.

## Contents

### Templates
JSON Schemas for defining your agents:
- Experience Agent
- Process Agent
- Function Agent

### Code Stubs
- **Dataverse Table**: Schema for a standard memory table.
- **Power Automate**: Skeleton flow for agent actions.
- **Prompt Flow**: YAML definition for a RAG pattern.
- **OpenAPI**: Swagger definition for a custom connector.
- **React Shell**: A simple chat interface component.

Generated on ${new Date().toLocaleDateString()}
`);

      const content = await zip.generateAsync({ type: "blob" });
      
      // Trigger download
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${folderName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Failed to generate zip", error);
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  const handleDownloadSolutionPack = async () => {
    setIsGenerating(true);
    setGeneratingType('solution');
    try {
      const report = buildReportModel(scenario.id);
      if (!report) throw new Error("Report model could not be built");
      
      const blob = await exportReportZip(report);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `agent-solution-pack-${scenario.name.replace(/\s+/g, '-').toLowerCase()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate ZIP', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Accelerator Starter Pack
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              Download a ZIP file containing JSON templates, code stubs, and schemas to jumpstart your project.
            </p>
          </div>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isGenerating && generatingType === 'starter' ? (
              <>Generating...</>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download ZIP
              </>
            )}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-2">
              <FileJson className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              Agent Templates
            </div>
            <ul className="text-sm text-gray-600 dark:text-slate-300 space-y-1 list-disc list-inside">
              <li>Experience Agent Schema</li>
              <li>Process Agent Schema</li>
              <li>Function Agent Schema</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-2">
              <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Backend Stubs
            </div>
            <ul className="text-sm text-gray-600 dark:text-slate-300 space-y-1 list-disc list-inside">
              <li>Dataverse Table JSON</li>
              <li>Power Automate Flow</li>
              <li>OpenAPI Connector</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-2">
              <FileCode className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Frontend & AI
            </div>
            <ul className="text-sm text-gray-600 dark:text-slate-300 space-y-1 list-disc list-inside">
              <li>React Chat Component</li>
              <li>Prompt Flow YAML</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Archive className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Solution Pack
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              Full artifact bundle containing the report, diagrams, datasets, and blueprints. Best for handing off to delivery teams.
            </p>
          </div>
          <button
            onClick={handleDownloadSolutionPack}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 dark:bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isGenerating && generatingType === 'solution' ? (
              <>Generating...</>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Solution Pack
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
