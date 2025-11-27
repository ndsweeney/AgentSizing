import { useState } from 'react';
import { useActiveScenario, useSizingStore } from '../state/sizingStore';
import { calculateDetailedCosts, type CostAssumptions, DEFAULT_COST_ASSUMPTIONS } from '../domain/costs';
import { calculateRoi, type BenefitAssumptions, DEFAULT_BENEFIT_ASSUMPTIONS } from '../domain/roi';
import { calculateSizingResult } from '../domain/scoring';
import { DollarSign, Settings, Info, TrendingUp, Clock, Target, BarChart3 } from 'lucide-react';
import { cn } from '../utils/cn';

export function CostView() {
  const { scores, scenario } = useActiveScenario();
  const { updateCostAssumptions, updateBenefitAssumptions, isReadOnly } = useSizingStore();
  const [showSettings, setShowSettings] = useState(false);

  // Fallback to default assumptions if not present in scenario (e.g. old data)
  const activeAssumptions = scenario.costAssumptions || DEFAULT_COST_ASSUMPTIONS;
  const activeBenefitAssumptions = scenario.benefitAssumptions || DEFAULT_BENEFIT_ASSUMPTIONS;

  const result = calculateSizingResult(scores);
  const costs = calculateDetailedCosts(result, scores, activeAssumptions);
  const roi = calculateRoi(activeBenefitAssumptions, costs.totalOneTime, costs.totalMonthly);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const formatPercent = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 0 }).format(val);

  const AssumptionInput = ({ 
    label, 
    field, 
    min, 
    max, 
    step, 
    format = (v: number) => v.toString() 
  }: { 
    label: string; 
    field: keyof CostAssumptions; 
    min: number; 
    max: number; 
    step: number;
    format?: (v: number) => string;
  }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 dark:text-slate-300">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">{format(activeAssumptions[field])}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={activeAssumptions[field]}
        onChange={(e) => updateCostAssumptions({ [field]: Number(e.target.value) })}
        disabled={isReadOnly}
        className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );

  const BenefitInput = ({ 
    label, 
    field, 
    min, 
    max, 
    step, 
    format = (v: number) => v.toString() 
  }: { 
    label: string; 
    field: keyof BenefitAssumptions; 
    min: number; 
    max: number; 
    step: number;
    format?: (v: number) => string;
  }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 dark:text-slate-300">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">{format(activeBenefitAssumptions[field] || 0)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={activeBenefitAssumptions[field] || 0}
        onChange={(e) => updateBenefitAssumptions({ [field]: Number(e.target.value) })}
        disabled={isReadOnly}
        className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-green-600"
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              Cost Estimates
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              Estimated costs based on sizing ({result.tShirtSize}) and complexity.
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600"
          >
            <Settings className="w-4 h-4" />
            {showSettings ? 'Hide Assumptions' : 'Adjust Assumptions'}
          </button>
        </div>

        {showSettings && (
          <div className="mb-8 p-6 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Cost Assumptions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Usage</h4>
                <AssumptionInput label="Estimated Users" field="estimatedUsers" min={10} max={5000} step={10} />
                <AssumptionInput label="Messages / User / Mo" field="messagesPerUserPerMonth" min={1} max={500} step={1} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Licensing & Azure</h4>
                <AssumptionInput label="License Cost / Mo" field="copilotStudioLicensePerMonth" min={0} max={500} step={10} format={(v) => `$${v}`} />
                <AssumptionInput label="Msg Pack Cost" field="copilotStudioMessagePackCost" min={0} max={200} step={10} format={(v) => `$${v}`} />
                <AssumptionInput label="Avg Tokens / Msg" field="averageTokensPerMessage" min={100} max={5000} step={100} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Implementation</h4>
                <AssumptionInput label="Hourly Rate" field="blendedHourlyRate" min={50} max={500} step={10} format={(v) => `$${v}/hr`} />
                <AssumptionInput label="Team Size" field="teamSize" min={1} max={10} step={1} />
                <AssumptionInput label="Hours / Sprint" field="hoursPerSprint" min={40} max={160} step={8} />
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Benefit Assumptions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Efficiency</h4>
                  <BenefitInput label="Time Saved / Tx (min)" field="timeSavingMinutesPerTx" min={1} max={60} step={1} />
                  <BenefitInput label="Monthly Transactions" field="txPerMonth" min={100} max={50000} step={100} />
                  <BenefitInput label="Automation Rate" field="automationRate" min={0} max={1} step={0.05} format={formatPercent} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Value</h4>
                  <BenefitInput label="Avg Hourly Cost" field="hourlyRate" min={20} max={200} step={5} format={(v) => `$${v}/hr`} />
                  <BenefitInput label="Adoption Rate (Yr 1)" field="adoptionRate" min={0} max={1} step={0.1} format={formatPercent} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Advanced</h4>
                  <BenefitInput label="Revenue Uplift" field="upliftPercent" min={0} max={0.2} step={0.01} format={formatPercent} />
                  <BenefitInput label="Base Revenue / Mo" field="baseRevenuePerMonth" min={0} max={1000000} step={10000} format={(v) => `$${v/1000}k`} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">One-Time Implementation</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(costs.totalOneTime)}</div>
            <div className="text-xs text-blue-500 dark:text-blue-300 mt-1">
              Est. {costs.sprintsEstimate} sprints ({costs.sprintsEstimate * 2} weeks)
            </div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Monthly Run Cost</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{formatCurrency(costs.totalMonthly)}</div>
            <div className="text-xs text-green-500 dark:text-green-300 mt-1">
              Licensing + Azure + Support
            </div>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">First Year Total</div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{formatCurrency(costs.totalAnnual)}</div>
            <div className="text-xs text-purple-500 dark:text-purple-300 mt-1">
              Implementation + 12 months run
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Item</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">One-Time</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Monthly</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {costs.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">{item.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2 py-1 text-xs font-medium rounded-full",
                      item.category === 'Licensing' ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" :
                      item.category === 'Infrastructure' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300" :
                      item.category === 'Implementation' ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300" :
                      "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-300"
                    )}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-slate-400">
                    {item.oneTimeCost > 0 ? formatCurrency(item.oneTimeCost) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-slate-400">
                    {item.monthlyCost > 0 ? formatCurrency(item.monthlyCost) : '-'}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 dark:bg-slate-900/50 font-bold">
                <td className="px-6 py-4 text-gray-900 dark:text-white">Total</td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{formatCurrency(costs.totalOneTime)}</td>
                <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{formatCurrency(costs.totalMonthly)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex gap-3 items-start">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Disclaimer</p>
            These estimates are for planning purposes only and do not constitute a formal quote. 
            Actual costs will vary based on specific requirements, volume discounts, and regional pricing.
            Azure AI Foundry costs are variable based on token usage.
          </div>
        </div>
      </div>

      {/* ROI Analysis Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              ROI Analysis
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              Projected return on investment based on efficiency gains and cost savings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 font-medium mb-1">
              <DollarSign className="w-4 h-4" />
              Annual Benefit
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(roi.annualTotalBenefit)}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Time savings + Revenue uplift
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 font-medium mb-1">
              <Target className="w-4 h-4" />
              Net Benefit
            </div>
            <div className={cn("text-2xl font-bold", roi.netBenefit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
              {formatCurrency(roi.netBenefit)}
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Benefit - Annual Cost
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 font-medium mb-1">
              <BarChart3 className="w-4 h-4" />
              ROI
            </div>
            <div className={cn("text-2xl font-bold", roi.roiPercent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
              {roi.roiPercent.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Return on Investment
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 font-medium mb-1">
              <Clock className="w-4 h-4" />
              Payback Period
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {roi.paybackMonths === 0 ? 'Immediate' : 
               roi.paybackMonths > 60 ? '> 5 Years' : 
               `${roi.paybackMonths.toFixed(1)} Months`}
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Time to recover costs
            </div>
          </div>
        </div>

        {/* Simple Visualization */}
        <div className="relative h-12 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-red-400 dark:bg-red-500 flex items-center justify-center text-white text-xs font-bold transition-all duration-500"
            style={{ width: `${Math.min(100, (roi.annualCost / (roi.annualCost + roi.annualTotalBenefit)) * 100)}%` }}
          >
            Cost
          </div>
          <div 
            className="h-full bg-green-500 dark:bg-green-600 flex items-center justify-center text-white text-xs font-bold transition-all duration-500"
            style={{ width: `${Math.min(100, (roi.annualTotalBenefit / (roi.annualCost + roi.annualTotalBenefit)) * 100)}%` }}
          >
            Benefit
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mt-2 px-1">
          <span>Annual Cost: {formatCurrency(roi.annualCost)}</span>
          <span>Annual Benefit: {formatCurrency(roi.annualTotalBenefit)}</span>
        </div>

        {/* Multi-Year ROI Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700 mb-8">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Period</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Cost</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Benefit</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Net Benefit</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">ROI</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">1 Year</td>
                <td className="px-6 py-4 text-sm text-right text-gray-500 dark:text-slate-400">{formatCurrency(roi.oneYear.totalCost)}</td>
                <td className="px-6 py-4 text-sm text-right text-green-600 dark:text-green-400">{formatCurrency(roi.oneYear.totalBenefit)}</td>
                <td className={cn("px-6 py-4 text-sm text-right font-medium", roi.oneYear.netBenefit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                  {formatCurrency(roi.oneYear.netBenefit)}
                </td>
                <td className={cn("px-6 py-4 text-sm text-right font-medium", roi.oneYear.roiPercent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                  {roi.oneYear.roiPercent.toFixed(0)}%
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">3 Year</td>
                <td className="px-6 py-4 text-sm text-right text-gray-500 dark:text-slate-400">{formatCurrency(roi.threeYear.totalCost)}</td>
                <td className="px-6 py-4 text-sm text-right text-green-600 dark:text-green-400">{formatCurrency(roi.threeYear.totalBenefit)}</td>
                <td className={cn("px-6 py-4 text-sm text-right font-medium", roi.threeYear.netBenefit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                  {formatCurrency(roi.threeYear.netBenefit)}
                </td>
                <td className={cn("px-6 py-4 text-sm text-right font-medium", roi.threeYear.roiPercent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                  {roi.threeYear.roiPercent.toFixed(0)}%
                </td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">5 Year</td>
                <td className="px-6 py-4 text-sm text-right text-gray-500 dark:text-slate-400">{formatCurrency(roi.fiveYear.totalCost)}</td>
                <td className="px-6 py-4 text-sm text-right text-green-600 dark:text-green-400">{formatCurrency(roi.fiveYear.totalBenefit)}</td>
                <td className={cn("px-6 py-4 text-sm text-right font-medium", roi.fiveYear.netBenefit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                  {formatCurrency(roi.fiveYear.netBenefit)}
                </td>
                <td className={cn("px-6 py-4 text-sm text-right font-medium", roi.fiveYear.roiPercent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                  {roi.fiveYear.roiPercent.toFixed(0)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
