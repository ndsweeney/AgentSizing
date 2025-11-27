import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DIMENSIONS, type ScoreValue, type DimensionId, type ScoresRecord } from '../domain/scoring';
import { type CostAssumptions, DEFAULT_COST_ASSUMPTIONS } from '../domain/costs';
import { type BenefitAssumptions, DEFAULT_BENEFIT_ASSUMPTIONS } from '../domain/roi';
import type { IndustryTemplate } from '../templates';
import { type MaturityLevel, MATURITY_DIMENSIONS } from '../domain/maturity';

export type AssessmentMode = 'single' | 'compare';
export type ViewState = 'intro' | 'wizard' | 'results' | 'portfolio' | 'knowledge';

export interface Scenario {
  id: string;
  name: string;
  scores: ScoresRecord;
  targetScores: ScoresRecord;
  maturityScores: Record<string, MaturityLevel>;
  systems: string[];
  mode: AssessmentMode;
  currentStep: number;
  createdAt: number;
  lastUpdated: number;
  
  // Metadata
  facilitatorName: string;
  customerName: string;
  workshopTitle: string;
  industry: string;
  useCase: string;
  notes: string;
  dimensionComments: Record<string, string>;
  costAssumptions: CostAssumptions;
  benefitAssumptions: BenefitAssumptions;
  isSimulation?: boolean;
  originalScenarioId?: string;
}

export interface SizingState {
  scenarios: Scenario[];
  activeScenarioId: string;
  isReadOnly: boolean;
  isCoachMode: boolean;
  currentView: ViewState;
  
  // Actions for active scenario
  setScore: (dimensionId: DimensionId, value: ScoreValue) => void;
  setTargetScore: (dimensionId: DimensionId, value: ScoreValue) => void;
  setMaturityScore: (dimensionId: string, value: MaturityLevel) => void;
  setSystems: (systems: string[]) => void;
  setMode: (mode: AssessmentMode) => void;
  setCoachMode: (enabled: boolean) => void;
  setView: (view: ViewState) => void;
  resetActiveScenario: () => void;
  setCurrentStep: (step: number) => void;
  goNext: () => void;
  goPrevious: () => void;
  
  // Metadata Actions
  updateMetadata: (field: keyof Pick<Scenario, 'facilitatorName' | 'customerName' | 'workshopTitle' | 'notes' | 'industry' | 'useCase'>, value: string) => void;
  setDimensionComment: (dimensionId: DimensionId, comment: string) => void;
  updateCostAssumptions: (assumptions: Partial<CostAssumptions>) => void;
  updateBenefitAssumptions: (assumptions: Partial<BenefitAssumptions>) => void;

  // Scenario Management
  createScenario: (name?: string, metadata?: Partial<Scenario>) => void;
  createFromTemplate: (template: IndustryTemplate) => void;
  createSimulation: () => void;
  renameScenario: (id: string, name: string) => void;
  duplicateScenario: (id: string) => void;
  deleteScenario: (id: string) => void;
  setActiveScenario: (id: string) => void;
  
