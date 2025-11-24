import type { ReportModel } from './reportModel';
import { DIMENSIONS } from '../domain/scoring';

export function renderReportMarkdown(report: ReportModel): string {
  const parts: string[] = [
    renderCoverPage(report),
    renderExecutiveSummary(report),
    renderScenarioOverview(report),
    renderDimensions(report),
    renderArchitecture(report),
    renderBlueprints(report),
    renderTopicSkeletons(report),
    renderMermaidDiagrams(report),
    renderDatasets(report),
    renderConnectors(report),
    renderGovernance(report),
    renderCost(report),
    renderRoi(report),
    renderValueRoadmap(report),
    renderDeliveryPlan(report),
    renderKnowledgeHub(report),
    renderMetadata(report)
  ];

  return parts.filter(Boolean).join('\n\n');
}

function renderCoverPage(report: ReportModel): string {
  return `# Agent Sizing & Architecture Report
**Project:** ${report.scenario.workshopTitle || 'Untitled Workshop'}
**Customer:** ${report.scenario.customerName || 'Unknown Customer'}
**Facilitator:** ${report.scenario.facilitatorName || 'Unknown Facilitator'}
**Date:** ${new Date(report.generatedAt).toLocaleDateString()}
**Version:** ${report.appVersion}
`;
}

function renderExecutiveSummary(report: ReportModel): string {
  return `## Executive Summary
Based on the assessment, the proposed agent solution is sized as **${report.sizingResult.tShirtSize}**.
The overall risk profile is **${report.riskProfile.level}**.

**Key Recommendations:**
${report.sizingResult.notes.map(n => `- ${n}`).join('\n')}
`;
}

function renderScenarioOverview(report: ReportModel): string {
  return `## Scenario Overview
**Industry:** ${report.scenario.industry || 'Not specified'}
**Use Case:** ${report.scenario.useCase || 'Not specified'}
**Systems:** ${report.scenario.systems.length > 0 ? report.scenario.systems.join(', ') : 'None selected'}

**Description:**
${report.scenario.notes || 'No additional notes provided.'}
`;
}

function renderDimensions(report: ReportModel): string {
  let md = `## Assessment Dimensions
| Dimension | Score | Description |
|-----------|-------|-------------|
`;

  DIMENSIONS.forEach(dim => {
    const val = report.scenario.scores[dim.id];
    const scoreLabel = val === 1 ? 'Small' : val === 2 ? 'Medium' : val === 3 ? 'Large' : '-';
    md += `| ${dim.label} | ${scoreLabel} (${val}) | ${dim.description} |\n`;
  });

  return md;
}

function renderArchitecture(report: ReportModel): string {
  if (!report.architecture) return '## Architecture Specification\n\n*No architecture data available.*';
  
  const { copilotSpec } = report.architecture;
  
  return `## Architecture Specification

### Copilot Studio Structure
- **Experience Agents:** ${copilotSpec.experienceAgents}
- **Value Stream Agents:** ${copilotSpec.valueStreamAgents}
- **Function Agents:** ${copilotSpec.functionAgents}
- **Process Agents:** ${copilotSpec.processAgents}
- **Task Agents:** ${copilotSpec.taskAgents}
- **Control Agents:** ${copilotSpec.controlAgents}
- **Foundry Requirement:** ${copilotSpec.foundryRequirement}

### Agent Recommendations
${report.sizingResult.agentArchitecture.map(a => `- **${a.type}**: ${a.necessity} (${a.reason})`).join('\n')}
`;
}

function renderBlueprints(report: ReportModel): string {
  if (!report.blueprints || report.blueprints.length === 0) return '## Agent Blueprints\n\n*No blueprints generated.*';
  
  return `## Agent Blueprints
${report.blueprints.join('\n\n---\n\n')}
`;
}

function renderTopicSkeletons(report: ReportModel): string {
  if (!report.topicSkeletons || report.topicSkeletons.length === 0) return '## Topic Skeletons\n\n*No topic skeletons generated.*';

  return `## Topic Skeletons
${report.topicSkeletons.map(t => `### ${t.name} (${t.agentType})
**Trigger Phrases:**
${t.triggerPhrases.map(p => `- "${p}"`).join('\n')}

**Steps:**
${t.steps.map(s => `- ${s}`).join('\n')}
`).join('\n')}
`;
}

function renderMermaidDiagrams(report: ReportModel): string {
  if (!report.diagrams) return '## Technical Diagrams\n\n*No diagrams available.*';
  
  let md = `## Technical Diagrams\n`;
  
  if (report.diagrams.agentFlow) {
    md += `### Agent Architecture Flow
\`\`\`mermaid
${report.diagrams.agentFlow.code}
\`\`\`
`;
  }

  if (report.diagrams.systemIntegration) {
    md += `### System Integration
\`\`\`mermaid
${report.diagrams.systemIntegration.code}
\`\`\`
`;
  }

  if (report.diagrams.governance) {
    md += `### Governance Model
\`\`\`mermaid
${report.diagrams.governance.code}
\`\`\`
`;
  }

  return md;
}

function renderDatasets(report: ReportModel): string {
  if (!report.exampleData || report.exampleData.length === 0) return '## Example Datasets\n\n*No example datasets available.*';

  return `## Example Datasets
${report.exampleData.map(d => `- **${d.name}** (${d.filename}): ${d.description}`).join('\n')}
`;
}

