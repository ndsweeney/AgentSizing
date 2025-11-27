import { Download, ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useActiveScenario } from '../state/sizingStore';
import { calculateSizingResult } from '../domain/scoring';
import { generateComplianceHeatmap } from '../domain/compliance';
import { downloadJson } from '../utils/export';
import { cn } from '../utils/cn';

export function ComplianceHeatmapView() {
  const { scores } = useActiveScenario();
  const result = calculateSizingResult(scores);
  const data = generateComplianceHeatmap(result);

  const handleExport = () => {
    downloadJson(data, 'compliance-heatmap.json');
  };

  const getStatusColor = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'yellow': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'red': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
    }
  };

  const getStatusIcon = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green': return <CheckCircle2 className="w-4 h-4" />;
      case 'yellow': return <AlertTriangle className="w-4 h-4" />;
      case 'red': return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Compliance Heatmap
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              Assess compliance risks across all agents and required controls.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Overall Score</span>
              <span className={cn(
                "text-2xl font-bold",
                data.overallScore >= 80 ? "text-green-600 dark:text-green-400" :
                data.overallScore >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"
              )}>
                {data.overallScore}%
              </span>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-300 font-semibold border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 min-w-[200px]">Agent Type</th>
              {data.controls.map(control => (
                <th key={control.id} className="px-4 py-4 min-w-[120px] text-center group relative">
                  <span className="cursor-help border-b border-dotted border-gray-400 dark:border-slate-500">{control.name}</span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 dark:bg-slate-950 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="font-bold mb-1">{control.category}</div>
                    {control.description}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {data.agentScores.map((agent) => (
              <tr key={agent.agentType} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white bg-white dark:bg-slate-800 sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  {agent.agentType}
                </td>
                {data.controls.map(control => {
                  const status = agent.scores[control.id];
                  return (
                    <td key={control.id} className="px-4 py-4 text-center">
                      <div className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full border transition-transform hover:scale-110",
                        getStatusColor(status)
                      )}>
                        {getStatusIcon(status)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex gap-6 justify-center text-sm text-gray-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span>Compliant / Low Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span>Partial / Medium Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span>Missing / High Risk</span>
        </div>
      </div>
    </div>
  );
}
