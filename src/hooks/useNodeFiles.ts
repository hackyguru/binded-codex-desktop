import { useState, useCallback } from 'react';

// This is the structure of a single file from the API
export interface NodeFile {
  cid: string;
  manifest: {
    treeCid: string;
    datasetSize: number;
    blockSize: number;
    filename: string;
    mimetype: string;
    protected: boolean;
  };
}

// The API response structure
interface ApiResponse {
  content: NodeFile[];
}

export const useNodeFiles = (apiPort: string = '8080', isConnected: boolean) => {
  const [files, setFiles] = useState<NodeFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    if (!isConnected) {
      setFiles([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:${apiPort}/api/codex/v1/data`);
      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.statusText}`);
      }
      const data: ApiResponse = await response.json();
      setFiles(data.content || []);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred');
      }
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiPort, isConnected]);

  return { files, isLoading, error, refetch: fetchFiles };
}; 