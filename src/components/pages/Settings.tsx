import React, { useState } from 'react';
import { FiFolder, FiRotateCcw, FiSettings, FiDownload, FiServer, FiWifi, FiMonitor } from 'react-icons/fi';
import { useCodexConfig } from '../../hooks/useCodexConfig';
import { useDownloadLocation } from '../../hooks/useDownloadLocation';

interface SettingsProps {
  connectionStatus: string;
  isConnected: boolean;
  codexOutput: string;
}

type SettingsCategory = 'general' | 'codex' | 'downloads' | 'system';

interface CategoryItem {
  id: SettingsCategory;
  name: string;
  icon: React.ReactNode;
}

const categories: CategoryItem[] = [
  { id: 'general', name: 'General', icon: <FiSettings className="w-5 h-5" /> },
  { id: 'codex', name: 'Codex Node', icon: <FiServer className="w-5 h-5" /> },
  { id: 'downloads', name: 'Downloads', icon: <FiDownload className="w-5 h-5" /> },
  { id: 'system', name: 'System', icon: <FiMonitor className="w-5 h-5" /> },
];

const Settings: React.FC<SettingsProps> = ({ connectionStatus, isConnected, codexOutput }) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');

  const {
    dataDirectory,
    isDirectorySet,
    discoveryPort,
    listeningPort,
    apiPort,
    autoStartCodex,
    handleSelectDirectory,
    handleChangeDirectory,
    handleDiscoveryPortChange,
    handleListeningPortChange,
    handleApiPortChange,
    handleAutoStartCodexChange
  } = useCodexConfig();

  const {
    customDownloadPath,
    selectDownloadDirectory,
    resetToDefault
  } = useDownloadLocation();

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Auto-start Codex Section */}
      <div className="bg-black/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FiSettings className="w-5 h-5 mr-2 text-[#6BE4A8]" />
          General Settings
        </h4>
        <div className="bg-black/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-grow">
              <h3 className="text-base font-medium text-white">Auto-start Codex</h3>
              <p className="text-sm text-gray-400 mt-1">
                Automatically start Codex when the application opens
              </p>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => handleAutoStartCodexChange(!autoStartCodex)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:ring-offset-2 ${
                  autoStartCodex ? 'bg-[#6BE4A8]' : 'bg-gray-600'
                }`}
                role="switch"
                aria-checked={autoStartCodex}
                aria-label="Toggle auto-start Codex"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoStartCodex ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCodexSettings = () => (
    <div className="space-y-6">
      {/* Data Directory */}
      <div className="bg-black/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FiServer className="w-5 h-5 mr-2 text-[#6BE4A8]" />
          Data Directory
        </h4>
        <div className="bg-black/20 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Current Directory:</p>
          <p className="text-white font-mono text-sm break-all mb-4">
            {dataDirectory || 'No directory selected'}
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleSelectDirectory}
              className="px-4 py-2 bg-[#6BE4A8] text-black rounded-lg font-medium hover:bg-[#5ad396] transition-colors"
            >
              Select Directory
            </button>
            {isDirectorySet && (
              <button
                onClick={handleChangeDirectory}
                className="px-4 py-2 bg-black/20 text-white rounded-lg font-medium hover:bg-black/30 transition-colors border border-gray-600"
              >
                Change Directory
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Port Configuration */}
      <div className="bg-black/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FiServer className="w-5 h-5 mr-2 text-[#6BE4A8]" />
          Port Configuration
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Discovery Port</label>
            <input
              type="text"
              value={discoveryPort}
              onChange={(e) => handleDiscoveryPortChange(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent"
              placeholder="8090"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Listening Port</label>
            <input
              type="text"
              value={listeningPort}
              onChange={(e) => handleListeningPortChange(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent"
              placeholder="8070"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">API Port</label>
            <input
              type="text"
              value={apiPort}
              onChange={(e) => handleApiPortChange(e.target.value)}
              className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent"
              placeholder="8080"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDownloadSettings = () => (
    <div className="space-y-6">
      {/* Download Location */}
      <div className="bg-black/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FiDownload className="w-5 h-5 mr-2 text-[#6BE4A8]" />
          Download Location
        </h4>
        <div className="bg-black/20 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Current Location:</p>
          <p className="text-white font-mono text-sm break-all mb-4">
            {customDownloadPath || 'Using default downloads directory'}
          </p>
          <div className="flex space-x-3">
            <button
              onClick={selectDownloadDirectory}
              className="flex items-center px-4 py-2 bg-[#6BE4A8] text-black rounded-lg font-medium hover:bg-[#5ad396] transition-colors"
            >
              <FiFolder className="w-4 h-4 mr-2" />
              Choose Directory
            </button>
            {customDownloadPath && (
              <button
                onClick={resetToDefault}
                className="flex items-center px-4 py-2 bg-black/20 text-white rounded-lg font-medium hover:bg-black/30 transition-colors border border-gray-600"
                title="Reset to default downloads directory"
              >
                <FiRotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-black/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FiWifi className="w-5 h-5 mr-2 text-[#6BE4A8]" />
          Connection Status
        </h4>
        <div className="bg-black/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${connectionStatus === "Found" ? 'bg-[#6BE4A8]' : 'bg-red-500'}`}></div>
              <span className="text-white font-medium">
                {connectionStatus === "Found" ? 'Connected to Codex API' : 'Not connected to Codex API'}
              </span>
            </div>
            <span className="text-sm text-gray-400">Port: {apiPort}</span>
          </div>
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-black/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FiMonitor className="w-5 h-5 mr-2 text-[#6BE4A8]" />
          System Logs
        </h4>
        <div className="bg-black rounded-lg p-4 max-h-96 overflow-y-auto">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
            {codexOutput || 'No logs available'}
          </pre>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case 'general':
        return renderGeneralSettings();
      case 'codex':
        return renderCodexSettings();
      case 'downloads':
        return renderDownloadSettings();
      case 'system':
        return renderSystemSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="w-full h-full flex">
      {/* Left Sidebar - Categories */}
      <div className="w-64 flex-shrink-0 border-r border-gray-800/50">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
          <nav className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors text-left ${
                  activeCategory === category.id
                    ? 'bg-[#6BE4A8] text-black font-medium'
                    : 'text-gray-300 hover:bg-black/20 hover:text-white'
                }`}
              >
                {category.icon}
                <span className="ml-3">{category.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings; 