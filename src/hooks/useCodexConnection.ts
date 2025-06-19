import { useState, useEffect } from 'react';

export const useCodexConnection = (apiPort: string = '8080') => {
  const [connectionStatus, setConnectionStatus] = useState<string>("Not Found");
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    try {
      setIsChecking(true);
      const response = await fetch(`http://localhost:${apiPort}/api/codex/v1/debug/info`);
      setConnectionStatus(response.status === 200 ? "Found" : "Not Found");
    } catch (error) {
      setConnectionStatus("Not Found");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    // Check connection every 5 seconds
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [apiPort]);

  return {
    connectionStatus,
    isChecking,
    checkConnection
  };
}; 