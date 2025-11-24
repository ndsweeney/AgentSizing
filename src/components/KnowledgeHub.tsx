import { useState, useMemo } from 'react';
import { Search, Book, Shield, Layers, Lightbulb, Download, FileText, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { KNOWLEDGE_BASE, type KnowledgeCategory } from '../domain/knowledge';
import { cn } from '../utils/cn';

interface KnowledgeHubProps {
  onNavigateToResults: () => void;
  hasResults: boolean;
}

export function KnowledgeHub({ onNavigateToResults, hasResults }: KnowledgeHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<KnowledgeCategory | 'all'>('all');

  const filteredItems = useMemo(() => {
    return KNOWLEDGE_BASE.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleExportJson = () => {
    const data = JSON.stringify(KNOWLEDGE_BASE, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge-base.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    let md = '# Knowledge Base Export\n\n';
    
    const categories: Record<KnowledgeCategory, string> = {
      glossary: 'Glossary',
      pattern: 'Architecture Patterns',
      governance: 'Governance Controls',
      example: 'Example Agents'
    };

    (Object.keys(categories) as KnowledgeCategory[]).forEach(cat => {
      const items = KNOWLEDGE_BASE.filter(i => i.category === cat);
      if (items.length > 0) {
        md += `## ${categories[cat]}\n\n`;
        items.forEach(item => {
          md += `### ${item.title}\n`;
          md += `${item.content}\n\n`;
          md += `*Tags: ${item.tags.join(', ')}*\n\n`;
        });
      }
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge-base.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category: KnowledgeCategory) => {
    switch (category) {
      case 'glossary': return Book;
      case 'pattern': return Layers;
      case 'governance': return Shield;
      case 'example': return Lightbulb;
    }
  };

  const getCategoryColor = (category: KnowledgeCategory) => {
    switch (category) {
      case 'glossary': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pattern': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'governance': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'example': return 'text-amber-600 bg-amber-50 border-amber-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Knowledge Hub</h2>
            <p className="mt-2 text-gray-600">
              Explore best practices, patterns, and terminology for Copilot Studio.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Export MD
            </button>
            <button
              onClick={handleExportJson}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {(['all', 'glossary', 'pattern', 'governance', 'example'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  activeCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Related Artefacts Link */}
      {hasResults && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-indigo-900">Your Project Artefacts</h3>
              <p className="text-sm text-indigo-700">View your generated sizing estimation and delivery plan.</p>
            </div>
          </div>
          <button
            onClick={onNavigateToResults}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            View Results
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const Icon = getCategoryIcon(item.category);
          const colorClass = getCategoryColor(item.category);
          
          return (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-2 rounded-lg border", colorClass)}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn("text-xs font-medium px-2 py-1 rounded-full uppercase tracking-wider", colorClass)}>
                  {item.category}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-4">{item.content}</p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {item.tags.map(tag => (
                  <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No results found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}

