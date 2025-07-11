import React, { useEffect, useState } from 'react';
import { SwaggerRenderer } from './SwaggerRenderer';
import { SwaggerInput } from './SwaggerInput';
import { SwaggerSpec } from '../types/swagger';

export const EmbedWrapper: React.FC = () => {
  const [spec, setSpec] = useState<SwaggerSpec | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const swaggerUrl = urlParams.get('url');
    
    if (swaggerUrl) {
      fetch(swaggerUrl)
        .then(response => response.json())
        .then(data => {
          setSpec(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to load Swagger spec:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Swagger documentation...</p>
        </div>
      </div>
    );
  }

  if (!spec) {
    return <SwaggerInput onSpecLoad={setSpec} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SwaggerRenderer spec={spec} />
    </div>
  );
};