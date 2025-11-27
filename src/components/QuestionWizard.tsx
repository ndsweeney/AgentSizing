import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSizingStore, useActiveScenario } from '../state/sizingStore';
import { DIMENSIONS, type ScoreValue, type DimensionId } from '../domain/scoring';
import { MATURITY_DIMENSIONS, type MaturityLevel } from '../domain/maturity';
import { DimensionQuestion } from './DimensionQuestion';
import { useState } from 'react';
import { GuidedWizard } from './GuidedWizard';

interface QuestionWizardProps {
  onComplete: () => void;
}

export function QuestionWizard({ onComplete }: QuestionWizardProps) {
  const { setScore, setTargetScore, setMaturityScore, goNext, goPrevious, setDimensionComment, isReadOnly } = useSizingStore();
  const { currentStep, scores, targetScores, maturityScores, mode, scenario } = useActiveScenario();
  const [isGuided, setIsGuided] = useState(false);

  if (isGuided) {
    return (
      <GuidedWizard 
        onComplete={onComplete} 
        onExitGuidedMode={() => setIsGuided(false)} 
      />
    );
  }

  const totalSteps = DIMENSIONS.length + MATURITY_DIMENSIONS.length;
  const isMaturityStep = currentStep >= DIMENSIONS.length;
  
  let currentDimension;
  let currentScore: ScoreValue | null = null;
  let targetScore: ScoreValue | null = null;
  let currentComment = '';

  if (isMaturityStep) {
    const maturityIndex = currentStep - DIMENSIONS.length;
    currentDimension = MATURITY_DIMENSIONS[maturityIndex];
    // Cast maturity score (1|2|3) to ScoreValue (1|2|3) as they are compatible
    currentScore = (maturityScores?.[currentDimension.id] as ScoreValue) ?? null;
  } else {
    currentDimension = DIMENSIONS[currentStep];
    currentScore = scores[currentDimension.id] ?? null;
    targetScore = targetScores[currentDimension.id] ?? null;
    currentComment = scenario?.dimensionComments?.[currentDimension.id] || '';
  }
  
  const isLastStep = currentStep === totalSteps - 1;
  
  const canProceed = isMaturityStep
    ? currentScore !== null
    : mode === 'compare'
      ? currentScore !== null && targetScore !== null
      : currentScore !== null;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      goNext();
    }
  };

  const progress = Math.round(((currentStep) / totalSteps) * 100);

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Subtle Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-slate-800 z-50">
        <motion.div 
          className="h-full bg-blue-600 dark:bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          <span>Question {currentStep + 1} of {totalSteps}</span>
          <div className="flex items-center gap-4">
            {!isMaturityStep && (
              <button 
                onClick={() => setIsGuided(true)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                Switch to Guided Mode
              </button>
            )}
            <span>{progress}% Completed</span>
          </div>
        </div>
        {isMaturityStep && (
           <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
             <strong>Org Maturity Assessment:</strong> These questions help assess your organization's readiness.
           </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentDimension.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <DimensionQuestion
            dimensionId={currentDimension.id}
            label={currentDimension.label}
            description={currentDimension.description}
            options={currentDimension.options as any}
            value={currentScore}
            targetValue={isMaturityStep ? undefined : targetScore}
            mode={isMaturityStep ? 'single' : mode}
            onChange={(val) => {
              if (isMaturityStep) {
                setMaturityScore(currentDimension.id, val as MaturityLevel);
              } else {
                setScore(currentDimension.id as DimensionId, val);
              }
            }}
            onTargetChange={(val) => !isMaturityStep && setTargetScore(currentDimension.id as DimensionId, val)}
            comment={isMaturityStep ? undefined : currentComment}
            onCommentChange={(val) => !isMaturityStep && setDimensionComment(currentDimension.id as DimensionId, val)}
            isReadOnly={isReadOnly}
          />
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 flex items-center justify-between pt-6 border-t border-gray-100 dark:border-slate-700">
        <button
          onClick={goPrevious}
          disabled={currentStep === 0}
          aria-label="Go to previous question"
          className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-slate-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed}
          aria-label={isLastStep ? "View results" : "Go to next question"}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2"
        >
          {isLastStep ? (
            <>
              View Results
              <Check className="w-4 h-4" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
