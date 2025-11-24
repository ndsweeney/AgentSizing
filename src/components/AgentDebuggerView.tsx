import { useState, useEffect } from 'react';
import { Play, AlertTriangle, CheckCircle2, ShieldAlert, Download, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { useActiveScenario } from '../state/sizingStore';
import { calculateSizingResult } from '../domain/scoring';
import { runSimulation, generateSimulationMermaid, type SimulationMode, type SimulationTrace } from '../domain/simulation';
import { MermaidDiagram } from './MermaidDiagram';
import { cn } from '../utils/cn';
import { downloadJson } from '../utils/export';

export function AgentDebuggerView() {
  const { scores } = useActiveScenario();
  const result = calculateSizingResult(scores);
  
  const [mode, setMode] = useState<SimulationMode>('happy-path');
  const [trace, setTrace] = useState<SimulationTrace | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  const handleRun = () => {
    const newTrace = runSimulation(mode, result);
    setTrace(newTrace);
    setIsPlaying(true);
    setCurrentStepIndex(-1);
  };

  useEffect(() => {
    if (isPlaying && trace && currentStepIndex < trace.steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 800); // Playback speed
      return () => clearTimeout(timer);
    } else if (currentStepIndex >= (trace?.steps.length || 0) - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStepIndex, trace]);

  const handleExport = () => {
    if (trace) {
      downloadJson(trace, `simulation-trace-${mode}.json`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Play className="w-6 h-6 text-blue-600" />
              Multi-Agent Debugger
            </h2>
            <p className="text-gray-500 mt-1">
              Simulate execution flows between agents to validate architecture and error handling.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {(['happy-path', 'error-path', 'escalation-path'] as SimulationMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                    mode === m 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {m === 'happy-path' && <CheckCircle2 className="w-3 h-3" />}
                  {m === 'error-path' && <AlertTriangle className="w-3 h-3" />}
                  {m === 'escalation-path' && <ShieldAlert className="w-3 h-3" />}
                  {m.split('-')[0].charAt(0).toUpperCase() + m.split('-')[0].slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={handleRun}
              disabled={isPlaying}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isPlaying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Running...' : 'Simulate'}
            </button>

            {trace && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Trace
              </button>
            )}
          </div>
        </div>
      </div>

      {trace && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Timeline / Trace Log */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                Execution Timeline
              </h3>
              <span className="text-xs font-mono text-gray-400">
                {currentStepIndex + 1} / {trace.steps.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {trace.steps.map((step, idx) => (
                <div 
                  key={step.id}
                  className={cn(
                    "relative pl-4 border-l-2 transition-all duration-300",
                    idx <= currentStepIndex ? "opacity-100" : "opacity-30",
                    step.status === 'failure' ? "border-red-500" : "border-blue-200"
                  )}
                >
                  <div className={cn(
                    "absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full border-2 bg-white",
                    idx === currentStepIndex ? "border-blue-600 scale-125" : 
                    step.status === 'failure' ? "border-red-500" : "border-blue-200"
                  )} />
                  
                  <div className="text-xs text-gray-400 mb-1 font-mono">
                    T+{step.timestamp}ms
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600 border border-gray-200">
                      {step.source}
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600 border border-gray-200">
                      {step.target}
                    </span>
                  </div>
                  <div className={cn(
                    "mt-1 text-sm p-2 rounded border",
                    step.status === 'failure' ? "bg-red-50 text-red-700 border-red-100" : "bg-slate-50 text-slate-700 border-slate-100"
                  )}>
                    {step.message}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagram */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
             <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Sequence Diagram</h3>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-white">
              <MermaidDiagram 
                code={generateSimulationMermaid(trace)} 
                className="h-full border-0 shadow-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
