import { useEffect } from 'react';
import { Layout } from './components/Layout';
import { ArrowRight, CheckCircle2, Eye } from 'lucide-react';
import { useSizingStore } from './state/sizingStore';
import { QuestionWizard } from './components/QuestionWizard';
import { ResultsView } from './components/ResultsView';
import { PortfolioView } from './components/PortfolioView';
import { KnowledgeHub } from './components/KnowledgeHub';
import { decodeScenario } from './utils/share';
import { CoachModeOverlay } from './components/CoachModeOverlay';
import { ReportPrintView } from './components/ReportPrintView';

function App() {
  // Check for print mode immediately
  const isPrintMode = new URLSearchParams(window.location.search).get('print') === 'true';

  if (isPrintMode) {
    return <ReportPrintView />;
  }

  const { 
    resetActiveScenario, 
    setCurrentStep, 
    importScenario, 
    setReadOnly, 
    isReadOnly, 
    setCoachMode, 
    activeScenarioId,
    currentView: view,
    setView
  } = useSizingStore();

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
    resetActiveScenario();
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
    setCurrentStep(0);
    setView('wizard');
  };

  return (
    <Layout 
      showSidebar={true}
      onLogoClick={() => setView('intro')}
    >
      <CoachModeOverlay view={view} />
      {isReadOnly && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-sm text-blue-800 flex items-center justify-center gap-2">
          <Eye className="w-4 h-4" />
          <span>Viewing shared scenario in read-only mode</span>
          <button 
            onClick={handleRestart}
            className="ml-4 underline hover:text-blue-900"
          >
            Start New Assessment
          </button>
        </div>
      )}
      {view === 'intro' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-500">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to the Workshop</h2>
              <p className="mt-2 text-gray-600">
                Start a new assessment to size your Copilot Studio agent deployment.
              </p>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Assess 8 Dimensions</h3>
                    <p className="text-gray-600 mt-1">Evaluate your project across key areas like business scope, complexity, and data sensitivity.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">2</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Get T-Shirt Sizing</h3>
                    <p className="text-gray-600 mt-1">Receive an immediate Small, Medium, or Large classification for your deployment.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">3</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Architecture Recommendations</h3>
                    <p className="text-gray-600 mt-1">Get tailored advice on agent patterns and implementation strategies.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Start?</h3>
                <p className="text-gray-600 mb-6 text-sm">Estimated time: 5-10 minutes</p>
                <button 
                  onClick={handleStart}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto shadow-sm hover:shadow"
                >
                  Start New Assessment
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'portfolio' && (
        <PortfolioView onBack={() => setView('intro')} />
      )}

      {view === 'knowledge' && (
        <KnowledgeHub 
          onNavigateToResults={() => setView('results')} 
          hasResults={!!activeScenarioId} 
        />
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
