import React, { useState, useEffect } from 'react';
import { ConfluenceMacroEditor } from './components/ConfluenceMacroEditor';
import { ConfluenceMacroRenderer } from './components/ConfluenceMacroRenderer';
import { SwaggerRenderer } from './components/SwaggerRenderer';
import { sampleSwagger } from './data/sampleSwagger';
import './index.css';

type AppMode = 'standalone' | 'editor' | 'renderer';

interface MacroConfig {
  swaggerUrl?: string;
  title?: string;
  filterType?: 'all' | 'tag' | 'endpoint';
  filterValue?: string;
}

const App: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [mode, setMode] = useState<AppMode>('standalone');
  const [config, setConfig] = useState<MacroConfig>({});

  useEffect(() => {
    setIsClient(true);
    
    const urlParams = new URLSearchParams(window.location.search);
    const confluenceMode = urlParams.get('mode');
    const configParam = urlParams.get('config');
    
    if (confluenceMode === 'editor') {
      setMode('editor');
      
      // Try to parse existing config for edit mode
      if (configParam) {
        try {
          // First try to decode if it's URL encoded
          let decodedConfig = configParam;
          try {
            decodedConfig = decodeURIComponent(configParam);
          } catch (e) {
            // If decoding fails, use original
          }
          
          const parsedConfig = JSON.parse(decodedConfig);
          setConfig(parsedConfig);
        } catch (e) {
          // If parsing fails, try without decoding
          try {
            const parsedConfig = JSON.parse(configParam);
            setConfig(parsedConfig);
          } catch (e2) {
            console.error('Failed to parse config:', e2);
          }
        }
      }
    } else if (confluenceMode === 'renderer' && configParam) {
      setMode('renderer');
      
      try {
        // For renderer mode, we expect the config parameter to be properly formatted
        let decodedConfig = configParam;
        try {
          decodedConfig = decodeURIComponent(configParam);
        } catch (e) {
          // If decoding fails, use original
        }
        
        const parsedConfig = JSON.parse(decodedConfig);
        setConfig(parsedConfig);
      } catch (e) {
        console.error('Failed to parse config in renderer mode:', e);
      }
    } else {
      setMode('standalone');
      // Default config for standalone mode with sample data
      setConfig({
        swaggerUrl: '',
        title: 'Swagger Petstore',
        filterType: 'all',
        filterValue: ''
      });
    }
  }, []);

  // Signal to Confluence that we're ready
  useEffect(() => {
    if (window.AP) {
      try {
        if (window.AP.resize) {
          window.AP.resize();
        }
        if (window.AP.events && window.AP.events.emit) {
          window.AP.events.emit('app.ready');
        }
      } catch (error) {
        // Ignore AP errors in non-Confluence environments
      }
    }
  }, [mode, config]);

  const handleSave = (newConfig: MacroConfig) => {
    setConfig(newConfig);
  };

  // Don't render anything until we're on the client
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (mode === 'editor') {
    return (
      <ConfluenceMacroEditor 
        onSave={handleSave}
        initialConfig={config}
        isEditMode={Object.keys(config).length > 0}
      />
    );
  }
  
  if (mode === 'renderer') {
    // Pass the config as a JSON string to the renderer
    return <ConfluenceMacroRenderer config={JSON.stringify(config)} />;
  }

  // Standalone mode - show sample swagger
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Swagger Documentation for Confluence</h1>
          <p className="text-gray-600 mt-1">Preview of the Confluence macro with sample Petstore API</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <SwaggerRenderer 
            spec={sampleSwagger} 
            title="Swagger Petstore (Demo)"
            filterType="all"
            filterValue=""
          />
        </div>
      </main>
    </div>
  );
};

export default App;