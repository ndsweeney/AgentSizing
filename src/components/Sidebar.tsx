import { useState } from 'react';
import { CheckCircle2, Plus, Copy, Trash2, Edit2, FolderOpen, ArrowRightLeft, LayoutTemplate, FlaskConical, Home, LayoutDashboard, BookOpen } from 'lucide-react';
import { useSizingStore, useActiveScenario } from '../state/sizingStore';
import { DIMENSIONS } from '../domain/scoring';
import { cn } from '../utils/cn';
import { WorkshopMetadata } from './WorkshopMetadata';
import { TemplateSelector } from './TemplateSelector';

export function Sidebar() {
  const { 
    setCurrentStep, 
    createScenario, 
    createFromTemplate, 
    createSimulation, 
    deleteScenario, 
    duplicateScenario, 
    renameScenario, 
    setActiveScenario, 
    setMode, 
    scenarios, 
    activeScenarioId,
    currentView,
    setView
  } = useSizingStore();
  const { currentStep, scores, targetScores, mode } = useActiveScenario();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      renameScenario(editingId, editName.trim());
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Main Navigation */}
      <div className="space-y-1">
        <button
          onClick={() => setView('intro')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
            currentView === 'intro' ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <Home className="w-4 h-4" />
          Home
        </button>
        <button
          onClick={() => setView('portfolio')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
            currentView === 'portfolio' ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          Portfolio
        </button>
        <button
          onClick={() => setView('knowledge')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
            currentView === 'knowledge' ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <BookOpen className="w-4 h-4" />
          Knowledge Hub
        </button>
      </div>

      <div className="h-px bg-gray-200" />

      <WorkshopMetadata />

      {/* Scenario Management */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <FolderOpen className="w-3 h-3" />
            Scenarios
          </h2>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowTemplates(true)}
              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"
              title="New from Template"
            >
              <LayoutTemplate className="w-4 h-4" />
            </button>
            <button 
              onClick={() => createScenario()}
              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"
              title="New Scenario"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={() => createSimulation()}
              className="p-1.5 hover:bg-purple-50 text-purple-600 rounded-md transition-colors"
              title="New Simulation"
            >
              <FlaskConical className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {scenarios.map((scenario) => (
            <div 
              key={scenario.id}
              className={cn(
                "group flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all",
                scenario.id === activeScenarioId 
                  ? "bg-white text-blue-900 font-medium shadow-sm ring-1 ring-gray-200" 
                  : "text-gray-600 hover:bg-gray-100 border border-transparent"
              )}
            >
              {editingId === scenario.id ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-white border border-blue-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setActiveScenario(scenario.id)}
                    className="flex-1 text-left truncate mr-2 flex items-center gap-2"
                  >
                    {scenario.isSimulation && <FlaskConical className="w-3 h-3 text-purple-500" />}
                    {scenario.name}
                  </button>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartEdit(scenario.id, scenario.name)}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => duplicateScenario(scenario.id)}
                      className="p-1 text-gray-400 hover:text-green-600 rounded"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {scenarios.length > 1 && (
                      <button
                        onClick={() => deleteScenario(scenario.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Steps */}
      <div>
        <div className="mb-4 px-2 flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Progress
          </h2>
          <button
            onClick={() => setMode(mode === 'single' ? 'compare' : 'single')}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all border shadow-sm",
              mode === 'compare'
                ? "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
            )}
            title="Toggle Comparison Mode"
          >
            <ArrowRightLeft className="w-3 h-3" />
            {mode === 'compare' ? 'Compare' : 'Single'}
          </button>
        </div>
        
        <nav className="space-y-0.5">
          {DIMENSIONS.map((dim, index) => {
            const isCurrentCompleted = scores[dim.id] !== undefined && scores[dim.id] !== null;
            const isTargetCompleted = targetScores[dim.id] !== undefined && targetScores[dim.id] !== null;
            
            const isCompleted = mode === 'compare' 
              ? isCurrentCompleted && isTargetCompleted
              : isCurrentCompleted;
              
            const isCurrent = currentStep === index;
            const isClickable = isCompleted || isCurrent;

            return (
              <button
                key={dim.id}
                onClick={() => isClickable && setCurrentStep(index)}
                disabled={!isClickable}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 text-left group",
                  isCurrent 
                    ? "bg-white text-blue-700 shadow-sm ring-1 ring-gray-200" 
                    : isCompleted
                      ? "text-gray-600 hover:bg-gray-100"
                      : "text-gray-400 cursor-not-allowed"
                )}
              >
                <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center bg-white">
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center text-[10px] text-gray-400 font-medium bg-gray-50">
                      {index + 1}
                    </div>
                  )}
                </div>
                <span className="truncate">{dim.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-4 py-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <h3 className="text-sm font-bold text-blue-900 mb-1">Sizing Guide</h3>
        <p className="text-xs text-blue-700 mb-3 leading-relaxed">
          Need help understanding the dimensions? Check our detailed guide for examples.
        </p>
        <button className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
          View Definitions →
        </button>
      </div>
      <TemplateSelector 
        isOpen={showTemplates} 
        onClose={() => setShowTemplates(false)}
        onSelect={(template) => {
          createFromTemplate(template);
          setShowTemplates(false);
        }}
      />
    </div>
  );
}
