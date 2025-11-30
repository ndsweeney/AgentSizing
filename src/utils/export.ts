import { DIMENSIONS, type SizingResult, type ScoresRecord, calculateRiskProfile } from '../domain/scoring';
import { getGovernanceChecklist } from '../domain/rules';
import { buildAgentArchitectureMermaid, buildSystemIntegrationMermaid, buildGovernanceMermaid } from '../domain/diagrams';
import { generatePrompts, type PromptTemplateConfig } from '../domain/prompts';
import { getConnectorsForSystem, type ConnectorDefinition } from '../domain/connectors';
import { generateTestPlan } from '../domain/tests';
import { generateGovernancePack } from '../domain/governance';
import { calculateDetailedCosts, type CostAssumptions, DEFAULT_COST_ASSUMPTIONS } from '../domain/costs';
import { calculateRoi, type BenefitAssumptions, DEFAULT_BENEFIT_ASSUMPTIONS } from '../domain/roi';

export function downloadJson(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateMarkdown(
  result: SizingResult, 
  scores: ScoresRecord,
  comparison?: { targetResult: SizingResult | null, targetScores: ScoresRecord },
  systems?: string[],
  costAssumptions: CostAssumptions = DEFAULT_COST_ASSUMPTIONS,
  benefitAssumptions: BenefitAssumptions = DEFAULT_BENEFIT_ASSUMPTIONS,
  promptTemplates?: Record<string, PromptTemplateConfig>
): string {
  const date = new Date().toLocaleDateString();
  
  const riskProfile = calculateRiskProfile(scores);
  const governanceChecklist = getGovernanceChecklist(scores, riskProfile);
  const costs = calculateDetailedCosts(result, scores, costAssumptions);
  const roi = calculateRoi(benefitAssumptions, costs.totalOneTime, costs.totalMonthly);
  
  // Generate diagrams for export
  const archDiagram = buildAgentArchitectureMermaid(result);
  const sysDiagram = buildSystemIntegrationMermaid(result, systems || []);
  const govDiagram = buildGovernanceMermaid(result, scores);
  const governancePack = generateGovernancePack(scores, riskProfile);

  const connectors = (systems || [])
    .map(sys => getConnectorsForSystem(sys))
    .filter((c): c is ConnectorDefinition => c !== null)
    .filter((c, index, self) => index === self.findIndex(t => t.id === c.id));

  const testPlan = generateTestPlan(result);

  let md = `# Agent Sizing Assessment Results
Date: ${date}

## Summary
- **Current T-Shirt Size:** ${result.tShirtSize}
- **Current Total Score:** ${result.totalScore} / ${DIMENSIONS.length * 3}
`;

  if (comparison && comparison.targetResult) {
    md += `- **Target T-Shirt Size:** ${comparison.targetResult.tShirtSize}
- **Target Total Score:** ${comparison.targetResult.totalScore} / ${DIMENSIONS.length * 3}
`;
  }

  if (systems && systems.length > 0) {
    md += `
## Integrated Systems
${systems.map(sys => `- ${sys}`).join('\n')}
`;
  }

  md += `
## Architecture Recommendations
${result.recommendedAgentPattern.map(rec => `- ${rec}`).join('\n')}

## Technical Diagrams

### Agent Architecture
\`\`\`mermaid
${archDiagram.code}
\`\`\`

### System Integration
\`\`\`mermaid
${sysDiagram.code}
\`\`\`

### Governance & Control
\`\`\`mermaid
${govDiagram.code}
\`\`\`

## Suggested Copilot Studio Architecture
- **Experience Agents:** ${result.copilotArchitecture.experienceAgents}
- **Value Stream Agents:** ${result.copilotArchitecture.valueStreamAgents}
- **Function Agents:** ${result.copilotArchitecture.functionAgents}
- **Process Agents:** ${result.copilotArchitecture.processAgents}
- **Task Agents:** ${result.copilotArchitecture.taskAgents}
- **Control Agents:** ${result.copilotArchitecture.controlAgents}
- **Foundry Requirement:** ${result.copilotArchitecture.foundryRequirement}

## Suggested Agent Architecture
${result.agentArchitecture.map(agent => `### ${agent.type}
- **Necessity:** ${agent.necessity}
- **Reason:** ${agent.reason}
`).join('\n')}

## Key Considerations
${result.notes.map(note => `- ${note}`).join('\n')}

## Regulator-Ready Governance & Risk Assessment

### Risk Profile: ${riskProfile.level}
**Impact Level:** ${governancePack.impactLevel}

**Risk Factors:**
${riskProfile.reasons.map(r => `- ${r}`).join('\n')}

### Governance Checklist
${governanceChecklist.map(item => `- [${item.required ? 'Required' : 'Recommended'}] **${item.category}**: ${item.question}`).join('\n')}

### Governance Annex (EU AI Act / ISO 42001)
**Monitoring Cadence:** ${governancePack.monitoringCadence}

**Human Oversight:**
${governancePack.oversightPoints.map(p => `- ${p}`).join('\n')}

**Required Controls:**
${governancePack.requirements.map(r => `- [${r.priority}] **${r.title}**: ${r.description}`).join('\n')}


## LLM Prompts Library
${generatePrompts(result, promptTemplates).map(p => `### ${p.title}
**Agent Type:** ${p.agentType}
**Description:** ${p.description}

**System Prompt:**
\`\`\`
${p.systemPrompt}
\`\`\`

${p.userPromptExample ? `**User Prompt Example:**
\`\`\`
${p.userPromptExample}
\`\`\`
` : ''}`).join('\n')}

## Connector Schemas & API Mocks
${connectors.length > 0 ? connectors.map(c => `### ${c.name}
**Provider:** ${c.provider}
**Description:** ${c.description}

#### Actions
${c.schemas.map(s => `- **${s.name}** (${s.method}): ${s.description}
  - Endpoint: \`${s.endpoint}\`
`).join('\n')}
`).join('\n') : 'No specific connectors identified based on system inputs.'}

## Test Harness & Validation Plan
${testPlan.cases.map(t => `### ${t.title} (${t.id})
**Type:** ${t.agentType}
**Description:** ${t.description}

**Input:**
\`\`\`
${t.input}
\`\`\`

**Expected Output:**
\`\`\`
${t.expectedOutput}
\`\`\`

**Edge Cases:**
${t.edgeCases.map(ec => `- ${ec}`).join('\n')}
`).join('\n')}


