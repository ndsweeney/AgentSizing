import { useState } from 'react';
import { User, Building2, FileText, Share2, Check, Briefcase, Tag } from 'lucide-react';
import { useSizingStore, useActiveScenario } from '../state/sizingStore';
import { encodeScenario } from '../utils/share';

export function WorkshopMetadata() {
  const { updateMetadata, isReadOnly } = useSizingStore();
  const { scenario } = useActiveScenario();
  const [copied, setCopied] = useState(false);

  if (!scenario) return null;

  const { facilitatorName, customerName, workshopTitle, industry, useCase } = scenario;

  const handleShare = () => {
    const encoded = encodeScenario(scenario);
    const url = new URL(window.location.href);
    url.searchParams.set('share', encoded);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 mb-6 pb-6 border-b border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Workshop Details
        </h2>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100"
          title="Share read-only link"
        >
          {copied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={workshopTitle || ''}
            onChange={(e) => updateMetadata('workshopTitle', e.target.value)}
            placeholder="Workshop Title"
            disabled={isReadOnly}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
            <User className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={facilitatorName || ''}
            onChange={(e) => updateMetadata('facilitatorName', e.target.value)}
            placeholder="Facilitator Name"
            disabled={isReadOnly}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={customerName || ''}
            onChange={(e) => updateMetadata('customerName', e.target.value)}
            placeholder="Customer Name"
            disabled={isReadOnly}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={industry || ''}
            onChange={(e) => updateMetadata('industry', e.target.value)}
            placeholder="Industry"
            disabled={isReadOnly}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={useCase || ''}
            onChange={(e) => updateMetadata('useCase', e.target.value)}
            placeholder="Use Case"
            disabled={isReadOnly}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>
      </div>
    </div>
  );
}
