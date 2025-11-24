import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import type { ScoreValue, DimensionOption, DimensionId } from '../domain/scoring';
import type { AssessmentMode } from '../state/sizingStore';

interface DimensionQuestionProps {
  dimensionId: DimensionId;
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{label}</h2>
        <p className="text-gray-600 text-lg">{description}</p>
        {mode === 'compare' && (
          <div className="mt-4 flex items-center justify-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span className="text-blue-900">Current State</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600"></span>
              <span className="text-purple-900">Target State</span>
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
                "relative flex flex-col items-start p-6 rounded-xl border-2 text-left transition-all duration-200 bg-white",
                isReadOnly ? "cursor-default" : "cursor-pointer",
                isSelected && isTargetSelected ? "border-indigo-600 bg-indigo-50/30" :
                isSelected ? "border-blue-600 bg-blue-50/30" :
                isTargetSelected ? "border-purple-600 bg-purple-50/30" :
                "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center justify-between w-full mb-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                  isSelected || isTargetSelected ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
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
                          ? "bg-blue-600 text-white border-blue-600" 
                          : "bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-600",
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
                          ? "bg-purple-600 text-white border-purple-600" 
                          : "bg-white text-gray-500 border-gray-200 hover:border-purple-400 hover:text-purple-600",
                        isReadOnly && "opacity-50 cursor-not-allowed hover:border-gray-200 hover:text-gray-500"
                      )}
                    >
                      Target
                    </button>
                  </div>
                ) : (
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                  )}>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                )}
              </div>

              <h3 className="font-bold text-gray-900 mb-2">{option.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{option.description}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comments
        </label>
        <textarea
          value={comment || ''}
          onChange={(e) => onCommentChange?.(e.target.value)}
          disabled={isReadOnly}
          placeholder="Add notes about this dimension..."
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          rows={3}
        />
      </div>
    </div>
  );
}
