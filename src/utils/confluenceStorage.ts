// Confluence Storage API utilities
declare global {
  interface Window {
    AP: {
      confluence: {
        saveMacro: (config: any) => void;
        getContentProperty: (key: string) => Promise<any>;
        setContentProperty: (key: string, value: any) => Promise<void>;
      };
      dialog: {
        close: () => void;
      };
      request: (options: {
        url: string;
        type: string;
        data?: any;
        contentType?: string;
      }) => Promise<any>;
      context: {
        getToken: () => Promise<string>;
      };
    };
  }
}

export interface StoredFile {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  size: number;
}

/**
 * Upload file content to Confluence storage
 */
export async function uploadFileToConfluence(
  fileName: string, 
  fileContent: string
): Promise<StoredFile> {
  try {
    // Generate unique file ID
    const fileId = `swagger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const storedFile: StoredFile = {
      id: fileId,
      name: fileName,
      content: fileContent,
      createdAt: new Date().toISOString(),
      size: fileContent.length
    };

    // Store file using Confluence Content Properties API
    if (window.AP?.confluence?.setContentProperty) {
      await window.AP.confluence.setContentProperty(`swagger-file-${fileId}`, storedFile);
    } else {
      // Fallback: store in localStorage for development/testing
      localStorage.setItem(`swagger-file-${fileId}`, JSON.stringify(storedFile));
    }

    return storedFile;
  } catch (error) {
    console.error('Failed to upload file to Confluence storage:', error);
    throw new Error('Failed to upload file to storage');
  }
}

/**
 * Retrieve file content from Confluence storage
 */
export async function getFileFromConfluence(fileId: string): Promise<StoredFile | null> {
  try {
    if (window.AP?.confluence?.getContentProperty) {
      const result = await window.AP.confluence.getContentProperty(`swagger-file-${fileId}`);
      return result || null;
    } else {
      // Fallback: retrieve from localStorage for development/testing
      const stored = localStorage.getItem(`swagger-file-${fileId}`);
      return stored ? JSON.parse(stored) : null;
    }
  } catch (error) {
    console.error('Failed to retrieve file from Confluence storage:', error);
    return null;
  }
}

/**
 * Delete file from Confluence storage
 */
export async function deleteFileFromConfluence(fileId: string): Promise<boolean> {
  try {
    if (window.AP?.confluence?.setContentProperty) {
      await window.AP.confluence.setContentProperty(`swagger-file-${fileId}`, null);
    } else {
      // Fallback: remove from localStorage
      localStorage.removeItem(`swagger-file-${fileId}`);
    }
    return true;
  } catch (error) {
    console.error('Failed to delete file from Confluence storage:', error);
    return false;
  }
}

/**
 * List all stored swagger files for current page/space
 */
export async function listStoredFiles(): Promise<StoredFile[]> {
  try {
    // This would require implementing a proper indexing system
    // For now, return empty array as this is primarily for single file usage
    return [];
  } catch (error) {
    console.error('Failed to list stored files:', error);
    return [];
  }
}

/**
 * Validate file size and format
 */
export function validateSwaggerFile(fileName: string, content: string): { valid: boolean; error?: string } {
  // Check file size (max 5MB)
  if (content.length > 5 * 1024 * 1024) {
    return { valid: false, error: 'File size exceeds 5MB limit' };
  }

  // Check file extension
  const validExtensions = ['.json', '.yaml', '.yml'];
  const hasValidExtension = validExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  
  if (!hasValidExtension) {
    return { valid: false, error: 'File must be a JSON or YAML file' };
  }

  // Try to parse JSON if it's a JSON file
  if (fileName.toLowerCase().endsWith('.json')) {
    try {
      const parsed = JSON.parse(content);
      if (!parsed.openapi && !parsed.swagger) {
        return { valid: false, error: 'File does not appear to be a valid OpenAPI/Swagger specification' };
      }
    } catch (error) {
      return { valid: false, error: 'Invalid JSON format' };
    }
  }

  return { valid: true };
} 