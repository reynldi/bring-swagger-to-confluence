import React, { useMemo } from 'react';
import { SwaggerSpec, APIEndpoint } from '../types/swagger';
import { EndpointCard } from './EndpointCard';

interface SwaggerRendererProps {
  spec: SwaggerSpec;
  filterType?: 'all' | 'tag' | 'endpoint';
  filterValue?: string;
}

export const SwaggerRenderer: React.FC<SwaggerRendererProps> = ({ 
  spec, 
  filterType = 'all', 
  filterValue = '' 
}) => {
  const endpoints = useMemo(() => {
    const endpointList: APIEndpoint[] = [];
    
    Object.entries(spec.paths || {}).forEach(([path, pathItem]) => {
      if (!pathItem || typeof pathItem !== 'object') return;
      
      Object.entries(pathItem).forEach(([method, operation]) => {
        if (
          typeof operation === 'object' && 
          operation !== null && 
          'responses' in operation &&
          operation.responses
        ) {
          const operationData = operation as {
            summary?: string;
            description?: string;
            tags?: string[];
            parameters?: any[];
            requestBody?: any;
            responses: any;
          };

          endpointList.push({
            path,
            method,
            summary: operationData.summary,
            description: operationData.description,
            tags: operationData.tags || [],
            parameters: operationData.parameters,
            requestBody: operationData.requestBody,
            responses: operationData.responses,
          });
        }
      });
    });
    return endpointList;
  }, [spec.paths]);

  // Filter endpoints based on filterType and filterValue
  const filteredEndpoints = useMemo(() => {
    if (filterType === 'all') {
      return endpoints;
    } else if (filterType === 'tag') {
      if (!filterValue) return endpoints;
      return endpoints.filter(endpoint => endpoint.tags?.includes(filterValue));
    } else if (filterType === 'endpoint') {
      if (!filterValue) return endpoints;
      const [targetMethod, targetPath] = filterValue.split(':');
      return endpoints.filter(endpoint => 
        endpoint.method.toLowerCase() === targetMethod.toLowerCase() && 
        endpoint.path === targetPath
      );
    }
    return endpoints;
  }, [endpoints, filterType, filterValue]);

  const groupedEndpoints = useMemo(() => {
    const groups: { [key: string]: APIEndpoint[] } = {};
    filteredEndpoints.forEach(endpoint => {
      const tag = endpoint.tags?.[0] || 'API';
      if (!groups[tag]) {
        groups[tag] = [];
      }
      groups[tag].push(endpoint);
    });
    return groups;
  }, [filteredEndpoints]);

  // If no endpoints match the filter, show a message
  if (filteredEndpoints.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <div className="text-gray-500">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No endpoints found</h3>
          <p className="text-sm">
            {filterType === 'tag' && filterValue && `No endpoints found for tag "${filterValue}"`}
            {filterType === 'endpoint' && filterValue && `Endpoint "${filterValue.replace(':', ' ')}" not found`}
            {filterType === 'all' && 'No endpoints available in this specification'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedEndpoints).map(([tag, tagEndpoints]) => (
        <div key={tag} className="space-y-4">
          {/* Only show tag header if we're not filtering to a single endpoint */}
          {filterType !== 'endpoint' && (
            <div className="border-b border-gray-200 pb-2">
              <h3 className="text-base font-medium text-gray-900">{tag}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {tagEndpoints.length} endpoint{tagEndpoints.length !== 1 ? 's' : ''}
                {filterType === 'tag' && filterValue && ` (filtered by "${filterValue}")`}
              </p>
            </div>
          )}
          
          {/* Endpoint cards */}
          <div className="space-y-3">
            {tagEndpoints.map((endpoint, index) => (
              <EndpointCard
                key={`${endpoint.path}-${endpoint.method}`}
                endpoint={endpoint}
                schemas={spec.components?.schemas || {}}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};