import { useState } from 'react';
import { Copy, Download, Check, FileText, Bot } from 'lucide-react';
import { generateAllBlueprints } from '../domain/blueprints';
import { copyToClipboard } from '../utils/export'; // I might need a downloadText or similar
import { cn } from '../utils/cn';
import type { SizingResult } from '../domain/types';

interface BlueprintsViewProps {
  result: SizingResult;
}

export function BlueprintsView({ result }: BlueprintsViewProps) {
  const blueprints = generateAllBlueprints(result);
  const [activeBlueprintIndex, setActiveBlueprintIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeBlueprint = blueprints[activeBlueprintIndex];

  const handleCopy = async () => {
    if (activeBlueprint) {
      await copyToClipboard(activeBlueprint.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (activeBlueprint) {
      // Create a blob and download it
      const blob = new Blob([activeBlueprint.markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeBlueprint.title.replace(/\s+/g, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (blueprints.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-slate-400">
        No agent blueprints available for this configuration.
      </div>
    );
  }

  return (
    <div className="flex h-[600px] border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 transition-colors">
      {/* Sidebar List */}
      <div className="w-64 bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Agent Blueprints
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {blueprints.map((bp, idx) => (
            <button
              key={idx}
              onClick={() => setActiveBlueprintIndex(idx)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                activeBlueprintIndex === idx
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-slate-700"
                  : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <FileText className="w-4 h-4 opacity-70" />
              {bp.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">{activeBlueprint.title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Markdown'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download .md
            </button>
          </div>
        </div>

        {/* Markdown Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-900">
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-slate-300 leading-relaxed">
              {activeBlueprint.markdown}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
