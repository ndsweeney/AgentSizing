import { useState } from 'react';
import { User, Building2, Share2, Check, Edit2, X } from 'lucide-react';
import { useActiveScenario, useHasCompletedAllDimensions } from '../state/sizingStore';
import { encodeScenario } from '../utils/share';
import { cn } from '../utils/cn';
import { WorkshopIntake } from './WorkshopIntake';

export function WorkshopMetadata() {
  const { scenario } = useActiveScenario();
  const isComplete = useHasCompletedAllDimensions();
  const [copied, setCopied] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);

  if (!scenario) return null;

  const { facilitatorName, customerName, workshopTitle } = scenario;

  const handleShare = () => {
    if (!isComplete) return;
    const encoded = encodeScenario(scenario);
    const url = new URL(window.location.href);
    url.searchParams.set('share', encoded);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
          Workshop Details
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowEditDetails(true)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-md transition-colors"
            title="Edit Details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleShare}
            disabled={!isComplete}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-colors px-2 py-1 rounded-md",
              isComplete 
                ? "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50" 
                : "text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 cursor-not-allowed"
            )}
            title={isComplete ? "Share read-only link" : "Complete assessment to share"}
          >
            {copied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>
      
      <div className="space-y-2 px-1">
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={workshopTitle || 'Untitled Workshop'}>
            {workshopTitle || 'Untitled Workshop'}
          </div>
          {customerName && (
            <div className="text-xs text-gray-500 dark:text-slate-400 truncate flex items-center gap-1 mt-1">
              <Building2 className="w-3 h-3" />
              {customerName}
            </div>
          )}
          {facilitatorName && (
            <div className="text-xs text-gray-500 dark:text-slate-400 truncate flex items-center gap-1 mt-1">
              <User className="w-3 h-3" />
              {facilitatorName}
            </div>
          )}
        </div>
      </div>

      {showEditDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50 dark:bg-slate-900">
              <h3 className="font-bold text-gray-900 dark:text-white">Edit Workshop Details</h3>
              <button onClick={() => setShowEditDetails(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="p-6">
                <WorkshopIntake className="shadow-none border-none p-0 mb-0" />
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex justify-end">
              <button 
                  onClick={() => setShowEditDetails(false)}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                  Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
