import React, { useState } from 'react';
import { FiFolder, FiRotateCcw, FiSettings, FiDownload, FiServer, FiPlay } from 'react-icons/fi';
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
  { id: 'system', name: 'System', icon: <FiPlay className="w-5 h-5" /> },
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
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-white">General Settings</h2>
        <p className="text-gray-400 text-sm mt-1">Configure your application preferences</p>
      </div>

      {/* Auto-start Codex Section */}
      <div className="bg-[#151515] rounded-xl p-6">
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
  );

  const renderCodexSettings = () => (
    <div className="space-y-6">
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-white">Codex Node Configuration</h2>
        <p className="text-gray-400 text-sm mt-1">Configure your Codex node settings</p>
      </div>

      {/* Data Directory */}
      <div className="bg-[#151515] rounded-xl p-6">
        <h3 className="text-base font-medium text-white mb-4">Data Directory</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-800/30 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Current Directory:</p>
            <p className="text-white font-mono text-sm break-all">
              {dataDirectory || 'No directory selected'}
            </p>
          </div>
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
                className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Change Directory
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Port Configuration */}
      <div className="bg-[#151515] rounded-xl p-6">
        <h3 className="text-base font-medium text-white mb-4">Port Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Discovery Port</label>
            <input
              type="text"
              value={discoveryPort}
              onChange={(e) => handleDiscoveryPortChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent"
              placeholder="8090"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Listening Port</label>
            <input
              type="text"
              value={listeningPort}
              onChange={(e) => handleListeningPortChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent"
              placeholder="8070"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">API Port</label>
            <input
              type="text"
              value={apiPort}
              onChange={(e) => handleApiPortChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent"
              placeholder="8080"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDownloadSettings = () => (
    <div className="space-y-6">
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-white">Download Settings</h2>
        <p className="text-gray-400 text-sm mt-1">Configure where files are downloaded</p>
      </div>

      {/* Download Location */}
      <div className="bg-[#151515] rounded-xl p-6">
        <h3 className="text-base font-medium text-white mb-4">Download Location</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-800/30 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Current Location:</p>
            <p className="text-white font-mono text-sm break-all">
              {customDownloadPath || 'Using default downloads directory'}
            </p>
          </div>
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
                className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
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
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-white">System Information</h2>
        <p className="text-gray-400 text-sm mt-1">View system status and logs</p>
      </div>

      {/* Connection Status */}
      <div className="bg-[#151515] rounded-xl p-6">
        <h3 className="text-base font-medium text-white mb-4">Connection Status</h3>
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${connectionStatus === "Found" ? 'bg-[#6BE4A8]' : 'bg-red-500'}`}></div>
            <span className="text-white font-medium">
              {connectionStatus === "Found" ? 'Connected to Codex API' : 'Not connected to Codex API'}
            </span>
          </div>
          <span className="text-sm text-gray-400">Port: {apiPort}</span>
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-[#151515] rounded-xl p-6">
        <h3 className="text-base font-medium text-white mb-4">System Logs</h3>
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
      <div className="w-64 flex-shrink-0 border-r border-gray-700">
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
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
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