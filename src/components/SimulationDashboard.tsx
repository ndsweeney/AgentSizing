import { useState } from 'react';
import { FlaskConical, ArrowLeft, Download, TrendingUp, TrendingDown, BarChart3, Activity, DollarSign, Network } from 'lucide-react';
import { useActiveScenario, useSizingStore } from '../state/sizingStore';
import { DIMENSIONS, calculateSizingResult, type ScoreValue } from '../domain/scoring';
import { calculateEstimatedCosts, formatCurrency } from '../domain/costs';
import { buildSystemIntegrationMermaid, buildAgentArchitectureMermaid } from '../domain/diagrams';
import { MermaidDiagram } from './MermaidDiagram';
import { cn } from '../utils/cn';
import { downloadJson } from '../utils/export';

export function SimulationDashboard() {
  const { scenario, scores } = useActiveScenario();
  const { scenarios, setActiveScenario, setScore } = useSizingStore();
  const [showDiagram, setShowDiagram] = useState(false);
  const [diagramType, setDiagramType] = useState<'integration' | 'architecture'>('architecture');
  
  const originalScenario = scenarios.find(s => s.id === scenario.originalScenarioId);
  
  if (!originalScenario) {
      return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600">Error: Original scenario not found</h2>
            <button onClick={() => setActiveScenario(scenarios[0].id)} className="mt-4 text-blue-600 underline">Return to Home</button>
        </div>
      );
  }

  const originalResult = calculateSizingResult(originalScenario.scores);
  const currentResult = calculateSizingResult(scores);
  
  const originalCosts = calculateEstimatedCosts(originalResult);
  const currentCosts = calculateEstimatedCosts(currentResult);

  const handleDownload = () => {
    const exportData = {
      simulationName: scenario.name,
      originalScenario: originalScenario.name,
      timestamp: new Date().toISOString(),
      comparison: {
        original: {
          scores: originalScenario.scores,
          result: originalResult,
          costs: originalCosts
        },
        simulation: {
          scores: scores,
          result: currentResult,
          costs: currentCosts
        },
        deltas: DIMENSIONS.map(d => ({
          dimension: d.label,
          delta: (scores[d.id] || 0) - (originalScenario.scores[d.id] || 0)
        }))
      }
    };
    downloadJson(exportData, `simulation-${scenario.name.replace(/\s+/g, '-').toLowerCase()}.json`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between bg-purple-50 p-6 rounded-xl border border-purple-100">
        <div>
          <div className="flex items-center gap-2 text-purple-900 font-bold text-xl mb-1">
            <FlaskConical className="w-6 h-6" />
            Scenario Simulator
          </div>
          <p className="text-purple-700">
            Simulating changes based on <span className="font-semibold">{originalScenario.name}</span>. 
            Adjust dimensions below to see impact on sizing and architecture.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveScenario(originalScenario.id)}
            className="flex items-center gap-2 px-4 py-2 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Simulation
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Summary
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Adjust Dimensions
            </h3>
            <div className="space-y-6">
              {DIMENSIONS.map((dim) => {
                const val = scores[dim.id] || 0;
                const originalVal = originalScenario.scores[dim.id] || 0;
                const delta = val - originalVal;

                return (
                  <div key={dim.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{dim.label}</span>
                      <div className="flex items-center gap-2">
                        {delta !== 0 && (
                          <span className={cn(
                            "text-xs font-bold px-1.5 py-0.5 rounded",
                            delta > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                          )}>
                            {delta > 0 ? '+' : ''}{delta}
                          </span>
                        )}
                        <span className="font-mono text-gray-500">{val}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="1"
                      value={val || 1}
                      onChange={(e) => setScore(dim.id, parseInt(e.target.value) as ScoreValue)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 px-1">
                      <span>Small</span>
                      <span>Medium</span>
                      <span>Large</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Metrics Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Original Card */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 opacity-75">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Baseline</div>
              <div className="flex items-end gap-4 mb-2">
                <div className="text-4xl font-bold text-gray-700">{originalResult.tShirtSize}</div>
                <div className="text-sm text-gray-500 mb-1.5">Score: {originalResult.totalScore}</div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Est. Sprints</span>
                  <span className="font-medium">{originalResult.tShirtSize === 'SMALL' ? '2-3' : originalResult.tShirtSize === 'MEDIUM' ? '4-6' : '8+'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Team Size</span>
                  <span className="font-medium">{originalResult.tShirtSize === 'SMALL' ? '2-3' : originalResult.tShirtSize === 'MEDIUM' ? '4-6' : '8+'} FTEs</span>
                </div>
              </div>
            </div>

            {/* Simulation Card */}
            <div className="bg-white rounded-xl border-2 border-purple-100 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-bl-lg">
                SIMULATION
              </div>
              <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-4">Projected</div>
              <div className="flex items-end gap-4 mb-2">
                <div className="text-4xl font-bold text-purple-900">{currentResult.tShirtSize}</div>
                <div className="text-sm text-purple-600 mb-1.5">Score: {currentResult.totalScore}</div>
                {currentResult.totalScore !== originalResult.totalScore && (
                  <div className={cn(
                    "flex items-center text-sm font-bold mb-1.5",
                    currentResult.totalScore > originalResult.totalScore ? "text-red-600" : "text-green-600"
                  )}>
                    {currentResult.totalScore > originalResult.totalScore ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {Math.abs(currentResult.totalScore - originalResult.totalScore)}
                  </div>
                )}
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Est. Sprints</span>
                  <span className="font-medium text-gray-900">{currentResult.tShirtSize === 'SMALL' ? '2-3' : currentResult.tShirtSize === 'MEDIUM' ? '4-6' : '8+'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Team Size</span>
                  <span className="font-medium text-gray-900">{currentResult.tShirtSize === 'SMALL' ? '2-3' : currentResult.tShirtSize === 'MEDIUM' ? '4-6' : '8+'} FTEs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Dimension Impact Analysis
            </h3>
            <div className="space-y-4">
              {DIMENSIONS.map((dim) => {
                const currentVal = scores[dim.id] || 0;
                const originalVal = originalScenario.scores[dim.id] || 0;
                
                return (
                  <div key={dim.id} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4 text-xs font-medium text-gray-600 truncate" title={dim.label}>
                      {dim.label}
                    </div>
                    <div className="col-span-8 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                      {/* Original Marker */}
                      <div 
                        className="absolute top-0 bottom-0 bg-gray-400 w-1 z-10"
                        style={{ left: `${(originalVal / 3) * 100}%` }}
                      />
                      {/* Current Bar */}
                      <div 
                        className={cn(
                          "h-full transition-all duration-500",
                          currentVal > originalVal ? "bg-red-400" : currentVal < originalVal ? "bg-green-400" : "bg-blue-400"
                        )}
                        style={{ width: `${(currentVal / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-end gap-4 text-xs text-gray-500 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-3 bg-gray-400"></div>
                  <span>Baseline</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                  <span>Simulated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Estimation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Estimated Cost Impact (Year 1)
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-xs font-bold text-gray-500 uppercase mb-2">Baseline Estimate</div>
                <div className="text-2xl font-bold text-gray-700 mb-1">
                  {formatCurrency(originalCosts.totalFirstYear.min)} - {formatCurrency(originalCosts.totalFirstYear.max)}
                </div>
                <div className="text-xs text-gray-500">
                  Impl: {formatCurrency(originalCosts.implementation.min)} - {formatCurrency(originalCosts.implementation.max)}
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-xs font-bold text-purple-600 uppercase mb-2">Simulated Estimate</div>
                <div className="text-2xl font-bold text-purple-900 mb-1">
                  {formatCurrency(currentCosts.totalFirstYear.min)} - {formatCurrency(currentCosts.totalFirstYear.max)}
                </div>
                <div className="text-xs text-purple-700">
                  Impl: {formatCurrency(currentCosts.implementation.min)} - {formatCurrency(currentCosts.implementation.max)}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 italic">
              * Estimates include implementation, licensing, and Azure consumption. For rough order of magnitude only.
            </p>
          </div>

          {/* Architecture Changes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                 <Network className="w-4 h-4 text-blue-600" />
                 Architecture Implications
               </h3>
               <button 
                 onClick={() => setShowDiagram(!showDiagram)}
                 className="text-xs font-medium text-blue-600 hover:text-blue-800 underline"
               >
                 {showDiagram ? 'Hide Diagram' : 'Show Diagram'}
               </button>
             </div>
             
             {showDiagram && (
               <div className="mb-6 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                 <div className="flex gap-2 mb-4">
                   <button
                     onClick={() => setDiagramType('architecture')}
                     className={cn(
                       "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                       diagramType === 'architecture' ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                     )}
                   >
                     Agent Architecture
                   </button>
                   <button
                     onClick={() => setDiagramType('integration')}
                     className={cn(
                       "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                       diagramType === 'integration' ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                     )}
                   >
                     System Integration
                   </button>
                 </div>
                 <MermaidDiagram 
                   code={
                     diagramType === 'architecture' 
                       ? buildAgentArchitectureMermaid(currentResult).code 
                       : buildSystemIntegrationMermaid(currentResult, scenario.systems || []).code
                   } 
                 />
               </div>
             )}

             <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Baseline Architecture</h4>
                    <ul className="space-y-1">
                        {originalResult.recommendedAgentPattern.map((p, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5"></span>
                                {p}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-purple-600 uppercase mb-2">Simulated Architecture</h4>
                    <ul className="space-y-1">
                        {currentResult.recommendedAgentPattern.map((p, i) => (
                            <li key={i} className="text-xs text-gray-800 flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5"></span>
                                {p}
                            </li>
                        ))}
                    </ul>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
