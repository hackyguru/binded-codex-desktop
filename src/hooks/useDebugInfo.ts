import { useState, useEffect } from 'react';

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

  const fetchDebugInfo = async () => {
    if (!isConnected) {
      setError('Not connected to Codex API');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:${apiPort}/api/codex/v1/debug/info`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch debug info: ${response.statusText}`);
      }

      const data = await response.json();
      setDebugInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch debug info');
      setDebugInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchDebugInfo();
    }
  }, [apiPort, isConnected]);

  return {
    debugInfo,
    isLoading,
    error,
    refetch: fetchDebugInfo
  };
}; 