import type { ReportModel } from './reportModel';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CheckCircle2, AlertCircle, Shield, Database, Code, Terminal, DollarSign, Calendar, Activity } from 'lucide-react';

export function renderCoverPage(report: ReportModel) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center border-b-4 border-blue-600 mb-8 page-break">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">Agent Sizing & Architecture Report</h1>
      <h2 className="text-2xl text-gray-600 mb-8">{report.scenario.name}</h2>
      <div className="text-left bg-gray-50 p-8 rounded-xl border border-gray-200 max-w-2xl w-full">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Date</p>
            <p className="font-semibold">{new Date(report.generatedAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Version</p>
            <p className="font-semibold">{report.appVersion}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Facilitator</p>
            <p className="font-semibold">{report.scenario.facilitatorName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Customer</p>
            <p className="font-semibold">{report.scenario.customerName || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function renderExecutiveSummary(report: ReportModel) {
  return (
    <section className="mb-12 page-break-inside-avoid">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b border-gray-200 pb-2">Executive Summary</h2>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">T-Shirt Size</h3>
          <p className="text-5xl font-bold text-blue-900">{report.sizingResult.tShirtSize}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Complexity Score</h3>
          <p className="text-5xl font-bold text-gray-900">{report.sizingResult.totalScore}</p>
        </div>
      </div>
      <div className="prose max-w-none text-gray-700">
        <p className="text-lg leading-relaxed mb-4">{report.scenario.useCase}</p>
        {report.scenario.notes && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-900 mt-4">
            <h4 className="font-semibold mb-1 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Workshop Notes
            </h4>
            <p>{report.scenario.notes}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function renderStrategySection(report: ReportModel) {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b border-gray-200 pb-2 flex items-center gap-3">
        <Activity className="w-8 h-8" /> Strategy
      </h2>
      
      {/* Maturity */}
      {report.maturity && (
        <div className="mb-8 page-break-inside-avoid">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Organizational Maturity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(report.maturity.scores).map(([key, level]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  level === 3 ? 'bg-green-100 text-green-800' :
                  level === 2 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {level === 3 ? 'High' : level === 2 ? 'Medium' : 'Low'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Value Roadmap */}
      {report.valueRoadmap && (
        <div className="mb-8 page-break-inside-avoid">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Value Roadmap</h3>
          <div className="space-y-4">
            {report.valueRoadmap.initiatives.map((init, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-blue-700">{init.title}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{init.horizon}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{init.description}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Impact: {init.impact}</span>
                  <span>Effort: {init.effort}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Governance */}
      {report.governance && (
        <div className="mb-8 page-break-inside-avoid">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Governance & Compliance
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-700">Impact Level</span>
              <span className={`px-3 py-1 rounded-full font-bold ${
                report.governance.impactLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                report.governance.impactLevel === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>{report.governance.impactLevel}</span>
            </div>
          </div>
          <div className="space-y-3">
            {report.governance.requirements.map((req, i) => (
              <div key={i} className="border-l-4 border-blue-500 pl-4 py-1">
                <h4 className="font-bold text-gray-900 text-sm">{req.title} <span className="text-xs font-normal text-gray-500">({req.priority})</span></h4>
                <p className="text-sm text-gray-600">{req.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function renderArchitectureSection(report: ReportModel) {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b border-gray-200 pb-2 flex items-center gap-3">
        <Database className="w-8 h-8" /> Architecture
      </h2>

      {report.diagrams?.agentFlow && (
        <div className="mb-8 page-break-inside-avoid diagram-block">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Agent Flow (L1)</h3>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <MermaidDiagram code={report.diagrams.agentFlow.code} />
          </div>
        </div>
      )}

      {report.diagrams?.systemIntegration && (
        <div className="mb-8 page-break-inside-avoid diagram-block">
          <h3 className="text-xl font-bold text-gray-800 mb-4">System Integration (L2)</h3>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <MermaidDiagram code={report.diagrams.systemIntegration.code} />
          </div>
        </div>
      )}

      {report.architecture?.copilotSpec && (
        <div className="mb-8 page-break-inside-avoid">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Copilot Architecture</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(report.architecture.copilotSpec).map(([key, value]) => {
              if (value === 'None' || value === 'N/A') return null;
              return (
                <div key={key} className="p-4 bg-gray-50 rounded border border-gray-200">
                  <h4 className="font-bold text-gray-700 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{value}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export function renderBuildSection(report: ReportModel) {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b border-gray-200 pb-2 flex items-center gap-3">
        <Code className="w-8 h-8" /> Build
      </h2>

      {/* Blueprints */}
      {report.blueprints && report.blueprints.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Agent Blueprints</h3>
          <div className="space-y-6">
            {report.blueprints.map((bp, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200 page-break-inside-avoid">
                <pre className="whitespace-pre-wrap text-xs font-mono text-gray-700 overflow-x-auto">{bp}</pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompts */}
      {report.prompts && report.prompts.length > 0 && (
        <div className="mb-8 page-break-inside-avoid">
          <h3 className="text-xl font-bold text-gray-800 mb-4">LLM Prompts</h3>
          <div className="space-y-4">
            {report.prompts.map((prompt, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-700">{prompt.title}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">{prompt.agentType}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{prompt.description}</p>
                <pre className="whitespace-pre-wrap text-xs font-mono text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                  {prompt.systemPrompt}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connectors */}
      {report.connectors && report.connectors.length > 0 && (
        <div className="mb-8 page-break-inside-avoid">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Connectors & APIs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.connectors.map((conn, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-bold text-gray-900">{conn.name}</h4>
                <p className="text-sm text-gray-500 mb-2">{conn.provider}</p>
                <p className="text-sm text-gray-700">{conn.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function renderPocSection(report: ReportModel) {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b border-gray-200 pb-2 flex items-center gap-3">
        <Terminal className="w-8 h-8" /> PoC
      </h2>

      {report.exampleData && report.exampleData.length > 0 && (
        <div className="mb-8 page-break-inside-avoid">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Example Data</h3>
          <div className="space-y-4">
            {report.exampleData.map((data, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-semibold text-sm text-gray-700">
                  {data.name}
                </div>
                <div className="p-4 bg-white overflow-x-auto">
                  <pre className="text-xs font-mono text-gray-600">{JSON.stringify(data.data[0], null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function renderCostsSection(report: ReportModel) {
  if (!report.costs) return null;

  return (
    <section className="mb-12 page-break-inside-avoid">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b border-gray-200 pb-2 flex items-center gap-3">
        <DollarSign className="w-8 h-8" /> Costs & ROI
      </h2>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total One-Time</h3>
          <p className="text-4xl font-bold text-gray-900">${report.costs.totalOneTime.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Monthly Recurring</h3>
          <p className="text-4xl font-bold text-gray-900">${report.costs.totalMonthly.toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Cost Breakdown</h3>
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Item</th>
              <th className="px-6 py-3">One-Time</th>
              <th className="px-6 py-3">Monthly</th>
              <th className="px-6 py-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {report.costs.items.map((item, i) => (
              <tr key={i} className="bg-white border-b">
                <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4">${item.oneTimeCost.toLocaleString()}</td>
                <td className="px-6 py-4">${item.monthlyCost.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-500">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {report.roi && (
        <div className="mb-8 page-break-inside-avoid">
          <h3 className="text-xl font-bold text-gray-800 mb-4">ROI Analysis</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <p className="text-sm text-gray-500 mb-1">Year 1 Net</p>
              <p className={`text-xl font-bold ${report.roi.oneYear.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${report.roi.oneYear.netBenefit.toLocaleString()}
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <p className="text-sm text-gray-500 mb-1">Year 3 Net</p>
              <p className={`text-xl font-bold ${report.roi.threeYear.netBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${report.roi.threeYear.netBenefit.toLocaleString()}
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <p className="text-sm text-gray-500 mb-1">Break-even</p>
              <p className="text-xl font-bold text-blue-600">{report.roi.paybackMonths.toFixed(1)} months</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function renderTestingSection(report: ReportModel) {
  if (!report.testPlan) return null;

  return (
    <section className="mb-12 page-break-inside-avoid">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b border-gray-200 pb-2 flex items-center gap-3">
        <CheckCircle2 className="w-8 h-8" /> Testing
      </h2>
      <div className="space-y-4">
        {report.testPlan.map((test, i) => (
          <div key={i} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
            <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${
              test.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {test.priority}
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{test.testCase}</h4>
              <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">Expected:</span> {test.expectedResult}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function renderOperateSection(report: ReportModel) {
  if (!report.debuggerConfig) return null;

  return (
    <section className="mb-12 page-break-inside-avoid">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b border-gray-200 pb-2 flex items-center gap-3">
        <Activity className="w-8 h-8" /> Operate
      </h2>
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Debugger Configuration</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Trace Enabled</p>
            <p className="font-semibold">{report.debuggerConfig.traceEnabled ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-gray-500">Log Level</p>
            <p className="font-semibold">{report.debuggerConfig.logLevel}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500 mb-1">Monitored Events</p>
            <div className="flex gap-2 flex-wrap">
              {report.debuggerConfig.monitoredEvents.map(e => (
                <span key={e} className="bg-white border border-gray-300 px-2 py-1 rounded text-xs font-mono">{e}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function renderReportingSection(report: ReportModel) {
  if (!report.deliveryPlan) return null;

  return (
    <section className="mb-12 page-break-inside-avoid">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b border-gray-200 pb-2 flex items-center gap-3">
        <Calendar className="w-8 h-8" /> Delivery Plan
      </h2>
      <div className="space-y-6">
        {report.deliveryPlan.phases.map((phase, i) => (
          <div key={i} className="border-l-4 border-blue-500 pl-6 py-2">
            <h3 className="text-xl font-bold text-gray-900">{phase.name}</h3>
            <p className="text-sm text-blue-600 font-semibold mb-2">{phase.duration}</p>
            <div className="space-y-2">
              {phase.epics.map((epic, j) => (
                <div key={j} className="bg-gray-50 p-3 rounded border border-gray-100">
                  <h4 className="font-semibold text-gray-800 text-sm">{epic.title}</h4>
                  <p className="text-xs text-gray-600">{epic.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function renderAppendices(report: ReportModel) {
  return (
    <section className="mb-12 page-break-before">
      <h2 className="text-3xl font-bold text-gray-400 mb-6 border-b border-gray-200 pb-2">Appendices</h2>
      
      {report.starterPack && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-600 mb-4">Starter Pack Contents</h3>
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-6 py-3">File</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {report.starterPack.map((item, i) => (
                  <tr key={i} className="bg-white border-b">
                    <td className="px-6 py-4 font-mono text-blue-600">{item.filename}</td>
                    <td className="px-6 py-4">{item.type}</td>
                    <td className="px-6 py-4">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 font-mono mt-8">
        <p>Scenario Hash: {report.scenarioHash}</p>
        <p>Generated: {report.generatedAt}</p>
      </div>
    </section>
  );
}
