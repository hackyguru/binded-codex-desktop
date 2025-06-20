import React, { useState, useEffect } from "react";
import {
  StatusLog,
  FileUpload,
  Install,
  Sidebar,
  Torrents,
  Search,
  Settings,
  TopNavigation
} from "./components";
import { useCodexProcess, useCodexConfig, useCodexConnection } from "./hooks";
import "./styles/App.css";

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [immediateConnectionState, setImmediateConnectionState] = useState<string | null>(null);

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

  // Use immediate state if set, otherwise use the connection hook state
  const effectiveConnectionStatus = immediateConnectionState || connectionStatus;
  const effectiveIsConnected = effectiveConnectionStatus === "Found";

  const handleRunCodexWithConfig = () => {
    // Clear any immediate state when starting
    setImmediateConnectionState(null);
    handleRunCodex(dataDirectory, discoveryPort, listeningPort, apiPort);
  };

  const handleKillCodexWithImmediateState = () => {
    // Immediately set connection to false for instant UI update
    setImmediateConnectionState("Not Found");
    handleKillCodex();
    // Clear the immediate state after a delay to allow normal connection checking to resume
    setTimeout(() => {
      setImmediateConnectionState(null);
    }, 5000);
  };

  // Auto-start codex when app loads
  useEffect(() => {
    checkExistingProcesses();
    // Only auto-start if data directory is already set
    if (isDirectorySet && dataDirectory) {
      handleRunCodexWithConfig();
    }
  }, [isDirectorySet, dataDirectory]);

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <DashboardPage />;
      case 'Torrents':
        return <Torrents />;
      case 'Search':
        return <Search />;
      case 'Settings':
        return <Settings 
          connectionStatus={effectiveConnectionStatus}
          isConnected={effectiveIsConnected}
          codexOutput={codexOutput}
        />;
      default:
        return <DashboardPage />;
    }
  };
  
  const DashboardPage = () => (
    <>
      {/* File Upload/Download Section */}
      <div className="mb-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          File Storage
        </h3>
        {effectiveConnectionStatus === "Found" ? (
          <FileUpload apiPort={apiPort} isConnected={effectiveIsConnected} />
        ) : (
          <Install />
        )}
      </div>
    </>
  );

  return (
    <div className="flex">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="min-h-screen bg-gray-300 text-white px-6 overflow-y-auto flex-1 ml-20">
        <TopNavigation
          isCodexRunning={isCodexRunning}
          isCodexStarted={codexChild !== null}
          isDirectorySet={isDirectorySet}
          isConnected={effectiveIsConnected}
          onRunCodex={handleRunCodexWithConfig}
          onKillCodex={handleKillCodexWithImmediateState}
        />
        <div className="max-w-4xl mx-auto bg-gray-300">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;
