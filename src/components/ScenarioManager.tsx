import { useState } from 'react';
import { FolderOpen, Plus, Edit2, Copy, Trash2, FlaskConical } from 'lucide-react';
import { useSizingStore } from '../state/sizingStore';
import { cn } from '../utils/cn';

interface ScenarioManagerProps {
  className?: string;
  listHeightClass?: string;
  onScenarioSelect?: () => void;
}

export function ScenarioManager({ className, listHeightClass = "max-h-48", onScenarioSelect }: ScenarioManagerProps) {
  const { 
    createScenario, 
    deleteScenario, 
    duplicateScenario, 
    renameScenario, 
    setActiveScenario, 
    scenarios, 
    activeScenarioId,
  } = useSizingStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      renameScenario(editingId, editName.trim());
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') setEditingId(null);
  };

  const handleScenarioClick = (id: string) => {
    setActiveScenario(id);
    if (onScenarioSelect) {
      onScenarioSelect();
    }
  };

  return (
    <div className={className}>
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <FolderOpen className="w-3 h-3" />
            Scenarios
          </h2>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => createScenario()}
              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md transition-colors"
              title="New Scenario"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={cn("space-y-1 overflow-y-auto pr-1 custom-scrollbar", listHeightClass)}>
          {scenarios.map((scenario) => (
            <div 
              key={scenario.id}
              className={cn(
                "group flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all",
                scenario.id === activeScenarioId 
                  ? "bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-100 font-medium shadow-sm ring-1 ring-gray-200 dark:ring-slate-700" 
                  : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent"
              )}
            >
              {editingId === scenario.id ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-500 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white"
                  />
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleScenarioClick(scenario.id)}
                    className="flex-1 text-left truncate mr-2 flex items-center gap-2"
                  >
                    {scenario.isSimulation && <FlaskConical className="w-3 h-3 text-purple-500 dark:text-purple-400" />}
                    {scenario.name}
                  </button>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartEdit(scenario.id, scenario.name)}
                      className="p-1 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => duplicateScenario(scenario.id)}
                      className="p-1 text-gray-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-green-400 rounded"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {scenarios.length > 1 && (
                      <button
                        onClick={() => deleteScenario(scenario.id)}
                        className="p-1 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
    </div>
  );
}
