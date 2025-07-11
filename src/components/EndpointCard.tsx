import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, CheckCircle } from 'lucide-react';
import { APIEndpoint, Schema, Parameter, Response } from '../types/swagger';
import { SchemaDisplay } from './SchemaDisplay';

interface EndpointCardProps {
  endpoint: APIEndpoint;
  schemas: { [key: string]: Schema };
}

export const EndpointCard: React.FC<EndpointCardProps> = ({ endpoint, schemas }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'description' | 'parameters' | 'request' | 'responses'>('description');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const getMethodColor = (method: string) => {
    const colors: { [key: string]: string } = {
      get: 'bg-blue-500 text-white',
      post: 'bg-green-500 text-white',
      put: 'bg-yellow-500 text-white',
      delete: 'bg-red-500 text-white',
      patch: 'bg-purple-500 text-white',
    };
    return colors[method.toLowerCase()] || 'bg-gray-500 text-white';
  };

  const getStatusColor = (status: string) => {
    const statusCode = parseInt(status);
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600 bg-green-50';
    if (statusCode >= 300 && statusCode < 400) return 'text-yellow-600 bg-yellow-50';
    if (statusCode >= 400 && statusCode < 500) return 'text-red-600 bg-red-50';
    if (statusCode >= 500) return 'text-red-800 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const renderParameters = (parameters: Parameter[]) => {
    if (!parameters || parameters.length === 0) return null;

    const grouped = parameters.reduce((acc, param) => {
      if (!acc[param.in]) acc[param.in] = [];
      acc[param.in].push(param);
      return acc;
    }, {} as { [key: string]: Parameter[] });

    return (
      <div className="space-y-4">
        {Object.entries(grouped).map(([location, params]) => (
          <div key={location} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-3 capitalize">{location} Parameters</h4>
            <div className="space-y-3">
              {params.map((param, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <span className={`px-2 py-1 text-xs rounded ${param.required ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                      {param.required ? 'Required' : 'Optional'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{param.name}</span>
                      <span className="text-sm text-gray-500">({param.schema.type})</span>
                    </div>
                    {param.description && (
                      <p className="text-sm text-gray-600 mt-1">{param.description}</p>
                    )}
                    {param.schema.enum && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Enum: </span>
                        <span className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                          {param.schema.enum.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRequestBody = () => {
    if (!endpoint.requestBody) return null;

    const contentTypes = Object.keys(endpoint.requestBody.content);
    const firstContentType = contentTypes[0];
    const schema = endpoint.requestBody.content[firstContentType]?.schema;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Content Type:</span>
          <span className="text-sm bg-gray-100 px-2 py-1 rounded">{firstContentType}</span>
          {endpoint.requestBody.required && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Required</span>
          )}
        </div>
        {endpoint.requestBody.description && (
          <p className="text-sm text-gray-600">{endpoint.requestBody.description}</p>
        )}
        {schema && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-3">Request Schema</h4>
            <SchemaDisplay schema={schema} schemas={schemas} />
          </div>
        )}
      </div>
    );
  };

  const renderResponses = () => {
    return (
      <div className="space-y-4">
        {Object.entries(endpoint.responses).map(([status, response]) => (
          <div key={status} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 text-sm font-medium rounded ${getStatusColor(status)}`}>
                {status}
              </span>
              <span className="text-sm text-gray-600">{response.description}</span>
            </div>
            {response.content && (
              <div className="space-y-3">
                {Object.entries(response.content).map(([contentType, content]) => (
                  <div key={contentType}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">Content Type:</span>
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded">{contentType}</span>
                    </div>
                    {content.schema && (
                      <div className="border border-gray-100 rounded p-3">
                        <SchemaDisplay schema={content.schema} schemas={schemas} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded font-medium text-sm ${getMethodColor(endpoint.method)}`}>
              {endpoint.method.toUpperCase()}
            </span>
            <span className="font-mono text-gray-700 font-medium">{endpoint.path}</span>
            {endpoint.summary && (
              <span className="text-gray-600 text-sm">{endpoint.summary}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(endpoint.path);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {copiedUrl ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Section Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {['description', 'parameters', 'request', 'responses'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section as any)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  activeSection === section
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {section}
                {section === 'parameters' && endpoint.parameters && (
                  <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded">
                    {endpoint.parameters.length}
                  </span>
                )}
                {section === 'responses' && (
                  <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded">
                    {Object.keys(endpoint.responses).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="p-4">
            {activeSection === 'description' && (
              <div className="space-y-4">
                {endpoint.description && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-600">{endpoint.description}</p>
                  </div>
                )}
                {endpoint.tags && endpoint.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {endpoint.tags.map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'parameters' && (
              <div>
                {endpoint.parameters && endpoint.parameters.length > 0 ? (
                  renderParameters(endpoint.parameters)
                ) : (
                  <p className="text-gray-500 text-center py-8">No parameters defined</p>
                )}
              </div>
            )}

            {activeSection === 'request' && (
              <div>
                {endpoint.requestBody ? (
                  renderRequestBody()
                ) : (
                  <p className="text-gray-500 text-center py-8">No request body defined</p>
                )}
              </div>
            )}

            {activeSection === 'responses' && (
              <div>
                {renderResponses()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};