import { storageUtils } from './storage';
import { invoke } from '@tauri-apps/api/core';
import { download } from '@tauri-apps/plugin-upload';

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
      const baseUrl = this.config.remoteEndpoint.replace(/\/$/, '');
      console.log(`Using remote endpoint: ${baseUrl}`);
      return baseUrl;
    } else if (this.config.nodeType === 'remote' && !this.config.remoteEndpoint) {
      // Remote mode but no endpoint configured
      console.error('Remote mode selected but no remote endpoint configured!');
      throw new Error('Remote mode is enabled but no remote endpoint is configured. Please configure the remote endpoint in settings.');
    }
    
    const localUrl = `http://localhost:${this.config.localApiPort}`;
    console.log(`Using local endpoint: ${localUrl}`);
    return localUrl;
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

  public buildUrl(endpoint: string, fallbackApiPort?: string): string {
    // If fallbackApiPort is provided and we're in local mode, use it to override the config temporarily
    const baseUrl = fallbackApiPort && this.config.nodeType === 'local' 
      ? `http://localhost:${fallbackApiPort}`
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
    
    console.log(`Built URL for ${this.config.nodeType} node: ${finalUrl}`);
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

  public async downloadFile(endpoint: string, filePath: string): Promise<void> {
    const url = this.buildUrl(endpoint);
    
    console.log(`File Download: GET ${url}`);
    console.log('Saving to:', filePath);
    console.log('Node type:', this.config.nodeType);

    try {
      if (this.config.nodeType === 'remote') {
        // Use Tauri command for remote file downloads with authentication
        console.log('Using Tauri download command for authenticated remote file download');
        
        const headers = this.getAuthHeaders();
        
        const result = await invoke('download_file', {
          url,
          filePath,
          headers,
        }) as any;

        if (!result.success) {
          throw new Error('Download failed');
        }
        
        console.log(`File downloaded successfully to ${result.path}, size: ${result.size} bytes`);
      } else {
        // Use regular Tauri download plugin for local downloads
        console.log('Using Tauri download plugin for local file download');
        
        await download(
          url,
          filePath,
          undefined, // No progress callback for now
          new Map([['Accept', '*/*']])
        );
        
        console.log('File downloaded successfully using Tauri plugin');
      }
    } catch (error) {
      console.error('File Download failed:', error);
      console.error('URL:', url);
      console.error('File path:', filePath);
      
      // Provide better error messages based on node type
      if (this.config.nodeType === 'remote') {
        throw new Error(
          `Remote File Download Error: Cannot download file from remote Codex server at "${this.config.remoteEndpoint}". ` +
          `Please check:\n` +
          `1. The server URL is correct and accessible\n` +
          `2. Your internet connection is working\n` +
          `3. The server is running and responding\n` +
          `4. Your authentication credentials are correct\n` +
          `5. The file exists on the server`
        );
      } else {
        // Local node error
        throw new Error(
          `Local File Download Error: Cannot download file from local Codex node at "${url}". ` +
          `Please ensure:\n` +
          `1. Codex is running on port ${this.config.localApiPort}\n` +
          `2. The API port is correct in settings\n` +
          `3. Codex is properly started and accessible\n` +
          `4. The file exists on the node`
        );
      }
    }
  }

  public async uploadFile(endpoint: string, file: File, abortController?: AbortController): Promise<Response> {
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
        
        // Get authentication headers
        const headers = this.getAuthHeaders();
        
        // For remote uploads, we'll use a Promise that can be cancelled
        const uploadPromise = invoke('upload_file', {
          url,
          fileData,
          contentType: file.type || 'application/octet-stream',
          filename: file.name,
          headers, // Pass authentication headers
        }) as Promise<any>;

        // Create a cancellable promise
        const cancellablePromise = new Promise<any>((resolve, reject) => {
          if (abortController?.signal.aborted) {
            reject(new DOMException('Upload cancelled', 'AbortError'));
            return;
          }

          const abortHandler = () => {
            reject(new DOMException('Upload cancelled', 'AbortError'));
          };

          abortController?.signal.addEventListener('abort', abortHandler);

          uploadPromise
            .then(resolve)
            .catch(reject)
            .finally(() => {
              abortController?.signal.removeEventListener('abort', abortHandler);
            });
        });

        const result = await cancellablePromise;

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
          signal: abortController?.signal, // Add abort signal for local uploads
        });

        console.log(`File Upload Response: ${response.status} ${response.statusText}`);
        return response;
      }
    } catch (error: any) {
      // Handle abort error specifically
      if (error.name === 'AbortError' || error.message?.includes('cancelled')) {
        console.log('File upload cancelled');
        throw new DOMException('Upload cancelled by user', 'AbortError');
      }
      
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
export const createApiClient = (fallbackApiPort: string): CodexApiClient => {
  const nodeType = storageUtils.getNodeType();
  const remoteEndpoint = storageUtils.getRemoteEndpoint();
  const remoteUsername = storageUtils.getRemoteUsername();
  const remotePassword = storageUtils.getRemotePassword();

  console.log(`Creating API client - Node type: ${nodeType}`);
  if (nodeType === 'remote') {
    console.log(`Remote mode - Using endpoint: ${remoteEndpoint}`);
  } else {
    console.log(`Local mode - Using port: ${fallbackApiPort}`);
  }

  return new CodexApiClient({
    nodeType,
    localApiPort: fallbackApiPort, // Only used when nodeType is 'local'
    remoteEndpoint: remoteEndpoint || undefined,
    remoteUsername: remoteUsername || undefined,
    remotePassword: remotePassword || undefined,
  });
};

// Debug utility function to verify API client configuration
export const debugApiClientConfig = (apiPort: string = '8080') => {
  const nodeType = storageUtils.getNodeType();
  const remoteEndpoint = storageUtils.getRemoteEndpoint();
  const remoteUsername = storageUtils.getRemoteUsername();
  const remotePassword = storageUtils.getRemotePassword();

  const client = createApiClient(apiPort);
  const testEndpoint = '/debug/info';
  const testUrl = client.buildUrl(testEndpoint);

  const config = {
    nodeType,
    localApiPort: apiPort,
    remoteEndpoint,
    remoteUsername,
    remotePassword: remotePassword ? '[REDACTED]' : null,
    testUrl,
    isRemoteMode: nodeType === 'remote',
    isRemoteConfigured: !!(remoteEndpoint && remoteUsername && remotePassword)
  };

  console.log('🔍 API Client Debug Configuration:', config);
  
  if (nodeType === 'remote') {
    if (!remoteEndpoint) {
      console.warn('⚠️ Remote mode selected but no remote endpoint configured!');
    }
    if (!remoteUsername || !remotePassword) {
      console.warn('⚠️ Remote mode selected but incomplete authentication credentials!');
    }
    if (testUrl.includes('localhost')) {
      console.error('❌ ERROR: Remote mode selected but URL still points to localhost!');
    } else {
      console.log('✅ Remote mode correctly configured - URL points to remote endpoint');
    }
  } else {
    if (testUrl.includes('localhost')) {
      console.log('✅ Local mode correctly configured - URL points to localhost');
    } else {
      console.error('❌ ERROR: Local mode selected but URL does not point to localhost!');
    }
  }

  return config;
};

// Enhanced debug utility to test all API methods with current configuration
export const testAllApiMethods = async (apiPort: string = '8080') => {
  console.log('🧪 Testing all API methods with current configuration...');
  
  const config = debugApiClientConfig(apiPort);
  
  const testResults = {
    buildUrl: {
      get: codexApi.buildUrl('/debug/info', apiPort),
      post: codexApi.buildUrl('/data/upload', apiPort),
      delete: codexApi.buildUrl('/data/test', apiPort),
      download: codexApi.buildUrl('/data/test/stream', apiPort)
    },
    nodeType: config.nodeType,
    remoteEndpoint: config.remoteEndpoint,
    allUrlsPointToCorrectEndpoint: true
  };
  
  // Verify all URLs point to the correct endpoint based on node type
  Object.values(testResults.buildUrl).forEach(url => {
    if (config.nodeType === 'remote') {
      if (url.includes('localhost')) {
        testResults.allUrlsPointToCorrectEndpoint = false;
        console.error('❌ ERROR: Found localhost URL in remote mode:', url);
      }
    } else {
      if (!url.includes('localhost')) {
        testResults.allUrlsPointToCorrectEndpoint = false;
        console.error('❌ ERROR: Found non-localhost URL in local mode:', url);
      }
    }
  });
  
  if (testResults.allUrlsPointToCorrectEndpoint) {
    console.log('✅ All API URLs correctly point to the configured endpoint');
  }
  
  console.log('🧪 Test Results:', testResults);
  return testResults;
};

// Convenience functions for one-off requests
// Note: The apiPort parameter is only used for local nodes. For remote nodes, 
// the remote endpoint from settings is used instead.
export const codexApi = {
  get: (endpoint: string, apiPort: string, options?: RequestInit) => {
    const client = createApiClient(apiPort);
    return client.get(endpoint, options);
  },
  
  post: (endpoint: string, apiPort: string, data?: any, options?: RequestInit) => {
    const client = createApiClient(apiPort);
    return client.post(endpoint, data, options);
  },
  
  delete: (endpoint: string, apiPort: string, options?: RequestInit) => {
    const client = createApiClient(apiPort);
    return client.delete(endpoint, options);
  },

  uploadFile: (endpoint: string, apiPort: string, file: File, abortController?: AbortController) => {
    const client = createApiClient(apiPort);
    return client.uploadFile(endpoint, file, abortController);
  },

  buildUrl: (endpoint: string, apiPort: string) => {
    const client = createApiClient(apiPort);
    return client.buildUrl(endpoint);
  },

  downloadFile: (endpoint: string, filePath: string, apiPort: string) => {
    const client = createApiClient(apiPort);
    return client.downloadFile(endpoint, filePath);
  },

  // Debug utilities
  debugConfig: debugApiClientConfig,
  testAllMethods: testAllApiMethods
}; 