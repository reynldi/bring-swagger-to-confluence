import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { SwaggerSpec } from '../types/swagger';
import { SwaggerRenderer } from './SwaggerRenderer';

interface ConfluenceMacroRendererProps {
  config: string;
}

interface ParsedConfig {
  swaggerUrl?: string;
  title?: string;
  filterType?: 'all' | 'tag' | 'endpoint';
  filterValue?: string;
}

export const ConfluenceMacroRenderer: React.FC<ConfluenceMacroRendererProps> = ({ config }) => {
  const [spec, setSpec] = useState<SwaggerSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parsedConfig, setParsedConfig] = useState<ParsedConfig>({});

  useEffect(() => {
    // Parse the configuration
    try {
      const parsed = JSON.parse(config) as ParsedConfig;
      setParsedConfig(parsed);
      
      // Load the Swagger spec from URL
      if (parsed.swaggerUrl) {
        loadSwaggerSpec(parsed.swaggerUrl);
      } else {
        setError('No Swagger URL provided in configuration');
        setLoading(false);
      }
    } catch (err) {
      setError('Invalid configuration format');
      setLoading(false);
    }
  }, [config]);

  const loadSwaggerSpec = async (url: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const spec = await response.json();
      
      // Basic validation
      if (!spec.openapi && !spec.swagger) {
        throw new Error('Invalid OpenAPI specification');
      }

      setSpec(spec);
    } catch (err) {
      console.error('Failed to load Swagger specification:', err);
      setError(`Failed to load API specification: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Signal to Confluence that we're ready
  useEffect(() => {
    if (window.AP && window.AP.resize) {
      try {
        // Resize the iframe to fit content
        window.AP.resize();
        
        // Signal that the app is ready
        if (window.AP.events && window.AP.events.emit) {
          window.AP.events.emit('app.ready');
        }
      } catch (error) {
        // Ignore AP errors in non-Confluence environments
      }
    }
  }, [spec, loading, error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Failed to Load API Documentation
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="p-6 bg-white">
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <p className="text-gray-600">No API specification available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <SwaggerRenderer 
        spec={spec} 
        title={parsedConfig.title}
        filterType={parsedConfig.filterType}
        filterValue={parsedConfig.filterValue}
      />
    </div>
  );
};