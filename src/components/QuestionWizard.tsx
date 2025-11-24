import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSizingStore, useActiveScenario } from '../state/sizingStore';
import { DIMENSIONS } from '../domain/scoring';
import { DimensionQuestion } from './DimensionQuestion';
import { useState } from 'react';
import { GuidedWizard } from './GuidedWizard';

interface QuestionWizardProps {
  onComplete: () => void;
}

export function QuestionWizard({ onComplete }: QuestionWizardProps) {
  const { setScore, setTargetScore, goNext, goPrevious, setDimensionComment, isReadOnly } = useSizingStore();
  const { currentStep, scores, targetScores, mode, scenario } = useActiveScenario();
  const [isGuided, setIsGuided] = useState(false);

  if (isGuided) {
    return (
      <GuidedWizard 
        onComplete={onComplete} 
        onExitGuidedMode={() => setIsGuided(false)} 
      />
    );
  }

  const currentDimension = DIMENSIONS[currentStep];
  const currentScore = scores[currentDimension.id] ?? null;
  const targetScore = targetScores[currentDimension.id] ?? null;
  const currentComment = scenario?.dimensionComments?.[currentDimension.id] || '';
  
  const isLastStep = currentStep === DIMENSIONS.length - 1;
  
  const canProceed = mode === 'compare'
    ? currentScore !== null && targetScore !== null
    : currentScore !== null;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      goNext();
    }
  };

  const progress = mode === 'compare'
    ? Math.round(((currentStep + (currentScore && targetScore ? 1 : 0)) / DIMENSIONS.length) * 100)
    : Math.round(((currentStep + (currentScore ? 1 : 0)) / DIMENSIONS.length) * 100);

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Subtle Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <motion.div 
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-2">
          <span>Question {currentStep + 1} of {DIMENSIONS.length}</span>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsGuided(true)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Switch to Guided Mode
            </button>
            <span>{progress}% Completed</span>
          </div>
        </div>
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
            options={currentDimension.options}
            value={currentScore}
            targetValue={targetScore}
            mode={mode}
            onChange={(val) => setScore(currentDimension.id, val)}
            onTargetChange={(val) => setTargetScore(currentDimension.id, val)}
            comment={currentComment}
            onCommentChange={(val) => setDimensionComment(currentDimension.id, val)}
            isReadOnly={isReadOnly}
          />
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 flex items-center justify-between pt-6 border-t border-gray-100">
        <button
          onClick={goPrevious}
          disabled={currentStep === 0}
          aria-label="Go to previous question"
          className="flex items-center gap-2 px-6 py-3 text-gray-600 font-medium rounded-lg hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed}
          aria-label={isLastStep ? "View results" : "Go to next question"}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
