import { useState } from 'react';
import { Download, Database } from 'lucide-react';
import { datasets, type DatasetMetadata } from '../domain/exampleData';
import { downloadJson } from '../utils/export';
import { cn } from '../utils/cn';

export function ExampleDataView() {
  const [activeDataset, setActiveDataset] = useState<DatasetMetadata>(datasets[0]);

  const handleDownload = (dataset: DatasetMetadata) => {
    downloadJson(dataset.data, dataset.filename);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">POC Example Datasets</h3>
        </div>
        <p className="text-sm text-gray-600">
          Use these JSON datasets to quickly seed your Copilot Studio environment or test your agents.
        </p>
      </div>

      <div className="grid md:grid-cols-4 min-h-[400px]">
        {/* Sidebar List */}
        <div className="border-r border-gray-100 bg-gray-50/30">
          {datasets.map((ds) => (
            <button
              key={ds.id}
              onClick={() => setActiveDataset(ds)}
              className={cn(
                "w-full text-left px-4 py-3 text-sm font-medium border-l-2 transition-colors hover:bg-gray-100",
                activeDataset.id === ds.id
                  ? "border-blue-600 text-blue-700 bg-white"
                  : "border-transparent text-gray-600"
              )}
            >
              {ds.name}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900">{activeDataset.name}</h4>
              <p className="text-xs text-gray-500">{activeDataset.description}</p>
            </div>
            <button
              onClick={() => handleDownload(activeDataset)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download JSON
            </button>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[400px] border border-gray-800">
            <pre className="text-xs font-mono text-gray-300 whitespace-pre">
              {JSON.stringify(activeDataset.data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
