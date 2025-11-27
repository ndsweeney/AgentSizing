import { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { ArrowRight, CheckCircle2, Eye, Clock, Trash2, LayoutTemplate } from 'lucide-react';
import { useSizingStore } from './state/sizingStore';
import { DIMENSIONS } from './domain/scoring';
import { QuestionWizard } from './components/QuestionWizard';
import { ResultsView } from './components/ResultsView';
import { PortfolioView } from './components/PortfolioView';
import { KnowledgeHub } from './components/KnowledgeHub';
import { decodeScenario } from './utils/share';
import { CoachModeOverlay } from './components/CoachModeOverlay';
import { ReportPrintView } from './components/ReportPrintView';
import { WorkshopIntake } from './components/WorkshopIntake';
import { TemplateSelector } from './components/TemplateSelector';

function App() {
  // Check for print mode immediately
  const isPrintMode = new URLSearchParams(window.location.search).get('print') === 'true';

  if (isPrintMode) {
    return <ReportPrintView />;
  }

  const { 
    scenarios,
    setActiveScenario,
    resetActiveScenario, 
    createScenario,
    importScenario, 
    setReadOnly, 
    isReadOnly, 
    setCoachMode, 
    activeScenarioId,
    currentView: view,
    setView,
    deleteScenario,
    theme,
    createFromTemplate
  } = useSizingStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  const [showTemplates, setShowTemplates] = useState(false);
  const [newWorkshopDetails, setNewWorkshopDetails] = useState({
    workshopTitle: '',
    facilitatorName: '',
    customerName: '',
    industry: '',
    useCase: ''
  });

  const isReadyToStart = newWorkshopDetails.workshopTitle?.trim() && 
    newWorkshopDetails.customerName?.trim() && 
    newWorkshopDetails.facilitatorName?.trim() && 
    newWorkshopDetails.industry && 
    newWorkshopDetails.useCase?.trim();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const share = params.get('share');
    const coach = params.get('coach');

    if (coach === 'true') {
      setCoachMode(true);
    }

    if (share) {
      const scenario = decodeScenario(share);
      if (scenario) {
        importScenario(scenario);
        setReadOnly(true);
        // Force disable coach mode in read-only/share links
        setCoachMode(false);
        setView('results');
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + C to toggle coach mode
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        setCoachMode(!useSizingStore.getState().isCoachMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStart = () => {
    setReadOnly(false);
    createScenario(newWorkshopDetails.workshopTitle || 'New Scenario', newWorkshopDetails);
    // Reset form
    setNewWorkshopDetails({
      workshopTitle: '',
      facilitatorName: '',
      customerName: '',
      industry: '',
      useCase: ''
    });
    setView('wizard');
  };

  const handleComplete = () => {
    setView('results');
  };

  const handleRestart = () => {
    setReadOnly(false);
    resetActiveScenario();
    setView('intro');
  };

  const handleEdit = () => {
    // Don't reset step to 0, let them continue where they left off
    setView('wizard');
  };

  const handleOpenScenario = (id: string) => {
    setActiveScenario(id);
    const target = scenarios.find(s => s.id === id);
    if (target) {
      const isComplete = DIMENSIONS.every(d => target.scores[d.id]);
      setView(isComplete ? 'results' : 'wizard');
    }
  };

  const recentScenarios = [...scenarios].sort((a, b) => b.lastUpdated - a.lastUpdated).slice(0, 3);

  return (
    <Layout 
      onLogoClick={() => setView('intro')}
    >
      <CoachModeOverlay view={view} />
      {isReadOnly && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-sm text-blue-800 flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" />
          <span>Viewing shared scenario in read-only mode</span>
          <button 
            onClick={handleStart}
            className="ml-4 underline hover:text-blue-900"
          >
            Start New Assessment
          </button>
        </div>
      )}
      {view === 'intro' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden animate-in fade-in duration-500 transition-colors">
          <div className="p-8 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to the Agent Sizing Workshop</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Start a new assessment to help size your agent deployment.
              </p>
            </div>
          </div>
          
          <div className="p-8">
            <WorkshopIntake 
              values={newWorkshopDetails}
              onChange={(field, value) => setNewWorkshopDetails(prev => ({ ...prev, [field]: value }))}
            />

            {/* Start New Assessment Card */}
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-6 border border-gray-200 dark:border-slate-700 flex items-center justify-between mb-8 transition-colors">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center flex-shrink-0 transition-colors">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Start New Assessment</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Create a new scenario to size another agent deployment
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowTemplates(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  <LayoutTemplate className="w-4 h-4" />
                  Start from Template
                </button>
                <button 
                  onClick={handleStart}
                  disabled={!isReadyToStart}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap ${
                    isReadyToStart
                      ? "bg-blue-600 text-white hover:bg-blue-700" 
                      : "bg-gray-300 dark:bg-slate-800/50 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Start New
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold transition-colors">1</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assess Multiple Dimensions</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Evaluate your project across key areas like business scope, complexity, and data sensitivity.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold transition-colors">2</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Get T-Shirt Sizing</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Receive an immediate Small, Medium, or Large classification for your deployment.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold transition-colors">3</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Architecture Recommendations</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Get tailored advice on agent patterns and implementation strategies.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Recent Assessments List */}
                {recentScenarios.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm transition-colors">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Assessments</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{scenarios.length} total</span>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-slate-700 max-h-[300px] overflow-y-auto">
                      {recentScenarios.map(s => {
                        const isCurrent = s.id === activeScenarioId;
                        return (
                          <div 
                            key={s.id} 
                            onClick={() => handleOpenScenario(s.id)}
                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group cursor-pointer ${isCurrent ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                          >
                            <div className="min-w-0 flex-1 mr-4">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-gray-900 dark:text-white truncate text-sm">{s.name}</div>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                                    Active
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(s.lastUpdated).toLocaleDateString()}
                                </span>
                                <span>•</span>
                                <span>{s.mode === 'compare' ? 'Gap Analysis' : 'Standard'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Are you sure you want to delete this assessment?')) {
                                    deleteScenario(s.id);
                                  }
                                }}
                                disabled={scenarios.length <= 1}
                                className={`p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
                                  scenarios.length <= 1 
                                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                                    : 'text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
                                }`}
                                title={scenarios.length <= 1 ? "Cannot delete the last assessment" : "Delete Assessment"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-all"
                                title="Open Assessment"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}


              </div>
            </div>
          </div>
        </div>
      )}

      <TemplateSelector 
        isOpen={showTemplates} 
        onClose={() => setShowTemplates(false)}
        onSelect={(template) => {
          createFromTemplate(template);
          setShowTemplates(false);
          setView('results');
        }}
      />

      {view === 'portfolio' && (
        <PortfolioView onBack={() => setView('intro')} />
      )}

      {view === 'knowledge' && (
        <KnowledgeHub />
      )}

      {view === 'wizard' && (
        <QuestionWizard onComplete={handleComplete} />
      )}

      {view === 'results' && (
        <ResultsView onRestart={handleRestart} onEdit={handleEdit} />
      )}
    </Layout>
  )
}

export default App
