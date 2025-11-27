import { useState } from 'react';
import { Copy, Check, Bot, Activity, Calculator, Settings, Shield, Terminal } from 'lucide-react';
import { MermaidDiagram } from './MermaidDiagram';
import { cn } from '../utils/cn';
import { copyToClipboard } from '../utils/export';
import type { SizingResult } from '../domain/scoring';
import {
  getExperienceAgentDiagram,
  getValueStreamAgentDiagram,
  getFunctionAgentDiagram,
  getProcessAgentDiagram,
  getTaskAgentDiagram,
  getControlAgentDiagram
} from '../domain/diagrams';

interface AgentDiagramsViewProps {
  result: SizingResult;
}

type AgentTab = 'experience' | 'valuestream' | 'function' | 'process' | 'task' | 'control';

export function AgentDiagramsView({ result }: AgentDiagramsViewProps) {
  const [activeTab, setActiveTab] = useState<AgentTab>('experience');
  const [copied, setCopied] = useState(false);

  const tabs: { id: AgentTab; label: string; icon: any }[] = [
    { id: 'experience', label: 'Experience', icon: Bot },
    { id: 'valuestream', label: 'Value Stream', icon: Activity },
    { id: 'function', label: 'Function', icon: Calculator },
    { id: 'process', label: 'Process', icon: Settings },
    { id: 'task', label: 'Task', icon: Terminal },
    { id: 'control', label: 'Control', icon: Shield },
  ];

  const getDiagramCode = (tab: AgentTab) => {
    switch (tab) {
      case 'experience': return getExperienceAgentDiagram(result);
      case 'valuestream': return getValueStreamAgentDiagram(result);
      case 'function': return getFunctionAgentDiagram(result);
      case 'process': return getProcessAgentDiagram(result);
      case 'task': return getTaskAgentDiagram(result);
      case 'control': return getControlAgentDiagram(result);
    }
  };

  const currentCode = getDiagramCode(activeTab);

  const handleCopy = async () => {
    const success = await copyToClipboard(currentCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800"
                  : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {tabs.find(t => t.id === activeTab)?.label} Agent Flow
          </h3>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Mermaid'}
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-x-auto bg-white dark:bg-slate-800">
            <MermaidDiagram 
              code={currentCode} 
              className="border-0 shadow-none rounded-none min-h-[300px]"
            />
          </div>
          
          <div className="bg-gray-900 dark:bg-slate-950 rounded-lg p-4 overflow-auto max-h-[400px]">
            <pre className="text-xs font-mono text-gray-300 dark:text-slate-400 whitespace-pre">
              {currentCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
