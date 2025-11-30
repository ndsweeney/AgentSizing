import { CheckCircle2, Info } from 'lucide-react';
import { cn } from '../utils/cn';
import { getArchetypesByTier } from '../data/agentArchetypes';
import type { ArchetypeTier } from '../types/agentArchetype';
import { useRulesStore } from '../state/rulesStore';

interface AgentArchetypeSelectorProps {
  selectedArchetypeId?: string;
  onChange: (id: string) => void;
  className?: string;
}

export function AgentArchetypeSelector({
  selectedArchetypeId,
  onChange,
  className
}: AgentArchetypeSelectorProps) {
  const { sizingThresholds, riskThresholds } = useRulesStore();
  const rulesConfig = { sizingThresholds, riskThresholds };
  
  const renderTierGroup = (tier: ArchetypeTier, title: string) => {
    const archetypes = getArchetypesByTier(tier, rulesConfig);
    if (!archetypes || archetypes.length === 0) return null;

    return (
      <div className="mb-8 last:mb-0">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 capitalize">
          {title}
          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700">
            {archetypes.length}
          </span>
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {archetypes.map((archetype) => {
            const isSelected = selectedArchetypeId === archetype.id;
            
            return (
              <div
                key={archetype.id}
                onClick={() => onChange(archetype.id)}
                className={cn(
                  "relative flex flex-col p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer bg-white dark:bg-slate-800",
                  isSelected 
                    ? "border-blue-600 bg-blue-50/30 dark:bg-blue-900/20 dark:border-blue-400" 
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-700"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {archetype.name}
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 flex-grow">
                  {archetype.shortDescription}
                </p>

                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-slate-700/50">
                  <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{archetype.exampleMicrosoftFit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      {renderTierGroup('core', 'Core Archetypes')}
      {renderTierGroup('extended', 'Extended Archetypes')}
      {/* Emerging tier can be added here if populated in the future */}
    </div>
  );
}
