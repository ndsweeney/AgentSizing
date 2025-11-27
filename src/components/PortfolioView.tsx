import { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { ArrowLeft, Download, Search, ArrowUpDown, Calendar, Building2, Tag, Users } from 'lucide-react';
import { useSizingStore } from '../state/sizingStore';
import { calculateSizingResult, DIMENSIONS } from '../domain/scoring';
import { downloadJson } from '../utils/export';
import { cn } from '../utils/cn';

interface PortfolioViewProps {
  onBack: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function PortfolioView({ onBack }: PortfolioViewProps) {
  const { scenarios, setActiveScenario, setView } = useSizingStore();
  const [filterText, setFilterText] = useState('');
  const [sortField, setSortField] = useState<'date' | 'size'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [groupBy, setGroupBy] = useState<'none' | 'customer'>('none');

  // Process data for charts and list
  const processedData = useMemo(() => {
    return scenarios.map(scenario => {
      const result = calculateSizingResult(scenario.scores);
      return {
        ...scenario,
        tShirtSize: result.tShirtSize,
        totalScore: result.totalScore,
        date: new Date(scenario.lastUpdated).toLocaleDateString(),
        timestamp: scenario.lastUpdated
      };
    });
  }, [scenarios]);

  // Filter and Sort
  const filteredScenarios = useMemo(() => {
    return processedData
      .filter(s => {
        const search = filterText.toLowerCase();
        return (
          s.name.toLowerCase().includes(search) ||
          s.customerName?.toLowerCase().includes(search) ||
          s.industry?.toLowerCase().includes(search) ||
          s.useCase?.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          return sortDirection === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
        } else {
          // Sort by size (Small < Medium < Large)
          const sizeOrder = { 'SMALL': 1, 'MEDIUM': 2, 'LARGE': 3 };
          const diff = sizeOrder[a.tShirtSize] - sizeOrder[b.tShirtSize];
          return sortDirection === 'asc' ? diff : -diff;
        }
      });
  }, [processedData, filterText, sortField, sortDirection]);

  // Grouping
  const groupedScenarios = useMemo(() => {
    if (groupBy === 'none') return { 'All Scenarios': filteredScenarios };
    
    const groups: Record<string, typeof filteredScenarios> = {};
    filteredScenarios.forEach(s => {
      const key = s.customerName || 'No Customer';
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    
    // Sort groups alphabetically
    return Object.keys(groups).sort().reduce(
      (obj, key) => { 
        obj[key] = groups[key]; 
        return obj;
      }, 
      {} as Record<string, typeof filteredScenarios>
    );
  }, [filteredScenarios, groupBy]);

  // Chart Data: Size Distribution
  const sizeDistribution = useMemo(() => {
    const counts = { SMALL: 0, MEDIUM: 0, LARGE: 0 };
    filteredScenarios.forEach(s => counts[s.tShirtSize]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredScenarios]);

  // Chart Data: Average Score per Dimension
  const avgScorePerDimension = useMemo(() => {
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};
    
    DIMENSIONS.forEach(d => {
      sums[d.id] = 0;
      counts[d.id] = 0;
    });

    filteredScenarios.forEach(s => {
      Object.entries(s.scores).forEach(([dimId, score]) => {
        if (score && sums[dimId] !== undefined) {
          sums[dimId] += score;
          counts[dimId]++;
        }
      });
    });

    return DIMENSIONS.map(d => ({
      name: d.label.split(' ')[0], // Short name
      fullName: d.label,
      score: counts[d.id] ? Number((sums[d.id] / counts[d.id]).toFixed(1)) : 0
    }));
  }, [filteredScenarios]);

  // Chart Data: High Scoring Dimensions (Frequency of 3s)
  const highScoringDimensions = useMemo(() => {
    const counts: Record<string, number> = {};
    DIMENSIONS.forEach(d => counts[d.id] = 0);

    filteredScenarios.forEach(s => {
      Object.entries(s.scores).forEach(([dimId, score]) => {
        if (score === 3 && counts[dimId] !== undefined) {
          counts[dimId]++;
        }
      });
    });

    return DIMENSIONS
      .map(d => ({ name: d.label, count: counts[d.id] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredScenarios]);

  // Chart Data: Tag Frequency
  const tagFrequency = useMemo(() => {
    const industries: Record<string, number> = {};
    const useCases: Record<string, number> = {};

    filteredScenarios.forEach(s => {
      if (s.industry) industries[s.industry] = (industries[s.industry] || 0) + 1;
      if (s.useCase) useCases[s.useCase] = (useCases[s.useCase] || 0) + 1;
    });

    return {
      industries: Object.entries(industries).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      useCases: Object.entries(useCases).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    };
  }, [filteredScenarios]);

  // Chart Data: Scenarios by Customer
  const scenariosByCustomer = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredScenarios.forEach(s => {
      const customer = s.customerName || 'Unknown';
      counts[customer] = (counts[customer] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredScenarios]);

  const handleExport = () => {
    const exportData = {
      summary: {
        totalScenarios: processedData.length,
        sizeDistribution,
        avgScorePerDimension,
        generatedAt: new Date().toISOString()
      },
      scenarios: processedData
    };
    downloadJson(exportData, `portfolio-export-${new Date().toISOString().split('T')[0]}.json`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-400">Analyze {scenarios.length} scenarios across your portfolio</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Summary
          </button>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Size Distribution */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {groupBy === 'customer' ? 'Scenarios by Customer' : 'Size Distribution'}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {groupBy === 'customer' ? (
                  <BarChart data={scenariosByCustomer} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                    <XAxis type="number" allowDecimals={false} stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" width={100} fontSize={12} stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-slate-800)', borderColor: 'var(--color-slate-700)', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={sizeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sizeDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average Scores */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Avg. Score by Dimension</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={avgScorePerDimension}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
                  <YAxis domain={[0, 3]} ticks={[1, 2, 3]} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-slate-800)', borderColor: 'var(--color-slate-700)', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* High Complexity Drivers */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Complexity Drivers (Score 3)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={highScoringDimensions} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis type="number" allowDecimals={false} stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" width={150} fontSize={11} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-slate-800)', borderColor: 'var(--color-slate-700)', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tag Frequency */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Industries</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tagFrequency.industries.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis type="number" allowDecimals={false} stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" width={100} fontSize={12} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-slate-800)', borderColor: 'var(--color-slate-700)', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Scenarios List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">All Scenarios</h3>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter scenarios..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
              
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
                <button
                  onClick={() => setGroupBy(prev => prev === 'none' ? 'customer' : 'none')}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1",
                    groupBy === 'customer' 
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"
                  )}
                >
                  <Users className="w-3 h-3" />
                  Group by Customer
                </button>
                <button
                  onClick={() => {
                    if (sortField === 'date') {
                      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('date');
                      setSortDirection('desc');
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1",
                    sortField === 'date' 
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"
                  )}
                >
                  Date
                  {sortField === 'date' && <ArrowUpDown className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => {
                    if (sortField === 'size') {
                      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('size');
                      setSortDirection('desc');
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1",
                    sortField === 'size' 
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"
                  )}
                >
                  Size
                  {sortField === 'size' && <ArrowUpDown className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {Object.entries(groupedScenarios).map(([groupName, scenarios]) => (
              <div key={groupName} className={cn("border-b border-slate-100 dark:border-slate-700 last:border-0", groupBy !== 'none' && "mb-4")}>
                {groupBy !== 'none' && (
                  <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 font-semibold text-slate-700 dark:text-slate-200 border-y border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {groupName}
                    <span className="text-xs font-normal text-slate-500 ml-2">({scenarios.length})</span>
                  </div>
                )}
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-3">Scenario Name</th>
                      {groupBy === 'none' && <th className="px-6 py-3">Customer</th>}
                      <th className="px-6 py-3">Industry</th>
                      <th className="px-6 py-3">Size</th>
                      <th className="px-6 py-3">Score</th>
                      <th className="px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {scenarios.map((scenario) => (
                      <tr 
                        key={scenario.id} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setActiveScenario(scenario.id);
                          setView('results');
                        }}
                      >
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{scenario.name}</td>
                        {groupBy === 'none' && (
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {scenario.customerName && (
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-3 h-3" />
                                {scenario.customerName}
                              </div>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {scenario.industry && (
                            <div className="flex items-center gap-1.5">
                              <Tag className="w-3 h-3" />
                              {scenario.industry}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-bold",
                            scenario.tShirtSize === 'SMALL' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                            scenario.tShirtSize === 'MEDIUM' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          )}>
                            {scenario.tShirtSize}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{scenario.totalScore}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {scenario.date}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {scenarios.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                          No scenarios found matching your filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
