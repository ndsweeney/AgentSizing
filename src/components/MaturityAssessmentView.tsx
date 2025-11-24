import { useState } from 'react';
import { BarChart3, CheckCircle2, AlertTriangle, ArrowRight, Info, Download } from 'lucide-react';
import { useActiveScenario, useSizingStore } from '../state/sizingStore';
import { MATURITY_DIMENSIONS, calculateMaturityResult, type MaturityLevel } from '../domain/maturity';
import { cn } from '../utils/cn';
import { downloadJson } from '../utils/export';

export function MaturityAssessmentView() {
  const { scenario } = useActiveScenario();
  const { setMaturityScore } = useSizingStore();
  const [activeTab, setActiveTab] = useState<'assessment' | 'report'>('assessment');

  const scores = scenario.maturityScores || {};
  const result = calculateMaturityResult(scores);
  const isComplete = MATURITY_DIMENSIONS.every(d => scores[d.id]);

  const handleScore = (id: string, value: MaturityLevel) => {
    setMaturityScore(id, value);
  };

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Organisational Maturity Assessment
            </h2>
            <p className="text-gray-500 mt-1">
              Evaluate your organization's readiness for AI adoption across 6 key dimensions.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('assessment')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === 'assessment' ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              Assessment
            </button>
            <button
              onClick={() => setActiveTab('report')}
              disabled={!isComplete}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === 'report' ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              )}
            >
              Report
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'assessment' && (
        <div className="grid gap-6">
          {MATURITY_DIMENSIONS.map((dim) => (
            <div key={dim.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900 text-lg">{dim.label}</h3>
                <p className="text-gray-500 text-sm">{dim.description}</p>
              </div>
              <div className="p-6 grid md:grid-cols-3 gap-4">
                {[1, 2, 3].map((val) => {
                  const option = dim.options[val as MaturityLevel];
                  const isSelected = scores[dim.id] === val;
                  return (
                    <button
                      key={val}
                      onClick={() => handleScore(dim.id, val as MaturityLevel)}
                      className={cn(
                        "text-left p-4 rounded-lg border-2 transition-all relative",
                        isSelected 
                          ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" 
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-blue-600">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                      <div className="font-semibold text-gray-900 mb-1">{option.title}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          
          {isComplete && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setActiveTab('report')}
                className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                View Maturity Report
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Score Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h3 className="text-lg font-medium text-gray-500 mb-2">Overall Readiness Score</h3>
            <div className={cn(
              "inline-flex items-center justify-center w-32 h-32 rounded-full border-4 text-4xl font-bold mb-4",
              result.overallScore >= 80 ? "border-green-500 text-green-700 bg-green-50" :
              result.overallScore >= 60 ? "border-blue-500 text-blue-700 bg-blue-50" :
              result.overallScore >= 40 ? "border-yellow-500 text-yellow-700 bg-yellow-50" :
              "border-red-500 text-red-700 bg-red-50"
            )}>
              {result.overallScore}
            </div>
            <div className="text-xl font-semibold text-gray-900 mb-6">
              Maturity Level: <span className="text-blue-600">{result.level}</span>
            </div>
            
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Report JSON
            </button>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-blue-50">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Strategic Recommendations
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {MATURITY_DIMENSIONS.map((dim) => {
                const score = scores[dim.id];
                const rec = dim.recommendations[score === 1 ? 'low' : score === 2 ? 'medium' : 'high'];
                
                return (
                  <div key={dim.id} className="p-6 flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {score === 3 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : score === 2 ? (
                        <Info className="w-5 h-5 text-blue-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{dim.label}</h4>
                      <p className="text-gray-600 text-sm">{rec}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
