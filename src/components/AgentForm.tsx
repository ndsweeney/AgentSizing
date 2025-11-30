import { useState } from 'react';
import { AgentArchetypeSelector } from './AgentArchetypeSelector';
import type { AgentSpec } from '../domain/types';
import { cn } from '../utils/cn';

interface AgentFormProps {
  initialAgent?: Partial<AgentSpec>;
  onSave: (agent: AgentSpec) => void;
  onCancel: () => void;
  className?: string;
}

export function AgentForm({ initialAgent, onSave, onCancel, className }: AgentFormProps) {
  const [agent, setAgent] = useState<Partial<AgentSpec>>({
    title: '',
    purpose: '',
    archetypeId: '',
    ...initialAgent
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!agent.title?.trim()) {
      newErrors.title = 'Agent title is required';
    }
    
    if (!agent.purpose?.trim()) {
      newErrors.purpose = 'Agent purpose is required';
    }
    
    if (!agent.archetypeId) {
      newErrors.archetypeId = 'Agent archetype is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    setTouched({ title: true, purpose: true, archetypeId: true });
    if (validate()) {
      onSave(agent as AgentSpec);
    }
  };

  return (
    <div className={cn("space-y-6 bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700", className)}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Agent Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={agent.title}
            onChange={(e) => setAgent({ ...agent, title: e.target.value })}
            className={cn(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-white",
              errors.title && touched.title ? "border-red-500" : "border-gray-300 dark:border-slate-600"
            )}
            placeholder="e.g. Customer Service Agent"
          />
          {errors.title && touched.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Purpose <span className="text-red-500">*</span>
          </label>
          <textarea
            value={agent.purpose}
            onChange={(e) => setAgent({ ...agent, purpose: e.target.value })}
            className={cn(
              "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-white h-24 resize-none",
              errors.purpose && touched.purpose ? "border-red-500" : "border-gray-300 dark:border-slate-600"
            )}
            placeholder="Describe what this agent does..."
          />
          {errors.purpose && touched.purpose && (
            <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Agent Archetype <span className="text-red-500">*</span>
          </label>
          <AgentArchetypeSelector
            selectedArchetypeId={agent.archetypeId}
            onChange={(id) => {
              setAgent({ ...agent, archetypeId: id });
              if (errors.archetypeId) {
                setErrors({ ...errors, archetypeId: '' });
              }
            }}
          />
          {errors.archetypeId && touched.archetypeId && (
            <p className="text-red-500 text-sm mt-2">{errors.archetypeId}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
        >
          Save Agent
        </button>
      </div>
    </div>
  );
}
