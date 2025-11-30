import { useState } from 'react';
import { 
  Bot, 
  Brain, 
  Activity, 
  Terminal, 
  CheckCircle2, 
  Layers,
  DollarSign,
  Scale,
  ShieldAlert,
  Settings,
  RotateCcw
} from 'lucide-react';
import { getArchetypesByTier } from '../data/agentArchetypes';
import { generateAgentSpecs } from '../domain/generators';
import { generatePrompts } from '../domain/prompts';
import { generateTestPlan } from '../domain/tests';
import { calculateSizingResult } from '../domain/rules';
import { DimensionId, DIMENSIONS } from '../domain/scoring';
import { cn } from '../utils/cn';
import { useRulesStore } from '../state/rulesStore';

function ConfigInput({ 
  label, 
  value, 
  onChange, 
  type = "number",
  step = "any",
  suffix
}: { 
  label: string; 
  value: number | string; 
  onChange: (val: number | string) => void;
  type?: "number" | "text";
  step?: string;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          step={step}
          value={value}
          onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white text-sm"
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 text-sm">{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );
}



export function SystemReferenceView() {
  const [activeTab, setActiveTab] = useState<'archetypes' | 'logic' | 'prompts' | 'tests' | 'costs' | 'roi' | 'scoring' | 'risk'>('archetypes');
  const [isEditing, setIsEditing] = useState(false);
  
  const { 
    sizingThresholds, 
    riskThresholds, 
    governanceRules, 
    riskRules,
    archetypeTriggers,
    costDrivers,
    costAssumptions,
    benefitAssumptions,
    testPlanTemplates,
    promptTemplates,
    updateSizingThreshold,
    updateRiskThreshold,
    updatePromptTemplate,
    setGovernanceRules,
    setRiskRules,
    setArchetypeTriggers,
    setCostDrivers,
    setCostAssumptions,
    setBenefitAssumptions,
    setTestPlanTemplates,
    resetRules
  } = useRulesStore();

  const rulesConfig = { 
    sizingThresholds, 
    riskThresholds,
    governanceRules,
    riskRules,
    archetypeTriggers,
    costDrivers,
    costAssumptions,
    testPlanTemplates,
    promptTemplates
  };

  // Mock result to trigger all generators
  const MOCK_FULL_RESULT = calculateSizingResult({
    [DimensionId.WorkflowComplexity]: 3,
    [DimensionId.DataSensitivity]: 3,
    [DimensionId.SystemsToIntegrate]: 3,
    [DimensionId.UserReach]: 3,
    [DimensionId.BusinessScope]: 3,
    [DimensionId.AgentCountAndTypes]: 3,
    [DimensionId.PlatformMix]: 3,
    [DimensionId.ChangeAndAdoption]: 3
  }, rulesConfig);

  // Force all archetypes into the mock result for documentation purposes
  const ALL_ARCHETYPES = [
    ...getArchetypesByTier('core', rulesConfig),
    ...getArchetypesByTier('extended', rulesConfig)
  ];

  // Override the agentArchitecture to include EVERYONE
  MOCK_FULL_RESULT.agentArchitecture = ALL_ARCHETYPES.map(arch => ({
    type: arch.tier === 'core' ? 'Value Stream Agents' : 'Control Agents', // Dummy mapping
    archetypeId: arch.id,
    necessity: 'Definitely needed',
    reason: 'Documentation Reference'
  }));

  const specs = generateAgentSpecs(MOCK_FULL_RESULT);
  const prompts = generatePrompts(MOCK_FULL_RESULT, promptTemplates);
  const testPlan = generateTestPlan(MOCK_FULL_RESULT);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Reference</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Comprehensive documentation of all Agent Archetypes, logic, and generated assets.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isEditing && (
            <button
              onClick={resetRules}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Defaults
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors border w-full sm:w-auto justify-center",
              isEditing 
                ? "bg-blue-50 text-blue-700 border-blue-200" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            )}
          >
            <Settings className="w-4 h-4" />
            {isEditing ? 'Done Editing' : 'Edit Logic'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg mb-8 w-full sm:w-fit overflow-x-auto">
        {[
          { id: 'archetypes', label: 'Agent Archetypes', icon: Bot },
          { id: 'scoring', label: 'Scoring Logic', icon: Scale },
          { id: 'risk', label: 'Risk & Governance', icon: ShieldAlert },
          { id: 'costs', label: 'Cost Models', icon: DollarSign },
          { id: 'roi', label: 'ROI Models', icon: Activity },
          { id: 'prompts', label: 'System Prompts', icon: Terminal },
          { id: 'tests', label: 'Test Plans', icon: CheckCircle2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-8">
        
        {/* ARCHETYPES TAB */}
        {activeTab === 'archetypes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isEditing && (
               <div className="col-span-1 lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Edit Archetype Triggers
                  </h3>
                  <div className="space-y-4">
                    {archetypeTriggers.map((trigger, idx) => (
                      <div key={trigger.id} className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-start">
                        <div className="flex-1 space-y-2 w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono bg-gray-200 dark:bg-slate-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                              {trigger.id}
                            </span>
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              {trigger.archetypeId}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Necessity</label>
                              <select
                                value={trigger.necessity}
                                onChange={(e) => {
                                  const newTriggers = [...archetypeTriggers];
                                  newTriggers[idx] = { ...trigger, necessity: e.target.value as any };
                                  setArchetypeTriggers(newTriggers);
                                }}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md text-sm"
                              >
                                <option value="Optional">Optional</option>
                                <option value="Recommended">Recommended</option>
                                <option value="Definitely needed">Definitely needed</option>
                              </select>
                            </div>
                            <ConfigInput
                              label="Reason"
                              type="text"
                              value={trigger.reason}
                              onChange={(v) => {
                                const newTriggers = [...archetypeTriggers];
                                newTriggers[idx] = { ...trigger, reason: String(v) };
                                setArchetypeTriggers(newTriggers);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
               </div>
            )}
            {ALL_ARCHETYPES.map((arch) => {
              const spec = specs.find(s => s.archetypeId === arch.id);
              return (
                <div key={arch.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{arch.name}</h3>
                        <span className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full uppercase",
                          arch.tier === 'core' 
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        )}>
                          {arch.tier}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{arch.shortDescription}</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                      <Bot className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {arch.longDescription}
                    </div>

                    {arch.triggerCondition && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                        <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                          <Activity className="w-3 h-3" />
                          Trigger Logic
                        </h4>
                        <p className="text-sm text-amber-900 dark:text-amber-100">
                          {arch.triggerCondition}
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                      <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-1 flex items-center gap-2">
                        <Layers className="w-3 h-3" />
                        Microsoft Fit
                      </h4>
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        {arch.exampleMicrosoftFit}
                      </p>
                    </div>

                    {spec && (
                      <>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Generated Steps</h4>
                          <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            {spec.steps.map(step => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Inputs</h4>
                            <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
                              {spec.inputs.map(i => <li key={i}>{i}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Outputs</h4>
                            <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
                              {spec.outputs.map(o => <li key={o}>{o}</li>)}
                            </ul>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LOGIC TAB */}
        {activeTab === 'logic' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-500" />
                Recommendation Logic
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                <p>The system recommends archetypes based on the following dimension thresholds:</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-2 font-medium">Archetype</th>
                        <th className="px-4 py-2 font-medium">Trigger Condition</th>
                        <th className="px-4 py-2 font-medium">Reasoning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                      <tr>
                        <td className="px-4 py-3 font-medium">Orchestrator</td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">Complexity ≥ 2 OR Business Scope ≥ 2</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Central coordination point for delegating tasks and managing state.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">User-Facing Copilot</td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">Always (Reach ≥ 2 = "Definitely")</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Provides a consistent conversational interface.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Connector / Integration</td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">Systems ≥ 2</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Multiple backend systems require dedicated integration agents.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Specialist / Domain</td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">Business Scope ≥ 2 OR Agent Count ≥ 2</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Encapsulates specific domain knowledge and business logic.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Toolsmith / Action</td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">Systems ≥ 1</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Executes specific discrete actions against APIs.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Governance / Guardrail</td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">Data Sensitivity ≥ 2 OR Complexity = 3</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">High data sensitivity or complexity requires strict output validation.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Logical / Reasoning</td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">Complexity = 3</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Complex decision trees benefit from a dedicated reasoning engine.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Memory / Context</td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">Complexity ≥ 2 OR Reach ≥ 3</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Long-running or personalized conversations need persistent context.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Simulation / Planning</td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">Complexity = 3 AND Business Scope = 3</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Advanced scenario planning for high-stakes business decisions.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Meta / Self-Improving</td>
                        <td className="px-4 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">Agent Count = 3 AND Complexity = 3</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Large agent ecosystems can benefit from self-optimization.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCORING LOGIC TAB */}
        {activeTab === 'scoring' && (
          <div className="space-y-8">
            {/* T-Shirt Sizing Thresholds */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                T-Shirt Sizing Thresholds
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The overall size is determined by the sum of scores across all 8 dimensions. 
                Each dimension is scored from 1 (Simple) to 3 (Complex).
              </p>

              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <ConfigInput
                      label="Medium Threshold (Points)"
                      value={sizingThresholds.MEDIUM}
                      onChange={(v) => updateSizingThreshold('MEDIUM', Number(v))}
                    />
                    <p className="mt-2 text-xs text-gray-500">Scores below this are SMALL.</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <ConfigInput
                      label="Large Threshold (Points)"
                      value={sizingThresholds.LARGE}
                      onChange={(v) => updateSizingThreshold('LARGE', Number(v))}
                    />
                    <p className="mt-2 text-xs text-gray-500">Scores equal or above this are LARGE.</p>
                  </div>
                </div>
              ) : (
                <div className="relative pt-8 pb-4 px-4">
                  {/* Scale Line */}
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-full w-full relative">
                    <div className="absolute top-0 left-0 h-full bg-green-500 rounded-l-full" style={{ width: `${(sizingThresholds.MEDIUM / 24) * 100}%` }}></div>
                    <div className="absolute top-0 left-[50%] h-full bg-yellow-500" style={{ left: `${(sizingThresholds.MEDIUM / 24) * 100}%`, width: `${((sizingThresholds.LARGE - sizingThresholds.MEDIUM) / 24) * 100}%` }}></div>
                    <div className="absolute top-0 right-0 h-full bg-red-500 rounded-r-full" style={{ width: `${((24 - sizingThresholds.LARGE) / 24) * 100}%` }}></div>
                  </div>

                  {/* Markers */}
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-[-20px]" style={{ left: '0%' }}>
                      <span className="text-xs font-bold text-gray-500">0</span>
                    </div>
                    <div className="absolute top-[-20px]" style={{ left: `${(sizingThresholds.MEDIUM / 24) * 100}%`, transform: 'translateX(-50%)' }}>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{sizingThresholds.MEDIUM}</span>
                    </div>
                    <div className="absolute top-[-20px]" style={{ left: `${(sizingThresholds.LARGE / 24) * 100}%`, transform: 'translateX(-50%)' }}>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{sizingThresholds.LARGE}</span>
                    </div>
                    <div className="absolute top-[-20px]" style={{ right: '0%' }}>
                      <span className="text-xs font-bold text-gray-500">24</span>
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="flex justify-between mt-4 text-sm font-medium">
                    <div className="text-green-600 w-1/3 text-center">SMALL<br/><span className="text-xs font-normal text-gray-500">&lt; {sizingThresholds.MEDIUM} points</span></div>
                    <div className="text-yellow-600 w-1/3 text-center">MEDIUM<br/><span className="text-xs font-normal text-gray-500">{sizingThresholds.MEDIUM} - {sizingThresholds.LARGE - 1} points</span></div>
                    <div className="text-red-600 w-1/3 text-center">LARGE<br/><span className="text-xs font-normal text-gray-500">&ge; {sizingThresholds.LARGE} points</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Dimension Drivers */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Dimension Drivers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DIMENSIONS.map(dim => (
                  <div key={dim.id} className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{dim.label}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{dim.description}</p>
                    <div className="space-y-2">
                      {Object.entries(dim.options).map(([score, opt]) => (
                        <div key={score} className="flex items-start gap-2 text-xs">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded font-mono font-bold",
                            score === '1' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                            score === '2' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" :
                            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          )}>{score}</span>
                          <span className="text-gray-700 dark:text-gray-300">
                            <strong className="font-medium text-gray-900 dark:text-white">{opt.title}:</strong> {opt.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RISK & GOVERNANCE TAB */}
        {activeTab === 'risk' && (
          <div className="space-y-8">
            {isEditing ? (
              <>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Risk Thresholds</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ConfigInput
                      label="Low Risk Threshold"
                      value={riskThresholds.LOW}
                      onChange={(v) => updateRiskThreshold('LOW', Number(v))}
                    />
                    <ConfigInput
                      label="Medium Risk Threshold"
                      value={riskThresholds.MEDIUM}
                      onChange={(v) => updateRiskThreshold('MEDIUM', Number(v))}
                    />
                    <ConfigInput
                      label="High Risk Threshold"
                      value={riskThresholds.HIGH}
                      onChange={(v) => updateRiskThreshold('HIGH', Number(v))}
                    />
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Edit Risk Rules
                  </h3>
                  <div className="space-y-4">
                    {riskRules.map((rule, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                          <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Risk Level</label>
                            <select
                              value={rule.level}
                              onChange={(e) => {
                                const newRules = [...riskRules];
                                newRules[idx] = { ...rule, level: e.target.value as any };
                                setRiskRules(newRules);
                              }}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md text-sm"
                            >
                              <option value="LOW">Low</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HIGH">High</option>
                            </select>
                          </div>
                          <div className="md:col-span-9">
                            <ConfigInput
                              label="Reason"
                              type="text"
                              value={rule.reason}
                              onChange={(v) => {
                                const newRules = [...riskRules];
                                newRules[idx] = { ...rule, reason: String(v) };
                                setRiskRules(newRules);
                              }}
                            />
                          </div>
                          <div className="md:col-span-12">
                            <p className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-slate-800 p-2 rounded">
                              Condition: {rule.conditionDescription}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Edit Governance Rules
                  </h3>
                  <div className="space-y-4">
                    {governanceRules.map((rule, idx) => (
                      <div key={rule.id} className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono bg-gray-200 dark:bg-slate-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                            {rule.id}
                          </span>
                          <p className="text-xs text-gray-500 font-mono">
                            Trigger: {rule.triggerDescription}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <ConfigInput
                            label="Title"
                            type="text"
                            value={rule.title}
                            onChange={(v) => {
                              const newRules = [...governanceRules];
                              newRules[idx] = { ...rule, title: String(v) };
                              setGovernanceRules(newRules);
                            }}
                          />
                          <ConfigInput
                            label="Category"
                            type="text"
                            value={rule.category}
                            onChange={(v) => {
                              const newRules = [...governanceRules];
                              newRules[idx] = { ...rule, category: String(v) };
                              setGovernanceRules(newRules);
                            }}
                          />
                          <div className="md:col-span-2">
                            <ConfigInput
                              label="Description"
                              type="text"
                              value={rule.description}
                              onChange={(v) => {
                                const newRules = [...governanceRules];
                                newRules[idx] = { ...rule, description: String(v) };
                                setGovernanceRules(newRules);
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                            <select
                              value={rule.priority}
                              onChange={(e) => {
                                const newRules = [...governanceRules];
                                newRules[idx] = { ...rule, priority: e.target.value as any };
                                setGovernanceRules(newRules);
                              }}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md text-sm"
                            >
                              <option value="Recommended">Recommended</option>
                              <option value="Mandatory">Mandatory</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
            {/* Risk Matrix */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-600" />
                Risk Classification Rules
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The Risk Profile (Low, Medium, High) is calculated independently of the T-Shirt size. 
                A small project can still be High Risk if it handles sensitive data.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {riskRules.map((rule, idx) => (
                  <div key={idx} className={cn(
                    "p-4 rounded-lg border",
                    rule.level === 'HIGH' 
                      ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800" 
                      : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800"
                  )}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={cn(
                        "px-2 py-0.5 text-xs font-bold rounded",
                        rule.level === 'HIGH' 
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" 
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                      )}>
                        {rule.level} RISK
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                      {rule.conditionDescription}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {rule.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Governance Triggers */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Governance Triggers</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-slate-900 dark:text-gray-400">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Category</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3 rounded-tr-lg">Trigger Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {governanceRules.map((rule, idx) => (
                      <tr key={idx} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {rule.category}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {rule.title}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {rule.description}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {rule.priority}
                        </td>
                        <td className="px-4 py-3">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-slate-900 rounded text-xs font-mono text-blue-600 dark:text-blue-400">
                            {rule.triggerDescription}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </>
            )}
          </div>
        )}

        {/* PROMPTS TAB */}
        {activeTab === 'prompts' && (
          <div className="grid grid-cols-1 gap-6">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={prompt.title}
                        onChange={(e) => updatePromptTemplate(prompt.archetypeId, { title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white font-bold"
                        placeholder="Prompt Title"
                      />
                      <input
                        type="text"
                        value={prompt.description}
                        onChange={(e) => updatePromptTemplate(prompt.archetypeId, { description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white text-sm"
                        placeholder="Description"
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="font-bold text-gray-900 dark:text-white">{prompt.title}</h3>
                      <p className="text-sm text-gray-500">{prompt.description}</p>
                    </>
                  )}
                </div>
                <div className="p-4">
                  {isEditing ? (
                    <textarea
                      value={prompt.systemPrompt}
                      onChange={(e) => updatePromptTemplate(prompt.archetypeId, { systemPrompt: e.target.value })}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white font-mono text-sm"
                      placeholder="System Prompt..."
                    />
                  ) : (
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                      {prompt.systemPrompt}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TEST PLANS TAB */}
        {activeTab === 'tests' && (
          <div className="space-y-8">
             {isEditing && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Edit Test Plan Templates
                  </h3>
                  <div className="space-y-6">
                    {testPlanTemplates.map((template, tIdx) => (
                      <div key={template.archetypeId} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-slate-900 px-4 py-2 border-b border-gray-200 dark:border-slate-700 font-medium text-sm flex justify-between items-center">
                          <span>Archetype: {template.archetypeId}</span>
                          <span className="text-xs text-gray-500">{template.cases.length} cases</span>
                        </div>
                        <div className="p-4 space-y-6">
                          {template.cases.map((testCase, cIdx) => (
                            <div key={testCase.id} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded border border-gray-200 dark:border-slate-700 relative">
                              <div className="absolute top-2 right-2 text-xs font-mono text-gray-400">{testCase.id}</div>
                              <div className="grid grid-cols-1 gap-4">
                                <ConfigInput
                                  label="Title"
                                  value={testCase.title}
                                  onChange={(v) => {
                                    const newTemplates = [...testPlanTemplates];
                                    newTemplates[tIdx].cases[cIdx].title = String(v);
                                    setTestPlanTemplates(newTemplates);
                                  }}
                                />
                                <ConfigInput
                                  label="Description"
                                  value={testCase.description}
                                  onChange={(v) => {
                                    const newTemplates = [...testPlanTemplates];
                                    newTemplates[tIdx].cases[cIdx].description = String(v);
                                    setTestPlanTemplates(newTemplates);
                                  }}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-500">Input</label>
                                    <textarea
                                      value={testCase.input}
                                      onChange={(e) => {
                                        const newTemplates = [...testPlanTemplates];
                                        newTemplates[tIdx].cases[cIdx].input = e.target.value;
                                        setTestPlanTemplates(newTemplates);
                                      }}
                                      rows={3}
                                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md text-sm font-mono"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-500">Expected Output</label>
                                    <textarea
                                      value={testCase.expectedOutput}
                                      onChange={(e) => {
                                        const newTemplates = [...testPlanTemplates];
                                        newTemplates[tIdx].cases[cIdx].expectedOutput = e.target.value;
                                        setTestPlanTemplates(newTemplates);
                                      }}
                                      rows={3}
                                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md text-sm font-mono"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="block text-xs font-medium text-gray-500">Edge Cases (one per line)</label>
                                  <textarea
                                    value={testCase.edgeCases.join('\n')}
                                    onChange={(e) => {
                                      const newTemplates = [...testPlanTemplates];
                                      newTemplates[tIdx].cases[cIdx].edgeCases = e.target.value.split('\n').filter(line => line.trim() !== '');
                                      setTestPlanTemplates(newTemplates);
                                    }}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             )}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Test Plan Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Automatically generated test plans based on the recommended archetypes and logic.
              </p>

              <div className="space-y-4">
                {testPlan.cases.map((test) => (
                  <div key={test.id} className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{test.title}</h3>
                        <p className="text-xs text-gray-500">{test.description}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs rounded font-mono">
                        {test.id}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase">Input</h4>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded border border-gray-200 dark:border-slate-700 text-sm font-mono text-gray-700 dark:text-gray-300">
                          {test.input}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase">Expected Output</h4>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
                          {test.expectedOutput}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Edge Cases</h4>
                      <div className="flex flex-wrap gap-2">
                        {test.edgeCases.map(ec => (
                          <span key={ec} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 text-xs rounded border border-gray-200 dark:border-slate-600">
                            {ec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* COSTS TAB */}
        {activeTab === 'costs' && (
          <div className="space-y-8">
            {isEditing ? (
              <>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Edit Cost Assumptions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">
                        Licensing
                      </h4>
                      <ConfigInput
                        label="Copilot Studio / Month"
                        value={costAssumptions.copilotStudioLicensePerMonth}
                        onChange={(v) => setCostAssumptions({ ...costAssumptions, copilotStudioLicensePerMonth: Number(v) })}
                        suffix="$"
                      />
                      <ConfigInput
                        label="Message Pack Cost"
                        value={costAssumptions.copilotStudioMessagePackCost}
                        onChange={(v) => setCostAssumptions({ ...costAssumptions, copilotStudioMessagePackCost: Number(v) })}
                        suffix="$"
                      />
                      <ConfigInput
                        label="Included Messages"
                        value={costAssumptions.messagesIncludedInBase}
                        onChange={(v) => setCostAssumptions({ ...costAssumptions, messagesIncludedInBase: Number(v) })}
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">
                        Azure AI
                      </h4>
                      <ConfigInput
                        label="Input Token Rate (1k)"
                        value={costAssumptions.azureOpenAIInputTokenRate}
                        step="0.0001"
                        onChange={(v) => setCostAssumptions({ ...costAssumptions, azureOpenAIInputTokenRate: Number(v) })}
                        suffix="$"
                      />
                      <ConfigInput
                        label="Output Token Rate (1k)"
                        value={costAssumptions.azureOpenAIOutputTokenRate}
                        step="0.0001"
                        onChange={(v) => setCostAssumptions({ ...costAssumptions, azureOpenAIOutputTokenRate: Number(v) })}
                        suffix="$"
                      />
                      <ConfigInput
                        label="Avg Tokens / Msg"
                        value={costAssumptions.averageTokensPerMessage}
                        onChange={(v) => setCostAssumptions({ ...costAssumptions, averageTokensPerMessage: Number(v) })}
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">
                        Implementation
                      </h4>
                      <ConfigInput
                        label="Blended Hourly Rate"
                        value={costAssumptions.blendedHourlyRate}
                        onChange={(v) => setCostAssumptions({ ...costAssumptions, blendedHourlyRate: Number(v) })}
                        suffix="$/hr"
                      />
                      <ConfigInput
                        label="Hours / Sprint"
                        value={costAssumptions.hoursPerSprint}
                        onChange={(v) => setCostAssumptions({ ...costAssumptions, hoursPerSprint: Number(v) })}
                      />
                      <ConfigInput
                        label="Team Size"
                        value={costAssumptions.teamSize}
                        onChange={(v) => setCostAssumptions({ ...costAssumptions, teamSize: Number(v) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Edit Cost Drivers (T-Shirt Sizing)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(['SMALL', 'MEDIUM', 'LARGE'] as const).map((size) => (
                      <div key={size} className="space-y-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                        <h4 className="font-bold text-center text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2 mb-4">
                          {size}
                        </h4>
                        <ConfigInput
                          label="Impl Min ($)"
                          value={costDrivers.tShirtSize[size].implMin}
                          onChange={(v) => setCostDrivers({
                            ...costDrivers,
                            tShirtSize: {
                              ...costDrivers.tShirtSize,
                              [size]: { ...costDrivers.tShirtSize[size], implMin: Number(v) }
                            }
                          })}
                        />
                        <ConfigInput
                          label="Impl Max ($)"
                          value={costDrivers.tShirtSize[size].implMax}
                          onChange={(v) => setCostDrivers({
                            ...costDrivers,
                            tShirtSize: {
                              ...costDrivers.tShirtSize,
                              [size]: { ...costDrivers.tShirtSize[size], implMax: Number(v) }
                            }
                          })}
                        />
                        <ConfigInput
                          label="Licensing ($)"
                          value={costDrivers.tShirtSize[size].licensing}
                          onChange={(v) => setCostDrivers({
                            ...costDrivers,
                            tShirtSize: {
                              ...costDrivers.tShirtSize,
                              [size]: { ...costDrivers.tShirtSize[size], licensing: Number(v) }
                            }
                          })}
                        />
                        <ConfigInput
                          label="Azure ($)"
                          value={costDrivers.tShirtSize[size].azure}
                          onChange={(v) => setCostDrivers({
                            ...costDrivers,
                            tShirtSize: {
                              ...costDrivers.tShirtSize,
                              [size]: { ...costDrivers.tShirtSize[size], azure: Number(v) }
                            }
                          })}
                        />
                        <ConfigInput
                          label="Support ($)"
                          value={costDrivers.tShirtSize[size].support}
                          onChange={(v) => setCostDrivers({
                            ...costDrivers,
                            tShirtSize: {
                              ...costDrivers.tShirtSize,
                              [size]: { ...costDrivers.tShirtSize[size], support: Number(v) }
                            }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Default Cost Assumptions
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                These are the baseline values used to calculate estimated running costs. 
                Actual costs will vary based on volume, region, and specific enterprise agreements.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Licensing */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">
                    Licensing (Copilot Studio)
                  </h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Base Tenant / Month</dt>
                      <dd className="font-mono font-medium text-gray-900 dark:text-white">${costAssumptions.copilotStudioLicensePerMonth}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Message Pack (25k)</dt>
                      <dd className="font-mono font-medium text-gray-900 dark:text-white">${costAssumptions.copilotStudioMessagePackCost}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Included Messages</dt>
                      <dd className="font-mono font-medium text-gray-900 dark:text-white">{costAssumptions.messagesIncludedInBase.toLocaleString()}</dd>
                    </div>
                  </dl>
                </div>

                {/* Azure AI */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">
                    Azure AI Foundry
                  </h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Input Token Rate (1k)</dt>
                      <dd className="font-mono font-medium text-gray-900 dark:text-white">${costAssumptions.azureOpenAIInputTokenRate}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Output Token Rate (1k)</dt>
                      <dd className="font-mono font-medium text-gray-900 dark:text-white">${costAssumptions.azureOpenAIOutputTokenRate}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Avg Tokens / Msg</dt>
                      <dd className="font-mono font-medium text-gray-900 dark:text-white">{costAssumptions.averageTokensPerMessage}</dd>
                    </div>
                  </dl>
                </div>

                {/* Implementation */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">
                    Implementation
                  </h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Blended Hourly Rate</dt>
                      <dd className="font-mono font-medium text-gray-900 dark:text-white">${costAssumptions.blendedHourlyRate}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Hours / Sprint</dt>
                      <dd className="font-mono font-medium text-gray-900 dark:text-white">{costAssumptions.hoursPerSprint}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Team Size</dt>
                      <dd className="font-mono font-medium text-gray-900 dark:text-white">{costAssumptions.teamSize}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Calculation Logic</h2>
              <div className="space-y-6 text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Licensing Costs</h3>
                  <p>
                    Calculated based on the estimated number of users and messages per user. 
                    If total messages exceed the base inclusion ({costAssumptions.messagesIncludedInBase.toLocaleString()}), 
                    additional message packs are added automatically.
                  </p>
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-700 font-mono text-xs">
                    Total Messages = Users × Messages/User/Month<br/>
                    Packs Needed = CEIL(MAX(0, Total Messages - Base) / 25,000)
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Azure AI Consumption</h3>
                  <p>
                    Estimates token usage for Generative AI features. The percentage of messages using GenAI 
                    scales with <strong>Workflow Complexity</strong> (Low: 20%, Medium: 50%, High: 80%).
                  </p>
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-700 font-mono text-xs">
                    GenAI Messages = Total Messages × Complexity Ratio<br/>
                    Cost = (Input Tokens × Rate) + (Output Tokens × Rate)
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Implementation Effort</h3>
                  <p>
                    Derived from the overall <strong>T-Shirt Size</strong> (Small: 2 sprints, Medium: 6 sprints, Large: 12 sprints). 
                    Additional sprints are added for high <strong>Change Management</strong> or <strong>Data Sensitivity</strong> scores.
                  </p>
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        )}

        {/* ROI TAB */}
        {activeTab === 'roi' && (
          <div className="space-y-8">
            {isEditing ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Edit ROI Assumptions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">
                      Time Savings
                    </h4>
                    <ConfigInput
                      label="Minutes Saved / Transaction"
                      value={benefitAssumptions.timeSavingMinutesPerTx}
                      onChange={(v) => setBenefitAssumptions({ ...benefitAssumptions, timeSavingMinutesPerTx: Number(v) })}
                      suffix="min"
                    />
                    <ConfigInput
                      label="Transactions / Month"
                      value={benefitAssumptions.txPerMonth}
                      onChange={(v) => setBenefitAssumptions({ ...benefitAssumptions, txPerMonth: Number(v) })}
                    />
                    <ConfigInput
                      label="Automation Rate (0-1)"
                      value={benefitAssumptions.automationRate}
                      step="0.01"
                      onChange={(v) => setBenefitAssumptions({ ...benefitAssumptions, automationRate: Number(v) })}
                    />
                    <ConfigInput
                      label="Hourly Labor Cost"
                      value={benefitAssumptions.hourlyRate}
                      onChange={(v) => setBenefitAssumptions({ ...benefitAssumptions, hourlyRate: Number(v) })}
                      suffix="$/hr"
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">
                      Adoption & Growth
                    </h4>
                    <ConfigInput
                      label="Year 1 Adoption Rate (0-1)"
                      value={benefitAssumptions.adoptionRate}
                      step="0.01"
                      onChange={(v) => setBenefitAssumptions({ ...benefitAssumptions, adoptionRate: Number(v) })}
                    />
                    <ConfigInput
                      label="Revenue Uplift (0-1)"
                      value={benefitAssumptions.upliftPercent || 0}
                      step="0.001"
                      onChange={(v) => setBenefitAssumptions({ ...benefitAssumptions, upliftPercent: Number(v) })}
                    />
                    <ConfigInput
                      label="Base Revenue / Month"
                      value={benefitAssumptions.baseRevenuePerMonth || 0}
                      onChange={(v) => setBenefitAssumptions({ ...benefitAssumptions, baseRevenuePerMonth: Number(v) })}
                      suffix="$"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Default ROI Assumptions
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  These assumptions drive the Return on Investment calculations, estimating time savings and efficiency gains.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">
                      Time Savings
                    </h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Minutes Saved / Tx</dt>
                        <dd className="font-mono font-medium text-gray-900 dark:text-white">{benefitAssumptions.timeSavingMinutesPerTx} min</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Transactions / Month</dt>
                        <dd className="font-mono font-medium text-gray-900 dark:text-white">{benefitAssumptions.txPerMonth.toLocaleString()}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Automation Rate</dt>
                        <dd className="font-mono font-medium text-gray-900 dark:text-white">{(benefitAssumptions.automationRate * 100).toFixed(0)}%</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Hourly Labor Cost</dt>
                        <dd className="font-mono font-medium text-gray-900 dark:text-white">${benefitAssumptions.hourlyRate}/hr</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2">
                      Adoption & Growth
                    </h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Year 1 Adoption</dt>
                        <dd className="font-mono font-medium text-gray-900 dark:text-white">{(benefitAssumptions.adoptionRate * 100).toFixed(0)}%</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Revenue Uplift</dt>
                        <dd className="font-mono font-medium text-gray-900 dark:text-white">{((benefitAssumptions.upliftPercent || 0) * 100).toFixed(1)}%</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Base Revenue</dt>
                        <dd className="font-mono font-medium text-gray-900 dark:text-white">${(benefitAssumptions.baseRevenuePerMonth || 0).toLocaleString()}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
