import React, { useState } from 'react';
import { Upload, FileText, Link, AlertCircle, CheckCircle } from 'lucide-react';
import { SwaggerSpec } from '../types/swagger';

interface SwaggerInputProps {
  onSpecLoad: (spec: SwaggerSpec) => void;
}

export const SwaggerInput: React.FC<SwaggerInputProps> = ({ onSpecLoad }) => {
  const [inputMethod, setInputMethod] = useState<'file' | 'url' | 'text'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const spec = JSON.parse(content);
        validateAndLoadSpec(spec);
      } catch (err) {
        setError('Invalid JSON file. Please ensure the file contains valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleUrlLoad = async () => {
    if (!urlInput.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(urlInput);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const spec = await response.json();
      validateAndLoadSpec(spec);
    } catch (err) {
      setError(`Failed to load from URL: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTextLoad = () => {
    if (!textInput.trim()) {
      setError('Please paste your OpenAPI specification');
      return;
    }

    try {
      const spec = JSON.parse(textInput);
      validateAndLoadSpec(spec);
    } catch (err) {
      setError('Invalid JSON. Please ensure the text contains valid JSON.');
    }
  };

  const validateAndLoadSpec = (spec: any) => {
    if (!spec.openapi && !spec.swagger) {
      setError('Invalid OpenAPI specification. Missing "openapi" or "swagger" field.');
      return;
    }

    if (!spec.info) {
      setError('Invalid OpenAPI specification. Missing "info" field.');
      return;
    }

    if (!spec.paths) {
      setError('Invalid OpenAPI specification. Missing "paths" field.');
      return;
    }

    setError(null);
    onSpecLoad(spec);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Swagger Documentation Renderer</h1>
          <p className="text-gray-600">Load your OpenAPI specification to generate beautiful documentation</p>
        </div>

        <div className="p-6">
          {/* Input Method Selection */}
          <div className="mb-6">
            <h2 className="text-base font-medium text-gray-900 mb-3">Choose Input Method</h2>
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
              <button
                onClick={() => setInputMethod('file')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMethod === 'file' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
              <button
                onClick={() => setInputMethod('url')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMethod === 'url' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Link className="w-4 h-4" />
                From URL
              </button>
              <button
                onClick={() => setInputMethod('text')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMethod === 'text' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                Paste JSON
              </button>
            </div>
          </div>

          {/* Input Forms */}
          <div className="space-y-4">
            {inputMethod === 'file' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload OpenAPI Specification File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your OpenAPI file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".json,.yaml,.yml"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              </div>
            )}

            {inputMethod === 'url' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAPI Specification URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/api/openapi.json"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                  />
                  <button
                    onClick={handleUrlLoad}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                  >
                    {loading ? 'Loading...' : 'Load'}
                  </button>
                </div>
              </div>
            )}

            {inputMethod === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste OpenAPI Specification JSON
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your OpenAPI specification JSON here..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500 font-mono text-sm"
                />
                <div className="mt-2">
                  <button
                    onClick={handleTextLoad}
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Load Specification
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {!error && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-700">
                  Ready to load your OpenAPI specification. Choose a method above to get started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};