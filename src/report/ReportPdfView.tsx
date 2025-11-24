import React from 'react';
import type { ReportModel } from './reportModel';
import { DIMENSIONS } from '../domain/scoring';

interface ReportPdfViewProps {
  report: ReportModel;
}

export const ReportPdfView: React.FC<ReportPdfViewProps> = ({ report }) => {
  const { scenario, sizingResult, riskProfile } = report;

  return (
    <div className="report-container font-sans text-gray-900 bg-white p-8 max-w-[210mm] mx-auto">
      <style>{`
        @media print {
          @page { margin: 20mm; size: A4; }
          body { -webkit-print-color-adjust: exact; }
        }
        .page-break { page-break-before: always; }
        .avoid-break { page-break-inside: avoid; }
        .section-title { font-size: 24px; font-weight: bold; color: #1e40af; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
        .subsection-title { font-size: 18px; font-weight: bold; color: #374151; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .card { border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; background-color: #fff; }
        .highlight-box { background-color: #eff6ff; padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #2563eb; margin-bottom: 1rem; }
        .table-row { display: flex; border-bottom: 1px solid #e5e7eb; padding: 0.5rem 0; }
        .table-header { font-weight: bold; background-color: #f9fafb; }
        img { max-width: 100%; height: auto; page-break-inside: avoid; }

        /* Color Overrides for html2canvas compatibility (No oklch) */
        .text-gray-900 { color: #111827 !important; }
        .text-gray-700 { color: #374151 !important; }
        .text-gray-600 { color: #4b5563 !important; }
        .text-gray-500 { color: #6b7280 !important; }
        .text-blue-900 { color: #1e3a8a !important; }
        .text-blue-800 { color: #1e40af !important; }
        .text-blue-700 { color: #1d4ed8 !important; }
        .text-blue-600 { color: #2563eb !important; }
        .text-green-700 { color: #15803d !important; }
        .text-green-600 { color: #16a34a !important; }
        .bg-white { background-color: #ffffff !important; }
        .bg-gray-50 { background-color: #f9fafb !important; }
        .bg-gray-100 { background-color: #f3f4f6 !important; }
        .border-gray-200 { border-color: #e5e7eb !important; }
      `}</style>

      {/* Cover Page */}
      <div className="min-h-[250mm] flex flex-col justify-center text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">{scenario.workshopTitle || 'Agent Sizing Workshop'}</h1>
        <div className="text-xl text-gray-600 mb-8">
          <p>Prepared for: {scenario.customerName || 'Unknown Customer'}</p>
          <p>Facilitator: {scenario.facilitatorName || 'Unknown'}</p>
        </div>
        <div className="text-gray-500">
          <p>Date: {new Date(report.generatedAt).toLocaleDateString()}</p>
          <p>Version: {report.appVersion}</p>
        </div>
      </div>

      <div className="page-break" />

      {/* Executive Summary */}
      <section>
        <h2 className="section-title">Executive Summary</h2>
        <div className="highlight-box">
          <p className="mb-2">Based on the assessment, the proposed agent solution is sized as <strong>{sizingResult.tShirtSize}</strong>.</p>
          <p>Risk Profile: <strong>{riskProfile.level}</strong></p>
        </div>
        <p className="mb-4">This report outlines the recommended architecture, sizing considerations, and delivery roadmap for the proposed agentic solution.</p>
        
        {sizingResult.notes.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Key Recommendations:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {sizingResult.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Scenario Overview */}
      <section className="mt-8 avoid-break">
        <h2 className="section-title">Scenario Overview</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><span className="font-bold">Industry:</span> {scenario.industry || 'Not specified'}</div>
          <div><span className="font-bold">Use Case:</span> {scenario.useCase || 'Not specified'}</div>
        </div>
        <div className="mb-4"><span className="font-bold">Systems:</span> {scenario.systems.length > 0 ? scenario.systems.join(', ') : 'None selected'}</div>
        <div>
          <span className="font-bold block mb-2">Description:</span>
          <p className="whitespace-pre-wrap">{scenario.notes || 'No additional notes provided.'}</p>
        </div>
      </section>

      <div className="page-break" />

      {/* Assessment Dimensions */}
      <section>
        <h2 className="section-title">Assessment Dimensions</h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="table-row table-header">
            <div className="w-1/4 px-4">Dimension</div>
            <div className="w-1/4 px-4">Score</div>
            <div className="w-1/2 px-4">Description</div>
          </div>
          {DIMENSIONS.map((dim) => {
            const val = scenario.scores[dim.id];
            const scoreLabel = val === 1 ? 'Small' : val === 2 ? 'Medium' : val === 3 ? 'Large' : '-';
            return (
              <div key={dim.id} className="table-row avoid-break">
                <div className="w-1/4 px-4 font-medium">{dim.label}</div>
                <div className="w-1/4 px-4">{scoreLabel} ({val})</div>
                <div className="w-1/2 px-4 text-sm text-gray-600">{dim.description}</div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="page-break" />

      {/* Architecture */}
      <section>
        <h2 className="section-title">Recommended Architecture</h2>
        
        <div className="card avoid-break">
          <h3 className="subsection-title mt-0">Agent Pattern</h3>
          <ul className="list-disc pl-5 space-y-1">
            {sizingResult.recommendedAgentPattern.map((pattern, i) => (
              <li key={i}>{pattern}</li>
            ))}
          </ul>
        </div>

        <div className="card avoid-break">
          <h3 className="subsection-title mt-0">Required Agent Types</h3>
          <div className="space-y-4">
            {sizingResult.agentArchitecture.map((agent, i) => (
              <div key={i}>
                <div className="font-bold text-blue-800">{agent.type} ({agent.necessity})</div>
                <div className="text-sm text-gray-700">{agent.reason}</div>
              </div>
            ))}
          </div>
        </div>

        {report.architecture && (
          <div className="card avoid-break">
            <h3 className="subsection-title mt-0">Copilot Studio Structure</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div><span className="font-bold">Experience Agents:</span> {report.architecture.copilotSpec.experienceAgents}</div>
              <div><span className="font-bold">Value Stream Agents:</span> {report.architecture.copilotSpec.valueStreamAgents}</div>
              <div><span className="font-bold">Function Agents:</span> {report.architecture.copilotSpec.functionAgents}</div>
              <div><span className="font-bold">Process Agents:</span> {report.architecture.copilotSpec.processAgents}</div>
              <div><span className="font-bold">Task Agents:</span> {report.architecture.copilotSpec.taskAgents}</div>
              <div><span className="font-bold">Control Agents:</span> {report.architecture.copilotSpec.controlAgents}</div>
              <div className="col-span-2 mt-2"><span className="font-bold">Foundry Requirement:</span> {report.architecture.copilotSpec.foundryRequirement}</div>
            </div>
          </div>
        )}
      </section>

      {/* Blueprints */}
      {report.blueprints && report.blueprints.length > 0 && (
        <>
          <div className="page-break" />
          <section>
            <h2 className="section-title">Agent Blueprints</h2>
            {report.blueprints.map((blueprint, i) => (
              <div key={i} className="card avoid-break">
                <pre className="whitespace-pre-wrap font-sans text-sm">{blueprint.replace(/#/g, '').trim()}</pre>
              </div>
            ))}
          </section>
        </>
      )}

      {/* Topic Skeletons */}
      {report.topicSkeletons && report.topicSkeletons.length > 0 && (
        <>
          <div className="page-break" />
          <section>
            <h2 className="section-title">Topic Skeletons</h2>
            {report.topicSkeletons.map((topic, i) => (
              <div key={i} className="card avoid-break">
                <h3 className="subsection-title mt-0">{topic.name} <span className="text-sm font-normal text-gray-500">({topic.agentType})</span></h3>
                
                <div className="mt-4">
                  <span className="font-bold text-sm uppercase text-gray-500">Trigger Phrases</span>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {topic.triggerPhrases.map((phrase, j) => (
                      <li key={j} className="text-sm">"{phrase}"</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <span className="font-bold text-sm uppercase text-gray-500">Steps</span>
                  <ol className="list-decimal pl-5 mt-1 space-y-1">
                    {topic.steps.map((step, j) => (
                      <li key={j} className="text-sm">{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      {/* Technical Diagrams */}
      {report.diagrams && (
        <>
          <div className="page-break" />
          <section>
            <h2 className="section-title">Technical Diagrams</h2>
            
            {report.diagrams.agentFlow && (
              <div className="mb-8 avoid-break">
                <h3 className="subsection-title">Agent Architecture Flow</h3>
                <div className="diagram-block border border-gray-200 rounded p-4 flex justify-center">
                  {report.diagrams.agentFlow.imageUrl ? (
                    <img src={report.diagrams.agentFlow.imageUrl} alt="Agent Flow" />
                  ) : (
                    <pre className="text-xs bg-gray-100 p-4 overflow-x-auto">{report.diagrams.agentFlow.code}</pre>
                  )}
                </div>
              </div>
            )}

            {report.diagrams.systemIntegration && (
              <div className="mb-8 avoid-break">
                <h3 className="subsection-title">System Integration</h3>
                <div className="diagram-block border border-gray-200 rounded p-4 flex justify-center">
                  {report.diagrams.systemIntegration.imageUrl ? (
                    <img src={report.diagrams.systemIntegration.imageUrl} alt="System Integration" />
                  ) : (
                    <pre className="text-xs bg-gray-100 p-4 overflow-x-auto">{report.diagrams.systemIntegration.code}</pre>
                  )}
                </div>
              </div>
            )}

            {report.diagrams.governance && (
              <div className="mb-8 avoid-break">
                <h3 className="subsection-title">Governance Model</h3>
                <div className="diagram-block border border-gray-200 rounded p-4 flex justify-center">
                  {report.diagrams.governance.imageUrl ? (
                    <img src={report.diagrams.governance.imageUrl} alt="Governance Model" />
                  ) : (
                    <pre className="text-xs bg-gray-100 p-4 overflow-x-auto">{report.diagrams.governance.code}</pre>
                  )}
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* Connectors */}
      {report.connectors && report.connectors.length > 0 && (
        <>
          <div className="page-break" />
          <section>
            <h2 className="section-title">Required Connectors</h2>
            {report.connectors.map((connector, i) => (
              <div key={i} className="card avoid-break">
                <h3 className="subsection-title mt-0">{connector.name} <span className="text-sm font-normal text-gray-500">({connector.provider})</span></h3>
                <p className="mb-4 text-sm">{connector.description}</p>
                
                <div className="bg-gray-50 p-3 rounded">
                  <span className="font-bold text-xs uppercase text-gray-500 block mb-2">Actions</span>
                  <ul className="space-y-2">
                    {connector.schemas.map((schema, j) => (
                      <li key={j} className="text-sm flex gap-2">
                        <span className="font-mono font-bold text-blue-600">{schema.method}</span>
                        <span className="font-mono text-gray-600">{schema.endpoint}</span>
                        <span className="text-gray-500">- {schema.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      {/* Governance */}
      {report.governance && (
        <>
          <div className="page-break" />
          <section>
            <h2 className="section-title">Governance & Compliance</h2>
            
            <div className="highlight-box">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-bold">Impact Level:</span> {report.governance.impactLevel}</div>
                <div><span className="font-bold">Monitoring Cadence:</span> {report.governance.monitoringCadence}</div>
              </div>
            </div>

            <h3 className="subsection-title">Required Controls</h3>
            <div className="space-y-4 mb-6">
              {report.governance.requirements.map((req, i) => (
                <div key={i} className="card avoid-break">
                  <div className="font-bold text-blue-800 mb-1">[{req.priority}] {req.title}</div>
                  <div className="text-sm text-gray-700">{req.description}</div>
                </div>
              ))}
            </div>

            <h3 className="subsection-title">Human Oversight</h3>
            <ul className="list-disc pl-5 space-y-2">
              {report.governance.oversightPoints.map((point, i) => (
                <li key={i} className="text-sm">{point}</li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* Cost Analysis */}
      {report.costs && (
        <>
          <div className="page-break" />
          <section>
            <h2 className="section-title">Cost Analysis (Estimated)</h2>
            
            <div className="highlight-box">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-500">One-Time Implementation</div>
                  <div className="text-xl font-bold">${report.costs.totalOneTime.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Monthly Run Cost</div>
                  <div className="text-xl font-bold">${report.costs.totalMonthly.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">First Year Total</div>
                  <div className="text-xl font-bold text-blue-700">${report.costs.totalAnnual.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <h3 className="subsection-title">Cost Breakdown</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="table-row table-header">
                <div className="w-2/5 px-4">Item</div>
                <div className="w-1/5 px-4">Category</div>
                <div className="w-1/5 px-4 text-right">One-Time</div>
                <div className="w-1/5 px-4 text-right">Monthly</div>
              </div>
              {report.costs.items.map((item, i) => (
                <div key={i} className="table-row avoid-break">
                  <div className="w-2/5 px-4 font-medium">{item.name}</div>
                  <div className="w-1/5 px-4 text-sm text-gray-600">{item.category}</div>
                  <div className="w-1/5 px-4 text-right">${item.oneTimeCost.toLocaleString()}</div>
                  <div className="w-1/5 px-4 text-right">${item.monthlyCost.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ROI Analysis */}
      {report.roi && (
        <>
          <div className="page-break" />
          <section>
            <h2 className="section-title">ROI Analysis (Projected)</h2>
            
            <div className="highlight-box">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-500">Annual Benefit</div>
                  <div className="text-lg font-bold">${report.roi.annualTotalBenefit.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Net Benefit</div>
                  <div className="text-lg font-bold">${report.roi.netBenefit.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">ROI</div>
                  <div className="text-lg font-bold text-green-600">{report.roi.roiPercent.toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Payback</div>
                  <div className="text-lg font-bold">{report.roi.paybackMonths.toFixed(1)} Mo</div>
                </div>
              </div>
            </div>

            <h3 className="subsection-title">Multi-Year Projections</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="table-row table-header">
                <div className="w-1/5 px-4">Period</div>
                <div className="w-1/5 px-4 text-right">Total Cost</div>
                <div className="w-1/5 px-4 text-right">Total Benefit</div>
                <div className="w-1/5 px-4 text-right">Net Benefit</div>
                <div className="w-1/5 px-4 text-right">ROI</div>
              </div>
              {[
                { label: '1 Year', data: report.roi.oneYear },
                { label: '3 Year', data: report.roi.threeYear },
                { label: '5 Year', data: report.roi.fiveYear }
              ].map((row, i) => (
                <div key={i} className="table-row avoid-break">
                  <div className="w-1/5 px-4 font-medium">{row.label}</div>
                  <div className="w-1/5 px-4 text-right">${row.data.totalCost.toLocaleString()}</div>
                  <div className="w-1/5 px-4 text-right">${row.data.totalBenefit.toLocaleString()}</div>
                  <div className="w-1/5 px-4 text-right font-bold text-green-700">${row.data.netBenefit.toLocaleString()}</div>
                  <div className="w-1/5 px-4 text-right">{row.data.roiPercent.toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Delivery Plan */}
      {report.deliveryPlan && (
        <>
          <div className="page-break" />
          <section>
            <h2 className="section-title">Delivery Plan</h2>
            
            <div className="highlight-box">
              <div className="flex justify-between px-8">
                <div><span className="font-bold">Total Sprints:</span> {report.deliveryPlan.totalSprints}</div>
                <div><span className="font-bold">Estimated Cost:</span> ${report.deliveryPlan.totalEstimatedCost.toLocaleString()}</div>
              </div>
            </div>

            <div className="space-y-6">
              {report.deliveryPlan.phases.map((phase, i) => (
                <div key={i} className="card avoid-break">
                  <h3 className="subsection-title mt-0">{phase.name} <span className="text-sm font-normal text-gray-500">({phase.duration})</span></h3>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    {phase.epics.map((epic, j) => (
                      <li key={j} className="text-sm">
                        <span className="font-bold">{epic.title}:</span> {epic.description}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Risk Profile */}
      <div className="page-break" />
      <section>
        <h2 className="section-title">Risk Assessment</h2>
        <div className="highlight-box">
          <div className="text-lg font-bold">Overall Risk Level: {riskProfile.level}</div>
        </div>
        
        <h3 className="subsection-title">Risk Factors</h3>
        {riskProfile.reasons.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {riskProfile.reasons.map((reason, i) => (
              <li key={i} className="text-sm">{reason}</li>
            ))}
          </ul>
        ) : (
          <p>No significant high-risk factors identified based on current inputs.</p>
        )}
      </section>

      {/* Appendix */}
      {report.knowledgeHub && report.knowledgeHub.filter(k => k.category === 'glossary').length > 0 && (
        <>
          <div className="page-break" />
          <section>
            <h2 className="section-title">Appendix: Glossary</h2>
            <div className="space-y-2">
              {report.knowledgeHub.filter(k => k.category === 'glossary').map((item, i) => (
                <div key={i} className="avoid-break">
                  <span className="font-bold">{item.title}:</span> <span className="text-sm">{item.content}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
