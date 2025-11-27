import { useState } from 'react';
import { MessageSquare, Copy, Check, Terminal } from 'lucide-react';
import { generatePrompts } from '../domain/prompts';
import { copyToClipboard } from '../utils/export';
import { cn } from '../utils/cn';
import type { SizingResult } from '../domain/types';

interface PromptsViewProps {
  result: SizingResult;
}

export function PromptsView({ result }: PromptsViewProps) {
  const prompts = generatePrompts(result);
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activePrompt = prompts[activeIndex];

  const handleCopy = async () => {
    if (activePrompt) {
      await copyToClipboard(activePrompt.systemPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (prompts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-slate-400">
        No prompt templates available for this configuration.
      </div>
    );
  }

  return (
    <div className="flex h-[600px] border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Prompt Library
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {prompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                activeIndex === idx
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-slate-700"
                  : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <MessageSquare className="w-4 h-4 opacity-70" />
              <div className="overflow-hidden">
                <div className="truncate">{p.title}</div>
                <div className="text-xs text-gray-400 dark:text-slate-500 truncate">{p.agentType}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{activePrompt.title}</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">{activePrompt.description}</p>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Prompt'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-900">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-900 dark:bg-black rounded-lg shadow-sm border border-gray-800 dark:border-slate-800 overflow-hidden">
              <div className="px-4 py-2 bg-gray-800 dark:bg-slate-900 border-b border-gray-700 dark:border-slate-800 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-gray-400 font-mono ml-2">System Prompt</span>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="font-mono text-sm text-gray-300 dark:text-slate-300 whitespace-pre-wrap">
                  {activePrompt.systemPrompt}
                </pre>
              </div>
            </div>

            {activePrompt.userPromptExample && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Example User Input</h4>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 italic text-sm">
                  "{activePrompt.userPromptExample}"
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
