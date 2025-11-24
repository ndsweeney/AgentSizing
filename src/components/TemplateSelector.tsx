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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-blue-600" />
              Start from Template
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Choose an industry template to pre-fill assessment values.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* List */}
          <div className="w-full md:w-1/3 border-r border-slate-100 overflow-y-auto p-4 space-y-2 bg-slate-50/30">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedId(template.id)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all",
                  selectedId === template.id
                    ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200 shadow-sm"
                    : "bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50"
                )}
              >
                <div className="font-semibold text-slate-900 mb-1">{template.name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {template.industry}
                </div>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
            {selectedTemplate ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedTemplate.name}</h3>
                  <p className="text-slate-600 leading-relaxed">{selectedTemplate.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Recommended Use Cases</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.recommendedUseCases.map((useCase) => (
                      <span key={useCase} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Agent Mesh Strategy</h4>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed">
                    {selectedTemplate.agentMeshSummary}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => onSelect(selectedTemplate)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                  >
                    Create Scenario
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-8">
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
