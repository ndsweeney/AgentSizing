import { User, Building2, FileText, Briefcase, Tag } from 'lucide-react';
import { useSizingStore, useActiveScenario } from '../state/sizingStore';
import { cn } from '../utils/cn';

interface WorkshopIntakeProps {
  className?: string;
  values?: {
    workshopTitle?: string;
    facilitatorName?: string;
    customerName?: string;
    industry?: string;
    useCase?: string;
  };
  onChange?: (field: string, value: string) => void;
  disabled?: boolean;
  hideTitle?: boolean;
}

export function WorkshopIntake({ className, values, onChange, disabled, hideTitle }: WorkshopIntakeProps) {
  const store = useSizingStore();
  const { scenario } = useActiveScenario();

  const isControlled = !!values;
  const data = isControlled ? values : scenario;
  const handleChange = isControlled ? onChange : store.updateMetadata;
  const isDisabled = isControlled ? disabled : store.isReadOnly;

  if (!data) return null;

  const { facilitatorName, customerName, workshopTitle, industry, useCase } = data;

  const inputClasses = "w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-900 dark:disabled:text-slate-400 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white";
  const iconClasses = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500";

  const onFieldChange = (field: string, value: string) => {
    if (handleChange) {
      handleChange(field as any, value);
    }
  };

  return (
    <div className={cn("bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm mb-8 transition-colors", className)}>
      {!hideTitle && (
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
          Workshop Details
        </h3>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className={iconClasses}>
            <FileText className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={workshopTitle || ''}
            onChange={(e) => onFieldChange('workshopTitle', e.target.value)}
            placeholder="Workshop Title"
            disabled={isDisabled}
            className={inputClasses}
          />
        </div>

        <div className="relative">
          <div className={iconClasses}>
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={facilitatorName || ''}
            onChange={(e) => onFieldChange('facilitatorName', e.target.value)}
            placeholder="Facilitator Name"
            disabled={isDisabled}
            className={inputClasses}
          />
        </div>

        <div className="relative">
          <div className={iconClasses}>
            <Building2 className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={customerName || ''}
            onChange={(e) => onFieldChange('customerName', e.target.value)}
            placeholder="Customer Name"
            disabled={isDisabled}
            className={inputClasses}
          />
        </div>

        <div className="relative">
          <div className={iconClasses}>
            <Briefcase className="w-4 h-4" />
          </div>
          <select
            value={industry || ''}
            onChange={(e) => onFieldChange('industry', e.target.value)}
            disabled={isDisabled}
            className={`${inputClasses} appearance-none`}
          >
            <option value="">Select Industry...</option>
            <option value="Retail">Retail</option>
            <option value="FSI">Financial Services</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Public Sector">Public Sector</option>
            <option value="Technology">Technology</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="relative md:col-span-2">
          <div className="absolute top-2.5 left-0 pl-3 flex items-start pointer-events-none text-gray-400">
            <Tag className="w-4 h-4" />
          </div>
          <textarea
            value={useCase || ''}
            onChange={(e) => onFieldChange('useCase', e.target.value)}
            placeholder="Use Case Description"
            disabled={isDisabled}
            rows={2}
            className={`${inputClasses} resize-none`}
          />
        </div>
      </div>
    </div>
  );
}
