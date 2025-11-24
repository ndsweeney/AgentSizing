import { useState } from 'react';
import { FileText, FileJson, Archive, Download, CheckCircle2, AlertCircle, Printer } from 'lucide-react';
import { useActiveScenario } from '../state/sizingStore';
import { buildReportModel } from '../report/reportBuilder';
import { renderReportMarkdown } from '../report/renderMarkdown';
import { renderReportJson } from '../report/renderJson';
import { exportReportZip } from '../report/exportZip';

export function ReportGeneratorView() {
  const { scenario } = useActiveScenario();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<'zip' | null>(null);
  
  const report = buildReportModel(scenario.id);

  if (!report) {
    return (
      <div className="p-8 text-center text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
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

  const handleDownloadJson = () => {
    const blob = new Blob([renderReportJson(report)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agent-sizing-report-${scenario.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenPrintView = () => {
    window.open(`?print=true&scenarioId=${scenario.id}`, '_blank');
  };

  const handleDownloadZip = async () => {
    setIsGenerating(true);
    setGeneratingType('zip');
    try {
      const blob = await exportReportZip(report);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `agent-solution-pack-${scenario.name.replace(/\s+/g, '-').toLowerCase()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate ZIP', error);
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Report Generator
            </h2>
            <p className="text-gray-500 mt-1">
              Generate and download comprehensive documentation for your agent sizing assessment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={handleOpenPrintView}
            className="flex items-center justify-center gap-3 p-6 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group text-left"
          >
            <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Printer className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Print / PDF View</h3>
              <p className="text-sm text-gray-500">Open a print-optimized view to save as PDF</p>
            </div>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center justify-center gap-3 p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-gray-500 hover:shadow-md transition-all group text-left"
          >
            <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Markdown Report</h3>
              <p className="text-sm text-gray-500">Single file documentation</p>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* JSON Card */}
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FileJson className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">JSON Data</h3>
                <p className="text-xs text-gray-500">Raw data export</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 flex-grow">
              The raw data structure including all scores, inputs, and generated recommendations. Useful for programmatic processing.
            </p>
            <button
              onClick={handleDownloadJson}
              disabled={isGenerating}
              className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Download JSON
            </button>
          </div>

          {/* ZIP Card */}
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Archive className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Solution Pack</h3>
                <p className="text-xs text-gray-500">Full artifact bundle</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 flex-grow">
              A ZIP archive containing the report, diagrams, datasets, and blueprints. Best for handing off to delivery teams.
            </p>
            <button
              onClick={handleDownloadZip}
              disabled={isGenerating}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isGenerating && generatingType === 'zip' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download ZIP
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Included in Report</h3>
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
              <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
