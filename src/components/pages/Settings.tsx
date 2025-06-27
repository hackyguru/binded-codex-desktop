import React, { useState } from 'react';
import { FiFolder, FiRotateCcw, FiSettings, FiDownload, FiServer, FiWifi, FiMonitor, FiGlobe, FiX } from 'react-icons/fi';
import { useCodexConfig } from '../../hooks/useCodexConfig';
import { useDownloadLocation } from '../../hooks/useDownloadLocation';
import { useNodeConfig } from '../../hooks/useNodeConfig';

interface SettingsProps {
  connectionStatus?: string;
  codexOutput?: string;
  onKillCodex?: () => void;
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

const Settings: React.FC<SettingsProps> = ({ connectionStatus, codexOutput, onKillCodex }) => {
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

  const {
    nodeType,
    remoteConfig,
    handleNodeTypeChange,
    handleRemoteConfigChange,
    clearRemoteConfig,
    isRemoteConfigValid
  } = useNodeConfig();

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
      {/* Node Type Selection */}
      <div className="bg-black/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FiGlobe className="w-5 h-5 mr-2 text-[#6BE4A8]" />
          Node Configuration
        </h4>
        <div className="bg-black/20 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-4">Choose how to connect to Codex:</p>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="nodeType"
                value="local"
                checked={nodeType === 'local'}
                onChange={() => handleNodeTypeChange('local')}
                className="w-4 h-4 text-[#6BE4A8] bg-black/20 border-gray-600 focus:ring-[#6BE4A8] focus:ring-2 accent-[#6BE4A8]"
              />
              <div>
                <span className="text-white font-medium">Local Node</span>
                <p className="text-sm text-gray-400">Use the local Codex binary running on this machine</p>
              </div>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="nodeType"
                value="remote"
                checked={nodeType === 'remote'}
                onChange={() => handleNodeTypeChange('remote')}
                className="w-4 h-4 text-[#6BE4A8] bg-black/20 border-gray-600 focus:ring-[#6BE4A8] focus:ring-2 accent-[#6BE4A8]"
              />
              <div>
                <span className="text-white font-medium">Remote Node</span>
                <p className="text-sm text-gray-400">Connect to a remote Codex API endpoint</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Remote Node Configuration */}
      {nodeType === 'remote' && (
        <div className="bg-black/20 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FiServer className="w-5 h-5 mr-2 text-[#6BE4A8]" />
            Remote Node Settings
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Endpoint URL
              </label>
              <input
                type="url"
                value={remoteConfig.endpoint}
                onChange={(e) => handleRemoteConfigChange({ endpoint: e.target.value })}
                className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent"
                placeholder="https://api.demo.codex.storage/fileshareapp/"
              />
              <p className="text-xs text-gray-400 mt-1">
                Full URL to the remote Codex API endpoint
              </p>
              <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-600/30 rounded-lg">
                <p className="text-xs text-yellow-300">
                  <strong>Note:</strong> Remote servers must be configured with CORS headers to allow web browser access. 
                  If you encounter connection issues, contact the server administrator or use a local node instead.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={remoteConfig.username}
                  onChange={(e) => handleRemoteConfigChange({ username: e.target.value })}
                  className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent"
                  placeholder="codex"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={remoteConfig.password}
                  onChange={(e) => handleRemoteConfigChange({ password: e.target.value })}
                  className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent"
                  placeholder="••••••••••••••••••••••••••"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isRemoteConfigValid() ? (
                  <div className="flex items-center text-[#6BE4A8]">
                    <div className="w-2 h-2 rounded-full bg-[#6BE4A8] mr-2"></div>
                    <span className="text-sm">Configuration valid</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-400">
                    <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                    <span className="text-sm">Please fill all fields</span>
                  </div>
                )}
              </div>
              <button
                onClick={clearRemoteConfig}
                className="px-3 py-1 text-sm bg-black/20 text-white rounded-lg font-medium hover:bg-black/30 transition-colors border border-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Local Node Configuration - only show if local node is selected */}
      {nodeType === 'local' && (
        <>
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
        </>
      )}
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

      {/* Process Control */}
      <div className="bg-black/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FiServer className="w-5 h-5 mr-2 text-[#6BE4A8]" />
          Process Control
        </h4>
        <div className="bg-black/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-grow">
              <h3 className="text-base font-medium text-white">Kill Codex Processes</h3>
              <p className="text-sm text-gray-400 mt-1">
                Force stop all processes when the app becomes unresponsive
              </p>
            </div>
            <div className="flex items-center ml-4">
              <button
                onClick={onKillCodex}
                disabled={!onKillCodex}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                <FiX className="w-4 h-4 mr-2" />
                Kill Processes
              </button>
            </div>
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
    <div className="w-full h-full flex gap-6">
      {/* Left Sidebar - Categories */}
      <div className="w-64 flex-shrink-0 h-full">
        <div className="bg-black/20 rounded-xl p-6 h-full">
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