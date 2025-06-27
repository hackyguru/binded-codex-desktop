import { storageUtils } from './storage';
import { invoke } from '@tauri-apps/api/core';

export interface ApiClientConfig {
  nodeType: 'local' | 'remote';
  localApiPort: string;
  remoteEndpoint?: string;
  remoteUsername?: string;
  remotePassword?: string;
}

export class CodexApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  private getBaseUrl(): string {
    if (this.config.nodeType === 'remote' && this.config.remoteEndpoint) {
      // Remove trailing slash if present
      return this.config.remoteEndpoint.replace(/\/$/, '');
    }
    return `http://localhost:${this.config.localApiPort}`;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (this.config.nodeType === 'remote' && this.config.remoteUsername && this.config.remotePassword) {
      const credentials = btoa(`${this.config.remoteUsername}:${this.config.remotePassword}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }

    return headers;
  }

  public buildUrl(endpoint: string, localApiPort?: string): string {
    // If localApiPort is provided, use it to override the config temporarily
    const baseUrl = localApiPort && this.config.nodeType === 'local' 
      ? `http://localhost:${localApiPort}`
      : this.getBaseUrl();
    
    let finalUrl: string;
    if (this.config.nodeType === 'remote') {
      // For remote nodes, we need to add the full API path
      // The remote endpoint is just the base URL, we need to add /api/codex/v1
      finalUrl = `${baseUrl}/api/codex/v1${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    } else {
      // For local nodes, use the standard Codex API structure
      finalUrl = `${baseUrl}/api/codex/v1${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    }
    
    return finalUrl;
  }

  public async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = this.buildUrl(endpoint);
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    console.log('Request headers:', headers);
    console.log('Node type:', this.config.nodeType);

    try {
      let response: Response;
      
      if (this.config.nodeType === 'remote') {
        // Use Tauri command for remote requests to bypass CORS
        console.log('Using Tauri HTTP command for remote request');
        const result = await invoke('http_request', {
          url,
          method: options.method || 'GET',
          headers,
          body: options.body ? String(options.body) : null,
        }) as any;

        // Create a Response-like object from the Tauri command result
        response = new Response(
          typeof result.body === 'string' ? result.body : JSON.stringify(result.body),
          {
            status: result.status,
            statusText: result.statusText,
            headers: new Headers(result.headers),
          }
        );
      } else {
        // Use regular fetch for local requests
        response = await fetch(url, {
          ...options,
          headers,
          mode: 'cors',
        });
      }

      console.log(`API Response: ${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      console.error('API Request failed:', error);
      console.error('URL:', url);
      console.error('Headers:', headers);
      
      // Provide better error messages based on node type
      if (this.config.nodeType === 'remote') {
        throw new Error(
          `Remote Connection Error: Cannot connect to remote Codex server at "${this.config.remoteEndpoint}". ` +
          `Please check:\n` +
          `1. The server URL is correct and accessible\n` +
          `2. Your internet connection is working\n` +
          `3. The server is running and responding\n` +
          `4. Your authentication credentials are correct`
        );
      } else {
        // Local node error
        throw new Error(
          `Local Connection Error: Cannot connect to local Codex node at "${url}". ` +
          `Please ensure:\n` +
          `1. Codex is running on port ${this.config.localApiPort}\n` +
          `2. The API port is correct in settings\n` +
          `3. Codex is properly started and accessible`
        );
      }
    }
  }

  public async get(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return this.fetch(endpoint, { ...options, method: 'GET' });
  }

  public async post(endpoint: string, data?: any, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {};
    let body: string | FormData | undefined;

    if (data) {
      if (data instanceof FormData) {
        body = data;
        // Don't set Content-Type, let browser set it with boundary
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(data);
      }
    }

    return this.fetch(endpoint, {
      ...options,
      method: 'POST',
      headers: { ...headers, ...options.headers },
      body,
    });
  }

  public async delete(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return this.fetch(endpoint, { ...options, method: 'DELETE' });
  }

  public async uploadFile(endpoint: string, file: File): Promise<Response> {
    const url = this.buildUrl(endpoint);
    
    console.log(`File Upload: POST ${url}`);
    console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);
    console.log('Node type:', this.config.nodeType);

    try {
      if (this.config.nodeType === 'remote') {
        // Use Tauri command for remote file uploads
        console.log('Using Tauri upload command for remote file upload');
        
        // Convert file to array buffer then to Uint8Array
        const arrayBuffer = await file.arrayBuffer();
        const fileData = Array.from(new Uint8Array(arrayBuffer));
        
        const result = await invoke('upload_file', {
          url,
          fileData,
          contentType: file.type || 'application/octet-stream',
          filename: file.name,
        }) as any;

        // Create a Response-like object from the Tauri command result
        return new Response(
          typeof result.body === 'string' ? result.body : JSON.stringify(result.body),
          {
            status: result.status,
            statusText: result.statusText,
            headers: new Headers(result.headers),
          }
        );
      } else {
        // Use regular fetch for local file uploads
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${file.name}"`,
            ...this.getAuthHeaders(),
          },
          body: file,
          mode: 'cors',
        });

        console.log(`File Upload Response: ${response.status} ${response.statusText}`);
        return response;
      }
    } catch (error) {
      console.error('File Upload failed:', error);
      console.error('URL:', url);
      
      // Provide better error messages based on node type
      if (this.config.nodeType === 'remote') {
        throw new Error(
          `Remote File Upload Error: Cannot upload file to remote Codex server at "${this.config.remoteEndpoint}". ` +
          `Please check:\n` +
          `1. The server URL is correct and accessible\n` +
          `2. Your internet connection is working\n` +
          `3. The server is running and responding\n` +
          `4. Your authentication credentials are correct\n` +
          `5. The server supports file uploads`
        );
      } else {
        // Local node error
        throw new Error(
          `Local File Upload Error: Cannot upload file to local Codex node at "${url}". ` +
          `Please ensure:\n` +
          `1. Codex is running on port ${this.config.localApiPort}\n` +
          `2. The API port is correct in settings\n` +
          `3. Codex is properly started and accessible`
        );
      }
    }
  }
}

// Factory function to create API client with current configuration
export const createApiClient = (localApiPort: string): CodexApiClient => {
  const nodeType = storageUtils.getNodeType();
  const remoteEndpoint = storageUtils.getRemoteEndpoint();
  const remoteUsername = storageUtils.getRemoteUsername();
  const remotePassword = storageUtils.getRemotePassword();

  return new CodexApiClient({
    nodeType,
    localApiPort,
    remoteEndpoint: remoteEndpoint || undefined,
    remoteUsername: remoteUsername || undefined,
    remotePassword: remotePassword || undefined,
  });
};

// Convenience function for one-off requests
export const codexApi = {
  get: (endpoint: string, localApiPort: string, options?: RequestInit) => {
    const client = createApiClient(localApiPort);
    return client.get(endpoint, options);
  },
  
  post: (endpoint: string, localApiPort: string, data?: any, options?: RequestInit) => {
    const client = createApiClient(localApiPort);
    return client.post(endpoint, data, options);
  },
  
  delete: (endpoint: string, localApiPort: string, options?: RequestInit) => {
    const client = createApiClient(localApiPort);
    return client.delete(endpoint, options);
  },

  uploadFile: (endpoint: string, localApiPort: string, file: File) => {
    const client = createApiClient(localApiPort);
    return client.uploadFile(endpoint, file);
  },

  buildUrl: (endpoint: string, localApiPort: string) => {
    const client = createApiClient(localApiPort);
    return client.buildUrl(endpoint);
  }
}; 