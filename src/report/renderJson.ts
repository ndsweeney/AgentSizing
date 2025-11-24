import type { ReportModel } from './reportModel';

export function renderReportJson(report: ReportModel): string {
  return JSON.stringify(report, null, 2);
}
