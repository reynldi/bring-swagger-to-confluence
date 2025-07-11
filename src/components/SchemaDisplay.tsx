import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Hash, Type, List, FileText } from 'lucide-react';
import { Schema } from '../types/swagger';

interface SchemaDisplayProps {
  schema: Schema;
  schemas: { [key: string]: Schema };
  depth?: number;
  name?: string;
}

export const SchemaDisplay: React.FC<SchemaDisplayProps> = ({ 
  schema, 
  schemas, 
  depth = 0, 
  name 
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  const resolveSchema = (schema: Schema): Schema => {
    if (schema.$ref) {
      const refPath = schema.$ref.replace('#/components/schemas/', '');
      return schemas[refPath] || schema;
    }
    return schema;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'object':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'array':
        return <List className="w-4 h-4 text-green-500" />;
      case 'string':
        return <Type className="w-4 h-4 text-purple-500" />;
      case 'integer':
      case 'number':
        return <Hash className="w-4 h-4 text-orange-500" />;
      default:
        return <Type className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      object: 'bg-blue-50 text-blue-700 border-blue-200',
      array: 'bg-green-50 text-green-700 border-green-200',
      string: 'bg-purple-50 text-purple-700 border-purple-200',
      integer: 'bg-orange-50 text-orange-700 border-orange-200',
      number: 'bg-orange-50 text-orange-700 border-orange-200',
      boolean: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    };
    return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const renderSchema = (schema: Schema, propertyName?: string) => {
    const resolvedSchema = resolveSchema(schema);
    
    if (resolvedSchema.type === 'object' && resolvedSchema.properties) {
      return (
        <div className={`${depth > 0 ? 'ml-4 border-l-2 border-gray-200 pl-4' : ''}`}>
          {propertyName && (
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {getTypeIcon('object')}
                {propertyName}
              </button>
              <span className={`px-2 py-1 text-xs rounded border ${getTypeColor('object')}`}>
                object
              </span>
              {resolvedSchema.description && (
                <span className="text-xs text-gray-500">— {resolvedSchema.description}</span>
              )}
            </div>
          )}
          
          {isExpanded && (
            <div className="space-y-2">
              {Object.entries(resolvedSchema.properties).map(([propName, propSchema]) => (
                <div key={propName} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {getTypeIcon(propSchema.type || 'unknown')}
                    <span className="font-medium text-gray-700">{propName}</span>
                    {resolvedSchema.required?.includes(propName) && (
                      <span className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded">required</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 text-xs rounded border ${getTypeColor(propSchema.type || 'unknown')}`}>
                        {propSchema.type || 'unknown'}
                      </span>
                      {propSchema.format && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                          {propSchema.format}
                        </span>
                      )}
                      {propSchema.enum && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                          enum: {propSchema.enum.join(', ')}
                        </span>
                      )}
                    </div>
                    {propSchema.description && (
                      <p className="text-sm text-gray-600 mt-1">{propSchema.description}</p>
                    )}
                    {propSchema.example && (
                      <div className="mt-1">
                        <span className="text-xs text-gray-500">Example: </span>
                        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                          {JSON.stringify(propSchema.example)}
                        </code>
                      </div>
                    )}
                    {(propSchema.type === 'object' || propSchema.type === 'array') && (
                      <div className="mt-2">
                        <SchemaDisplay 
                          schema={propSchema} 
                          schemas={schemas} 
                          depth={depth + 1}
                          name={propName}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (resolvedSchema.type === 'array' && resolvedSchema.items) {
      return (
        <div className={`${depth > 0 ? 'ml-4 border-l-2 border-gray-200 pl-4' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              {getTypeIcon('array')}
              {propertyName || 'Array'}
            </button>
            <span className={`px-2 py-1 text-xs rounded border ${getTypeColor('array')}`}>
              array
            </span>
            {resolvedSchema.description && (
              <span className="text-xs text-gray-500">— {resolvedSchema.description}</span>
            )}
          </div>
          
          {isExpanded && (
            <div className="p-2 bg-gray-50 rounded">
              <div className="text-sm text-gray-600 mb-2">Array items:</div>
              <SchemaDisplay 
                schema={resolvedSchema.items} 
                schemas={schemas} 
                depth={depth + 1}
                name="item"
              />
            </div>
          )}
        </div>
      );
    } else if (resolvedSchema.$ref) {
      const refName = resolvedSchema.$ref.replace('#/components/schemas/', '');
      return (
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
          <FileText className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-blue-700">{refName}</span>
          <span className="text-xs text-blue-600">Reference</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          {getTypeIcon(resolvedSchema.type || 'unknown')}
          <span className="font-medium text-gray-700">{propertyName || 'Value'}</span>
          <span className={`px-2 py-1 text-xs rounded border ${getTypeColor(resolvedSchema.type || 'unknown')}`}>
            {resolvedSchema.type || 'unknown'}
          </span>
          {resolvedSchema.description && (
            <span className="text-xs text-gray-500">— {resolvedSchema.description}</span>
          )}
        </div>
      );
    }
  };

  return renderSchema(schema, name);
};