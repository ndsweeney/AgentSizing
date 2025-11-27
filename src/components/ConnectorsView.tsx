import { useState } from 'react';
import { Database, Server, Copy, Check, Link } from 'lucide-react';
import { getConnectorsForSystem, type ConnectorDefinition } from '../domain/connectors';
import { copyToClipboard } from '../utils/export';
import { cn } from '../utils/cn';

// Import mock data
import d365Account from '../../mock-data/connectors/d365-account.json';
import sapOrder from '../../mock-data/connectors/sap-order.json';
import snowIncident from '../../mock-data/connectors/servicenow-incident.json';
import spItems from '../../mock-data/connectors/sharepoint-items.json';

interface ConnectorsViewProps {
  systems: string[];
}

export function ConnectorsView({ systems }: ConnectorsViewProps) {
  const connectors = systems
    .map(sys => getConnectorsForSystem(sys))
    .filter((c): c is ConnectorDefinition => c !== null)
    // Deduplicate by ID
    .filter((c, index, self) => index === self.findIndex(t => t.id === c.id));

  if (connectors.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
        <Database className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Specific Connectors Identified</h3>
        <p className="text-gray-500 dark:text-slate-400 mt-2">
          Add systems in the "System Integration" tab to see recommended connectors and schemas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6">
        <h3 className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100 mb-2">
          <Link className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Connector & API Mocks
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          These schemas and mock responses help developers implement Task Agents. 
          Use these JSON structures to configure API calls and test data parsing logic.
        </p>
      </div>

      <div className="grid gap-6">
        {connectors.map(connector => (
          <ConnectorCard key={connector.id} connector={connector} />
        ))}
      </div>
    </div>
  );
}

function ConnectorCard({ connector }: { connector: ConnectorDefinition }) {
  const [expandedSchema, setExpandedSchema] = useState<string | null>(connector.schemas[0]?.name || null);

  const getMockData = (connectorId: string) => {
    switch (connectorId) {
      case 'd365-sales': return d365Account;
      case 'sap-s4hana': return sapOrder;
      case 'servicenow': return snowIncident;
      case 'sharepoint': return spItems;
      default: return { message: "No mock data available for this generic connector." };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm">
            <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{connector.name}</h4>
            <p className="text-xs text-gray-500 dark:text-slate-400">{connector.provider}</p>
          </div>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full border border-gray-200 dark:border-slate-600">
          {connector.schemas.length} Actions
        </span>
      </div>

      <div className="p-6">
        <p className="text-sm text-gray-600 dark:text-slate-300 mb-6">{connector.description}</p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Schema List */}
          <div className="lg:col-span-1 space-y-2">
            <h5 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Available Actions</h5>
            {connector.schemas.map(schema => (
              <button
                key={schema.name}
                onClick={() => setExpandedSchema(schema.name)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all",
                  expandedSchema === schema.name
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 ring-1 ring-blue-200 dark:ring-blue-800"
                    : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("font-medium", expandedSchema === schema.name ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-white")}>
                    {schema.name}
                  </span>
                  <span className={cn(
                    "text-[10px] font-mono px-1.5 py-0.5 rounded border",
                    schema.method === 'GET' ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" :
                    schema.method === 'POST' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" :
                    "bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600"
                  )}>
                    {schema.method}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{schema.description}</p>
              </button>
            ))}
          </div>

          {/* Schema Details */}
          <div className="lg:col-span-2 bg-gray-900 dark:bg-slate-950 rounded-xl overflow-hidden flex flex-col">
            {connector.schemas.map(schema => {
              if (schema.name !== expandedSchema) return null;
              
              const mockData = getMockData(connector.id);

              return (
                <div key={schema.name} className="flex flex-col h-full">
                  <div className="px-4 py-3 bg-gray-800 dark:bg-slate-900 border-b border-gray-700 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded",
                        schema.method === 'GET' ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                      )}>
                        {schema.method}
                      </span>
                      <code className="text-xs text-gray-300 dark:text-slate-400 font-mono truncate" title={schema.endpoint}>
                        {schema.endpoint}
                      </code>
                    </div>
                    <CopyButton text={JSON.stringify(mockData, null, 2)} />
                  </div>
                  
                  <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                    <div className="space-y-4">
                      {schema.requestSchema && (
                        <div>
                          <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Request Body Schema</div>
                          <pre className="text-xs font-mono text-blue-300 bg-gray-950/50 dark:bg-black/50 p-3 rounded-lg border border-gray-800 dark:border-slate-800 overflow-x-auto">
                            {JSON.stringify(schema.requestSchema, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Response Example</span>
                          <span className="text-[10px] text-gray-600 dark:text-slate-500">JSON</span>
                        </div>
                        <pre className="text-xs font-mono text-green-300 bg-gray-950/50 dark:bg-black/50 p-3 rounded-lg border border-gray-800 dark:border-slate-800 overflow-x-auto">
                          {JSON.stringify(mockData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-white hover:bg-gray-700 dark:hover:bg-slate-800 rounded-lg transition-colors"
      title="Copy JSON"
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}
