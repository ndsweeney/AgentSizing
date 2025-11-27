import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { useSizingStore } from '../state/sizingStore';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

interface MermaidDiagramProps {
  code: string;
  title?: string;
  description?: string;
  className?: string;
}

export function MermaidDiagram({ code, title, description, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useSizingStore((state) => state.theme);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
      darkMode: theme === 'dark',
    });
  }, [theme]);

  useEffect(() => {
    let mounted = true;
    const renderDiagram = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Generate a unique ID for this render
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        
        // Attempt to parse first to catch syntax errors early
        await mermaid.parse(code);
        
        // Render the diagram
        const { svg } = await mermaid.render(id, code);
        
        if (mounted) {
          setSvg(svg);
          setLoading(false);
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
          setLoading(false);
        }
      }
    };

    // Small delay to ensure DOM and styles are ready
    const timeoutId = setTimeout(renderDiagram, 0);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [code, theme]);

  return (
    <div className={cn("bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden", className)}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
          {title && <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>}
          {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
        </div>
      )}
      
      <div className="p-6 overflow-x-auto flex justify-center min-h-[200px] items-center bg-white dark:bg-slate-900 transition-colors">
        {loading && (
          <div className="flex flex-col items-center gap-2 text-gray-400 animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">Rendering diagram...</span>
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center gap-2 text-red-500 p-4 text-center">
            <AlertCircle className="w-8 h-8" />
            <span className="text-sm font-medium">Failed to render diagram</span>
            <pre className="text-xs bg-red-50 p-2 rounded text-red-700 max-w-full overflow-auto mt-2">
              {error}
            </pre>
          </div>
        )}
        
        {!loading && !error && (
          <div 
            ref={containerRef}
            className="w-full flex justify-center mermaid-container"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
    </div>
  );
}
