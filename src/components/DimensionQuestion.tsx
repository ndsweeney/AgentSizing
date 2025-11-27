import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import type { ScoreValue, DimensionOption } from '../domain/scoring';
import type { AssessmentMode } from '../state/sizingStore';

interface DimensionQuestionProps {
  dimensionId: string;
  label: string;
  description: string;
  options: {
    1: DimensionOption;
    2: DimensionOption;
    3: DimensionOption;
  };
  value: ScoreValue | null;
  targetValue?: ScoreValue | null;
  mode?: AssessmentMode;
  onChange: (newValue: ScoreValue) => void;
  onTargetChange?: (newValue: ScoreValue) => void;
  comment?: string;
  onCommentChange?: (comment: string) => void;
  isReadOnly?: boolean;
}

export function DimensionQuestion({
  label,
  description,
  options,
  value,
  targetValue,
  mode = 'single',
  onChange,
  onTargetChange,
  comment,
  onCommentChange,
  isReadOnly,
}: DimensionQuestionProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{label}</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">{description}</p>
        {mode === 'compare' && (
          <div className="mt-4 flex items-center justify-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span className="text-blue-900 dark:text-blue-300">Current State</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600"></span>
              <span className="text-purple-900 dark:text-purple-300">Target State</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {([1, 2, 3] as const).map((score) => {
          const option = options[score];
          const isSelected = value === score;
          const isTargetSelected = mode === 'compare' && targetValue === score;

          return (
            <motion.div
              key={score}
              whileHover={isReadOnly ? {} : { scale: 1.02 }}
              whileTap={isReadOnly ? {} : { scale: 0.98 }}
              onClick={() => {
                if (!isReadOnly && mode === 'single') onChange(score);
              }}
              className={cn(
                "relative flex flex-col items-start p-6 rounded-xl border-2 text-left transition-all duration-200 bg-white dark:bg-slate-800",
                isReadOnly ? "cursor-default" : "cursor-pointer",
                isSelected && isTargetSelected ? "border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/20 dark:border-indigo-400" :
                isSelected ? "border-blue-600 bg-blue-50/30 dark:bg-blue-900/20 dark:border-blue-400" :
                isTargetSelected ? "border-purple-600 bg-purple-50/30 dark:bg-purple-900/20 dark:border-purple-400" :
                "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-700"
              )}
            >
              <div className="flex items-center justify-between w-full mb-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                  isSelected || isTargetSelected ? "bg-gray-900 text-white dark:bg-white dark:text-slate-900" : "bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400"
                )}>
                  {score}
                </div>
                
                {mode === 'compare' ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isReadOnly) onChange(score);
                      }}
                      disabled={isReadOnly}
                      className={cn(
                        "px-3 py-1 text-xs font-bold rounded-full transition-colors border",
                        isSelected 
                          ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500" 
                          : "bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-600 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-600 dark:hover:border-blue-400 dark:hover:text-blue-400",
                        isReadOnly && "opacity-50 cursor-not-allowed hover:border-gray-200 hover:text-gray-500"
                      )}
                    >
                      Current
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isReadOnly) onTargetChange?.(score);
                      }}
                      disabled={isReadOnly}
                      className={cn(
                        "px-3 py-1 text-xs font-bold rounded-full transition-colors border",
                        isTargetSelected 
                          ? "bg-purple-600 text-white border-purple-600 dark:bg-purple-500 dark:border-purple-500" 
                          : "bg-white text-gray-500 border-gray-200 hover:border-purple-400 hover:text-purple-600 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-600 dark:hover:border-purple-400 dark:hover:text-purple-400",
                        isReadOnly && "opacity-50 cursor-not-allowed hover:border-gray-200 hover:text-gray-500"
                      )}
                    >
                      Target
                    </button>
                  </div>
                ) : (
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300 dark:border-slate-600"
                  )}>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                )}
              </div>

              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{option.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{option.description}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Comments
        </label>
        <textarea
          value={comment || ''}
          onChange={(e) => onCommentChange?.(e.target.value)}
          disabled={isReadOnly}
          placeholder="Add notes about this dimension..."
          className="w-full p-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-slate-900 dark:bg-slate-800 dark:text-white"
          rows={3}
        />
      </div>
    </div>
  );
}
