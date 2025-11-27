import { useState } from 'react';
import { Copy, FileJson, Code, Check, Bot } from 'lucide-react';
import { generateTopicSkeletons } from '../domain/topicSkeletons';
import { copyToClipboard } from '../utils/export';
import { cn } from '../utils/cn';
import type { SizingResult, TopicSkeleton } from '../domain/types';

interface TopicSkeletonsViewProps {
  result: SizingResult;
}

export function TopicSkeletonsView({ result }: TopicSkeletonsViewProps) {
  const skeletons = generateTopicSkeletons(result);
  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const activeSkeleton = skeletons[activeIndex];

  const handleCopyMarkdown = async () => {
    if (activeSkeleton) {
      const md = generateSkeletonMarkdown(activeSkeleton);
      await copyToClipboard(md);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    }
  };

  const handleCopyJson = async () => {
    if (activeSkeleton) {
      await copyToClipboard(JSON.stringify(activeSkeleton, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  if (skeletons.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No topic skeletons available for this configuration.
      </div>
    );
  }

  return (
    <div className="flex h-[600px] border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 transition-colors">
      {/* Sidebar List */}
      <div className="w-64 bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Code className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Topic Skeletons
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {skeletons.map((sk, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                activeIndex === idx
                  ? "bg-white text-purple-600 shadow-sm border border-gray-200 dark:bg-slate-700 dark:text-purple-400 dark:border-slate-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-white"
              )}
            >
              <Bot className="w-4 h-4 opacity-70" />
              <div className="overflow-hidden">
                <div className="truncate">{sk.name}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{sk.agentType}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{activeSkeleton.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{activeSkeleton.agentType}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors dark:text-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              {copiedMd ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedMd ? 'Copied MD' : 'Copy Markdown'}
            </button>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors dark:text-gray-300 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <FileJson className="w-3.5 h-3.5" />}
              {copiedJson ? 'Copied JSON' : 'Copy JSON'}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-900/50">
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trigger Phrases</h3>
              <ul className="list-disc pl-5 mb-6 text-gray-600 dark:text-gray-400">
                {activeSkeleton.triggerPhrases.map((phrase, i) => (
                  <li key={i}>{phrase}</li>
                ))}
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Variables</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {activeSkeleton.variables.map((v, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-mono border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                    {v}
                  </span>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conversation Flow</h3>
              <ol className="list-decimal pl-5 mb-6 text-gray-600 dark:text-gray-400 space-y-1">
                {activeSkeleton.steps.map((step, i) => (
                  <li key={i} className="pl-1">{step.replace(/^\d+\.\s*/, '')}</li>
                ))}
              </ol>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions & Skills</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {activeSkeleton.actions.map((action, i) => (
                  <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-mono border border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                    {action}
                  </span>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Response Templates</h3>
              <div className="space-y-2 mb-6">
                {activeSkeleton.responseTemplates.map((tmpl, i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-slate-900/50 rounded border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-400 italic text-sm">
                    "{tmpl}"
                  </div>
                ))}
              </div>

              {activeSkeleton.guardrailNotes && activeSkeleton.guardrailNotes.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Guardrails & Notes</h3>
                  <ul className="list-disc pl-5 text-red-600 dark:text-red-400">
                    {activeSkeleton.guardrailNotes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateSkeletonMarkdown(skeleton: TopicSkeleton): string {
  return `# Topic Skeleton: ${skeleton.name}
**Agent Type:** ${skeleton.agentType}

## Trigger Phrases
${skeleton.triggerPhrases.map(p => `- ${p}`).join('\n')}

## Variables
${skeleton.variables.map(v => `- \`${v}\``).join('\n')}

## Conversation Steps
${skeleton.steps.map(s => `- ${s}`).join('\n')}

## Actions
${skeleton.actions.map(a => `- \`${a}\``).join('\n')}

## Response Templates
${skeleton.responseTemplates.map(t => `- "${t}"`).join('\n')}

## Guardrails
${(skeleton.guardrailNotes || []).map(n => `- ${n}`).join('\n')}
`;
}
