import { useState } from 'react';
import { Copy, Check, Layers, CheckCircle2, Bot, Box } from 'lucide-react';
import { MermaidDiagram } from './MermaidDiagram';
import { getAllArchitectureDiagrams, type ArchitectureContext } from '../domain/architectureDiagrams';
import { copyToClipboard } from '../utils/export';
import { cn } from '../utils/cn';
import type { SizingResult } from '../domain/types';
import { getArchetypeById } from '../data/agentArchetypes';
import { useRulesStore } from '../state/rulesStore';

interface ArchitectureViewProps {
  result: SizingResult;
  scenarioName: string;
  industry: string;
  systems: string[];
  recommendations: string[];
}

const getNecessityColor = (necessity: string) => {
  switch (necessity) {
    case 'Definitely needed': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    case 'Recommended': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    case 'Optional': return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    default: return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
  }
};

function ArchitectureCard({ title, value, className }: { title: string, value: string, className?: string }) {
  return (
    <div className={cn("p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30", className)}>
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{title}</h4>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

export function ArchitectureView({ result, scenarioName, industry, systems, recommendations }: ArchitectureViewProps) {
  const { sizingThresholds, riskThresholds } = useRulesStore();
  const rulesConfig = { sizingThresholds, riskThresholds };
  const context: ArchitectureContext = { scenarioName, industry, systems };
  const diagrams = getAllArchitectureDiagrams(context, result);
  const [activeTab, setActiveTab] = useState<'recommendations' | number>('recommendations');
  const [copied, setCopied] = useState(false);

  const activeDiagram = typeof activeTab === 'number' ? diagrams[activeTab] : null;

  const handleCopy = async () => {
    if (activeDiagram) {
      await copyToClipboard(activeDiagram.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-[700px] border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
      {/* Header / Tabs */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === 'recommendations'
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-slate-600"
                : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-200"
            )}
          >
            Recommendations
          </button>
          {diagrams.map((d, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === idx
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-slate-600"
                  : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-200"
              )}
            >
              {d.title.split(':')[0]}
            </button>
          ))}
        </div>
        
        {activeDiagram && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Mermaid' : 'Copy Mermaid'}
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col">
        {activeTab === 'recommendations' ? (
          <div className="p-6 space-y-8">
            {/* Technical Architecture Recommendations */}
            <div>
              <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Box className="w-4 h-4" />
                Technical Architecture
              </h4>
              <ul className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 mt-1.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Architecture Recommendations Section */}
            <div>
              <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Pattern Recommendations
              </h4>
              <ul className="grid gap-3 md:grid-cols-2">
                {result.recommendedAgentPattern.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-900/30 p-3 rounded-lg border border-gray-100 dark:border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Agent Architecture Section */}
            <div>
              <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Agent Roles & Necessity</h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {result.agentArchitecture.map((agent) => {
                  const archetype = getArchetypeById(agent.archetypeId, rulesConfig);
                  return (
                    <div key={agent.type} className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{agent.type}</h4>
                          {archetype && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              <span className="capitalize">{archetype.tier}</span> – {archetype.name}
                            </p>
                          )}
                        </div>
                        <span className={cn(
                          "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ml-2 flex-shrink-0",
                          getNecessityColor(agent.necessity)
                        )}>
                          {agent.necessity === 'Definitely needed' ? 'Required' : agent.necessity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-auto leading-relaxed">
                        {agent.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Copilot Studio Architecture Section */}
            <div>
              <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Copilot Studio Components
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ArchitectureCard title="Experience Agents" value={result.copilotArchitecture.experienceAgents} />
                <ArchitectureCard title="Value Stream Agents" value={result.copilotArchitecture.valueStreamAgents} />
                <ArchitectureCard title="Function Agents" value={result.copilotArchitecture.functionAgents} />
                <ArchitectureCard title="Process Agents" value={result.copilotArchitecture.processAgents} />
                <ArchitectureCard title="Task Agents" value={result.copilotArchitecture.taskAgents} />
                <ArchitectureCard title="Control Agents" value={result.copilotArchitecture.controlAgents} />
                <ArchitectureCard title="Foundry Requirement" value={result.copilotArchitecture.foundryRequirement} className="md:col-span-2 lg:col-span-3" />
              </div>
            </div>
          </div>
        ) : activeDiagram ? (
          <>
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{activeDiagram.title}</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">{activeDiagram.description}</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4">
              <MermaidDiagram 
                title="" 
                description="" 
                code={activeDiagram.code} 
                className="border-0 shadow-none"
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
