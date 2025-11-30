import { Shield, Scale, Eye, Activity, FileText, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { generateGovernancePack } from '../domain/governance';
import { calculateRiskProfile, type ScoresRecord } from '../domain/scoring';
import { cn } from '../utils/cn';
import { MermaidDiagram } from './MermaidDiagram';
import { buildGovernanceMermaid } from '../domain/diagrams';
import { calculateSizingResult } from '../domain/scoring';

import { useRulesConfig } from '../hooks/useRulesConfig';

interface GovernanceViewProps {
  scores: ScoresRecord;
}

export function GovernanceView({ scores }: GovernanceViewProps) {
  const rulesConfig = useRulesConfig();
  const riskProfile = calculateRiskProfile(scores, rulesConfig);
  const pack = generateGovernancePack(scores, riskProfile, rulesConfig);
  const result = calculateSizingResult(scores, rulesConfig);
  const governanceDiagram = buildGovernanceMermaid(result, scores);

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
      case 'MODERATE': return 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800';
      default: return 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-lg mb-1">
                <Scale className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                Governance & Risk Assessment
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Aligned with EU AI Act & ISO 42001 principles
              </p>
            </div>
            <div className={cn("px-4 py-2 rounded-lg border flex flex-col items-center", getImpactColor(pack.impactLevel))}>
              <span className="text-xs font-bold uppercase tracking-wider">Impact Level</span>
              <span className="text-xl font-bold">{pack.impactLevel}</span>
            </div>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Risk Profile
            </h4>
            <ul className="space-y-2">
              {pack.riskProfile.reasons.map((reason, idx) => (
                <li key={idx} className="text-sm text-gray-600 dark:text-slate-300 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Human Oversight
            </h4>
            <ul className="space-y-2">
              {pack.oversightPoints.map((point, idx) => (
                <li key={idx} className="text-sm text-gray-600 dark:text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Monitoring Cadence
            </h4>
            <p className="text-sm text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
              {pack.monitoringCadence}
            </p>
          </div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
          <h4 className="font-semibold text-gray-900 dark:text-white">Required Controls & Policies</h4>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {pack.requirements.map((req, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50/30 dark:hover:bg-slate-700/30 transition-colors flex items-start gap-4">
              <div className={cn(
                "mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                req.priority === 'Mandatory' ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              )}>
                {req.priority === 'Mandatory' ? <Lock className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-medium text-gray-900 dark:text-white">{req.title}</h5>
                  <span className="text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-600">
                    {req.category}
                  </span>
                  {req.priority === 'Mandatory' && (
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                      Mandatory
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-300">{req.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Governance Diagram */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
          <h4 className="font-semibold text-gray-900 dark:text-white">Governance Flow Diagram</h4>
        </div>
        <MermaidDiagram 
          title={governanceDiagram.title}
          description={governanceDiagram.description}
          code={governanceDiagram.code}
          className="border-0 shadow-none rounded-none"
        />
      </div>
    </div>
  );
}
