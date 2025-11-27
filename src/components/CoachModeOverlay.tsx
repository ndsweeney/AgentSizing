import { useState, useEffect } from 'react';
import { Lightbulb, X, MessageCircle, AlertTriangle, HelpCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { useSizingStore } from '../state/sizingStore';
import { COACH_CONTENT } from '../domain/coachContent';
import { DIMENSIONS } from '../domain/scoring';
import { cn } from '../utils/cn';

interface CoachModeOverlayProps {
  view: 'intro' | 'wizard' | 'results' | 'portfolio' | 'knowledge';
}

export function CoachModeOverlay({ view }: CoachModeOverlayProps) {
  const { isCoachMode, scenarios, activeScenarioId } = useSizingStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTipIndex, setActiveTipIndex] = useState(0);

  const activeScenario = scenarios.find(s => s.id === activeScenarioId);
  const currentStep = activeScenario?.currentStep || 0;

  if (!isCoachMode) return null;

  // Filter content based on context
  const relevantContent = COACH_CONTENT.filter(tip => {
    if (tip.context === 'general') return true;
    
    if (view === 'wizard') {
      if (tip.context === 'wizard') return true;
      if (tip.context === 'dimension') {
        // Map step to dimension
        const currentDimension = DIMENSIONS[currentStep];
        return currentDimension && tip.dimensionId === currentDimension.id;
      }
    }

    if (view === 'results' && tip.context === 'results') return true;

    return false;
  });

  if (relevantContent.length === 0) return null;

  const currentTip = relevantContent[activeTipIndex] || relevantContent[0];

  const handleNext = () => {
    setActiveTipIndex((prev) => (prev + 1) % relevantContent.length);
  };

  const handlePrev = () => {
    setActiveTipIndex((prev) => (prev - 1 + relevantContent.length) % relevantContent.length);
  };

  // Reset index when content changes significantly
  useEffect(() => {
    setActiveTipIndex(0);
  }, [view, currentStep]);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 dark:bg-indigo-500 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all animate-in fade-in slide-in-from-bottom-4"
        title="Open Coach Mode"
      >
        <Lightbulb className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border-2 border-indigo-100 dark:border-indigo-900 overflow-hidden animate-in fade-in slide-in-from-bottom-4 flex flex-col">
      {/* Header */}
      <div className="bg-indigo-600 dark:bg-indigo-900 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-300" />
          <h3 className="font-bold">Consultant Coach</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-indigo-500 dark:bg-indigo-800 px-2 py-0.5 rounded text-indigo-100 dark:text-indigo-200">
            {activeTipIndex + 1} / {relevantContent.length}
          </span>
          <button 
            onClick={() => setIsExpanded(false)}
            className="hover:bg-indigo-500 dark:hover:bg-indigo-800 p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-gradient-to-b from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-800 min-h-[200px]">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            {currentTip.type === 'question' && <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            {currentTip.type === 'steering' && <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />}
            {currentTip.type === 'pitfall' && <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />}
            {currentTip.type === 'tip' && <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />}
            
            <span className={cn(
              "text-xs font-bold uppercase tracking-wider",
              currentTip.type === 'question' && "text-blue-600 dark:text-blue-400",
              currentTip.type === 'steering' && "text-green-600 dark:text-green-400",
              currentTip.type === 'pitfall' && "text-red-600 dark:text-red-400",
              currentTip.type === 'tip' && "text-yellow-600 dark:text-yellow-400",
            )}>
              {currentTip.type}
            </span>
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{currentTip.title}</h4>
          <p className="text-gray-700 dark:text-slate-300 leading-relaxed text-sm">
            {currentTip.content}
          </p>
        </div>
      </div>

      {/* Footer / Navigation */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex justify-between items-center">
        <button 
          onClick={handlePrev}
          className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-slate-400 transition-colors"
          disabled={relevantContent.length <= 1}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex gap-1">
          {relevantContent.map((_, idx) => (
            <div 
              key={idx}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                idx === activeTipIndex ? "bg-indigo-600 dark:bg-indigo-400" : "bg-gray-300 dark:bg-slate-600"
              )}
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-slate-400 transition-colors"
          disabled={relevantContent.length <= 1}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
