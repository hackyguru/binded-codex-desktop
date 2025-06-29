import React, { useState } from 'react';
import { FiFolder, FiRotateCcw, FiSettings, FiDownload, FiServer, FiWifi, FiGlobe, FiTrash2, FiX } from 'react-icons/fi';
import { useCodexConfig } from '../../../hooks/useCodexConfig';
import { useDownloadLocation } from '../../../hooks/useDownloadLocation';
import { useNodeConfig } from '../../../hooks/useNodeConfig';
import { SettingsProps, SettingsCategory } from './types';
import { STORAGE_PRESETS, CLEAR_DATA_ITEMS, MODAL_CLEAR_DATA_ITEMS } from './constants';
import { isPresetSelected, isCustomValue } from './utils';
import { useClearDataModal, useKillCodexModal } from './hooks';
import SettingsSidebar from './SettingsSidebar';
import ConfirmationModal from './ConfirmationModal';

const Settings: React.FC<SettingsProps> = ({ connectionStatus, onKillCodex }) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');

  // Custom hooks for modal management
  const clearDataModal = useClearDataModal();
  const killCodexModal = useKillCodexModal(onKillCodex);

  // External hooks
  const {
    dataDirectory,
    isDirectorySet,
    discoveryPort,
    listeningPort,
    apiPort,
    autoStartCodex,
    storageQuota,
    handleSelectDirectory,
    handleChangeDirectory,
    handleDiscoveryPortChange,
    handleListeningPortChange,
    handleApiPortChange,
    handleAutoStartCodexChange,
    handleStorageQuotaChange
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

  // Derived state
  const isConnected = connectionStatus === "Found";
  const isCodexRunning = isConnected;

  const renderGeneralSettings = () => (
    <div className="space-y-4">
      <div className="bg-black/20 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
          <FiSettings className="w-4 h-4 mr-2 text-[#6BE4A8]" />
          General Settings
        </h4>
        <div className="bg-black/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex-grow">
              <h3 className="text-sm font-medium text-white">Auto-start Codex</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Automatically start Codex when the application opens
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
              <input
                type="checkbox"
                checked={autoStartCodex}
                onChange={(e) => handleAutoStartCodexChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#6BE4A8]/50 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6BE4A8]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStoragePresets = () => (
    <div className="grid grid-cols-4 gap-1.5 mb-3">
      {STORAGE_PRESETS.map((preset) => (
        <button
          key={preset.value}
          onClick={() => handleStorageQuotaChange(preset.value.toString())}
          className={`px-2 py-1.5 text-xs font-medium rounded border transition-all duration-200 whitespace-nowrap ${
            isPresetSelected(preset.value, storageQuota)
              ? 'bg-gradient-to-r from-[#6BE4A8] to-[#5DD49A] text-black border-[#6BE4A8] font-medium shadow-md'
              : 'bg-black/20 text-white border-gray-600 hover:bg-black/30 hover:border-[#6BE4A8]/50'
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );

  const renderCodexSettings = () => (
    <div className="space-y-4">
      {/* Node Type Selection */}
      <div className="bg-black/20 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
          <FiGlobe className="w-4 h-4 mr-2 text-[#6BE4A8]" />
          Node Configuration
        </h4>
        <div className="bg-black/20 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-3">Choose how to connect to Codex:</p>
          <div className="space-y-2">
            <label className="flex items-start space-x-3 cursor-pointer p-2 rounded-lg hover:bg-black/20 transition-colors">
              <input
                type="radio"
                name="nodeType"
                value="local"
                checked={nodeType === 'local'}
                onChange={() => handleNodeTypeChange('local')}
                className="w-4 h-4 mt-0.5 text-[#6BE4A8] bg-black/20 border-gray-600 focus:ring-[#6BE4A8] focus:ring-2 accent-[#6BE4A8]"
              />
              <div>
                <span className="text-white font-medium text-sm">Local Node</span>
                <p className="text-xs text-gray-400 mt-0.5">Use the local Codex binary running on this machine</p>
              </div>
            </label>
            <label className="flex items-start space-x-3 cursor-pointer p-2 rounded-lg hover:bg-black/20 transition-colors">
              <input
                type="radio"
                name="nodeType"
                value="remote"
                checked={nodeType === 'remote'}
                onChange={() => handleNodeTypeChange('remote')}
                className="w-4 h-4 mt-0.5 text-[#6BE4A8] bg-black/20 border-gray-600 focus:ring-[#6BE4A8] focus:ring-2 accent-[#6BE4A8]"
              />
              <div>
                <span className="text-white font-medium text-sm">Remote Node</span>
                <p className="text-xs text-gray-400 mt-0.5">Connect to a remote Codex API endpoint</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Remote Node Configuration */}
      {nodeType === 'remote' && (
        <div className="bg-black/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
            <FiServer className="w-4 h-4 mr-2 text-[#6BE4A8]" />
            Remote Node Settings
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Endpoint URL
              </label>
              <input
                type="url"
                value={remoteConfig.endpoint}
                onChange={(e) => handleRemoteConfigChange({ endpoint: e.target.value })}
                className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent transition-all duration-200"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={remoteConfig.username}
                  onChange={(e) => handleRemoteConfigChange({ username: e.target.value })}
                  className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent transition-all duration-200"
                  placeholder="codex"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={remoteConfig.password}
                  onChange={(e) => handleRemoteConfigChange({ password: e.target.value })}
                  className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent transition-all duration-200"
                  placeholder="••••••••••••••••••••••••••"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                {isRemoteConfigValid() ? (
                  <div className="flex items-center text-[#6BE4A8]">
                    <div className="w-2 h-2 rounded-full bg-[#6BE4A8] mr-2"></div>
                    <span className="text-xs">Configuration valid</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-400">
                    <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                    <span className="text-xs">Please fill all fields</span>
                  </div>
                )}
              </div>
              <button
                onClick={clearRemoteConfig}
                className="px-3 py-1.5 text-xs bg-black/20 text-white rounded-lg font-medium hover:bg-black/30 transition-colors border border-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Local Node Configuration */}
      {nodeType === 'local' && (
        <>
          {/* Data Directory */}
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
              <FiFolder className="w-4 h-4 mr-2 text-[#6BE4A8]" />
              Data Directory
            </h4>
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-2">Current Directory:</p>
              <div className="bg-black/30 p-2.5 rounded border border-gray-600/50 mb-3">
                <p className="text-white font-mono text-xs break-all">
                  {dataDirectory || 'No directory selected'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectDirectory}
                  className="px-3 py-2 bg-[#6BE4A8] text-black rounded-lg text-sm font-medium hover:bg-[#5ad396] transition-colors"
                >
                  Select Directory
                </button>
                {isDirectorySet && (
                  <button
                    onClick={handleChangeDirectory}
                    className="px-3 py-2 bg-black/20 text-white rounded-lg text-sm font-medium hover:bg-black/30 transition-colors border border-gray-600"
                  >
                    Change Directory
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Port Configuration */}
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
              <FiWifi className="w-4 h-4 mr-2 text-[#6BE4A8]" />
              Port Configuration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Discovery Port</label>
                <input
                  type="text"
                  value={discoveryPort}
                  onChange={(e) => handleDiscoveryPortChange(e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent transition-all duration-200"
                  placeholder="8090"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Listening Port</label>
                <input
                  type="text"
                  value={listeningPort}
                  onChange={(e) => handleListeningPortChange(e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent transition-all duration-200"
                  placeholder="8070"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">API Port</label>
                <input
                  type="text"
                  value={apiPort}
                  onChange={(e) => handleApiPortChange(e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent transition-all duration-200"
                  placeholder="8080"
                />
              </div>
            </div>
          </div>

          {/* Storage Configuration */}
          <div className="bg-black/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
              <FiServer className="w-4 h-4 mr-2 text-[#6BE4A8]" />
              Storage Configuration
            </h4>
            <div className="bg-black/20 rounded-lg p-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Storage Quota (bytes)
                </label>
                <input
                  type="text"
                  value={storageQuota}
                  onChange={(e) => handleStorageQuotaChange(e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent transition-all duration-200"
                  placeholder="11811160064"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Maximum storage space for Codex data
                </p>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-300 mb-2">Quick Select:</p>
                {renderStoragePresets()}
                {isCustomValue(storageQuota) && (
                  <div className="text-xs text-[#6BE4A8] mt-1">
                    ✓ Custom value selected
                  </div>
                )}
              </div>
              {isCodexRunning && (
                <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-600/30 rounded-lg flex items-center justify-between">
                  <p className="text-xs text-yellow-300">
                    <strong>Note:</strong> Changes will take effect after restarting Codex
                  </p>
                  <button
                    onClick={killCodexModal.handleOpenModal}
                    className="px-2 py-1 bg-[#6BE4A8] text-black rounded text-xs font-medium hover:bg-[#5ad396] transition-colors whitespace-nowrap ml-2"
                  >
                    Restart Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderDownloadSettings = () => (
    <div className="space-y-4">
      <div className="bg-black/20 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
          <FiDownload className="w-4 h-4 mr-2 text-[#6BE4A8]" />
          Download Location
        </h4>
        <div className="bg-black/20 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-2">Current Location:</p>
          <div className="bg-black/30 p-2.5 rounded border border-gray-600/50 mb-3">
            <p className="text-white font-mono text-xs break-all">
              {customDownloadPath || 'Using default downloads directory'}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={selectDownloadDirectory}
              className="flex items-center px-3 py-2 bg-[#6BE4A8] text-black rounded-lg text-sm font-medium hover:bg-[#5ad396] transition-colors"
            >
              <FiFolder className="w-4 h-4 mr-2" />
              Choose Directory
            </button>
            {customDownloadPath && (
              <button
                onClick={resetToDefault}
                className="flex items-center px-3 py-2 bg-black/20 text-white rounded-lg text-sm font-medium hover:bg-black/30 transition-colors border border-gray-600"
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
    <div className="space-y-4">
      <div className="bg-black/20 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
          <FiDownload className="w-4 h-4 mr-2 text-[#6BE4A8]" />
          Download Location
        </h4>
        <div className="bg-black/20 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-2">Current Directory:</p>
          <div className="bg-black/30 p-2.5 rounded border border-gray-600/50 mb-3">
            <p className="text-white font-mono text-xs break-all">
              {customDownloadPath || 'Using default downloads directory'}
            </p>
          </div>
          <button
            onClick={selectDownloadDirectory}
            className="px-3 py-2 bg-[#6BE4A8] text-black rounded-lg text-sm font-medium hover:bg-[#5ad396] transition-colors"
          >
            Change Directory
          </button>
        </div>
      </div>

      <div className="bg-black/20 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
          <FiTrash2 className="w-4 h-4 mr-2 text-red-400" />
          App Data Management
        </h4>
        <div className="bg-black/20 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-3">
            This will delete all application data and preferences, returning the app to its initial state.
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-300">
            {CLEAR_DATA_ITEMS.map((item, index) => (
              <div key={index}>• {item}</div>
            ))}
          </div>
          {isCodexRunning && (
            <div className="mb-3 p-2 bg-yellow-900/30 border border-yellow-600/30 rounded-lg">
              <p className="text-xs text-yellow-300">
                <strong>Warning:</strong> Codex is currently running. It's recommended to stop it before clearing data.
              </p>
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={clearDataModal.handleOpenModal}
              className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Clear All Data</span>
            </button>
          </div>
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
      <SettingsSidebar 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-1">
          {renderContent()}
        </div>
      </div>

      <ConfirmationModal
        isOpen={clearDataModal.showClearDataModal}
        title="Clear App Data"
        description="Are you sure you want to clear all app data and preferences?"
        warningMessage="This action cannot be undone. The app will restart after clearing data."
        confirmationText={clearDataModal.confirmationText}
        onConfirmationTextChange={clearDataModal.setConfirmationText}
        onConfirm={clearDataModal.handleConfirmClearData}
        onCancel={clearDataModal.handleCloseModal}
        confirmButtonText="Clear All Data"
        icon={<FiTrash2 className="w-6 h-6" />}
        destructiveItems={MODAL_CLEAR_DATA_ITEMS}
      />

      <ConfirmationModal
        isOpen={killCodexModal.showKillCodexModal}
        title="Kill Codex Processes"
        description="This will forcefully terminate all running Codex processes. Any ongoing operations will be interrupted."
        warningMessage="This action will stop all Codex network activity immediately."
        confirmationText={killCodexModal.killCodexConfirmationText}
        onConfirmationTextChange={killCodexModal.setKillCodexConfirmationText}
        onConfirm={killCodexModal.handleConfirmKillCodex}
        onCancel={killCodexModal.handleCloseModal}
        confirmButtonText="Kill Processes"
        icon={<FiX className="w-6 h-6" />}
      />
    </div>
  );
};

export default Settings; 