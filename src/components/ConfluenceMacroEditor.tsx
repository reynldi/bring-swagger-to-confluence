import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AlertCircle, CheckCircle, Eye, Link, Loader, Filter } from 'lucide-react';
import { SwaggerSpec } from '../types/swagger';
import { SwaggerRenderer } from './SwaggerRenderer';
import { sampleSwagger } from '../data/sampleSwagger';

interface MacroConfig {
  swaggerUrl?: string; 
  title?: string;
  filterType?: 'all' | 'tag' | 'endpoint';
  filterValue?: string;
}

interface ConfluenceMacroEditorProps {
  onSave: (config: MacroConfig) => void;
  initialConfig?: MacroConfig;
  isEditMode?: boolean;
}

// Global submit handler that Confluence can call
declare global {
  interface Window {
    confluenceSubmitHandler?: () => boolean;
  }
}

export const ConfluenceMacroEditor: React.FC<ConfluenceMacroEditorProps> = ({ 
  onSave, 
  initialConfig = {} as MacroConfig,
  isEditMode = false 
}) => {
  const [swaggerUrl, setSwaggerUrl] = useState(initialConfig.swaggerUrl || '');
  const [title, setTitle] = useState(initialConfig.title || '');
  const [filterType, setFilterType] = useState<'all' | 'tag' | 'endpoint'>(initialConfig.filterType || 'all');
  const [filterValue, setFilterValue] = useState(initialConfig.filterValue || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spec, setSpec] = useState<SwaggerSpec | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);

  // Use refs to always have access to current values in submit handler
  const specRef = useRef<SwaggerSpec | null>(null);
  const swaggerUrlRef = useRef<string>('');
  const titleRef = useRef<string>('');
  const filterTypeRef = useRef<'all' | 'tag' | 'endpoint'>('all');
  const filterValueRef = useRef<string>('');

  // Update refs whenever state changes
  useEffect(() => {
    specRef.current = spec;
    swaggerUrlRef.current = swaggerUrl;
    titleRef.current = title;
    filterTypeRef.current = filterType;
    filterValueRef.current = filterValue;
  }, [spec, swaggerUrl, title, filterType, filterValue]);

  // Extract available tags and endpoints from spec
  const availableOptions = useMemo(() => {
    if (!spec) return { tags: [], endpoints: [] };

    const tags = spec.tags?.map((tag: { name: string }) => tag.name) || [];
    const endpoints: Array<{path: string, method: string, summary?: string, tag?: string}> = [];
    
    Object.entries(spec.paths || {}).forEach(([path, pathItem]) => {
      if (pathItem && typeof pathItem === 'object') {
        Object.entries(pathItem).forEach(([method, operation]) => {
          if (typeof operation === 'object' && operation !== null && 
              operation && 'responses' in operation) {
            const operationData = operation as {
              summary?: string;
              tags?: string[];
              responses: unknown;
            };
            
            endpoints.push({
              path,
              method: method.toUpperCase(),
              summary: operationData.summary,
              tag: operationData.tags?.[0]
            });
          }
        });
      }
    });

    // If no tags defined in spec, extract from endpoints
    if (tags.length === 0) {
      const extractedTags = [...new Set(endpoints.map(e => e.tag).filter(Boolean))];
      tags.push(...extractedTags);
    }

    return { tags, endpoints };
  }, [spec]);

  // Handle submit function that can be called globally
  const handleSubmit = () => {
    // Use refs to get current values
    const currentSpec = specRef.current;
    const currentSwaggerUrl = swaggerUrlRef.current;
    const currentTitle = titleRef.current;
    const currentFilterType = filterTypeRef.current;
    const currentFilterValue = filterValueRef.current;
    
    if (!currentSwaggerUrl.trim()) {
      setError('Please enter a Swagger URL before submitting');
      return false;
    }

    if (!currentSpec) {
      setError('Please load and validate the Swagger specification first');
      return false;
    }

    const config = {
      swaggerUrl: currentSwaggerUrl.trim(),
      title: currentTitle.trim() || currentSpec.info.title,
      filterType: currentFilterType,
      filterValue: currentFilterType === 'all' ? '' : currentFilterValue
    };

    // Call the callback for local state management
    onSave(config);

    // Try multiple methods to save the macro
    let saved = false;

    // Method 1: Try AP.confluence.saveMacro
    if (window.AP && window.AP.confluence && window.AP.confluence.saveMacro) {
      try {
        const macroParameters = {
          config: JSON.stringify(config)
        };
        
        window.AP.confluence.saveMacro(macroParameters);
        saved = true;
      } catch (e) {
        console.error('Failed to save macro via AP.confluence.saveMacro:', e);
      }
    }

    // Method 2: Try parent window communication
    if (!saved && window.parent && window.parent !== window) {
      try {
        const message = {
          type: 'confluence-macro-save',
          config: JSON.stringify(config)
        };
        window.parent.postMessage(message, '*');
        saved = true;
      } catch (e) {
        console.error('Failed to save macro via postMessage:', e);
      }
    }

    // Method 3: Try direct AP access via parent
    if (!saved && window.parent && (window.parent as any).AP) {
      try {
        const parentAP = (window.parent as any).AP;
        if (parentAP.confluence && parentAP.confluence.saveMacro) {
          parentAP.confluence.saveMacro({
            config: JSON.stringify(config)
          });
          saved = true;
        }
      } catch (e) {
        console.error('Failed to save macro via parent AP:', e);
      }
    }

    if (saved) {
      return true; // Allow dialog to close
    } else {
      setError('Failed to insert macro into Confluence. Please try again.');
      return false;
    }
  };

  // Set up multiple binding approaches
  useEffect(() => {
    // Method 1: Global function approach
    window.confluenceSubmitHandler = handleSubmit;

    // Method 2: Try immediate AP binding
    const tryImmediateBinding = () => {
      if (window.AP && window.AP.dialog && window.AP.dialog.getButton) {
        try {
          const submitButton = window.AP.dialog.getButton('submit');
          if (submitButton && submitButton.bind) {
            submitButton.bind(handleSubmit);
            return true;
          }
        } catch (e) {
          // Ignore binding errors
        }
      }
      return false;
    };

    if (!tryImmediateBinding()) {
      // Method 3: Retry binding with delays
      const retryBinding = (attempt: number) => {
        setSubmitAttempts(attempt);
        
        if (tryImmediateBinding()) {
          return;
        }

        if (attempt < 10) {
          setTimeout(() => retryBinding(attempt + 1), 500 * attempt);
        }
      };

      retryBinding(1);
    }

    // Method 4: Listen for Confluence events
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'confluence-submit') {
        handleSubmit();
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      delete window.confluenceSubmitHandler;
    };
  }, []); // Remove dependencies to avoid re-binding

  // Update submit button state
  useEffect(() => {
    if (window.AP && window.AP.dialog && window.AP.dialog.getButton) {
      try {
        const submitButton = window.AP.dialog.getButton('submit');
        if (submitButton) {
          if (spec && swaggerUrl.trim()) {
            submitButton.enable();
          } else {
            submitButton.disable();
          }
        }
      } catch (e) {
        // Ignore errors here
      }
    }
  }, [spec, swaggerUrl]);

  const validateAndLoadSpec = async (url: string) => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // More lenient Content-Type check - allow JSON, text/plain, and other common types
      const contentType = response.headers.get('content-type') || '';
      const isValidContentType = 
        contentType.includes('application/json') ||
        contentType.includes('text/plain') ||
        contentType.includes('text/json') ||
        contentType.includes('application/x-json') ||
        url.endsWith('.json') || // Also allow if URL ends with .json
        !contentType; // Allow if no content type specified

      let parsedSpec;
      if (isValidContentType) {
        // Try to parse as JSON
        try {
          parsedSpec = await response.json();
        } catch (jsonError) {
          throw new Error('URL returned content that could not be parsed as JSON');
        }
      } else {
        throw new Error(`URL must return JSON content. Received content type: ${contentType}`);
      }
      
      if (!parsedSpec.openapi && !parsedSpec.swagger) {
        throw new Error('Invalid OpenAPI specification. Missing "openapi" or "swagger" field.');
      }

      if (!parsedSpec.info) {
        throw new Error('Invalid OpenAPI specification. Missing "info" field.');
      }

      if (!parsedSpec.paths) {
        throw new Error('Invalid OpenAPI specification. Missing "paths" field.');
      }

      setSpec(parsedSpec);
      if (!title) {
        setTitle(parsedSpec.info?.title || 'API Documentation');
      }
      
      // Reset filters when new spec is loaded
      setFilterType('all');
      setFilterValue('');
      
      setError(null);
    } catch (err) {
      setError(`Failed to load from URL: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setSpec(null);
    } finally {
      setLoading(false);
    }
  };

  // Get endpoint count for current filter
  const getFilteredEndpointCount = () => {
    if (!spec) return 0;
    
    if (filterType === 'all') {
      return availableOptions.endpoints.length;
    } else if (filterType === 'tag') {
      return availableOptions.endpoints.filter(e => e.tag === filterValue).length;
    } else if (filterType === 'endpoint') {
      return 1; // Single endpoint
    }
    
    return 0;
  };

  if (previewMode && spec) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900">Preview: {title || spec.info.title}</h2>
            <button
              onClick={() => setPreviewMode(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to Editor
            </button>
          </div>
        </div>
        <div className="p-6">
          <SwaggerRenderer 
            spec={spec} 
            filterType={filterType}
            filterValue={filterValue}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {isEditMode ? 'Edit' : 'Insert'} Swagger Documentation
          </h1>
          <p className="text-gray-600">
            Enter the URL of your OpenAPI specification to display API documentation in Confluence
          </p>
          
          {/* Debug Info - Only in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-gray-500">
              Debug: Submit attempts: {submitAttempts} | 
              Has spec: {spec ? '✅' : '❌'} | 
              Has URL: {swaggerUrl ? '✅' : '❌'} |
              AP available: {window.AP ? '✅' : '❌'}
            </div>
          )}
        </div>

        {/* Main Configuration */}
        <div className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documentation Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Will use API title if left empty"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAPI Specification URL *
            </label>
            
            {/* Security Warning */}
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-amber-800 font-medium mb-1">Security Notice</p>
                  <p className="text-amber-700">
                    Only use <strong>publicly accessible</strong> OpenAPI URLs. Private/internal API URLs will be visible to anyone who can view this Confluence page.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="url"
                  value={swaggerUrl}
                  onChange={(e) => setSwaggerUrl(e.target.value)}
                  placeholder="https://example.com/api/openapi.json"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => validateAndLoadSpec(swaggerUrl)}
                disabled={loading || !swaggerUrl.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load & Validate'
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              URL must return a valid OpenAPI 3.0 or Swagger 2.0 JSON specification
            </p>
          </div>

          {/* Example URLs */}
          {!spec && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Try these examples:</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSwaggerUrl('https://petstore3.swagger.io/api/v3/openapi.json');
                    validateAndLoadSpec('https://petstore3.swagger.io/api/v3/openapi.json');
                  }}
                  className="block w-full text-left px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  <strong>Swagger Petstore:</strong> https://petstore3.swagger.io/api/v3/openapi.json
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Display */}
          {spec && !error && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-700 font-medium">
                  OpenAPI specification loaded successfully!
                </p>
              </div>
              <div className="text-sm text-green-600 ml-7">
                <p><strong>Title:</strong> {spec.info.title}</p>
                <p><strong>Version:</strong> {spec.info.version}</p>
                <p><strong>Total Endpoints:</strong> {availableOptions.endpoints.length}</p>
                <p><strong>URL:</strong> {swaggerUrl}</p>
              </div>
            </div>
          )}

          {/* Filter Options */}
          {spec && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-medium text-blue-900">Filter Documentation</h3>
              </div>
              
              <div className="space-y-4">
                {/* Filter Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">
                    What to display:
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value as 'all' | 'tag' | 'endpoint');
                      setFilterValue(''); // Reset filter value when type changes
                    }}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="all">All endpoints ({availableOptions.endpoints.length} total)</option>
                    <option value="tag">Specific tag</option>
                    <option value="endpoint">Single endpoint</option>
                  </select>
                </div>

                {/* Tag Selection */}
                {filterType === 'tag' && (
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-2">
                      Select tag:
                    </label>
                    <select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Choose a tag...</option>
                      {availableOptions.tags.map(tag => {
                        const tagEndpointCount = availableOptions.endpoints.filter(e => e.tag === tag).length;
                        return (
                          <option key={tag} value={tag}>
                            {tag} ({tagEndpointCount} endpoints)
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Endpoint Selection */}
                {filterType === 'endpoint' && (
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-2">
                      Select endpoint:
                    </label>
                    <select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Choose an endpoint...</option>
                      {availableOptions.endpoints.map((endpoint, index) => {
                        const key = `${endpoint.method}:${endpoint.path}`;
                        const displayText = `${endpoint.method} ${endpoint.path}${endpoint.summary ? ` - ${endpoint.summary}` : ''}`;
                        return (
                          <option key={key} value={key}>
                            {displayText}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Filter Summary */}
                <div className="text-sm text-blue-700 bg-blue-100 rounded p-2">
                  <strong>Will display:</strong> {getFilteredEndpointCount()} endpoint(s)
                  {filterType === 'tag' && filterValue && (
                    <span> from "{filterValue}" tag</span>
                  )}
                  {filterType === 'endpoint' && filterValue && (
                    <span> - {filterValue.replace(':', ' ')}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preview Button */}
          {spec && (
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => setPreviewMode(true)}
                className="px-4 py-2 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors font-medium"
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Preview Documentation
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Ready to insert! Click the "Insert" button below to add this documentation to your Confluence page.
              </p>
              
              {/* Manual Insert Button for Testing - Only in development */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={handleSubmit}
                  className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  🧪 Manual Insert (Test)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};