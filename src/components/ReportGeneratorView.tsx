import { FileText, CheckCircle2, AlertCircle, Printer } from 'lucide-react';
import { useActiveScenario } from '../state/sizingStore';
import { buildReportModel } from '../report/reportBuilder';
import { renderReportMarkdown } from '../report/renderMarkdown';

export function ReportGeneratorView() {
  const { scenario } = useActiveScenario();
  
  const report = buildReportModel(scenario.id);

  if (!report) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-slate-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500 dark:text-red-400" />
        <h3 className="text-lg font-medium">Unable to generate report</h3>
        <p>Could not find scenario data.</p>
      </div>
    );
  }

  const handleDownloadMarkdown = () => {
    const md = renderReportMarkdown(report);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agent-sizing-report-${scenario.name.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenPrintView = () => {
    window.open(`?print=true&scenarioId=${scenario.id}`, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Report Generator
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              Generate and download comprehensive documentation for your agent sizing assessment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={handleOpenPrintView}
            className="flex items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 border-2 border-blue-100 dark:border-blue-900 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group text-left"
          >
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
              <Printer className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Print / PDF View</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">Open a print-optimized view to save as PDF</p>
            </div>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-xl hover:border-gray-500 dark:hover:border-slate-500 hover:shadow-md transition-all group text-left"
          >
            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg group-hover:bg-gray-100 dark:group-hover:bg-slate-600 transition-colors">
              <FileText className="w-8 h-8 text-gray-600 dark:text-slate-300" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Markdown Report</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">Single file documentation</p>
            </div>
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Included in Report</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Executive Summary",
              "Scenario Overview",
              "Sizing & Scoring",
              "Architecture Diagrams",
              "Agent Blueprints",
              "Topic Skeletons",
              "Governance Model",
              "Cost Analysis",
              "ROI Projections",
              "Delivery Plan",
              "Value Roadmap",
              "Example Datasets"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
