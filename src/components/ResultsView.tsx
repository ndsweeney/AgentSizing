import { useState } from 'react';
import { AlertTriangle, ArrowLeft, RefreshCw, FileText, Box, Check, ArrowRight, Users, ShieldAlert, HardHat, Bot, Plus, X, Code, FileJson, Factory, Share2, FlaskConical, LogOut } from 'lucide-react';
import { useHasCompletedAllDimensions, useActiveScenario, useSizingStore } from '../state/sizingStore';
import { calculateSizingResult, calculateRiskProfile, DIMENSIONS, type ScoreValue, DimensionId } from '../domain/scoring';
import { getRecommendations } from '../domain/rules';
import { buildSystemIntegrationMermaid } from '../domain/diagrams';
import { generateAgentSpecs, generateBuildPlan } from '../domain/generators';
import { downloadJson } from '../utils/export';
import { encodeScenario } from '../utils/share';
import { cn } from '../utils/cn';
import { MermaidDiagram } from './MermaidDiagram';
import { AgentDiagramsView } from './AgentDiagramsView';
import { ExampleDataView } from './ExampleDataView';
import { BlueprintsView } from './BlueprintsView';
import { TopicSkeletonsView } from './TopicSkeletonsView';
import { PromptsView } from './PromptsView';
import { ConnectorsView } from './ConnectorsView';
import { TestPlanView } from './TestPlanView';
import { GovernanceView } from './GovernanceView';
import { ArchitectureView } from './ArchitectureView';
import { DeliveryPlanView } from './DeliveryPlanView';
import { CostView } from './CostView';
import { retailTemplate, fsiTemplate, manufacturingTemplate, consultingTemplate, publicSectorTemplate } from '../templates';
import { SimulationDashboard } from './SimulationDashboard';
import { StarterPackView } from './StarterPackView';
import { AgentDebuggerView } from './AgentDebuggerView';
import { ComplianceHeatmapView } from './ComplianceHeatmapView';
import { MaturityAssessmentView } from './MaturityAssessmentView';
import { ValueRoadmapView } from './ValueRoadmapView';
import { ReportGeneratorView } from './ReportGeneratorView';
import { WorkshopIntake } from './WorkshopIntake';

type TabCategory = 'details' | 'strategy' | 'architecture' | 'build' | 'poc' | 'costs' | 'testing' | 'operate' | 'reporting';

const TABS_BY_CATEGORY: Record<TabCategory, { id: string; label: string }[]> = {
  details: [
    { id: 'details-info', label: 'Details' },
    { id: 'details-notes', label: 'Notes' },
    { id: 'details-breakdown', label: 'Breakdown' },
  ],
  strategy: [
    { id: 'maturity', label: 'Org Maturity' },
    { id: 'roadmap', label: 'Value Roadmap' },
    { id: 'compliance', label: 'Compliance Heatmap' },
    { id: 'governance', label: 'Governance' },
    { id: 'risks', label: 'Risk Controls' },
  ],
  architecture: [
    { id: 'architecture', label: 'System Architecture' },
    { id: 'integration', label: 'System Integration' },
    { id: 'diagrams', label: 'Agent Flow' },
    { id: 'copilot', label: 'Copilot Architecture' },
  ],
  build: [
    { id: 'blueprints', label: 'Agent Blueprints' },
    { id: 'skeletons', label: 'Topic Skeletons' },
    { id: 'prompts', label: 'LLM Prompts' },
    { id: 'connectors', label: 'Connectors & API Mocks' },
    { id: 'starter-pack', label: 'Starter Pack' },
  ],
  poc: [
    { id: 'data', label: 'Example Data' },
    { id: 'example-architecture', label: 'Example Architecture' },
  ],
  costs: [
    { id: 'costs', label: 'Cost Analysis' },
  ],
  testing: [
    { id: 'tests', label: 'Test Plan' },
  ],
  operate: [
    { id: 'debugger', label: 'Agent Debugger' },
  ],
  reporting: [
    { id: 'delivery', label: 'Delivery Plan' },
    { id: 'report', label: 'Final Report' },
  ]
};

interface ResultsViewProps {
  onRestart: () => void;
  onEdit: () => void;
}

