import { Shield, Scale, Eye, Activity, FileText, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { generateGovernancePack } from '../domain/governance';
import { calculateRiskProfile, type ScoresRecord } from '../domain/scoring';
import { cn } from '../utils/cn';
import { MermaidDiagram } from './MermaidDiagram';
import { buildGovernanceMermaid } from '../domain/diagrams';
import { calculateSizingResult } from '../domain/scoring';

interface GovernanceViewProps {
  scores: ScoresRecord;
}

export function GovernanceView({ scores }: GovernanceViewProps) {
  const riskProfile = calculateRiskProfile(scores);
  const pack = generateGovernancePack(scores, riskProfile);
  const result = calculateSizingResult(scores);
  const governanceDiagram = buildGovernanceMermaid(result, scores);

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-700 bg-red-50 border-red-200';
      case 'MODERATE': return 'text-orange-700 bg-orange-50 border-orange-200';
      default: return 'text-green-700 bg-green-50 border-green-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-slate-900 text-lg mb-1">
                <Scale className="w-5 h-5 text-slate-600" />
                Governance & Risk Assessment
              </h3>
              <p className="text-sm text-slate-600">
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
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Risk Profile
            </h4>
            <ul className="space-y-2">
              {pack.riskProfile.reasons.map((reason, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              Human Oversight
            </h4>
            <ul className="space-y-2">
              {pack.oversightPoints.map((point, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Monitoring Cadence
            </h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
              {pack.monitoringCadence}
            </p>
          </div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h4 className="font-semibold text-gray-900">Required Controls & Policies</h4>
        </div>
        <div className="divide-y divide-gray-100">
          {pack.requirements.map((req, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50/30 transition-colors flex items-start gap-4">
              <div className={cn(
                "mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                req.priority === 'Mandatory' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
              )}>
                {req.priority === 'Mandatory' ? <Lock className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-medium text-gray-900">{req.title}</h5>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                    {req.category}
                  </span>
                  {req.priority === 'Mandatory' && (
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider border border-red-200 bg-red-50 px-1.5 py-0.5 rounded">
                      Mandatory
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{req.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Governance Diagram */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h4 className="font-semibold text-gray-900">Governance Flow Diagram</h4>
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
