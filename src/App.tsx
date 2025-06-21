import React, { useState, useEffect } from "react";
import {
  StatusLog,
  FileUpload,
  Install,
  Sidebar,
  Torrents,
  Search,
  Settings,
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

    switch (activePage) {
      case 'Dashboard':
        return <Dashboard {...commonProps} />;
      case 'Torrents':
        return <Torrents />;
      case 'Search':
        return <Search cid={searchedCid} />;
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

  // Hooks
  const {
    dataDirectory,
    isDirectorySet,
    discoveryPort,
    listeningPort,
    apiPort
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
    handleRunCodex(dataDirectory, discoveryPort, listeningPort, apiPort);
  };

  const handleKillCodexWithImmediateState = () => {
    connectionState.setImmediateDisconnected();
    handleKillCodex();
  };

  const handleSearch = (cid: string) => {
    setSearchedCid(cid);
    setActivePage('Search');
  };

  // Effects
  useEffect(() => {
    const initializeApp = async () => {
      await checkExistingProcesses();
      if (isDirectorySet && dataDirectory) {
        handleRunCodexWithConfig();
      }
    };

    initializeApp();
  }, [isDirectorySet, dataDirectory]);

  return (
    <div className="flex">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="min-h-screen text-white px-6 overflow-y-auto flex-1 ml-20">
        {/* Fixed TopNavigation */}
        <div className="sticky top-0 z-20 bg-black pt-6 pb-4">
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
        
        {/* Scrollable Content */}
        <div className="mx-auto bg-[#151515] rounded-xl p-4">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;
