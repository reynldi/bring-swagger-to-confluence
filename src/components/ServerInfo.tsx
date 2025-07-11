import React from 'react';
import { Globe, Mail, ExternalLink, Info, Server, Code } from 'lucide-react';
import { SwaggerSpec } from '../types/swagger';

interface ServerInfoProps {
  spec: SwaggerSpec;
}

export const ServerInfo: React.FC<ServerInfoProps> = ({ spec }) => {
  return (
    <div className="space-y-8">
      {/* API Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">API Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Title</h4>
            <p className="text-gray-600">{spec.info.title}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Version</h4>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {spec.info.version}
            </span>
          </div>
          
          {spec.info.description && (
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-gray-600">{spec.info.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      {spec.info.contact && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {spec.info.contact.name && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Name</h4>
                <p className="text-gray-600">{spec.info.contact.name}</p>
              </div>
            )}
            
            {spec.info.contact.email && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Email</h4>
                <a 
                  href={`mailto:${spec.info.contact.email}`}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {spec.info.contact.email}
                </a>
              </div>
            )}
            
            {spec.info.contact.url && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">URL</h4>
                <a 
                  href={spec.info.contact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
                >
                  {spec.info.contact.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Server Information */}
      {spec.servers && spec.servers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-800">Servers</h3>
          </div>
          
          <div className="space-y-4">
            {spec.servers.map((server, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {server.url}
                  </code>
                </div>
                {server.description && (
                  <p className="text-sm text-gray-600 ml-6">{server.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OpenAPI Version */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-800">Specification Details</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">OpenAPI Version</h4>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {spec.openapi}
            </span>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Total Endpoints</h4>
            <p className="text-gray-600">
              {Object.values(spec.paths).reduce((count, path) => 
                count + Object.keys(path).length, 0
              )}
            </p>
          </div>
          
          {spec.components?.schemas && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Schemas</h4>
              <p className="text-gray-600">{Object.keys(spec.components.schemas).length}</p>
            </div>
          )}
          
          {spec.tags && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
              <p className="text-gray-600">{spec.tags.length}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {spec.tags && spec.tags.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
            <h3 className="text-lg font-semibold text-gray-800">Tags</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spec.tags.map((tag, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-1">{tag.name}</h4>
                {tag.description && (
                  <p className="text-sm text-gray-600">{tag.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};