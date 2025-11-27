import { Check, Bot, Building2 } from 'lucide-react';
import { useSizingStore, useActiveScenario } from '../state/sizingStore';
import { DIMENSIONS, type DimensionId } from '../domain/scoring';
import { MATURITY_DIMENSIONS } from '../domain/maturity';
import { cn } from '../utils/cn';

export function Sidebar() {
  const { 
    setCurrentStep, 
  } = useSizingStore();
  const { currentStep, scores, targetScores, maturityScores, mode, scenario } = useActiveScenario();

  const totalSteps = DIMENSIONS.length + MATURITY_DIMENSIONS.length;
  const completedSteps = Object.keys(scores).length + Object.keys(maturityScores || {}).length;
  const progress = (completedSteps / totalSteps) * 100;
  const onStepChange = setCurrentStep;

  const allDimensions = [
    ...DIMENSIONS.map(d => ({ ...d, isMaturity: false })),
    ...MATURITY_DIMENSIONS.map(d => ({ ...d, isMaturity: true }))
  ];

  return (
    <div className="w-80 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col h-screen sticky top-0 overflow-hidden transition-colors duration-300">
      <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-b from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-900/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">Agent Sizing</h1>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Workshop Assistant</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Progress Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Progress</h2>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Dimensions Navigation */}
        <nav className="space-y-1">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">Dimensions</h2>
          {allDimensions.map((dim, index) => {
            const isCompleted = dim.isMaturity 
              ? maturityScores?.[dim.id] !== undefined
              : scores[dim.id as DimensionId] !== undefined;
              
            const isActive = currentStep === index;
            const isTargetCompleted = !dim.isMaturity && mode === 'compare' && targetScores[dim.id as DimensionId] !== undefined;
            
            return (
              <button
                key={dim.id}
                onClick={() => onStepChange(index)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative overflow-hidden",
                  isActive 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium shadow-sm ring-1 ring-blue-100 dark:ring-blue-800" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-gray-200"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all duration-300 border shrink-0",
                  isActive 
                    ? "bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500" 
                    : isCompleted 
                      ? "bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400" 
                      : "bg-white border-gray-200 text-gray-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-500"
                )}>
                   {isCompleted && !isActive ? <Check className="w-3.5 h-3.5" /> : index + 1}
                </div>
                <span className="flex-1 text-left truncate">{dim.label}</span>
                {isCompleted && mode === 'compare' && isTargetCompleted && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 dark:bg-purple-500 shrink-0" title="Target set" />
                )}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Workshop Info */}
        <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Workshop Details</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Industry</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate w-40" title={scenario.industry}>
                  {scenario.industry || 'Not set'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          © 2024 Agent Sizing Workshop
        </p>
      </div>
    </div>
  );
}
