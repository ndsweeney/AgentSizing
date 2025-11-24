import { Rocket, Calendar, TrendingUp, Download, CheckCircle2, Clock, Star } from 'lucide-react';
import { useActiveScenario } from '../state/sizingStore';
import { calculateSizingResult } from '../domain/scoring';
import { calculateMaturityResult } from '../domain/maturity';
import { generateValueRoadmap, type Horizon } from '../domain/roadmap';
import { downloadJson } from '../utils/export';
import { cn } from '../utils/cn';

export function ValueRoadmapView() {
  const { scenario } = useActiveScenario();
  const sizingResult = calculateSizingResult(scenario.scores);
  const maturityResult = calculateMaturityResult(scenario.maturityScores || {});
  const roadmap = generateValueRoadmap(sizingResult, maturityResult);

  const handleExport = () => {
    downloadJson({
      scenarioName: scenario.name,
      roadmap,
      timestamp: new Date().toISOString()
    }, `value-roadmap-${scenario.name.replace(/\s+/g, '-').toLowerCase()}.json`);
  };

  const getHorizonColor = (h: Horizon) => {
    switch (h) {
      case 'Quick Win': return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'Medium Term': return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'Transformational': return 'bg-purple-50 border-purple-200 text-purple-900';
    }
  };

  const getHorizonIcon = (h: Horizon) => {
    switch (h) {
      case 'Quick Win': return <Rocket className="w-5 h-5 text-emerald-600" />;
      case 'Medium Term': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'Transformational': return <Star className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Time-to-Value Roadmap
            </h2>
            <p className="text-gray-500 mt-1">
              A strategic plan to realize value from your agent deployment, tailored to your maturity.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Roadmap
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <p className="text-blue-900 font-medium">{roadmap.summary}</p>
      </div>

      {/* Timeline View */}
      <div className="grid md:grid-cols-3 gap-6">
        {(['Quick Win', 'Medium Term', 'Transformational'] as Horizon[]).map((horizon) => {
          const items = roadmap.initiatives.filter(i => i.horizon === horizon);
          
          return (
            <div key={horizon} className="space-y-4">
              <div className={cn("p-4 rounded-lg border flex items-center gap-3", getHorizonColor(horizon))}>
                {getHorizonIcon(horizon)}
                <h3 className="font-bold">{horizon}</h3>
              </div>

              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    No initiatives in this phase.
                  </div>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          item.impact === 'High' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        )}>
                          {item.impact} Impact
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{item.timeline}</span>
                        </div>
                        {item.prerequisites.length > 0 && (
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 mt-0.5" />
                            <span>Requires: {item.prerequisites.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
