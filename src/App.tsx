import React, { useEffect } from "react";
import { Header, ConfigurationCard, StatusLog, FileUpload, Install } from "./components";
import { useCodexProcess, useCodexConfig, useCodexConnection } from "./hooks";
import "./styles/App.css";

const App: React.FC = () => {
  const {
    dataDirectory,
    isDirectorySet,
    discoveryPort,
    listeningPort,
    apiPort,
    handleSelectDirectory,
    handleChangeDirectory,
    handleDiscoveryPortChange,
    handleListeningPortChange,
    handleApiPortChange
  } = useCodexConfig();

  const {
    codexOutput,
    isCodexRunning,
    codexChild,
    handleRunCodex,
    handleKillCodex,
    checkExistingProcesses
  } = useCodexProcess();

  const { connectionStatus } = useCodexConnection(apiPort);

  const handleRunCodexWithConfig = () => {
    handleRunCodex(dataDirectory, discoveryPort, listeningPort, apiPort);
  };

  // Auto-start codex when app loads
  useEffect(() => {
    checkExistingProcesses();
    // Only auto-start if data directory is already set
    if (isDirectorySet && dataDirectory) {
      handleRunCodexWithConfig();
    }
  }, [isDirectorySet, dataDirectory]);

  return (
    <main className="min-h-screen bg-black text-white p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto bg-black">
        <Header />
        
        <ConfigurationCard
          isDirectorySet={isDirectorySet}
          dataDirectory={dataDirectory}
          discoveryPort={discoveryPort}
          listeningPort={listeningPort}
          apiPort={apiPort}
          isCodexRunning={isCodexRunning}
          isCodexStarted={codexChild !== null}
          onSelectDirectory={handleSelectDirectory}
          onChangeDirectory={handleChangeDirectory}
          onDiscoveryPortChange={handleDiscoveryPortChange}
          onListeningPortChange={handleListeningPortChange}
          onApiPortChange={handleApiPortChange}
          onRunCodex={handleRunCodexWithConfig}
          onKillCodex={handleKillCodex}
        />

        {/* Connection Status Display */}
        <div className="mt-8 max-w-4xl mx-auto bg-black">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              Codex Connection Status
            </h3>
            <div className="flex items-center justify-center">
              <div className={`w-4 h-4 rounded-full mr-3 ${connectionStatus === "Found" ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-lg font-medium text-white">
                {connectionStatus === "Found" ? 'Connected to Codex API' : 'Not connected to Codex API'}
              </span>
            </div>
          </div>
        </div>

        {/* File Upload/Download Section */}
        <div className="mt-8 max-w-4xl mx-auto bg-black">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              File Storage
            </h3>
            {connectionStatus === "Found" ? (
              <FileUpload apiPort={apiPort} />
            ) : (
              <Install />
            )}
          </div>
        </div>
      </div>

      <StatusLog codexOutput={codexOutput} />
    </main>
  );
};

export default App;