export function ResultsView({ onRestart, onEdit }: ResultsViewProps) {
  const [copiedShare, setCopiedShare] = useState(false);
  const [newSystem, setNewSystem] = useState('');
  const [activeCategory, setActiveCategory] = useState<TabCategory>('details');
  const [activeTab, setActiveTab] = useState<'details-info' | 'details-notes' | 'details-breakdown' | 'architecture' | 'integration' | 'governance' | 'copilot' | 'diagrams' | 'data' | 'blueprints' | 'skeletons' | 'prompts' | 'connectors' | 'tests' | 'delivery' | 'costs' | 'starter-pack' | 'debugger' | 'compliance' | 'maturity' | 'roadmap' | 'report' | 'example-architecture' | 'risks'>('details-info');
  const { scores, targetScores, scenario, mode } = useActiveScenario();
  const { setSystems, updateMetadata, isReadOnly, createSimulation, setActiveScenario } = useSizingStore();
  const isComplete = useHasCompletedAllDimensions();

  if (scenario.isSimulation) {
    return <SimulationDashboard />;
  }

  const result = calculateSizingResult(scores);
  const riskProfile = calculateRiskProfile(scores);

  const targetResult = mode === 'compare' ? calculateSizingResult(targetScores) : null;

  const recommendations = getRecommendations(scores);

  const agentSpecs = generateAgentSpecs(result);
  const buildPlan = generateBuildPlan(result);

  const templates = [retailTemplate, fsiTemplate, manufacturingTemplate, consultingTemplate, publicSectorTemplate];
  const activeTemplate = templates.find(t => t.industry === scenario.industry);

  const handleAddSystem = () => {
    if (newSystem.trim()) {
      const currentSystems = scenario.systems || [];
      if (!currentSystems.includes(newSystem.trim())) {
        setSystems([...currentSystems, newSystem.trim()]);
      }
      setNewSystem('');
    }
  };

  const handleRemoveSystem = (systemToRemove: string) => {
    const currentSystems = scenario.systems || [];
    setSystems(currentSystems.filter(s => s !== systemToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSystem();
    }
  };

  const attributes = [
    (scores[DimensionId.WorkflowComplexity] || 0) >= 3 && { icon: HardHat, label: 'High Complexity', color: 'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400' },
    (scores[DimensionId.DataSensitivity] || 0) >= 3 && { icon: ShieldAlert, label: 'Sensitive Data', color: 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400' },
    (scores[DimensionId.UserReach] || 0) >= 3 && { icon: Users, label: 'High Reach', color: 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' },
    (scores[DimensionId.SystemsToIntegrate] || 0) >= 3 && { icon: Box, label: 'System Heavy', color: 'text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-400' },
  ].filter(Boolean) as { icon: any, label: string, color: string }[];

  const riskColor = riskProfile.level === 'HIGH' ? 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400' : 
             riskProfile.level === 'MEDIUM' ? 'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400' : 
             'text-green-700 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400';


  if (!isComplete) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-900/50 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-600 dark:text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-yellow-900 dark:text-yellow-100 mb-2">Assessment Incomplete</h2>
        <p className="text-yellow-700 dark:text-yellow-200 mb-6">
          Please answer all questions to see your sizing results.
        </p>
        <button
          onClick={onEdit}
          className="px-6 py-2 bg-yellow-600 dark:bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors"
        >
          Continue Assessment
        </button>
      </div>
    );
  }

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'SMALL': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400';
      case 'MEDIUM': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400';
      case 'LARGE': return 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-400';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400';
    }
  };


  const getScoreLabel = (val: ScoreValue | null) => {
    if (val === 1) return 'Small';
    if (val === 2) return 'Medium';
    if (val === 3) return 'Large';
    return '-';
  };

  const handleShare = () => {
    const encoded = encodeScenario(scenario);
    const url = new URL(window.location.href);
    url.searchParams.set('share', encoded);
    navigator.clipboard.writeText(url.toString());
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleExportBuildPlan = () => {
    downloadJson(buildPlan, 'copilot-build-plan.json');
  };

  const getRoadmapSuggestions = () => {
    if (mode !== 'compare' || !targetResult) return [];
    
    const suggestions: { dimension: string; current: number; target: number; advice: string }[] = [];
    
    DIMENSIONS.forEach(dim => {
      const current = scores[dim.id] || 0;
      const target = targetScores[dim.id] || 0;
      
      if (target > current) {
        let advice = "";
        switch (dim.id) {
          case 'businessScope':
            advice = "Define clear boundaries and governance to prevent scope creep as business scope expands.";
            break;
          case 'agentCountAndTypes':
            advice = "Adopt orchestration patterns (e.g., Router-Solver) to handle increased agent complexity.";
            break;
          case 'systemsToIntegrate':
            advice = "Implement robust API gateways, error handling, and circuit breakers for new integrations.";
            break;
          case 'workflowComplexity':
            advice = "Break down complex workflows into smaller, manageable sub-agents or state machines.";
            break;
          case 'dataSensitivity':
            advice = "Implement PII masking, strict RBAC, and audit logging as data sensitivity increases.";
            break;
          case 'userReach':
            advice = "Scale infrastructure and optimize for concurrency to handle broader user reach.";
            break;
          case 'changeAndAdoption':
            advice = "Invest heavily in user training, documentation, and change management programs.";
            break;
          case 'platformMix':
            advice = "Ensure consistent user experience across all supported platforms and channels.";
            break;
          default:
            advice = "Review governance policies for this dimension.";
        }
        suggestions.push({ dimension: dim.label, current, target, advice });
      }
    });
    
    return suggestions;
  };

  const roadmap = getRoadmapSuggestions();

  const systemIntegrationDiagram = buildSystemIntegrationMermaid(result, scenario.systems || []);

  return (
    <div className="max-w-full mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{scenario.workshopTitle || scenario.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {mode === 'compare' ? 'Gap Analysis: Current vs Target' : 'Assessment Results'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm"
          >
            {copiedShare ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copiedShare ? 'Link Copied!' : 'Share Results'}
          </button>
        </div>
      </div>

      {/* Hero Result Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-8">
          {mode === 'compare' && targetResult ? (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              {/* Current State */}
              <div className="text-center">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Current State</div>
                <div className={cn(
                  "w-32 h-32 mx-auto flex items-center justify-center rounded-2xl border-4 text-4xl font-bold shadow-sm mb-4 transition-all",
                  getSizeColor(result.tShirtSize)
                )}>
                  {result.tShirtSize}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Score: <span className="font-bold text-gray-900 dark:text-white">{result.totalScore}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
                <ArrowRight className="w-8 h-8" />
                <span className="text-[10px] font-bold uppercase mt-1 tracking-widest">Target</span>
              </div>

              {/* Target State */}
              <div className="text-center">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Target State</div>
                <div className={cn(
                  "w-32 h-32 mx-auto flex items-center justify-center rounded-2xl border-4 text-4xl font-bold shadow-sm mb-4 transition-all",
                  getSizeColor(targetResult.tShirtSize)
                )}>
                  {targetResult.tShirtSize}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Score: <span className="font-bold text-gray-900 dark:text-white">{targetResult.totalScore}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row items-start justify-end gap-4">
                 {attributes.length > 0 && (
                   <div className="flex flex-wrap justify-center md:justify-end gap-2">
                     {attributes.map((attr, i) => (
                       <div key={i} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors", attr.color)}>
                         <attr.icon className="w-4 h-4" />
                         {attr.label}
                       </div>
                     ))}
                   </div>
                 )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8 overflow-x-auto pb-4">
                    <div className={cn(
                      "w-48 h-36 flex flex-col items-center justify-center rounded-2xl border-4 shadow-sm transition-all flex-shrink-0",
                      getSizeColor(result.tShirtSize)
                    )}>
                      <span className="text-4xl font-bold">{result.tShirtSize}</span>
                      <span className="text-xs font-medium opacity-80 uppercase tracking-wider mt-1 text-center px-2">Estimated Deployment Size</span>
                    </div>

                    <div className={cn(
                      "w-48 h-36 flex flex-col items-center justify-center rounded-2xl border-4 shadow-sm transition-all flex-shrink-0",
                      riskColor
                    )}>
                      <span className="text-4xl font-bold">{riskProfile.level}</span>
                      <span className="text-sm font-medium opacity-80 uppercase tracking-wider mt-1">Risk</span>
                    </div>

                    <div className="w-48 h-36 flex flex-col items-center justify-center rounded-2xl border-4 border-gray-100 dark:border-slate-700 shadow-sm transition-all bg-white dark:bg-slate-800 px-4 flex-shrink-0">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-baseline gap-2">
                        {result.totalScore} <span className="text-lg text-gray-400 font-normal">/ {DIMENSIONS.length * 3}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Complexity Score
                      </p>
                      
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000 ease-out",
                            result.totalScore > 20 ? "bg-purple-500" : result.totalScore > 10 ? "bg-blue-500" : "bg-green-500"
                          )}
                          style={{ width: `${(result.totalScore / (DIMENSIONS.length * 3)) * 100}%` }}
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (scenario.isSimulation && scenario.originalScenarioId) {
                          setActiveScenario(scenario.originalScenarioId);
                        } else {
                          createSimulation();
                        }
                      }}
                      className="w-48 h-36 flex flex-col items-center justify-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-4 border-purple-200 dark:border-purple-800 rounded-2xl text-lg font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors shadow-sm flex-shrink-0 sm:ml-auto"
                    >
                      {scenario.isSimulation ? (
                        <>
                          <LogOut className="w-8 h-8 mb-1" />
                          Exit Simulation
                        </>
                      ) : (
                        <>
                          <FlaskConical className="w-8 h-8 mb-1" />
                          Simulate Changes
                        </>
                      )}
                    </button>
              </div>
            </div>
          )}
        </div>
        
        {result.notes.length > 0 && (
          <div className="bg-gray-50 dark:bg-slate-900/50 px-8 py-6 border-t border-gray-100 dark:border-slate-700">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Key Considerations
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {result.notes.map((note, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-100 dark:border-slate-700 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{note}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Roadmap Suggestions (Compare Mode Only) */}
      {mode === 'compare' && roadmap.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-900/20">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Transition Roadmap
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {roadmap.map((item, idx) => (
              <div key={idx} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{item.dimension}</span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{getScoreLabel(item.current as ScoreValue)}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                    <span className="font-medium text-blue-600 dark:text-blue-400">{getScoreLabel(item.target as ScoreValue)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.advice}</p>
              </div>
            ))}
          </div>
        </div>
      )}










      {/* Diagrams Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
          {/* Category Navigation */}
          <div className="px-6 py-4 flex gap-2 overflow-x-auto border-b border-gray-100 dark:border-slate-700">
            {(Object.keys(TABS_BY_CATEGORY) as TabCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setActiveTab(TABS_BY_CATEGORY[category][0].id as any);
                }}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                  activeCategory === category
                    ? "bg-blue-600 dark:bg-blue-500 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:border-slate-600"
                )}
              >
                {category === 'details' ? 'Workshop Details' : category}
              </button>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto px-2">
            {TABS_BY_CATEGORY[activeCategory].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-white dark:bg-slate-800 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'details-info' && (
          <div className="p-6">
            <WorkshopIntake 
              className="shadow-none border-0 p-0 mb-0 bg-transparent" 
              hideTitle 
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block pl-1">Date Created</label>
                <div className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  {new Date(scenario.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details-notes' && (
          <div className="p-6">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Workshop Notes</label>
            <textarea
              value={scenario.notes || ''}
              onChange={(e) => updateMetadata('notes', e.target.value)}
              disabled={isReadOnly}
              placeholder="Add overall workshop notes, conclusions, or next steps..."
              className="w-full p-4 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 min-h-[300px]"
            />
          </div>
        )}

        {activeTab === 'details-breakdown' && (
          <div className="p-6">
            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Detailed Breakdown</h4>
            <div className="divide-y divide-gray-100 dark:divide-slate-700 border-t border-b border-gray-100 dark:border-slate-700">
              {DIMENSIONS.map((dim) => {
                const val = scores[dim.id];
                const targetVal = mode === 'compare' ? targetScores[dim.id] : null;
                
                return (
                  <div key={dim.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{dim.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{dim.description}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      {mode === 'compare' && targetVal !== null ? (
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Now</span>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium border",
                              val === 1 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" :
                              val === 2 ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" :
                              val === 3 ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800" :
                              "bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-700"
                            )}>
                              {getScoreLabel(val ?? null)}
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                          <div className="flex flex-col items-start">
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Target</span>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium border",
                              targetVal === 1 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" :
                              targetVal === 2 ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" :
                              targetVal === 3 ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800" :
                              "bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-700"
                            )}>
                              {getScoreLabel(targetVal ?? null)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium border",
                            val === 1 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" :
                            val === 2 ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" :
                            val === 3 ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800" :
                            "bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-700"
                          )}>
                            {getScoreLabel(val ?? null)}
                          </span>
                          <span className="w-4 text-right font-mono text-gray-400 dark:text-gray-500 text-xs">{val}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'architecture' && (
          <ArchitectureView 
            result={result} 
            scenarioName={scenario.name}
            industry={scenario.industry}
            systems={scenario.systems || []}
            recommendations={recommendations.architecture}
          />
        )}

        {activeTab === 'integration' && (
          <div>
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-900/30">
              <div className="flex flex-wrap gap-2 mb-4">
                {(scenario.systems || []).map((sys) => (
                  <span key={sys} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                    {sys}
                    <button onClick={() => handleRemoveSystem(sys)} className="hover:text-blue-900 dark:hover:text-blue-100">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSystem}
                  onChange={(e) => setNewSystem(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add system (e.g. SAP, Salesforce, SharePoint)..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleAddSystem}
                  disabled={!newSystem.trim()}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
            <MermaidDiagram 
              title={systemIntegrationDiagram.title}
              description={systemIntegrationDiagram.description}
              code={systemIntegrationDiagram.code}
              className="border-0 shadow-none rounded-none"
            />
          </div>
        )}

        {activeTab === 'governance' && (
          <GovernanceView scores={scores} />
        )}

        {activeTab === 'copilot' && (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {/* Industry Optimization Panel */}
            {activeTemplate && (
              <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/20">
                <div className="flex items-center gap-2 mb-4">
                  <Factory className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Optimised Architecture for {activeTemplate.industry}</h3>
                </div>
                <p className="text-sm text-indigo-800 dark:text-indigo-200 mb-4">{activeTemplate.agentMeshSummary}</p>
                <div className="flex flex-wrap gap-2">
                  {activeTemplate.recommendedUseCases.map(uc => (
                    <span key={uc} className="px-2 py-1 bg-white text-indigo-700 text-xs font-medium rounded border border-indigo-100 dark:bg-slate-800 dark:text-indigo-300 dark:border-indigo-800">
                      {uc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Build Plan Export */}
            <div className="p-6 flex items-center justify-between bg-gray-50/30 dark:bg-slate-900/30">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Implementation Build Plan</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Generate Epics and User Stories for your backlog.</p>
              </div>
              <button
                onClick={handleExportBuildPlan}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700"
              >
                <FileJson className="w-4 h-4" />
                Export Jira/DevOps JSON
              </button>
            </div>

            {/* Agent Specs */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Agent Specifications
              </h3>
              <div className="grid gap-4">
                {agentSpecs.map((spec, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-slate-900/50 px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-white">{spec.title}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border dark:border-slate-600">{spec.type}</span>
                    </div>
                    <div className="p-4 text-sm space-y-3">
                      <p className="text-gray-600 dark:text-gray-400 italic">{spec.purpose}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Inputs</span>
                          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1">
                            {spec.inputs.map((i, k) => <li key={k}>{i}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Outputs</span>
                          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1">
                            {spec.outputs.map((i, k) => <li key={k}>{i}</li>)}
                          </ul>
                        </div>
                      </div>
                      
                      {spec.type === 'Process Agents' && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Code className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="font-semibold text-purple-900 dark:text-purple-100 text-xs uppercase tracking-wider">Topic Skeleton</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                            See "Topic Skeletons" tab for detailed implementation guide.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diagrams' && (
          <AgentDiagramsView result={result} />
        )}

        {activeTab === 'data' && (
          <ExampleDataView />
        )}

        {activeTab === 'example-architecture' && (
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center dark:bg-blue-900/20 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Example Architecture</h3>
              <p className="text-blue-700 dark:text-blue-300">
                Reference architecture diagrams and patterns for your specific industry and use case will appear here.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'blueprints' && (
          <BlueprintsView result={result} />
        )}

        {activeTab === 'skeletons' && (
          <TopicSkeletonsView result={result} />
        )}

        {activeTab === 'prompts' && (
          <PromptsView result={result} />
        )}

        {activeTab === 'connectors' && (
          <ConnectorsView systems={scenario.systems || []} />
        )}

        {activeTab === 'tests' && (
          <TestPlanView result={result} />
        )}

        {activeTab === 'delivery' && (
          <DeliveryPlanView 
            result={result} 
            deliveryRecommendations={recommendations.delivery}
            teamRecommendations={recommendations.team}
          />
        )}

        {activeTab === 'costs' && (
          <div className="p-6">
            <CostView />
          </div>
        )}

        {activeTab === 'starter-pack' && (
          <div className="p-6">
            <StarterPackView />
          </div>
        )}

        {activeTab === 'debugger' && (
          <div className="p-6">
            <AgentDebuggerView />
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="p-6">
            <ComplianceHeatmapView />
          </div>
        )}

        {activeTab === 'maturity' && (
          <div className="p-6">
            <MaturityAssessmentView />
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="p-6">
            <ValueRoadmapView />
          </div>
        )}

        {activeTab === 'report' && (
          <div className="p-6">
            <ReportGeneratorView />
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="p-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-amber-50 dark:bg-amber-900/20">
                <h3 className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-100">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Risk Controls
                </h3>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {recommendations.risks.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors dark:text-gray-300 dark:hover:bg-slate-800"
        >
          <RefreshCw className="w-4 h-4" />
          Start Over
        </button>

        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Edit Answers
        </button>
      </div>

    </div>
  );
}

