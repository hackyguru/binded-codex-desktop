import React from 'react';
import DataDirectorySection from './DataDirectorySection';
import PortConfigurationSection from './PortConfigurationSection';
import StatusIndicator from './StatusIndicator';
import ControlButtons from './ControlButtons';

interface ConfigurationCardProps {
  isDirectorySet: boolean;
  dataDirectory: string;
  discoveryPort: string;
  listeningPort: string;
  apiPort: string;
  isCodexRunning: boolean;
  isCodexStarted: boolean;
  isConnected: boolean;
  onSelectDirectory: () => void;
  onChangeDirectory: () => void;
  onDiscoveryPortChange: (value: string) => void;
  onListeningPortChange: (value: string) => void;
  onApiPortChange: (value: string) => void;
  onRunCodex: () => void;
  onKillCodex: () => void;
}

const ConfigurationCard: React.FC<ConfigurationCardProps> = ({
  isDirectorySet,
  dataDirectory,
  discoveryPort,
  listeningPort,
  apiPort,
  isCodexRunning,
  isCodexStarted,
  isConnected,
  onSelectDirectory,
  onChangeDirectory,
  onDiscoveryPortChange,
  onListeningPortChange,
  onApiPortChange,
  onRunCodex,
  onKillCodex
}) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl bg-black">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
        Configuration
      </h2>

      <div className="codex-section">
        <h2>Codex Configuration</h2>
        
        <DataDirectorySection
          isDirectorySet={isDirectorySet}
          dataDirectory={dataDirectory}
          onSelectDirectory={onSelectDirectory}
          onChangeDirectory={onChangeDirectory}
        />
        
        <PortConfigurationSection
          discoveryPort={discoveryPort}
          listeningPort={listeningPort}
          apiPort={apiPort}
          onDiscoveryPortChange={onDiscoveryPortChange}
          onListeningPortChange={onListeningPortChange}
          onApiPortChange={onApiPortChange}
        />
        
        <StatusIndicator isRunning={isCodexStarted} />
        
        <ControlButtons
          isCodexRunning={isCodexRunning}
          isCodexStarted={isCodexStarted}
          isDirectorySet={isDirectorySet}
          isConnected={isConnected}
          onRunCodex={onRunCodex}
          onKillCodex={onKillCodex}
        />
      </div>
    </div>
  );
};

export default ConfigurationCard; 