function renderConnectors(report: ReportModel): string {
  if (!report.connectors || report.connectors.length === 0) return '## Required Connectors\n\n*No specific connectors identified.*';

  return `## Required Connectors
${report.connectors.map(c => `### ${c.name} (${c.provider})
${c.description}

**Actions:**
${c.schemas.map(s => `- ${s.method} ${s.endpoint} - ${s.description}`).join('\n')}
`).join('\n')}
`;
}

function renderGovernance(report: ReportModel): string {
  if (!report.governance) return '## Governance & Compliance\n\n*No governance data available.*';

  return `## Governance & Compliance
**Impact Level:** ${report.governance.impactLevel}
**Monitoring Cadence:** ${report.governance.monitoringCadence}

### Required Controls
${report.governance.requirements.map(r => `- [${r.priority}] **${r.title}**: ${r.description}`).join('\n')}

### Human Oversight
${report.governance.oversightPoints.map(p => `- ${p}`).join('\n')}
`;
}

function renderCost(report: ReportModel): string {
  if (!report.costs) return '## Cost Analysis\n\n*No cost data available.*';

  return `## Cost Analysis (Estimated)
- **One-Time Implementation:** $${report.costs.totalOneTime.toLocaleString()}
- **Monthly Run Cost:** $${report.costs.totalMonthly.toLocaleString()}
- **First Year Total:** $${report.costs.totalAnnual.toLocaleString()}

### Cost Breakdown
| Item | Category | One-Time | Monthly |
|------|----------|----------|---------|
${report.costs.items.map(i => `| ${i.name} | ${i.category} | $${i.oneTimeCost.toLocaleString()} | $${i.monthlyCost.toLocaleString()} |`).join('\n')}
`;
}

function renderRoi(report: ReportModel): string {
  if (!report.roi) return '## ROI Analysis\n\n*No ROI data available.*';

  return `## ROI Analysis (Projected)
- **Annual Benefit:** $${report.roi.annualTotalBenefit.toLocaleString()}
- **Net Benefit:** $${report.roi.netBenefit.toLocaleString()}
- **ROI:** ${report.roi.roiPercent.toFixed(0)}%
- **Payback Period:** ${report.roi.paybackMonths.toFixed(1)} Months

### Multi-Year Projections
| Period | Total Cost | Total Benefit | Net Benefit | ROI |
|--------|------------|---------------|-------------|-----|
| 1 Year | $${report.roi.oneYear.totalCost.toLocaleString()} | $${report.roi.oneYear.totalBenefit.toLocaleString()} | $${report.roi.oneYear.netBenefit.toLocaleString()} | ${report.roi.oneYear.roiPercent.toFixed(0)}% |
| 3 Year | $${report.roi.threeYear.totalCost.toLocaleString()} | $${report.roi.threeYear.totalBenefit.toLocaleString()} | $${report.roi.threeYear.netBenefit.toLocaleString()} | ${report.roi.threeYear.roiPercent.toFixed(0)}% |
| 5 Year | $${report.roi.fiveYear.totalCost.toLocaleString()} | $${report.roi.fiveYear.totalBenefit.toLocaleString()} | $${report.roi.fiveYear.netBenefit.toLocaleString()} | ${report.roi.fiveYear.roiPercent.toFixed(0)}% |
`;
}

function renderValueRoadmap(report: ReportModel): string {
  if (!report.valueRoadmap) return '## Value Roadmap\n\n*No roadmap generated.*';

  return `## Value Roadmap
${report.valueRoadmap.initiatives.map(i => `### ${i.title} (${i.horizon})
- **Impact:** ${i.impact}
- **Effort:** ${i.effort}
- **Timeline:** ${i.timeline}
- **Description:** ${i.description}
`).join('\n')}
`;
}

function renderDeliveryPlan(report: ReportModel): string {
  if (!report.deliveryPlan) return '## Delivery Plan\n\n*No delivery plan generated.*';

  return `## Delivery Plan
**Total Sprints:** ${report.deliveryPlan.totalSprints}
**Estimated Cost:** $${report.deliveryPlan.totalEstimatedCost.toLocaleString()}

### Phases
${report.deliveryPlan.phases.map(p => `#### ${p.name} (${p.duration})
${p.epics.map(e => `- **${e.title}**: ${e.description}`).join('\n')}
`).join('\n')}
`;
}

function renderKnowledgeHub(report: ReportModel): string {
  if (!report.knowledgeHub || report.knowledgeHub.length === 0) return '';
  
  // Only show glossary items for brevity in the main report
  const glossary = report.knowledgeHub.filter(k => k.category === 'glossary');
  
  if (glossary.length === 0) return '';

  return `## Appendix: Glossary
${glossary.map(k => `- **${k.title}**: ${k.content}`).join('\n')}
`;
}

function renderMetadata(report: ReportModel): string {
  return `
---
*Generated by Agent Sizing Workshop on ${new Date(report.generatedAt).toLocaleString()}*
*Report ID: ${report.scenario.id}*
*App Version: ${report.appVersion}*
*Scenario Hash: ${report.scenarioHash}*
`;
}
