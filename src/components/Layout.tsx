import React from 'react';
import { Bot, HelpCircle } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  onLogoClick?: () => void;
}

export function Layout({ children, showSidebar = false, onLogoClick }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className={`flex items-center gap-3 ${onLogoClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            onClick={onLogoClick}
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg shadow-md text-white">
              <Bot className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Agent Sizing Workshop</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm border border-blue-200 ring-2 ring-white shadow-sm">
              JD
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex items-start gap-6 p-4 sm:p-6 lg:p-8">
        
        {/* Left Sidebar - Navigation / Progress */}
        {showSidebar && (
          <aside className="w-64 flex-shrink-0 hidden md:block sticky top-24 animate-in slide-in-from-left-4 duration-500">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-4">
              <Sidebar />
            </div>
          </aside>
        )}

        {/* Right Content - Main Application Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
