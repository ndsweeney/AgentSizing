import React from 'react';
import { Bot, Home, LayoutDashboard, BookOpen, Moon, Sun, LayoutTemplate } from 'lucide-react';
import { AssessmentProgress } from './AssessmentProgress';
import { useSizingStore } from '../state/sizingStore';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
  onLogoClick?: () => void;
}

export function Layout({ children, onLogoClick }: LayoutProps) {
  const { currentView, setView, theme, toggleTheme } = useSizingStore();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100 transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 shadow-sm backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className={`flex items-center gap-3 ${onLogoClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            onClick={onLogoClick}
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg shadow-md text-white">
              <Bot className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Agent Sizing Workshop</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setView('intro')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                currentView === 'intro' 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700"
              )}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
            <button
              onClick={() => setView('portfolio')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                currentView === 'portfolio' 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </button>
            <button
              onClick={() => setView('knowledge')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                currentView === 'knowledge' 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700"
              )}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Knowledge</span>
            </button>
            <button
              onClick={() => setView('reference')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                currentView === 'reference' 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700"
              )}
            >
              <LayoutTemplate className="w-4 h-4" />
              <span className="hidden sm:inline">Reference</span>
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700 rounded-full transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {currentView === 'wizard' && <AssessmentProgress />}
        
        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
