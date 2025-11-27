import { Check, ArrowRightLeft } from 'lucide-react';
import { useSizingStore, useActiveScenario } from '../state/sizingStore';
import { DIMENSIONS, type DimensionId } from '../domain/scoring';
import { MATURITY_DIMENSIONS } from '../domain/maturity';
import { cn } from '../utils/cn';

export function AssessmentProgress() {
  const { 
    setCurrentStep, 
    setMode, 
  } = useSizingStore();
  const { currentStep, scores, targetScores, maturityScores, mode } = useActiveScenario();

  const totalSteps = DIMENSIONS.length + MATURITY_DIMENSIONS.length;
  const isMaturityStep = currentStep >= DIMENSIONS.length;
  
  const currentDimension = isMaturityStep 
    ? MATURITY_DIMENSIONS[currentStep - DIMENSIONS.length]
    : DIMENSIONS[currentStep];

  const allDimensions = [
    ...DIMENSIONS.map(d => ({ ...d, isMaturity: false })),
    ...MATURITY_DIMENSIONS.map(d => ({ ...d, isMaturity: true }))
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
      {/* Header with Title and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold">
              {currentStep + 1}
            </span>
            {currentDimension?.label}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-8">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>

        {!isMaturityStep && (
          <button
            onClick={() => setMode(mode === 'single' ? 'compare' : 'single')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all border shadow-sm whitespace-nowrap",
              mode === 'compare'
                ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-900"
                : "bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 hover:text-gray-900 dark:hover:text-white"
            )}
            title="Toggle Comparison Mode"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            {mode === 'compare' ? 'Compare Mode' : 'Single Mode'}
          </button>
        )}
      </div>

      {/* Progress Bar / Stepper */}
      <div className="relative mx-4">
        {/* Connecting Line Background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 dark:bg-slate-700 rounded-full -z-10" />
        
        {/* Connecting Line Progress */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 dark:bg-blue-500 rounded-full -z-10 transition-all duration-500"
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        />

        <div className="flex justify-between items-center">
          {allDimensions.map((dim, index) => {
            const isCurrentCompleted = dim.isMaturity 
              ? maturityScores?.[dim.id] !== undefined
              : scores[dim.id as DimensionId] !== undefined && scores[dim.id as DimensionId] !== null;

            const isTargetCompleted = !dim.isMaturity && targetScores[dim.id as DimensionId] !== undefined && targetScores[dim.id as DimensionId] !== null;
            
            const isCompleted = (!dim.isMaturity && mode === 'compare')
              ? isCurrentCompleted && isTargetCompleted
              : isCurrentCompleted;
              
            const isCurrent = currentStep === index;
            const isClickable = isCompleted || isCurrent;
            const isPast = index < currentStep;

            return (
              <button
                key={dim.id}
                onClick={() => isClickable && setCurrentStep(index)}
                disabled={!isClickable}
                className="group relative focus:outline-none"
                title={dim.label}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                  isCurrent 
                    ? "bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white shadow-md scale-110" 
                    : isCompleted || isPast
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                      : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-300 dark:text-slate-600"
                )}>
                  {isCompleted && !isCurrent ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                
                {/* Tooltip Label */}
                <div className={cn(
                  "absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium px-2 py-1 rounded bg-gray-900 dark:bg-slate-950 text-white opacity-0 transition-opacity pointer-events-none z-10",
                  "group-hover:opacity-100"
                )}>
                  {dim.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
