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
      case 'green': return 'bg-green-100 text-green-700 border-green-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'red': return 'bg-red-100 text-red-700 border-red-200';
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              Compliance Heatmap
            </h2>
            <p className="text-gray-500 mt-1">
              Assess compliance risks across all agents and required controls.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Overall Score</span>
              <span className={cn(
                "text-2xl font-bold",
                data.overallScore >= 80 ? "text-green-600" :
                data.overallScore >= 60 ? "text-yellow-600" : "text-red-600"
              )}>
                {data.overallScore}%
              </span>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 min-w-[200px]">Agent Type</th>
              {data.controls.map(control => (
                <th key={control.id} className="px-4 py-4 min-w-[120px] text-center group relative">
                  <span className="cursor-help border-b border-dotted border-gray-400">{control.name}</span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="font-bold mb-1">{control.category}</div>
                    {control.description}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.agentScores.map((agent) => (
              <tr key={agent.agentType} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 bg-white sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
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
      <div className="flex gap-6 justify-center text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Compliant / Low Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <span>Partial / Medium Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-600" />
          <span>Missing / High Risk</span>
        </div>
      </div>
    </div>
  );
}
