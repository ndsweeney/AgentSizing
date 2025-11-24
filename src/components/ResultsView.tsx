import { useState } from 'react';
import { AlertTriangle, ArrowLeft, RefreshCw, CheckCircle2, FileText, Layers, Box, Download, Copy, Check, ArrowRight, Users, Clock, ShieldAlert, HardHat, Bot, Plus, X, Code, FileJson, Factory } from 'lucide-react';
import { useHasCompletedAllDimensions, useActiveScenario, useSizingStore } from '../state/sizingStore';
import { calculateSizingResult, calculateRiskProfile, DIMENSIONS, type ScoreValue, type AgentNecessity, DimensionId } from '../domain/scoring';
import { getRecommendations } from '../domain/rules';
import { buildSystemIntegrationMermaid } from '../domain/diagrams';
import { generateAgentSpecs, generateBuildPlan } from '../domain/generators';
import { downloadJson, generateMarkdown, copyToClipboard } from '../utils/export';
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

type TabCategory = 'strategy' | 'architecture' | 'build' | 'poc' | 'costs' | 'testing' | 'operate' | 'reporting';

const TABS_BY_CATEGORY: Record<TabCategory, { id: string; label: string }[]> = {
  strategy: [
    { id: 'maturity', label: 'Org Maturity' },
    { id: 'roadmap', label: 'Value Roadmap' },
    { id: 'compliance', label: 'Compliance Heatmap' },
    { id: 'governance', label: 'Governance' },
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
  const [showToast, setShowToast] = useState(false);
  const [newSystem, setNewSystem] = useState('');
  const [activeCategory, setActiveCategory] = useState<TabCategory>('strategy');
  const [activeTab, setActiveTab] = useState<'architecture' | 'integration' | 'governance' | 'copilot' | 'diagrams' | 'data' | 'blueprints' | 'skeletons' | 'prompts' | 'connectors' | 'tests' | 'delivery' | 'costs' | 'starter-pack' | 'debugger' | 'compliance' | 'maturity' | 'roadmap' | 'report' | 'example-architecture'>('maturity');
  const { scores, targetScores, scenario, mode } = useActiveScenario();
  const { setSystems, updateMetadata, isReadOnly } = useSizingStore();
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
    (scores[DimensionId.WorkflowComplexity] || 0) >= 3 && { icon: HardHat, label: 'High Complexity', color: 'text-orange-700 bg-orange-50 border-orange-200' },
    (scores[DimensionId.DataSensitivity] || 0) >= 3 && { icon: ShieldAlert, label: 'Sensitive Data', color: 'text-red-700 bg-red-50 border-red-200' },
    (scores[DimensionId.UserReach] || 0) >= 3 && { icon: Users, label: 'High Reach', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    (scores[DimensionId.SystemsToIntegrate] || 0) >= 3 && { icon: Box, label: 'System Heavy', color: 'text-purple-700 bg-purple-50 border-purple-200' },
    { 
      icon: ShieldAlert, 
      label: `${riskProfile.level} Risk`, 
      color: riskProfile.level === 'HIGH' ? 'text-red-700 bg-red-50 border-red-200' : 
             riskProfile.level === 'MEDIUM' ? 'text-orange-700 bg-orange-50 border-orange-200' : 
             'text-green-700 bg-green-50 border-green-200'
    }
  ].filter(Boolean) as { icon: any, label: string, color: string }[];


  if (!isComplete) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-yellow-900 mb-2">Assessment Incomplete</h2>
        <p className="text-yellow-700 mb-6">
          Please answer all questions to see your sizing results.
        </p>
        <button
          onClick={onEdit}
          className="px-6 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Continue Assessment
        </button>
      </div>
    );
  }

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'SMALL': return 'text-green-600 bg-green-50 border-green-200';
      case 'MEDIUM': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'LARGE': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getNecessityColor = (necessity: AgentNecessity) => {
    switch (necessity) {
      case 'Definitely needed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Recommended': return 'bg-green-100 text-green-800 border-green-200';
      case 'Optional': return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getScoreLabel = (val: ScoreValue | null) => {
    if (val === 1) return 'Small';
    if (val === 2) return 'Medium';
    if (val === 3) return 'Large';
    return '-';
  };

  const handleExportJson = () => {
    const exportData = {
      scenarioName: scenario.name,
      mode,
      scores,
      targetScores: mode === 'compare' ? targetScores : undefined,
      result,
      targetResult,
      timestamp: new Date().toISOString(),
    };
    downloadJson(exportData, 'agent-sizing-results.json');
  };

  const handleExportBuildPlan = () => {
    downloadJson(buildPlan, 'copilot-build-plan.json');
  };

  const handleExportMarkdown = async () => {
    const md = generateMarkdown(
      result, 
      scores, 
      mode === 'compare' ? { targetResult, targetScores } : undefined,
      scenario.systems,
      scenario.costAssumptions,
      scenario.benefitAssumptions
    );
    const success = await copyToClipboard(md);
    if (success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
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
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium">Markdown copied to clipboard</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{scenario.name}</h2>
          <p className="text-sm text-gray-500">
            {mode === 'compare' ? 'Gap Analysis: Current vs Target' : 'Assessment Results'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button
            onClick={handleExportBuildPlan}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Build Plan
          </button>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Markdown Summary
          </button>
        </div>
      </div>

      {/* Hero Result Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 text-center border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/50">
          <h2 className="text-lg font-medium text-gray-500 mb-6">Estimated Deployment Size</h2>
          
          {mode === 'compare' && targetResult ? (
            <div className="flex items-center justify-center gap-12 mb-8">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Current State</div>
                <div className={cn(
                  "inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 text-2xl font-bold mb-2",
                  getSizeColor(result.tShirtSize)
                )}>
                  {result.tShirtSize}
                </div>
                <div className="text-sm text-gray-600">
                  Score: <span className="font-semibold">{result.totalScore}</span>
                </div>
              </div>

              <div className="flex flex-col items-center text-gray-400">
                <ArrowRight className="w-8 h-8" />
                <span className="text-xs font-medium mt-1">TARGET</span>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">Target State</div>
                <div className={cn(
                  "inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 text-2xl font-bold mb-2",
                  getSizeColor(targetResult.tShirtSize)
                )}>
                  {targetResult.tShirtSize}
                </div>
                <div className="text-sm text-gray-600">
                  Score: <span className="font-semibold">{targetResult.totalScore}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className={cn(
                "inline-flex items-center justify-center px-10 py-6 rounded-2xl border-2 text-5xl font-bold mb-4 shadow-sm",
                getSizeColor(result.tShirtSize)
              )}>
                {result.tShirtSize}
              </div>
              <p className="text-gray-600">
                Total Score: <span className="font-semibold text-gray-900">{result.totalScore}</span> / {DIMENSIONS.length * 3}
              </p>
            </div>
          )}

          {/* Attribute Chips */}
          {attributes.length > 0 && (
             <div className="flex flex-wrap justify-center gap-2 mt-4">
               {attributes.map((attr, i) => (
                 <div key={i} className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border", attr.color)}>
                   <attr.icon className="w-3.5 h-3.5" />
                   {attr.label}
                 </div>
               ))}
             </div>
           )}
        </div>
        
        <div className="bg-gray-50 p-6 grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
              <Layers className="w-4 h-4 text-blue-600" />
              Architecture Recommendations
            </h3>
            <ul className="space-y-2">
              {result.recommendedAgentPattern.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {result.notes.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                <FileText className="w-4 h-4 text-blue-600" />
                Key Considerations
              </h3>
              <ul className="space-y-2">
                {result.notes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Roadmap Suggestions (Compare Mode Only) */}
      {mode === 'compare' && roadmap.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/50">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <ArrowRight className="w-4 h-4 text-blue-600" />
              Transition Roadmap
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {roadmap.map((item, idx) => (
              <div key={idx} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{item.dimension}</span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">{getScoreLabel(item.current as ScoreValue)}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="font-medium text-blue-600">{getScoreLabel(item.target as ScoreValue)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{item.advice}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Architecture Suggestion */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900">
            <Box className="w-4 h-4 text-blue-600" />
            Suggested Agent Architecture
          </h3>
        </div>
        <div className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {result.agentArchitecture.map((agent) => (
            <div key={agent.type} className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 flex flex-col h-full">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-sm">{agent.type}</h4>
                <span className={cn(
                  "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border",
                  getNecessityColor(agent.necessity)
                )}>
                  {agent.necessity === 'Definitely needed' ? 'Required' : agent.necessity}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-auto leading-relaxed">
                {agent.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Copilot Studio Architecture Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-blue-50">
          <h3 className="flex items-center gap-2 font-semibold text-blue-900">
            <Bot className="w-4 h-4 text-blue-600" />
            Suggested Copilot Studio Architecture
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ArchitectureCard title="Experience Agents" value={result.copilotArchitecture.experienceAgents} />
          <ArchitectureCard title="Value Stream Agents" value={result.copilotArchitecture.valueStreamAgents} />
          <ArchitectureCard title="Function Agents" value={result.copilotArchitecture.functionAgents} />
          <ArchitectureCard title="Process Agents" value={result.copilotArchitecture.processAgents} />
          <ArchitectureCard title="Task Agents" value={result.copilotArchitecture.taskAgents} />
          <ArchitectureCard title="Control Agents" value={result.copilotArchitecture.controlAgents} />
          <ArchitectureCard title="Foundry Requirement" value={result.copilotArchitecture.foundryRequirement} className="md:col-span-2 lg:col-span-3" />
        </div>
      </div>

      {/* Workshop Notes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900">
            <FileText className="w-4 h-4 text-blue-600" />
            Workshop Notes
          </h3>
        </div>
        <div className="p-6">
          <textarea
            value={scenario.notes || ''}
            onChange={(e) => updateMetadata('notes', e.target.value)}
            disabled={isReadOnly}
            placeholder="Add overall workshop notes, conclusions, or next steps..."
            className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 min-h-[150px]"
          />
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Detailed Breakdown</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {DIMENSIONS.map((dim) => {
            const val = scores[dim.id];
            const targetVal = mode === 'compare' ? targetScores[dim.id] : null;
            
            return (
              <div key={dim.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-medium text-gray-900">{dim.label}</div>
                  <div className="text-xs text-gray-500">{dim.description}</div>
                </div>
                <div className="flex items-center gap-4">
                  {mode === 'compare' && targetVal !== null ? (
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Now</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium border",
                          val === 1 ? "bg-green-50 text-green-700 border-green-200" :
                          val === 2 ? "bg-blue-50 text-blue-700 border-blue-200" :
                          val === 3 ? "bg-purple-50 text-purple-700 border-purple-200" :
                          "bg-gray-100 text-gray-600 border-gray-200"
                        )}>
                          {getScoreLabel(val ?? null)}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Target</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium border",
                          targetVal === 1 ? "bg-green-50 text-green-700 border-green-200" :
                          targetVal === 2 ? "bg-blue-50 text-blue-700 border-blue-200" :
                          targetVal === 3 ? "bg-purple-50 text-purple-700 border-purple-200" :
                          "bg-gray-100 text-gray-600 border-gray-200"
                        )}>
                          {getScoreLabel(targetVal ?? null)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border",
                        val === 1 ? "bg-green-50 text-green-700 border-green-200" :
                        val === 2 ? "bg-blue-50 text-blue-700 border-blue-200" :
                        val === 3 ? "bg-purple-50 text-purple-700 border-purple-200" :
                        "bg-gray-100 text-gray-600 border-gray-200"
                      )}>
                        {getScoreLabel(val ?? null)}
                      </span>
                      <span className="w-6 text-right font-mono text-gray-400">{val}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Architecture */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50">
            <h3 className="flex items-center gap-2 font-semibold text-indigo-900">
              <HardHat className="w-4 h-4 text-indigo-600" />
              Technical Architecture
            </h3>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {recommendations.architecture.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-emerald-50">
            <h3 className="flex items-center gap-2 font-semibold text-emerald-900">
              <Clock className="w-4 h-4 text-emerald-600" />
              Delivery Estimate
            </h3>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {recommendations.delivery.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-blue-50">
            <h3 className="flex items-center gap-2 font-semibold text-blue-900">
              <Users className="w-4 h-4 text-blue-600" />
              Recommended Team
            </h3>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {recommendations.team.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Risks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-amber-50">
            <h3 className="flex items-center gap-2 font-semibold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Risk Controls
            </h3>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {recommendations.risks.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Diagrams Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50">
          {/* Category Navigation */}
          <div className="px-6 py-4 flex gap-2 overflow-x-auto border-b border-gray-100">
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
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                )}
              >
                {category}
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
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'architecture' && (
          <ArchitectureView 
            result={result} 
            scenarioName={scenario.name}
            industry={scenario.industry}
            systems={scenario.systems || []}
          />
        )}

        {activeTab === 'integration' && (
          <div>
            <div className="p-6 border-b border-gray-100 bg-gray-50/30">
              <div className="flex flex-wrap gap-2 mb-4">
                {(scenario.systems || []).map((sys) => (
                  <span key={sys} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm border border-blue-200">
                    {sys}
                    <button onClick={() => handleRemoveSystem(sys)} className="hover:text-blue-900">
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <button
                  onClick={handleAddSystem}
                  disabled={!newSystem.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          <div className="divide-y divide-gray-100">
            {/* Industry Optimization Panel */}
            {activeTemplate && (
              <div className="p-6 bg-indigo-50/50">
                <div className="flex items-center gap-2 mb-4">
                  <Factory className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-indigo-900">Optimised Architecture for {activeTemplate.industry}</h3>
                </div>
                <p className="text-sm text-indigo-800 mb-4">{activeTemplate.agentMeshSummary}</p>
                <div className="flex flex-wrap gap-2">
                  {activeTemplate.recommendedUseCases.map(uc => (
                    <span key={uc} className="px-2 py-1 bg-white text-indigo-700 text-xs font-medium rounded border border-indigo-100">
                      {uc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Build Plan Export */}
            <div className="p-6 flex items-center justify-between bg-gray-50/30">
              <div>
                <h3 className="font-semibold text-gray-900">Implementation Build Plan</h3>
                <p className="text-sm text-gray-500">Generate Epics and User Stories for your backlog.</p>
              </div>
              <button
                onClick={handleExportBuildPlan}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FileJson className="w-4 h-4" />
                Export Jira/DevOps JSON
              </button>
            </div>

            {/* Agent Specs */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                Agent Specifications
              </h3>
              <div className="grid gap-4">
                {agentSpecs.map((spec, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                      <span className="font-medium text-gray-900">{spec.title}</span>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">{spec.type}</span>
                    </div>
                    <div className="p-4 text-sm space-y-3">
                      <p className="text-gray-600 italic">{spec.purpose}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold text-gray-900 text-xs uppercase tracking-wider">Inputs</span>
                          <ul className="list-disc list-inside text-gray-600 mt-1">
                            {spec.inputs.map((i, k) => <li key={k}>{i}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 text-xs uppercase tracking-wider">Outputs</span>
                          <ul className="list-disc list-inside text-gray-600 mt-1">
                            {spec.outputs.map((i, k) => <li key={k}>{i}</li>)}
                          </ul>
                        </div>
                      </div>
                      
                      {spec.type === 'Process Agents' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Code className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold text-purple-900 text-xs uppercase tracking-wider">Topic Skeleton</span>
                          </div>
                          <p className="text-xs text-gray-500 italic">
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Example Architecture</h3>
              <p className="text-blue-700">
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
          <DeliveryPlanView result={result} />
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
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Start Over
        </button>

        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Edit Answers
        </button>
      </div>
    </div>
  );
}

function ArchitectureCard({ title, value, className }: { title: string, value: string, className?: string }) {
  return (
    <div className={cn("p-4 rounded-lg border border-gray-200 bg-gray-50/50", className)}>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</h4>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
