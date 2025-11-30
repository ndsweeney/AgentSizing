import { useState } from 'react';
import { Copy, Download, FlaskConical, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { generateTestPlan } from '../domain/tests';
import { copyToClipboard, downloadJson } from '../utils/export';
import type { SizingResult, TestCase } from '../domain/types';
import { getAgentArchetypes } from '../data/agentArchetypes';
import { useRulesStore } from '../state/rulesStore';

interface TestPlanViewProps {
  result: SizingResult;
}

export function TestPlanView({ result }: TestPlanViewProps) {
  const { sizingThresholds, riskThresholds } = useRulesStore();
  const agentArchetypes = getAgentArchetypes({ sizingThresholds, riskThresholds });
  const { cases, summary } = generateTestPlan(result);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = () => {
    downloadJson({ summary, cases }, 'agent-test-plan.json');
  };

  // Group cases by Agent Type
  const groupedCases = cases.reduce((acc, testCase) => {
    if (!acc[testCase.agentType]) {
      acc[testCase.agentType] = [];
    }
    acc[testCase.agentType].push(testCase);
    return acc;
  }, {} as Record<string, TestCase[]>);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-6 flex items-start justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
            <FlaskConical className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Test Harness & Validation Plan
          </h3>
          <p className="text-sm text-emerald-800 dark:text-emerald-300">
            Use these test cases to validate your agents during the build phase. 
            This plan covers happy paths, edge cases, and security guardrails.
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Download JSON
        </button>
      </div>

      <div className="grid gap-8">
        {Object.entries(groupedCases).map(([agentType, tests]) => {
          const agent = result.agentArchitecture.find(a => a.type === agentType);
          const archetype = agent ? agentArchetypes.find(a => a.id === agent.archetypeId) : null;

          return (
            <div key={agentType} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{agentType} Tests</h4>
                  {archetype && (
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-full">
                      {archetype.tier === 'core' ? 'Core' : 'Extended'} – {archetype.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {tests.map((test) => (
                  <div key={test.id} className="p-6 hover:bg-gray-50/30 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                          {test.id}
                        </span>
                        <h5 className="font-medium text-gray-900 dark:text-white">{test.title}</h5>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-300">{test.description}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(formatTestCaseForClipboard(test), test.id)}
                      className="p-2 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Copy Test Case"
                    >
                      {copiedId === test.id ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Input / Trigger</span>
                        <div className="mt-1 p-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-mono text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
                          {test.input}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Expected Outcome</span>
                        <div className="mt-1 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-lg text-sm text-green-800 dark:text-green-300">
                          {test.expectedOutput}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Edge Cases & Negative Tests
                      </span>
                      <ul className="mt-2 space-y-2">
                        {test.edgeCases.map((ec: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded border border-gray-100 dark:border-slate-700">
                            <ShieldAlert className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
                            <span>{ec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
}

function formatTestCaseForClipboard(test: TestCase): string {
  return `Test Case: ${test.title} (${test.id})
Type: ${test.agentType}
Description: ${test.description}

Input:
${test.input}

Expected Output:
${test.expectedOutput}

Edge Cases:
${test.edgeCases.map((ec: string) => `- ${ec}`).join('\n')}
`;
}
