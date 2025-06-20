import React from 'react';
import ConfigurationCard from '../ConfigurationCard';
import StatusLog from '../StatusLog';
import { useCodexConfig } from '../../hooks/useCodexConfig';
import { useDownloadLocation } from '../../hooks/useDownloadLocation';
import { FiFolder, FiRotateCcw } from 'react-icons/fi';

interface SettingsProps {
  connectionStatus: string;
  isConnected: boolean;
  codexOutput: string;
}

const Settings: React.FC<SettingsProps> = ({ connectionStatus, isConnected, codexOutput }) => {
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
    customDownloadPath,
    selectDownloadDirectory,
    resetToDefault
  } = useDownloadLocation();

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>
      
      <ConfigurationCard
        isDirectorySet={isDirectorySet}
        dataDirectory={dataDirectory}
        discoveryPort={discoveryPort}
        listeningPort={listeningPort}
        apiPort={apiPort}
        isCodexRunning={false} // Not needed in settings
        isCodexStarted={false} // Not needed in settings
        isConnected={false} // Not needed in settings
        onSelectDirectory={handleSelectDirectory}
        onChangeDirectory={handleChangeDirectory}
        onDiscoveryPortChange={handleDiscoveryPortChange}
        onListeningPortChange={handleListeningPortChange}
        onApiPortChange={handleApiPortChange}
        onRunCodex={() => {}} // Not needed in settings
        onKillCodex={() => {}} // Not needed in settings
        showControlButtons={false} // Hide start/kill buttons
      />

      {/* Download Location Section */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex-grow">
            <h3 className="text-sm font-medium text-gray-200">Download Location</h3>
            <p className="text-xs text-gray-400 mt-1">
              {customDownloadPath || 'Using default downloads directory'}
            </p>
            {customDownloadPath && (
              <p className="text-xs text-blue-400 font-mono mt-1 break-all">
                {customDownloadPath}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={selectDownloadDirectory}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiFolder className="w-4 h-4 mr-2" />
              Choose Directory
            </button>
            {customDownloadPath && (
              <button
                onClick={resetToDefault}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Reset to default downloads directory"
              >
                <FiRotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Connection Status Display */}
      <div className="mb-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-xl">
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

      {/* Status Log */}
      <StatusLog codexOutput={codexOutput} />
    </div>
  );
};

export default Settings; 