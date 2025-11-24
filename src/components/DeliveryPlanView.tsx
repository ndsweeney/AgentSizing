import { useState, useEffect, useRef } from 'react';
import { Calendar, CheckSquare, Users, Download, ChevronRight, ChevronDown, Clock, Flag, DollarSign, FileText, FileSpreadsheet } from 'lucide-react';
import { generateDeliveryPlan, type DeliveryTask } from '../domain/delivery';
import { buildDeliveryGanttMermaid } from '../domain/diagrams';
import { MermaidDiagram } from './MermaidDiagram';
import { downloadJson } from '../utils/export';
import { cn } from '../utils/cn';
import type { SizingResult } from '../domain/types';

interface DeliveryPlanViewProps {
  result: SizingResult;
}

export function DeliveryPlanView({ result }: DeliveryPlanViewProps) {
  const plan = generateDeliveryPlan(result);
  const ganttChart = buildDeliveryGanttMermaid(plan);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(plan.phases[0]?.id || null);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Find all text elements in the SVG
    const textElements = chartRef.current.querySelectorAll('svg text');
    
    textElements.forEach((el) => {
      const text = el.textContent?.trim();
      if (text && hoveredTask && text === hoveredTask) {
        (el as SVGTextElement).style.fontWeight = 'bold';
        (el as SVGTextElement).style.fill = '#4f46e5'; // indigo-600
        (el as SVGTextElement).style.fontSize = '14px';
      } else {
        (el as SVGTextElement).style.fontWeight = '';
        (el as SVGTextElement).style.fill = '';
        (el as SVGTextElement).style.fontSize = '';
      }
    });
  }, [hoveredTask]);

  const handleDownloadJson = () => {
    downloadJson(plan, 'agent-delivery-plan.json');
  };

  const handleDownloadCsv = () => {
    const headers = ['Phase', 'Epic', 'Task ID', 'Task Title', 'Start Sprint', 'Duration', 'Dependencies', 'Responsible', 'Accountable'];
    const rows = plan.phases.flatMap(phase => 
      phase.epics.flatMap(epic => 
        epic.tasks.map(task => [
          phase.name,
          epic.title,
          task.id,
          task.title,
          `Sprint ${task.startSprint}`,
          `${task.durationSprints} Sprint(s)`,
          task.dependencies.join(', '),
          task.raci.responsible.join(', '),
          task.raci.accountable.join(', ')
        ])
      )
    );

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'project_plan.csv';
    link.click();
  };

  const handleDownloadMarkdown = () => {
    let md = `# Project Delivery Plan\n\n`;
    md += `**Total Sprints:** ${plan.totalSprints}\n`;
    md += `**Estimated Cost:** $${plan.totalEstimatedCost.toLocaleString()}\n\n`;

    md += `## Resource Plan\n\n`;
    md += `| Role | Count | Allocation | Hours | Cost |\n`;
    md += `|------|-------|------------|-------|------|\n`;
    plan.resources.forEach(r => {
      md += `| ${r.role} | ${r.count} | ${r.allocation}% | ${r.totalHours} | $${r.totalCost.toLocaleString()} |\n`;
    });
    md += `\n`;

    plan.phases.forEach(phase => {
      md += `## ${phase.name} (${phase.duration})\n\n`;
      phase.epics.forEach(epic => {
        md += `### ${epic.title}\n${epic.description}\n\n`;
        epic.tasks.forEach(task => {
          md += `- **${task.title}** (Sprint ${task.startSprint}, ${task.durationSprints} sprints)\n`;
          md += `  - *Responsible:* ${task.raci.responsible.join(', ')}\n`;
        });
        md += `\n`;
      });
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'project_plan.md';
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-indigo-900 mb-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Delivery Accelerator Plan
          </h3>
          <p className="text-sm text-indigo-800">
            Estimated timeline: <span className="font-bold">{plan.totalSprints} Sprints</span>. 
            This plan breaks down the project into phases, epics, and tasks with suggested RACI roles.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
            title="Export to CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
            title="Export to Markdown"
          >
            <FileText className="w-4 h-4" />
            MD
          </button>
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
            title="Export to JSON"
          >
            <Download className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Project Timeline</h3>
        </div>
        <div 
          className="p-6 overflow-x-auto"
          onMouseOver={(e) => {
            // Try to find a task ID from the hovered element or its parents
            // Mermaid Gantt tasks often have IDs or text content we can match
            // Since we used the ID as the label, we might find it in text nodes
            const target = e.target as HTMLElement;
            // Check if we are hovering a text element with a task ID
            if (target.tagName === 'text' && target.textContent?.startsWith('TASK-')) {
              setHoveredTask(target.textContent.trim());
            }
            // Also check for rects which might have IDs if Mermaid preserved them
            // This is tricky without exact DOM knowledge, but text matching is safer given our label strategy
          }}
          onMouseOut={() => setHoveredTask(null)}
          ref={chartRef}
        >

          <MermaidDiagram 
            code={ganttChart.code} 
            title={ganttChart.title}
            description={ganttChart.description}
          />
        </div>
        {/* Task Key */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Task Key</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
            {plan.phases.flatMap(p => p.epics.flatMap(e => e.tasks)).map(task => (
              <div 
                key={task.id} 
                className={cn(
                  "flex items-start gap-2 text-sm p-1 rounded transition-colors cursor-default",
                  hoveredTask === task.id ? "bg-indigo-100 ring-1 ring-indigo-200" : "hover:bg-gray-100"
                )}
                onMouseEnter={() => setHoveredTask(task.id)}
                onMouseLeave={() => setHoveredTask(null)}
              >
                <span className="font-mono font-medium text-indigo-600 whitespace-nowrap">{task.id}</span>
                <span className="text-gray-600 truncate" title={task.title}>{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resource & Cost Estimates */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
            <Users className="w-4 h-4 text-blue-600" />
            Resource Plan
          </h4>
          <div className="space-y-4">
            {plan.resources.map((res, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium text-gray-900">{res.role}</div>
                  <div className="text-gray-500">{res.count} FTE @ {res.allocation}%</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{res.totalHours} hrs</div>
                  <div className="text-gray-500">${res.ratePerHour}/hr</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
            <DollarSign className="w-4 h-4 text-green-600" />
            Cost Estimation
          </h4>
          <div className="flex flex-col items-center justify-center h-full pb-6">
            <div className="text-sm text-gray-500 mb-1">Total Estimated Labor Cost</div>
            <div className="text-4xl font-bold text-gray-900">
              ${plan.totalEstimatedCost.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center max-w-xs">
              *Estimates based on standard market rates and typical velocity. Does not include licensing or infrastructure costs.
            </p>
          </div>
        </div>
      </div>

      {/* Phases & Epics */}
      <div className="space-y-4">
        {plan.phases.map((phase) => (
          <div key={phase.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  expandedPhase === phase.id ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                )}>
                  {phase.id.split('-')[1]}
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">{phase.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {phase.duration}
                  </div>
                </div>
              </div>
              {expandedPhase === phase.id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            </button>

            {expandedPhase === phase.id && (
              <div className="p-6 border-t border-gray-100 space-y-6">
                {phase.epics.map((epic) => (
                  <div key={epic.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-indigo-600" />
                      <h5 className="font-medium text-gray-900">{epic.title}</h5>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">{epic.description}</p>
                    
                    <div className="ml-6 grid gap-3">
                      {epic.tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* RACI Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
          <Users className="w-4 h-4 text-blue-600" />
          RACI Roles Legend
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(plan.raciMatrix).map(([code, role]) => (
            <div key={code} className="flex items-center gap-2 text-sm">
              <span className="font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{code}</span>
              <span className="text-gray-700">{role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: DeliveryTask }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg bg-white hover:border-indigo-200 transition-colors">
      <button 
        onClick={() => setShowDetails(!showDetails)}
        className="w-full px-4 py-3 flex items-start justify-between text-left"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-400">{task.id}</span>
            <span className="text-sm font-medium text-gray-900">{task.title}</span>
          </div>
          <p className="text-xs text-gray-500">{task.description}</p>
        </div>
        {showDetails ? <ChevronDown className="w-4 h-4 text-gray-400 mt-1" /> : <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />}
      </button>

      {showDetails && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-50 bg-gray-50/30 rounded-b-lg">
          <div className="mt-3 grid md:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Acceptance Criteria</span>
              <ul className="mt-1 space-y-1">
                {task.acceptanceCriteria.map((ac, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <CheckSquare className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    {ac}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">RACI</span>
              <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex gap-1"><span className="font-semibold text-gray-700">R:</span> <span className="text-gray-600">{task.raci.responsible.join(', ')}</span></div>
                <div className="flex gap-1"><span className="font-semibold text-gray-700">A:</span> <span className="text-gray-600">{task.raci.accountable.join(', ')}</span></div>
                <div className="flex gap-1"><span className="font-semibold text-gray-700">C:</span> <span className="text-gray-600">{task.raci.consulted.join(', ')}</span></div>
                <div className="flex gap-1"><span className="font-semibold text-gray-700">I:</span> <span className="text-gray-600">{task.raci.informed.join(', ')}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
