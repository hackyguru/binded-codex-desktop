import { useState, useEffect, useRef } from 'react';
import { codexApi } from '../utils/apiClient';

export const useCodexConnection = (apiPort: string = '8080') => {
  const [connectionStatus, setConnectionStatus] = useState<string>("Not Found");
  const [isChecking, setIsChecking] = useState(false);
  const lastCheckTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  const checkConnection = async () => {
    // Prevent too frequent checks (minimum 2 seconds between checks)
    const now = Date.now();
    if (now - lastCheckTimeRef.current < 2000) {
      return;
    }
    lastCheckTimeRef.current = now;

    if (!isMountedRef.current) return;

    try {
      setIsChecking(true);
      
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await codexApi.get('/debug/info', apiPort, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!isMountedRef.current) return;
      
      if (response.ok) {
        setConnectionStatus("Found");
      } else {
        setConnectionStatus("Not Found");
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('Connection check timed out');
        } else if (error.message.includes('CORS Error') || error.message.includes('Remote Connection Error')) {
          console.error('Remote Connection Error:', error.message);
          setConnectionStatus("Connection Error");
        } else if (error.message.includes('Local Connection Error')) {
          console.error('Local Connection Error:', error.message);
          setConnectionStatus("Not Found");
        } else if (error.message.includes('fetch') || error.message.includes('Load failed')) {
          console.log('Network error during connection check:', error.message);
        } else {
          console.error('Connection check failed:', error.message);
        }
      }
      setConnectionStatus("Not Found");
    } finally {
      if (isMountedRef.current) {
        setIsChecking(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    // Check immediately on mount
    checkConnection();
    
    // Check every 10 seconds instead of 60 for more responsive detection
    const interval = setInterval(checkConnection, 10000);
    
    // Also check when window gains focus (user clicks back to app)
    const handleFocus = () => {
      checkConnection();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [apiPort]);

  return {
    connectionStatus,
    isConnected: connectionStatus === "Found",
    isChecking,
    checkConnection
  };
}; 