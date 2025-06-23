import { useState, useEffect, useRef } from 'react';

interface LocalNode {
  nodeId: string;
  peerId: string;
  record: string;
  address: string;
  seen: boolean;
}

interface NetworkNode {
  nodeId: string;
  peerId: string;
  record: string;
  address: string;
  seen: boolean;
}

interface NetworkTable {
  localNode: LocalNode;
  nodes: NetworkNode[];
}

interface CodexInfo {
  version: string;
  revision: string;
  contracts: string;
}

interface DebugInfo {
  id: string;
  addrs: string[];
  repo: string;
  spr: string;
  announceAddresses: string[];
  table: NetworkTable;
  codex: CodexInfo;
}

export const useDebugInfo = (apiPort: string, isConnected: boolean) => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const isConnectedRef = useRef(isConnected);

  const fetchDebugInfo = async () => {
    if (!isConnectedRef.current) {
      setError('Not connected to Codex API');
      return;
    }

    // Debounce: prevent fetching more than once every 10 seconds
    const now = Date.now();
    if (now - lastFetchTime < 10000) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastFetchTime(now);

    try {
      const response = await fetch(`http://localhost:${apiPort}/api/codex/v1/debug/info`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch debug info: ${response.statusText}`);
      }

      const data = await response.json();
      setDebugInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch debug info');
      // Don't clear debugInfo on error - preserve previous data
    } finally {
      setIsLoading(false);
    }
  };

  // Update the ref whenever isConnected changes
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    let interval: number | null = null;

    // Initial fetch if connected
    if (isConnected) {
      fetchDebugInfo();
    }
    
    // Set up polling every 60 seconds for network status updates (reduced frequency)
    interval = setInterval(() => {
      fetchDebugInfo(); // This will check isConnectedRef.current internally
    }, 60000); // 60 seconds - less frequent updates for smoother scrolling

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [apiPort]); // Only depend on apiPort to prevent constant re-initialization

  return {
    debugInfo,
    isLoading,
    error,
    refetch: fetchDebugInfo
  };
}; 