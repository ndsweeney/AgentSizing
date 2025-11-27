import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, HelpCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSizingStore, useActiveScenario } from '../state/sizingStore';
import { DIMENSIONS } from '../domain/scoring';
import { GUIDED_TREES } from '../domain/guidedQuestions';

interface GuidedWizardProps {
  onComplete: () => void;
  onExitGuidedMode: () => void;
}

export function GuidedWizard({ onComplete, onExitGuidedMode }: GuidedWizardProps) {
  const { setScore, goNext, goPrevious, setDimensionComment } = useSizingStore();
  const { currentStep, scores, scenario } = useActiveScenario();

  const currentDimension = DIMENSIONS[currentStep];
  const tree = GUIDED_TREES[currentDimension.id];
  
  // Local state for navigation within the tree
  const [currentQuestionId, setCurrentQuestionId] = useState<string>(tree?.rootQuestionId || '');
  const [historyStack, setHistoryStack] = useState<string[]>([]);

  // Reset state when dimension changes
  useEffect(() => {
    if (tree) {
      setCurrentQuestionId(tree.rootQuestionId);
      setHistoryStack([]);
    }
  }, [currentDimension.id, tree]);

  const currentScore = scores[currentDimension.id];
  const currentComment = scenario?.dimensionComments?.[currentDimension.id];

  const handleAnswer = (answer: any) => {
    if (answer.resultScore) {
      // Final answer for this dimension
      setScore(currentDimension.id, answer.resultScore);
      if (answer.explanation) {
        setDimensionComment(currentDimension.id, answer.explanation);
      }
    } else if (answer.nextQuestionId) {
      // Move to next question
      setHistoryStack(prev => [...prev, currentQuestionId]);
      setCurrentQuestionId(answer.nextQuestionId);
    }
  };

  const handleBack = () => {
    if (currentScore !== undefined && currentScore !== null) {
      // If we are viewing the result, Back goes to the previous dimension
      if (currentStep > 0) {
        goPrevious();
      }
    } else if (historyStack.length > 0) {
      // Go back one question
      const prevQuestion = historyStack[historyStack.length - 1];
      setHistoryStack(prev => prev.slice(0, -1));
      setCurrentQuestionId(prevQuestion);
    } else {
      // Go back to previous dimension
      if (currentStep > 0) {
        goPrevious();
      }
    }
  };

  const handleRetake = () => {
    setScore(currentDimension.id, null as any); // Clear score
    setDimensionComment(currentDimension.id, '');
    setCurrentQuestionId(tree.rootQuestionId);
    setHistoryStack([]);
  };

  const handleNextDimension = () => {
    if (currentStep === DIMENSIONS.length - 1) {
      onComplete();
    } else {
      goNext();
    }
  };

  if (!tree) {
    return (
      <div className="text-center p-8">
        <p className="dark:text-slate-300">No guided questions available for this dimension.</p>
        <button onClick={onExitGuidedMode} className="text-blue-600 dark:text-blue-400 underline mt-4">
          Switch to Manual Mode
        </button>
      </div>
    );
  }

  const question = tree.questions[currentQuestionId];

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Progress Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-500 dark:text-slate-400">
          Step {currentStep + 1} of {DIMENSIONS.length}: <span className="text-gray-900 dark:text-white font-bold">{currentDimension.label}</span>
        </div>
        <button 
          onClick={onExitGuidedMode}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
        >
          Switch to Manual Mode
        </button>
      </div>

      <AnimatePresence mode="wait">
        {currentScore ? (
          // Result View
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentScore === 1 ? 'Small' : currentScore === 2 ? 'Medium' : 'Large'} Complexity
            </h3>
            <p className="text-gray-600 dark:text-slate-300 mb-8 max-w-lg mx-auto">
              {currentComment || "Based on your answers."}
            </p>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={handleRetake}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>
              <button
                onClick={handleNextDimension}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm"
              >
                {currentStep === DIMENSIONS.length - 1 ? 'Finish' : 'Next Dimension'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          // Question View
          <motion.div
            key={currentQuestionId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {question?.text}
              </h2>
              {question?.description && (
                <p className="text-gray-600 dark:text-slate-300 flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  {question.description}
                </p>
              )}
            </div>

            <div className="grid gap-4">
              {question?.answers.map((answer) => (
                <button
                  key={answer.id}
                  onClick={() => handleAnswer(answer)}
                  className="text-left p-6 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                >
                  <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 text-lg mb-1">
                    {answer.text}
                  </div>
                  {answer.explanation && (
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {answer.explanation}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-6 flex justify-start">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
