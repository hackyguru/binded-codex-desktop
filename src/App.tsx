import React, { useEffect } from "react";
import { Header, ConfigurationCard, StatusLog } from "./components";
import { useCodexProcess, useCodexConfig } from "./hooks";
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
      </div>

      <StatusLog codexOutput={codexOutput} />
    </main>
  );
};

export default App;
