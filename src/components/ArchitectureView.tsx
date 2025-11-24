import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { MermaidDiagram } from './MermaidDiagram';
import { getAllArchitectureDiagrams, type ArchitectureContext } from '../domain/architectureDiagrams';
import { copyToClipboard } from '../utils/export';
import { cn } from '../utils/cn';
import type { SizingResult } from '../domain/types';

interface ArchitectureViewProps {
  result: SizingResult;
  scenarioName: string;
  industry: string;
  systems: string[];
}

export function ArchitectureView({ result, scenarioName, industry, systems }: ArchitectureViewProps) {
  const context: ArchitectureContext = { scenarioName, industry, systems };
  const diagrams = getAllArchitectureDiagrams(context, result);
  const [activeDiagramIndex, setActiveDiagramIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeDiagram = diagrams[activeDiagramIndex];

  const handleCopy = async () => {
    if (activeDiagram) {
      await copyToClipboard(activeDiagram.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-[700px] border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Header / Tabs */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
        <div className="flex gap-2">
          {diagrams.map((d, idx) => (
            <button
              key={idx}
              onClick={() => setActiveDiagramIndex(idx)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeDiagramIndex === idx
                  ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              {d.title.split(':')[0]}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Mermaid' : 'Copy Mermaid'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{activeDiagram.title}</h2>
          <p className="text-sm text-gray-500">{activeDiagram.description}</p>
        </div>
        
        <div className="bg-white p-4">
          <MermaidDiagram 
            title="" 
            description="" 
            code={activeDiagram.code} 
            className="border-0 shadow-none"
          />
        </div>
      </div>
    </div>
  );
}
