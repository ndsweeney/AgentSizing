import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { ReportModel } from './reportModel';
import { DIMENSIONS } from '../domain/scoring';

// Register standard fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyCg4QIFq.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyCg4QIFq.ttf', fontWeight: 700 }, // Fallback for bold if needed
  ]
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: '20mm', // 20mm margin as requested
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 15,
    marginBottom: 8,
  },
  text: {
    fontSize: 12, // 12pt font size as requested
    marginBottom: 8,
    lineHeight: 1.5,
    color: '#374151',
    textAlign: 'justify',
  },
  label: {
    fontWeight: 'bold',
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  col: {
    flexDirection: 'column',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#e5e7eb',
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e7eb',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  codeBlock: {
    fontFamily: 'Courier',
    fontSize: 10,
    backgroundColor: '#f3f4f6',
    padding: 10,
    marginTop: 10,
  },
  code: {
    fontFamily: 'Courier',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 10,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bullet: {
    width: 10,
    fontSize: 12,
  },
  bulletText: {
    fontSize: 12,
    flex: 1,
  },
  card: {
    backgroundColor: '#f9fafb',
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
  },
  highlightBox: {
    backgroundColor: '#eff6ff',
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
});

// Helper to calculate image dimensions preserving aspect ratio
const getImageStyle = (width: number | undefined, height: number | undefined) => {
  const MAX_WIDTH = 480; // A4 width (approx 595pt) - margins (40mm approx 113pt)
  const MAX_HEIGHT = 500; // Leave room for header/footer

  // If no dimensions provided, constrain to page width but don't force height
  if (!width || !height) {
    return { width: MAX_WIDTH, objectFit: 'contain' as const };
  }

  let finalWidth = width;
  let finalHeight = height;

  // If the image is naturally smaller than the page, keep it small!
  // This prevents the "billboard effect" for simple diagrams.
  if (finalWidth < MAX_WIDTH && finalHeight < MAX_HEIGHT) {
    return { width: finalWidth, height: finalHeight };
  }

  // Scale down if too wide
  if (finalWidth > MAX_WIDTH) {
    const ratio = MAX_WIDTH / finalWidth;
    finalWidth = MAX_WIDTH;
    finalHeight = finalHeight * ratio;
  }

  // Scale down if too tall (after width scaling)
  if (finalHeight > MAX_HEIGHT) {
    const ratio = MAX_HEIGHT / finalHeight;
    finalHeight = MAX_HEIGHT;
    finalWidth = finalWidth * ratio;
  }

  return { width: finalWidth, height: finalHeight };
};

export const ReportPdfDocument: React.FC<{ report: ReportModel }> = ({ report }) => {
  const { scenario, sizingResult, riskProfile } = report;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{scenario.workshopTitle || 'Agent Sizing Workshop'}</Text>
          <Text style={styles.subtitle}>
            Prepared for: {scenario.customerName || 'Unknown Customer'} | Facilitator: {scenario.facilitatorName || 'Unknown'}
          </Text>
          <Text style={styles.subtitle}>
            Date: {new Date(report.generatedAt).toLocaleDateString()} | Version: {report.appVersion}
          </Text>
        </View>

        {/* Executive Summary */}
        <View>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.highlightBox}>
            <Text style={styles.text}>
              Based on the assessment, the proposed agent solution is sized as <Text style={{ fontWeight: 'bold' }}>{sizingResult.tShirtSize}</Text>.
            </Text>
            <Text style={styles.text}>
              Risk Profile: <Text style={{ fontWeight: 'bold' }}>{riskProfile.level}</Text>
            </Text>
          </View>
          <Text style={styles.text}>
            This report outlines the recommended architecture, sizing considerations, and delivery roadmap for the proposed agentic solution.
          </Text>
          {sizingResult.notes.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.label, { marginBottom: 5 }]}>Key Recommendations:</Text>
              {sizingResult.notes.map((note, i) => (
                <View key={i} style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{note}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Scenario Overview */}
        <View>
          <Text style={styles.sectionTitle}>Scenario Overview</Text>
          <Text style={styles.text}><Text style={styles.label}>Industry:</Text> {scenario.industry || 'Not specified'}</Text>
          <Text style={styles.text}><Text style={styles.label}>Use Case:</Text> {scenario.useCase || 'Not specified'}</Text>
          <Text style={styles.text}><Text style={styles.label}>Systems:</Text> {scenario.systems.length > 0 ? scenario.systems.join(', ') : 'None selected'}</Text>
          
          <Text style={[styles.label, { marginTop: 8, marginBottom: 4 }]}>Description:</Text>
          <Text style={styles.text}>{scenario.notes || 'No additional notes provided.'}</Text>
        </View>

        {/* Sizing Analysis */}
        <View>
          <Text style={styles.sectionTitle}>Assessment Dimensions</Text>
          <Text style={styles.text}>
            The solution has been evaluated across multiple dimensions to determine its complexity and resource requirements.
          </Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCol, { width: '30%' }]}>
                <Text style={styles.tableCell}>Dimension</Text>
              </View>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text style={styles.tableCell}>Score</Text>
              </View>
              <View style={[styles.tableCol, { width: '50%' }]}>
                <Text style={styles.tableCell}>Description</Text>
              </View>
            </View>
            {DIMENSIONS.map((dim) => {
              const val = scenario.scores[dim.id];
              const scoreLabel = val === 1 ? 'Small' : val === 2 ? 'Medium' : val === 3 ? 'Large' : '-';
              return (
                <View style={styles.tableRow} key={dim.id}>
                  <View style={[styles.tableCol, { width: '30%' }]}>
                    <Text style={styles.tableCell}>{dim.label}</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '20%' }]}>
                    <Text style={styles.tableCell}>{scoreLabel} ({val})</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '50%' }]}>
                    <Text style={styles.tableCell}>{dim.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Architecture */}
        <Text style={styles.sectionTitle}>Recommended Architecture</Text>
        
        <View style={styles.card}>
          <Text style={styles.subSectionTitle}>Agent Pattern</Text>
          {sizingResult.recommendedAgentPattern.map((pattern, i) => (
            <View key={i} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{pattern}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.subSectionTitle}>Required Agent Types</Text>
          {sizingResult.agentArchitecture.map((agent, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <Text style={[styles.text, { fontWeight: 'bold' }]}>{agent.type} ({agent.necessity})</Text>
              <Text style={styles.text}>{agent.reason}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

      {/* Technical Diagrams - Agent Flow */}
      {report.diagrams?.agentFlow && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Technical Diagrams</Text>
          <Text style={styles.subSectionTitle}>Agent Architecture Flow</Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            {report.diagrams.agentFlow.imageUrl ? (
              <Image 
                src={report.diagrams.agentFlow.imageUrl} 
                style={getImageStyle(report.diagrams.agentFlow.width, report.diagrams.agentFlow.height)}
              />
            ) : (
              <View style={[styles.codeBlock, { width: '100%' }]}>
                <Text style={styles.code}>{report.diagrams.agentFlow.code}</Text>
              </View>
            )}
          </View>
          <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      )}

      {/* Technical Diagrams - System Integration */}
      {report.diagrams?.systemIntegration && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Technical Diagrams</Text>
          <Text style={styles.subSectionTitle}>System Integration</Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            {report.diagrams.systemIntegration.imageUrl ? (
              <Image 
                src={report.diagrams.systemIntegration.imageUrl} 
                style={getImageStyle(report.diagrams.systemIntegration.width, report.diagrams.systemIntegration.height)}
              />
            ) : (
              <View style={[styles.codeBlock, { width: '100%' }]}>
                <Text style={styles.code}>{report.diagrams.systemIntegration.code}</Text>
              </View>
            )}
          </View>
          <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      )}

      {/* Technical Diagrams - Governance */}
      {report.diagrams?.governance && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Technical Diagrams</Text>
          <Text style={styles.subSectionTitle}>Governance Model</Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            {report.diagrams.governance.imageUrl ? (
              <Image 
                src={report.diagrams.governance.imageUrl} 
                style={getImageStyle(report.diagrams.governance.width, report.diagrams.governance.height)}
              />
            ) : (
              <View style={[styles.codeBlock, { width: '100%' }]}>
                <Text style={styles.code}>{report.diagrams.governance.code}</Text>
              </View>
            )}
          </View>
          <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      )}

      {/* Example Datasets */}
      {report.exampleData && report.exampleData.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Example Datasets</Text>
          {report.exampleData.map((data, i) => (
            <View key={i} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}><Text style={{ fontWeight: 'bold' }}>{data.name}</Text> ({data.filename}): {data.description}</Text>
            </View>
          ))}
          <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      )}

      {/* Value Roadmap */}
      {report.valueRoadmap && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Value Roadmap</Text>
          {report.valueRoadmap.initiatives.map((initiative, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.subSectionTitle}>{initiative.title} ({initiative.horizon})</Text>
              <Text style={styles.text}><Text style={styles.label}>Impact:</Text> {initiative.impact}</Text>
              <Text style={styles.text}><Text style={styles.label}>Effort:</Text> {initiative.effort}</Text>
              <Text style={styles.text}><Text style={styles.label}>Timeline:</Text> {initiative.timeline}</Text>
              <Text style={[styles.text, { marginTop: 4 }]}>{initiative.description}</Text>
            </View>
          ))}
          <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      )}

      {/* Appendix: Glossary */}
      {report.knowledgeHub && report.knowledgeHub.filter(k => k.category === 'glossary').length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Appendix: Glossary</Text>
          {report.knowledgeHub.filter(k => k.category === 'glossary').map((item, i) => (
            <View key={i} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}><Text style={{ fontWeight: 'bold' }}>{item.title}:</Text> {item.content}</Text>
            </View>
          ))}
          
          {/* Metadata */}
          <View style={[styles.card, { marginTop: 20, backgroundColor: '#f8f9fa' }]}>
            <Text style={[styles.text, { fontSize: 8, color: '#666' }]}>Generated by Agent Sizing Workshop on {new Date(report.generatedAt).toLocaleString()}</Text>
            <Text style={[styles.text, { fontSize: 8, color: '#666' }]}>Report ID: {report.scenario.id}</Text>
            <Text style={[styles.text, { fontSize: 8, color: '#666' }]}>App Version: {report.appVersion}</Text>
            <Text style={[styles.text, { fontSize: 8, color: '#666' }]}>Scenario Hash: {report.scenarioHash}</Text>
          </View>

          <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      )}

      {/* Agent Blueprints */}
      {report.blueprints && report.blueprints.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Agent Blueprints</Text>
          {report.blueprints.map((blueprint, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.text}>{blueprint.replace(/#/g, '').trim()}</Text>
            </View>
          ))}
          <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      )}

      {/* Topic Skeletons */}
      {report.topicSkeletons && report.topicSkeletons.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Topic Skeletons</Text>
          {report.topicSkeletons.map((topic, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.subSectionTitle}>{topic.name} ({topic.agentType})</Text>
              
              <Text style={[styles.label, { marginTop: 8 }]}>Trigger Phrases:</Text>
              {topic.triggerPhrases.map((phrase, j) => (
                <View key={j} style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>"{phrase}"</Text>
                </View>
              ))}

              <Text style={[styles.label, { marginTop: 8 }]}>Steps:</Text>
              {topic.steps.map((step, j) => (
                <View key={j} style={styles.bulletPoint}>
                  <Text style={styles.bullet}>{j + 1}.</Text>
                  <Text style={styles.bulletText}>{step}</Text>
                </View>
              ))}
            </View>
          ))}
          <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      )}

      {/* Connectors */}
      {report.connectors && report.connectors.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Required Connectors</Text>
          {report.connectors.map((connector, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.subSectionTitle}>{connector.name} ({connector.provider})</Text>
              <Text style={styles.text}>{connector.description}</Text>
              
              <Text style={[styles.label, { marginTop: 8 }]}>Actions:</Text>
              {connector.schemas.map((schema, j) => (
                <View key={j} style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{schema.method} {schema.endpoint} - {schema.description}</Text>
                </View>
              ))}
            </View>
          ))}
          <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      )}

      {/* Governance */}
      {report.governance && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Governance & Compliance</Text>
          
          <View style={styles.highlightBox}>
            <Text style={styles.text}><Text style={styles.label}>Impact Level:</Text> {report.governance.impactLevel}</Text>
            <Text style={styles.text}><Text style={styles.label}>Monitoring Cadence:</Text> {report.governance.monitoringCadence}</Text>
          </View>

          <Text style={styles.subSectionTitle}>Required Controls</Text>
          {report.governance.requirements.map((req, i) => (
            <View key={i} style={styles.card}>
              <Text style={[styles.text, { fontWeight: 'bold' }]}>[{req.priority}] {req.title}</Text>
              <Text style={styles.text}>{req.description}</Text>
            </View>
          ))}

          <Text style={styles.subSectionTitle}>Human Oversight</Text>
          {report.governance.oversightPoints.map((point, i) => (
            <View key={i} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{point}</Text>
            </View>
          ))}
          <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      )}

      {/* Cost Analysis */}
      {report.costs && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Cost Analysis (Estimated)</Text>
          
          <View style={styles.highlightBox}>
            <Text style={styles.text}><Text style={styles.label}>One-Time Implementation:</Text> ${report.costs.totalOneTime.toLocaleString()}</Text>
            <Text style={styles.text}><Text style={styles.label}>Monthly Run Cost:</Text> ${report.costs.totalMonthly.toLocaleString()}</Text>
            <Text style={styles.text}><Text style={styles.label}>First Year Total:</Text> ${report.costs.totalAnnual.toLocaleString()}</Text>
          </View>

          <Text style={styles.subSectionTitle}>Cost Breakdown</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCol, { width: '40%' }]}>
                <Text style={styles.tableCell}>Item</Text>
              </View>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text style={styles.tableCell}>Category</Text>
              </View>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text style={styles.tableCell}>One-Time</Text>
              </View>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text style={styles.tableCell}>Monthly</Text>
              </View>
            </View>
            {report.costs.items.map((item, i) => (
              <View style={styles.tableRow} key={i}>
                <View style={[styles.tableCol, { width: '40%' }]}>
                  <Text style={styles.tableCell}>{item.name}</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.tableCell}>{item.category}</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.tableCell}>${item.oneTimeCost.toLocaleString()}</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.tableCell}>${item.monthlyCost.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      )}

      {/* ROI Analysis */}
      {report.roi && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>ROI Analysis (Projected)</Text>
          
          <View style={styles.highlightBox}>
            <Text style={styles.text}><Text style={styles.label}>Annual Benefit:</Text> ${report.roi.annualTotalBenefit.toLocaleString()}</Text>
            <Text style={styles.text}><Text style={styles.label}>Net Benefit:</Text> ${report.roi.netBenefit.toLocaleString()}</Text>
            <Text style={styles.text}><Text style={styles.label}>ROI:</Text> {report.roi.roiPercent.toFixed(0)}%</Text>
            <Text style={styles.text}><Text style={styles.label}>Payback Period:</Text> {report.roi.paybackMonths.toFixed(1)} Months</Text>
          </View>

          <Text style={styles.subSectionTitle}>Multi-Year Projections</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text style={styles.tableCell}>Period</Text>
              </View>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text style={styles.tableCell}>Total Cost</Text>
              </View>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text style={styles.tableCell}>Total Benefit</Text>
              </View>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text style={styles.tableCell}>Net Benefit</Text>
              </View>
              <View style={[styles.tableCol, { width: '20%' }]}>
                <Text style={styles.tableCell}>ROI</Text>
              </View>
            </View>
            {[
              { label: '1 Year', data: report.roi.oneYear },
              { label: '3 Year', data: report.roi.threeYear },
              { label: '5 Year', data: report.roi.fiveYear }
            ].map((row, i) => (
              <View style={styles.tableRow} key={i}>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.tableCell}>{row.label}</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.tableCell}>${row.data.totalCost.toLocaleString()}</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.tableCell}>${row.data.totalBenefit.toLocaleString()}</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.tableCell}>${row.data.netBenefit.toLocaleString()}</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.tableCell}>{row.data.roiPercent.toFixed(0)}%</Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      )}

      {/* Delivery Plan */}
      {report.deliveryPlan && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Delivery Plan</Text>
          
          <View style={styles.highlightBox}>
            <Text style={styles.text}><Text style={styles.label}>Total Sprints:</Text> {report.deliveryPlan.totalSprints}</Text>
            <Text style={styles.text}><Text style={styles.label}>Estimated Cost:</Text> ${report.deliveryPlan.totalEstimatedCost.toLocaleString()}</Text>
          </View>

          {report.deliveryPlan.phases.map((phase, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.subSectionTitle}>{phase.name} ({phase.duration})</Text>
              {phase.epics.map((epic, j) => (
                <View key={j} style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}><Text style={{ fontWeight: 'bold' }}>{epic.title}:</Text> {epic.description}</Text>
                </View>
              ))}
            </View>
          ))}
          <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      )}

      {/* Risk Profile */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Risk Assessment</Text>
        <View style={styles.highlightBox}>
          <Text style={[styles.text, { fontSize: 14, fontWeight: 'bold' }]}>
            Overall Risk Level: {riskProfile.level}
          </Text>
        </View>
        
        <Text style={styles.subSectionTitle}>Risk Factors</Text>
        {riskProfile.reasons.length > 0 ? (
          riskProfile.reasons.map((reason, i) => (
            <View key={i} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{reason}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>No significant high-risk factors identified based on current inputs.</Text>
        )}

        {/* Footer */}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};
