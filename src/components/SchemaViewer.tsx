import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { Schema } from '../types/swagger';
import { SchemaDisplay } from './SchemaDisplay';

interface SchemaViewerProps {
  schemas: { [key: string]: Schema };
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ schemas }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSchemas, setExpandedSchemas] = useState<string[]>([]);

  const filteredSchemas = Object.entries(schemas).filter(([name, schema]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schema.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSchema = (schemaName: string) => {
    setExpandedSchemas(prev =>
      prev.includes(schemaName)
        ? prev.filter(name => name !== schemaName)
        : [...prev, schemaName]
    );
  };

  if (Object.keys(schemas).length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No schemas defined in this API specification</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search schemas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Schemas List */}
      <div className="space-y-4">
        {filteredSchemas.map(([schemaName, schema]) => (
          <div key={schemaName} className="border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <button
                onClick={() => toggleSchema(schemaName)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-800">{schemaName}</span>
                  {schema.description && (
                    <span className="text-sm text-gray-600">— {schema.description}</span>
                  )}
                </div>
                {expandedSchemas.includes(schemaName) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            {expandedSchemas.includes(schemaName) && (
              <div className="p-4">
                <SchemaDisplay schema={schema} schemas={schemas} name={schemaName} />
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredSchemas.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-500">No schemas found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};