  // Sharing
  importScenario: (scenario: Scenario) => void;
  setReadOnly: (readonly: boolean) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const createNewScenario = (name: string): Scenario => ({
  id: crypto.randomUUID(),
  name,
  scores: {},
  targetScores: {},
  maturityScores: {},
  systems: [],
  mode: 'single',
  currentStep: 0,
  createdAt: Date.now(),
  lastUpdated: Date.now(),
  facilitatorName: '',
  customerName: '',
  workshopTitle: '',
  industry: '',
  useCase: '',
  notes: '',
  dimensionComments: {},
  costAssumptions: DEFAULT_COST_ASSUMPTIONS,
  benefitAssumptions: DEFAULT_BENEFIT_ASSUMPTIONS,
});

export const useSizingStore = create<SizingState>()(
  persist(
    (set) => ({
      scenarios: [createNewScenario('Default Scenario')],
      activeScenarioId: '', // Will be set in onRehydrate or init
      isReadOnly: false,
      isCoachMode: false,
      currentView: 'intro',
      theme: 'light',

      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setCoachMode: (enabled) => set({ isCoachMode: enabled }),
      setView: (view) => set({ currentView: view }),

      updateCostAssumptions: (assumptions) =>
        set((state) => {
          const activeId = state.activeScenarioId;
          if (state.isReadOnly) return {};
          return {
            scenarios: state.scenarios.map(s =>
              s.id === activeId
                ? { 
                    ...s, 
                    costAssumptions: { ...(s.costAssumptions || DEFAULT_COST_ASSUMPTIONS), ...assumptions },
                    lastUpdated: Date.now() 
                  }
                : s
            )
          };
        }),

      updateBenefitAssumptions: (assumptions) =>
        set((state) => {
          const activeId = state.activeScenarioId;
          if (state.isReadOnly) return {};
          return {
            scenarios: state.scenarios.map(s =>
              s.id === activeId
                ? { 
                    ...s, 
                    benefitAssumptions: { ...(s.benefitAssumptions || DEFAULT_BENEFIT_ASSUMPTIONS), ...assumptions },
                    lastUpdated: Date.now() 
                  }
                : s
            )
          };
        }),

      updateMetadata: (field, value) =>
        set((state) => {
          const activeId = state.activeScenarioId;
          if (state.isReadOnly) return {};
          
          return {
            scenarios: state.scenarios.map(s => {
              if (s.id === activeId) {
                const updates: Partial<Scenario> = { 
                  [field]: value, 
                  lastUpdated: Date.now() 
                };
                
                // If updating workshop title, also update the scenario name
                if (field === 'workshopTitle' && value.trim()) {
                  updates.name = value.trim();
                }
                
                return { ...s, ...updates };
              }
              return s;
            })
          };
        }),

      setDimensionComment: (dimensionId, comment) =>
        set((state) => {
          const activeId = state.activeScenarioId;
          if (state.isReadOnly) return {};
          return {
            scenarios: state.scenarios.map(s =>
              s.id === activeId
                ? {
                    ...s,
                    dimensionComments: { ...s.dimensionComments, [dimensionId]: comment },
                    lastUpdated: Date.now()
                  }
                : s
            )
          };
        }),

      importScenario: (scenario) =>
        set((state) => {
            const exists = state.scenarios.find(s => s.id === scenario.id);
            if (exists) {
                return { activeScenarioId: scenario.id };
            }
            return {
                scenarios: [...state.scenarios, scenario],
                activeScenarioId: scenario.id
            };
        }),

      setReadOnly: (readonly) => set({ isReadOnly: readonly }),

      setScore: (dimensionId, value) => 
        set((state) => {
          if (state.isReadOnly) return {};
          const activeId = state.activeScenarioId;
          return {
            scenarios: state.scenarios.map(s => 
              s.id === activeId 
                ? { ...s, scores: { ...s.scores, [dimensionId]: value }, lastUpdated: Date.now() }
                : s
            )
          };
        }),

      setTargetScore: (dimensionId, value) => 
        set((state) => {
          if (state.isReadOnly) return {};
          const activeId = state.activeScenarioId;
          return {
            scenarios: state.scenarios.map(s => 
              s.id === activeId 
                ? { ...s, targetScores: { ...s.targetScores, [dimensionId]: value }, lastUpdated: Date.now() }
                : s
            )
          };
        }),

      setMaturityScore: (dimensionId, value) =>
        set((state) => {
          const activeId = state.activeScenarioId;
          if (state.isReadOnly) return {};
          return {
            scenarios: state.scenarios.map(s =>
              s.id === activeId
                ? {
                    ...s,
                    maturityScores: { ...(s.maturityScores || {}), [dimensionId]: value },
                    lastUpdated: Date.now()
                  }
                : s
            )
          };
        }),

      setSystems: (systems) => 
        set((state) => {
          if (state.isReadOnly) return {};
          const activeId = state.activeScenarioId;
          return {
            scenarios: state.scenarios.map(s => 
              s.id === activeId 
                ? { ...s, systems, lastUpdated: Date.now() }
                : s
            )
          };
        }),

      setMode: (mode) => 
        set((state) => {
          if (state.isReadOnly) return {};
          const activeId = state.activeScenarioId;
          return {
            scenarios: state.scenarios.map(s => 
              s.id === activeId 
                ? { ...s, mode, lastUpdated: Date.now() }
                : s
            )
          };
        }),

      resetActiveScenario: () => 
        set((state) => {
          const activeId = state.activeScenarioId;
          return {
            scenarios: state.scenarios.map(s => 
              s.id === activeId 
                ? { ...s, scores: {}, targetScores: {}, currentStep: 0, lastUpdated: Date.now() }
                : s
            )
          };
        }),

      setCurrentStep: (step) => 
        set((state) => {
          const activeId = state.activeScenarioId;
          const safeStep = Math.max(0, Math.min(step, DIMENSIONS.length - 1));
          return {
            scenarios: state.scenarios.map(s => 
              s.id === activeId 
                ? { ...s, currentStep: safeStep, lastUpdated: Date.now() }
                : s
            )
          };
        }),

      goNext: () => 
        set((state) => {
          const activeId = state.activeScenarioId;
          const scenario = state.scenarios.find(s => s.id === activeId);
          if (!scenario) return state;
          
          const totalSteps = DIMENSIONS.length + MATURITY_DIMENSIONS.length;
          const nextStep = Math.min(scenario.currentStep + 1, totalSteps - 1);
          return {
            scenarios: state.scenarios.map(s => 
              s.id === activeId 
                ? { ...s, currentStep: nextStep, lastUpdated: Date.now() }
                : s
            )
          };
        }),

      goPrevious: () => 
        set((state) => {
          const activeId = state.activeScenarioId;
          const scenario = state.scenarios.find(s => s.id === activeId);
          if (!scenario) return state;

          const prevStep = Math.max(scenario.currentStep - 1, 0);
          return {
            scenarios: state.scenarios.map(s => 
              s.id === activeId 
                ? { ...s, currentStep: prevStep, lastUpdated: Date.now() }
                : s
            )
          };
        }),

      createScenario: (name = 'New Scenario', metadata = {}) => 
        set((state) => {
          const newScenario = {
            ...createNewScenario(name),
            ...metadata
          };
          return {
            scenarios: [...state.scenarios, newScenario],
            activeScenarioId: newScenario.id
          };
        }),

      createFromTemplate: (template) =>
        set((state) => {
          const newScenario = createNewScenario(`${template.name} Assessment`);
          newScenario.industry = template.industry;
          newScenario.scores = { ...template.defaultScores };
          newScenario.notes = template.agentMeshSummary;
          // Optional: set first use case as default
          if (template.recommendedUseCases.length > 0) {
            newScenario.useCase = template.recommendedUseCases[0];
          }
          
          return {
            scenarios: [...state.scenarios, newScenario],
            activeScenarioId: newScenario.id
          };
        }),

      renameScenario: (id, name) =>
        set((state) => ({
          scenarios: state.scenarios.map(s => s.id === id ? { ...s, name, lastUpdated: Date.now() } : s)
        })),

      duplicateScenario: (id) =>
        set((state) => {
          const original = state.scenarios.find(s => s.id === id);
          if (!original) return state;
          const copy = {
            ...original,
            id: crypto.randomUUID(),
            name: `${original.name} (Copy)`,
            createdAt: Date.now(),
            lastUpdated: Date.now(),
            targetScores: original.targetScores || {},
            mode: original.mode || 'single'
          };
          return {
            scenarios: [...state.scenarios, copy],
            activeScenarioId: copy.id
          };
        }),

      deleteScenario: (id) =>
        set((state) => {
          if (state.scenarios.length <= 1) return state; // Prevent deleting last scenario
          const newScenarios = state.scenarios.filter(s => s.id !== id);
          const newActiveId = state.activeScenarioId === id ? newScenarios[0].id : state.activeScenarioId;
          return {
            scenarios: newScenarios,
            activeScenarioId: newActiveId
          };
        }),

      setActiveScenario: (id) => set({ activeScenarioId: id }),

      createSimulation: () =>
        set((state) => {
          const original = state.scenarios.find(s => s.id === state.activeScenarioId);
          if (!original) return state;
          const simulation = {
            ...original,
            id: crypto.randomUUID(),
            name: `${original.name} (Simulation)`,
            createdAt: Date.now(),
            lastUpdated: Date.now(),
            targetScores: original.targetScores || {},
            mode: original.mode || 'single',
            isSimulation: true,
            originalScenarioId: original.id
          };
          return {
            scenarios: [...state.scenarios, simulation],
            activeScenarioId: simulation.id,
            isReadOnly: false
          };
        }),
    }),
    {
      name: 'agentSizingWorkshop_v2',
      onRehydrateStorage: () => (state) => {
        // Ensure there's at least one scenario and an active ID
        if (state) {
          if (state.scenarios.length === 0) {
            const defaultScenario = createNewScenario('Default Scenario');
            state.scenarios = [defaultScenario];
            state.activeScenarioId = defaultScenario.id;
          } else if (!state.activeScenarioId || !state.scenarios.find(s => s.id === state.activeScenarioId)) {
            state.activeScenarioId = state.scenarios[0].id;
          }
        }
      }
    }
  )
);

// Helper hook to get active scenario data
export const useActiveScenario = () => {
  const store = useSizingStore();
  const scenario = store.scenarios.find(s => s.id === store.activeScenarioId) || store.scenarios[0];
  return {
    scenario,
    scores: scenario?.scores || {},
    targetScores: scenario?.targetScores || {},
    maturityScores: scenario?.maturityScores || {},
    mode: scenario?.mode || 'single',
    currentStep: scenario?.currentStep || 0,
  };
};

export const useHasCompletedAllDimensions = () => {
  const { scores, targetScores, mode } = useActiveScenario();
  const currentComplete = DIMENSIONS.every((dim) => scores[dim.id] !== undefined && scores[dim.id] !== null);
  
  if (mode === 'compare') {
    const targetComplete = DIMENSIONS.every((dim) => targetScores[dim.id] !== undefined && targetScores[dim.id] !== null);
    return currentComplete && targetComplete;
  }
  
  return currentComplete;
};
