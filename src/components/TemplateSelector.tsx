import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2, ArrowRight, LayoutTemplate } from 'lucide-react';
import { TEMPLATES, type IndustryTemplate } from '../templates';
import { cn } from '../utils/cn';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: IndustryTemplate) => void;
}

export function TemplateSelector({ isOpen, onClose, onSelect }: TemplateSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedTemplate = TEMPLATES.find(t => t.id === selectedId);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Start from Template
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Choose an industry template to pre-fill assessment values.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* List */}
          <div className="w-full md:w-1/3 border-r border-slate-100 dark:border-slate-700 overflow-y-auto p-4 space-y-2 bg-slate-50/30 dark:bg-slate-900/30">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedId(template.id)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all",
                  selectedId === template.id
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 ring-1 ring-blue-200 dark:ring-blue-800 shadow-sm"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                )}
              >
                <div className="font-semibold text-slate-900 dark:text-white mb-1">{template.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {template.industry}
                </div>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white dark:bg-slate-800">
            {selectedTemplate ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedTemplate.name}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedTemplate.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Recommended Use Cases</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.recommendedUseCases.map((useCase) => (
                      <span key={useCase} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800">
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Agent Mesh Strategy</h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    {selectedTemplate.agentMeshSummary}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                  <button
                    onClick={() => onSelect(selectedTemplate)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md"
                  >
                    Create Scenario
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-center p-8">
                <LayoutTemplate className="w-16 h-16 mb-4 opacity-20" />
                <p>Select a template from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
