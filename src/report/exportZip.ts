import JSZip from 'jszip';
import type { ReportModel } from './reportModel';
import { renderReportMarkdown } from './renderMarkdown';
import { renderReportJson } from './renderJson';

export async function exportReportZip(report: ReportModel): Promise<Blob> {
  const zip = new JSZip();

  // 1. Main Report Files
  zip.file('report.md', renderReportMarkdown(report));
  zip.file('report.json', renderReportJson(report));

  // 2. Diagrams
  if (report.diagrams) {
    const diagFolder = zip.folder('diagrams');
    if (diagFolder) {
      if (report.diagrams.agentFlow) {
        diagFolder.file('agent-flow.mmd', report.diagrams.agentFlow.code);
      }
      if (report.diagrams.systemIntegration) {
        diagFolder.file('system-integration.mmd', report.diagrams.systemIntegration.code);
      }
      if (report.diagrams.governance) {
        diagFolder.file('governance.mmd', report.diagrams.governance.code);
      }
      if (report.architecture) {
        if (report.architecture.l1) diagFolder.file('l1-architecture.mmd', report.architecture.l1.code);
        if (report.architecture.l2) diagFolder.file('l2-integration.mmd', report.architecture.l2.code);
        if (report.architecture.l3) diagFolder.file('l3-governance.mmd', report.architecture.l3.code);
      }
    }
  }

  // 3. Datasets
  if (report.exampleData && report.exampleData.length > 0) {
    const dataFolder = zip.folder('datasets');
    if (dataFolder) {
      report.exampleData.forEach(dataset => {
        dataFolder.file(dataset.filename, JSON.stringify(dataset.data, null, 2));
      });
    }
  }

  // 4. Blueprints
  if (report.blueprints && report.blueprints.length > 0) {
    const bpFolder = zip.folder('blueprints');
    if (bpFolder) {
      report.blueprints.forEach((bp, index) => {
        // Extract title from markdown if possible, else use index
        const titleMatch = bp.match(/^# Agent Blueprint: (.+)$/m);
        const filename = titleMatch ? `${titleMatch[1].replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md` : `blueprint-${index + 1}.md`;
        bpFolder.file(filename, bp);
      });
    }
  }

  // 5. Topic Skeletons
  if (report.topicSkeletons && report.topicSkeletons.length > 0) {
    const skelFolder = zip.folder('skeletons');
    if (skelFolder) {
      report.topicSkeletons.forEach(skel => {
        const filename = `${skel.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        const content = `# ${skel.name} (${skel.agentType})

## Trigger Phrases
${skel.triggerPhrases.map(p => `- ${p}`).join('\n')}

## Variables
${skel.variables.map(v => `- ${v}`).join('\n')}

## Steps
${skel.steps.map(s => `- ${s}`).join('\n')}

## Actions
${skel.actions.map(a => `- ${a}`).join('\n')}

## Response Templates
${skel.responseTemplates.map(r => `- ${r}`).join('\n')}
`;
        skelFolder.file(filename, content);
      });
    }
  }

  // 6. Connectors
  if (report.connectors && report.connectors.length > 0) {
    const connFolder = zip.folder('connectors');
    if (connFolder) {
      report.connectors.forEach(conn => {
        const filename = `${conn.id}.json`;
        connFolder.file(filename, JSON.stringify(conn, null, 2));
      });
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}
