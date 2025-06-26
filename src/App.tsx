import React, { useState, useEffect } from "react";
import {
  StatusLog,
  FileUpload,
  Install,
  Sidebar,
  Node,
  Search,
  Settings,
  NetworkStatus,
  TopNavigation,
  Dashboard
} from "./components";
import { useCodexProcess, useCodexConfig, useCodexConnection } from "./hooks";
import "./styles/App.css";

// Types
interface ConnectionState {
  status: string;
  isConnected: boolean;
  clearImmediateState: () => void;
  setImmediateDisconnected: () => void;
}

interface CodexState {
  isRunning: boolean;
  isStarted: boolean;
  output: string;
}

// Custom hook for connection state management
const useConnectionState = (connectionStatus: string, isConnected: boolean): ConnectionState => {
  const [immediateConnectionState, setImmediateConnectionState] = useState<string | null>(null);

  const effectiveConnectionStatus = immediateConnectionState || connectionStatus;
  const effectiveIsConnected = effectiveConnectionStatus === "Found";

  const clearImmediateState = () => setImmediateConnectionState(null);
  
  const setImmediateDisconnected = () => {
    setImmediateConnectionState("Not Found");
    setTimeout(() => setImmediateConnectionState(null), 5000);
  };

  return {
    status: effectiveConnectionStatus,
    isConnected: effectiveIsConnected,
    clearImmediateState,
    setImmediateDisconnected
  };
};

// Custom hook for page rendering
const usePageRenderer = (
  activePage: string,
  connectionState: ConnectionState,
  codexState: CodexState,
  apiPort: string,
  searchedCid: string
) => {
  const renderPage = () => {
    const commonProps = {
      connectionStatus: connectionState.status,
      isConnected: connectionState.isConnected,
      apiPort
    };

    // Show Install component on most pages when Codex is not running
    // Exception: Settings page should always be accessible for configuration
    if (connectionState.status !== "Found" && activePage !== 'Settings') {
      return <Install />;
    }

    switch (activePage) {
      case 'Dashboard':
        return <Dashboard {...commonProps} />;
      case 'Node':
        return <Node {...commonProps} />;
      case 'Search':
        return <Search cid={searchedCid} />;
      case 'NetworkStatus':
        return <NetworkStatus {...commonProps} />;
      case 'Settings':
        return <Settings {...commonProps} codexOutput={codexState.output} />;
      default:
        return <Dashboard {...commonProps} />;
    }
  };

  return renderPage;
};

const App: React.FC = () => {
  // State
  const [activePage, setActivePage] = useState('Dashboard');
  const [searchedCid, setSearchedCid] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [manuallyKilled, setManuallyKilled] = useState(false);
  const [appStartTime] = useState(Date.now());

  // Hooks
  const {
    dataDirectory,
    isDirectorySet,
    discoveryPort,
    listeningPort,
    apiPort,
    autoStartCodex
  } = useCodexConfig();

  const {
    codexOutput,
    isCodexRunning,
    codexChild,
    handleRunCodex,
    handleKillCodex,
    checkExistingProcesses
  } = useCodexProcess();

  const { connectionStatus, isConnected } = useCodexConnection(apiPort);

  // Custom hooks
  const connectionState = useConnectionState(connectionStatus, isConnected);
  const codexState: CodexState = {
    isRunning: isCodexRunning,
    isStarted: codexChild !== null,
    output: codexOutput
  };

  const renderPage = usePageRenderer(activePage, connectionState, codexState, apiPort, searchedCid);

  // Event handlers
  const handleRunCodexWithConfig = () => {
    connectionState.clearImmediateState();
    setManuallyKilled(false); // Reset manual kill flag when manually starting
    handleRunCodex(dataDirectory, discoveryPort, listeningPort, apiPort);
  };

  const handleKillCodexWithImmediateState = () => {
    connectionState.setImmediateDisconnected();
    setManuallyKilled(true); // Mark as manually killed to prevent auto-restart
    handleKillCodex();
  };

  const handleSearch = (cid: string) => {
    setSearchedCid(cid);
    setActivePage('Search');
  };

  // Effects - Only run once on app initialization
  useEffect(() => {
    const initializeApp = async () => {
      await checkExistingProcesses();
      
      // Debug logging
      console.log('Auto-start check:', {
        hasInitialized,
        isDirectorySet,
        dataDirectory: !!dataDirectory,
        autoStartCodex,
        manuallyKilled,
        timeSinceStart: Date.now() - appStartTime
      });
      
      // Only auto-start on very first initialization, within first 5 seconds of app start, and when auto-start is enabled
      const isInitialLoad = !hasInitialized && (Date.now() - appStartTime) < 5000;
      
      if (isInitialLoad && isDirectorySet && dataDirectory && autoStartCodex && !manuallyKilled) {
        console.log('Auto-starting Codex on initial load...');
        handleRunCodexWithConfig();
      }
      
      if (!hasInitialized) {
        setHasInitialized(true);
      }
    };

    // Only run if we haven't initialized yet - remove codexChild dependency to prevent re-runs
    if (!hasInitialized) {
      initializeApp();
    }
  }, [isDirectorySet, dataDirectory, autoStartCodex, hasInitialized, manuallyKilled, appStartTime]);

  // Debug effect to track auto-start setting changes
  useEffect(() => {
    console.log('Auto-start setting changed:', {
      autoStartCodex,
      rawLocalStorageValue: localStorage.getItem('codexAutoStartEnabled'),
      hasInitialized,
      manuallyKilled
    });
  }, [autoStartCodex, hasInitialized, manuallyKilled]);

  // Debug effect to track states that affect the power button
  useEffect(() => {
    console.log('App state affecting power button:', {
      isDirectorySet,
      dataDirectory: !!dataDirectory,
      isCodexRunning,
      codexChild: !!codexChild,
      connectionStatus,
      isConnected,
      hasInitialized,
      manuallyKilled
    });
  }, [isDirectorySet, dataDirectory, isCodexRunning, codexChild, connectionStatus, isConnected, hasInitialized, manuallyKilled]);

  // Don't reset manual kill flag automatically - only reset when user manually starts
  // This was causing auto-restart after manual kills
  // useEffect(() => {
  //   if (hasInitialized && !codexChild && !isCodexRunning && manuallyKilled) {
  //     // Process has stopped and we're not in the middle of starting it
  //     // Reset the manual kill flag after a delay to allow for potential auto-restart
  //     const timer = setTimeout(() => {
  //       setManuallyKilled(false);
  //     }, 5000); // 5 second delay
      
  //     return () => clearTimeout(timer);
  //   }
  // }, [codexChild, isCodexRunning, manuallyKilled, hasInitialized]);

  return (
    <div className="flex h-screen">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 flex flex-col text-white px-6 ml-20">
        {/* Fixed TopNavigation */}
        <div className="flex-shrink-0 bg-black pt-6 pb-4">
          <TopNavigation
            isCodexRunning={isCodexRunning}
            isCodexStarted={codexChild !== null}
            isDirectorySet={isDirectorySet}
            isConnected={connectionState.isConnected}
            onRunCodex={handleRunCodexWithConfig}
            onKillCodex={handleKillCodexWithImmediateState}
            onSearch={handleSearch}
          />
        </div>
        
        {/* Full Height Content Container */}
        <div className={`flex-1 bg-[#151515] rounded-xl mt-4 overflow-hidden mb-6 ${
          connectionStatus !== "Found" && activePage !== 'Settings' ? '' : 'p-4'
        }`}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;