## Cost Analysis (Estimated)
- **One-Time Implementation:** $${costs.totalOneTime.toLocaleString()}
- **Monthly Run Cost:** $${costs.totalMonthly.toLocaleString()}
- **First Year Total:** $${costs.totalAnnual.toLocaleString()}

## ROI Analysis (Projected)
- **Annual Benefit:** $${roi.annualTotalBenefit.toLocaleString()}
- **Net Benefit:** $${roi.netBenefit.toLocaleString()}
- **ROI:** ${roi.roiPercent.toFixed(0)}%
- **Payback Period:** ${roi.paybackMonths.toFixed(1)} Months

### Multi-Year Projections
| Period | Total Cost | Total Benefit | Net Benefit | ROI |
|--------|------------|---------------|-------------|-----|
| 1 Year | $${roi.oneYear.totalCost.toLocaleString()} | $${roi.oneYear.totalBenefit.toLocaleString()} | $${roi.oneYear.netBenefit.toLocaleString()} | ${roi.oneYear.roiPercent.toFixed(0)}% |
| 3 Year | $${roi.threeYear.totalCost.toLocaleString()} | $${roi.threeYear.totalBenefit.toLocaleString()} | $${roi.threeYear.netBenefit.toLocaleString()} | ${roi.threeYear.roiPercent.toFixed(0)}% |
| 5 Year | $${roi.fiveYear.totalCost.toLocaleString()} | $${roi.fiveYear.totalBenefit.toLocaleString()} | $${roi.fiveYear.netBenefit.toLocaleString()} | ${roi.fiveYear.roiPercent.toFixed(0)}% |

## Governance Checklist
${governanceChecklist.map(item => `- [ ] ${item}`).join('\n')}
`;

  if (comparison && comparison.targetScores) {
    md += `| Dimension | Current | Target | Description |
|-----------|---------|--------|-------------|
`;
    DIMENSIONS.forEach(dim => {
      const val = scores[dim.id];
      const targetVal = comparison.targetScores[dim.id];
      
      const scoreLabel = val === 1 ? 'Small' : val === 2 ? 'Medium' : val === 3 ? 'Large' : '-';
      const targetLabel = targetVal === 1 ? 'Small' : targetVal === 2 ? 'Medium' : targetVal === 3 ? 'Large' : '-';
      
      md += `| ${dim.label} | ${scoreLabel} (${val}) | ${targetLabel} (${targetVal}) | ${dim.description} |\n`;
    });
  } else {
    md += `| Dimension | Score | Description |
|-----------|-------|-------------|
`;
    DIMENSIONS.forEach(dim => {
      const val = scores[dim.id];
      const scoreLabel = val === 1 ? 'Small' : val === 2 ? 'Medium' : val === 3 ? 'Large' : '-';
      md += `| ${dim.label} | ${scoreLabel} (${val}) | ${dim.description} |\n`;
    });
  }

  return md;
}

export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}
