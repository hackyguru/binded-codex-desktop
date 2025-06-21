import { useState, useEffect } from 'react';
import { FileManifest } from '../types';

interface CidInfo {
  cid: string;
  manifest: FileManifest;
}

export const useCidInfo = (cid: string, apiPort: string = '8080') => {
  const [fileInfo, setFileInfo] = useState<CidInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCidInfo = async () => {
      if (!cid) {
        setFileInfo(null);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const url = `http://localhost:${apiPort}/api/codex/v1/data/${cid}/network/manifest`;
        console.log('useCidInfo - Fetching manifest from:', url);
        
        const response = await fetch(url);
        console.log('useCidInfo - Response status:', response.status);
        console.log('useCidInfo - Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('useCidInfo - Error response:', errorText);
          throw new Error(`File manifest not found. The content may not be available on the network. Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('useCidInfo - Received data:', data);
        setFileInfo(data);
        console.log('useCidInfo - Setting fileInfo, clearing error');
        setError(null);
      } catch (e) {
        console.error('useCidInfo - Fetch error:', e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
        setFileInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCidInfo();
  }, [cid, apiPort]);

  return { fileInfo, isLoading, error };
}; 