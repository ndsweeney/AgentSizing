import { BarChart3, CheckCircle2, AlertTriangle, Info, Download } from 'lucide-react';
import { useActiveScenario } from '../state/sizingStore';
import { MATURITY_DIMENSIONS, calculateMaturityResult } from '../domain/maturity';
import { cn } from '../utils/cn';
import { downloadJson } from '../utils/export';

export function MaturityAssessmentView() {
  const { scenario } = useActiveScenario();

  const scores = scenario.maturityScores || {};
  const result = calculateMaturityResult(scores);
  
  const handleExport = () => {
    downloadJson({
      scenarioName: scenario.name,
      maturityResult: result,
      timestamp: new Date().toISOString()
    }, `maturity-report-${scenario.name.replace(/\s+/g, '-').toLowerCase()}.json`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Organisational Maturity Assessment
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              Evaluate your organization's readiness for AI adoption across 6 key dimensions.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
          {/* Score Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
            <h3 className="text-lg font-medium text-gray-500 dark:text-slate-400 mb-2">Overall Readiness Score</h3>
            <div className={cn(
              "inline-flex items-center justify-center w-32 h-32 rounded-full border-4 text-4xl font-bold mb-4",
              result.overallScore >= 80 ? "border-green-500 dark:border-green-600 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20" :
              result.overallScore >= 60 ? "border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" :
              result.overallScore >= 40 ? "border-yellow-500 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20" :
              "border-red-500 dark:border-red-600 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
            )}>
              {result.overallScore}
            </div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Maturity Level: <span className="text-blue-600 dark:text-blue-400">{result.level}</span>
            </div>
            
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Report JSON
            </button>
          </div>

          {/* Recommendations */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Strategic Recommendations
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {MATURITY_DIMENSIONS.map((dim) => {
                const score = scores[dim.id];
                const rec = dim.recommendations[score === 1 ? 'low' : score === 2 ? 'medium' : 'high'];
                
                return (
                  <div key={dim.id} className="p-6 flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {score === 3 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
                      ) : score === 2 ? (
                        <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">{dim.label}</h4>
                      <p className="text-gray-600 dark:text-slate-300 text-sm">{rec || "No recommendation available."}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
    </div>
  );
}
