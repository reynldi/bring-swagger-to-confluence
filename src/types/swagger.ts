export interface SwaggerSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
    contact?: {
      name?: string;
      email?: string;
      url?: string;
    };
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: {
    [path: string]: {
      [method: string]: {
        summary?: string;
        description?: string;
        operationId?: string;
        tags?: string[];
        parameters?: Parameter[];
        requestBody?: RequestBody;
        responses: {
          [statusCode: string]: Response;
        };
      };
    };
  };
  components?: {
    schemas?: {
      [schemaName: string]: Schema;
    };
  };
  tags?: Array<{
    name: string;
    description?: string;
  }>;
}

export interface Parameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema: Schema;
}

export interface RequestBody {
  description?: string;
  content: {
    [mediaType: string]: {
      schema: Schema;
    };
  };
  required?: boolean;
}

export interface Response {
  description: string;
  content?: {
    [mediaType: string]: {
      schema: Schema;
    };
  };
}

export interface Schema {
  type?: string;
  properties?: {
    [propertyName: string]: Schema;
  };
  items?: Schema;
  required?: string[];
  description?: string;
  example?: any;
  $ref?: string;
}

export interface APIEndpoint {
  path: string;
  method: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: {
    [statusCode: string]: Response;
  };
}