import { useState, useEffect, useRef } from 'react';
import { codexService } from '../services/codexService';
import { PROCESS_CHECK_INTERVAL } from '../constants';

export const useCodexProcess = () => {
  const [codexOutput, setCodexOutput] = useState("");
  const [isCodexRunning, setIsCodexRunning] = useState(false);
  const [codexChild, setCodexChild] = useState<any>(null);
  const isMountedRef = useRef(true);
  const processCheckIntervalRef = useRef<number | null>(null);

  const checkProcessStatus = async () => {
    if (codexChild) {
      const isRunning = await codexService.checkProcessStatus(codexChild);
      if (!isRunning && isMountedRef.current) {
        setCodexChild(null);
        setCodexOutput("Codex process is no longer running");
      }
    }
  };

  const handleRunCodex = async (
    dataDirectory: string,
    discoveryPort: string,
    listeningPort: string,
    apiPort: string
  ) => {
    if (!dataDirectory) {
      setCodexOutput("Please select a data directory first.");
      return;
    }

    setIsCodexRunning(true);
    setCodexOutput("Starting Codex...");

    try {
      // First kill any existing processes
      await codexService.killExistingProcesses();
      setCodexOutput("Existing Codex processes killed successfully.");

      const child = await codexService.startCodex(
        dataDirectory,
        discoveryPort,
        listeningPort,
        apiPort
      );
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setCodexChild(child);
        setCodexOutput("Codex started successfully and running in background...");
        setIsCodexRunning(false);
        
        // Start periodic process status check
        processCheckIntervalRef.current = setInterval(checkProcessStatus, PROCESS_CHECK_INTERVAL);
      } else {
        // Component was unmounted, kill the process
        await child.kill();
      }
    } catch (error) {
      if (isMountedRef.current) {
        setCodexOutput(`Error starting Codex: ${error}`);
      }
    } finally {
      if (isMountedRef.current) {
        setIsCodexRunning(false);
      }
    }
  };

  const handleKillCodex = async () => {
    try {
      setCodexOutput("Killing Codex process...");
      await codexService.killExistingProcesses();
      
      // Also kill the current child process if it exists
      if (codexChild) {
        await codexChild.kill();
        setCodexChild(null);
        
        // Clear the process check interval
        if (processCheckIntervalRef.current) {
          clearInterval(processCheckIntervalRef.current);
          processCheckIntervalRef.current = null;
        }
      }
      
      setCodexOutput("Codex process killed successfully.");
    } catch (error) {
      setCodexOutput(`Error killing Codex process: ${error}`);
    } finally {
      setIsCodexRunning(false);
    }
  };

  const checkExistingProcesses = async () => {
    const result = await codexService.checkExistingProcesses();
    setCodexOutput(result);
  };

  // Cleanup when component unmounts
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (codexChild) {
        try {
          await codexChild.kill();
          console.log('Codex process terminated');
        } catch (error) {
          console.error('Error terminating codex process:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Clear the process check interval
      if (processCheckIntervalRef.current) {
        clearInterval(processCheckIntervalRef.current);
        processCheckIntervalRef.current = null;
      }
      
      // Also try to kill the process when component unmounts
      if (codexChild) {
        codexChild.kill().catch(console.error);
      }
    };
  }, [codexChild]);

  return {
    codexOutput,
    isCodexRunning,
    codexChild,
    handleRunCodex,
    handleKillCodex,
    checkExistingProcesses
  };
}; 