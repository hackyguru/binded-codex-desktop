import React, { useState, useEffect } from 'react';
import { FiXCircle, FiAlertTriangle, FiSearch, FiDownload, FiCopy, FiCheck } from 'react-icons/fi';
import { FaSeedling } from 'react-icons/fa';
import { useCidInfo, useCodexConfig, useDownloadLocation, useRecentFiles, useNodeFiles, useCodexConnection } from '../../hooks';
import { LogoSpinner } from '../';
import { formatBytes } from '../../utils/formatBytes';
import { codexApi } from '../../utils/apiClient';

type DownloadState = 'downloading' | 'completed' | 'error' | null;

interface SearchProps {
  cid: string;
}

const Search: React.FC<SearchProps> = ({ cid }) => {
  const { apiPort } = useCodexConfig();
  const { fileInfo, isLoading, error } = useCidInfo(cid, apiPort);
  const { getCurrentDownloadPath } = useDownloadLocation();
  const { addRecentFile } = useRecentFiles();
  const { isConnected } = useCodexConnection(apiPort);
  const { files: nodeFiles } = useNodeFiles(apiPort, isConnected);
  
  const [downloadState, setDownloadState] = useState<DownloadState>(null);
  const [seedState, setSeedState] = useState<DownloadState>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [seedProgress, setSeedProgress] = useState(0);
  const [lastAction, setLastAction] = useState<'seed' | 'stop' | null>(null);
  
  // Check if the current file is already seeded in local node (initial state)
  const initialSeededState = fileInfo ? nodeFiles.some(file => file.cid === fileInfo.cid) : false;
  
  // Local seeding status that updates with user actions
  const [currentSeededState, setCurrentSeededState] = useState<boolean | null>(null);
  
  // Use local state if available, otherwise fall back to initial state
  const isFileSeededInNode = currentSeededState !== null ? currentSeededState : initialSeededState;
  
  // Copy functionality
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});

  const handleCopy = async (text: string, key: string) => {
    console.log('Copy button clicked - attempting to copy:', text);
    try {
      // Check if clipboard API is available
      if (!navigator.clipboard) {
        console.error('Clipboard API not available');
        // Fallback method
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        console.log('Fallback copy method used');
      } else {
        await navigator.clipboard.writeText(text);
        console.log('Successfully copied to clipboard:', text);
      }
      
      setCopiedItems(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Try fallback method
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        console.log('Fallback copy method succeeded');
        setCopiedItems(prev => ({ ...prev, [key]: true }));
        setTimeout(() => {
          setCopiedItems(prev => ({ ...prev, [key]: false }));
        }, 2000);
      } catch (fallbackError) {
        console.error('Fallback copy method also failed:', fallbackError);
      }
    }
  };

  // Copy button component
  const CopyButton: React.FC<{ text: string; copyKey: string }> = ({ text, copyKey }) => (
    <button
      onClick={(e) => {
        console.log('CopyButton onClick triggered for key:', copyKey);
        e.preventDefault();
        e.stopPropagation();
        handleCopy(text, copyKey);
      }}
      className="ml-2 w-6 h-6 clip-path-hexagon bg-black/20 hover:bg-[#6BE4A8]/20 flex items-center justify-center text-gray-400 hover:text-[#6BE4A8] transition-colors focus:outline-none cursor-pointer relative z-10"
      title="Copy to clipboard"
    >
      {copiedItems[copyKey] ? <FiCheck size={12} className="text-[#6BE4A8]" /> : <FiCopy size={12} />}
    </button>
  );

  // Add file to recent files when found and reset seeding state
  useEffect(() => {
    if (fileInfo && fileInfo.manifest) {
      const safeFilename = getSafeFilename(fileInfo.manifest.filename);
      addRecentFile({
        cid: fileInfo.cid,
        fileName: safeFilename,
        fileType: fileInfo.manifest.mimetype.split('/')[1] || getFileExtension(fileInfo.manifest.filename),
        fileSize: formatBytes(fileInfo.manifest.datasetSize),
        source: 'search'
      });
    }
    // Reset local seeding state when file changes
    setCurrentSeededState(null);
  }, [fileInfo]); // Removed addRecentFile from dependencies as it should be stable

  // Update seeding status when seed operations complete
  useEffect(() => {
    if (seedState === 'completed' && lastAction) {
      console.log('Seed operation completed, updating status:', lastAction);
      console.log('Before state update - currentSeededState:', currentSeededState);
      
      if (lastAction === 'stop') {
        console.log('Setting currentSeededState to FALSE');
        setCurrentSeededState(false);
      } else if (lastAction === 'seed') {
        console.log('Setting currentSeededState to TRUE');
        setCurrentSeededState(true);
      }
      
      // Force a small delay to ensure state has updated
      setTimeout(() => {
        console.log('After state update - currentSeededState should be updated');
      }, 100);
    }
  }, [seedState, lastAction]);

  // Debug logging moved to useEffect to prevent infinite loop
  useEffect(() => {
    if (cid) {
      console.log('Search component initialized for CID:', cid);
    }
  }, [cid]);

  const getFileExtension = (filename: string | null) => {
    if (!filename) return 'FILE';
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const getSafeFilename = (filename: string | null) => {
    return filename || 'unnamed';
  };

  const downloadWithProgress = async (url: string, filename: string, setProgress: (progress: number) => void) => {
    // Get the configured download path
    const downloadPath = getCurrentDownloadPath();
    const fullPath = `${downloadPath}/${filename}`;
    
    console.log('Downloading to:', fullPath);
    
    try {
      // Extract the endpoint from the URL for the new API method
      // The url comes in as the full URL, we need to extract the endpoint part
      const urlObj = new URL(url);
      const endpoint = urlObj.pathname.replace('/api/codex/v1', '');
      
      // Use the new codexApi downloadFile method which handles authentication for remote nodes
      await codexApi.downloadFile(endpoint, fullPath, apiPort);
      
      // Set progress to 100% when completed
      setProgress(100);
      
      console.log('File saved to:', fullPath);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  };

  const handleDownload = async () => {
    if (!fileInfo) return;
    setDownloadState('downloading');
    setDownloadProgress(0);
    
    try {
      const url = codexApi.buildUrl(`/data/${fileInfo.cid}/network/stream`, apiPort);
      console.log('Download URL:', url);
      
      const safeFilename = getSafeFilename(fileInfo.manifest.filename);
      await downloadWithProgress(url, safeFilename, setDownloadProgress);
      console.log('File downloaded');
      setDownloadState('completed');
      setDownloadProgress(100);

      // Add to recent files when downloaded
      addRecentFile({
        cid: fileInfo.cid,
        fileName: safeFilename,
        fileType: fileInfo.manifest.mimetype.split('/')[1] || getFileExtension(fileInfo.manifest.filename),
        fileSize: formatBytes(fileInfo.manifest.datasetSize),
        source: 'download'
      });
    } catch (e) {
      console.error('Download failed:', e);
      setDownloadState('error');
      setDownloadProgress(0);
    }
  };

  const handleStopSeeding = async () => {
    if (!fileInfo) return;
    
    setLastAction('stop');
    setSeedState('downloading');
    setSeedProgress(0);
    setCurrentSeededState(false);
    
    try {
      // Remove the file from local node storage using the API client
      console.log('Stop seeding - removing file from local node');
      const deleteResponse = await codexApi.delete(`/data/${fileInfo.cid}`, apiPort);
      
      if (!deleteResponse.ok) {
        throw new Error(`Failed to stop seeding file. Status: ${deleteResponse.status}`);
      }
      
      console.log('File removed from local node');
      setSeedState('completed');
      setSeedProgress(100);
    } catch (e) {
      console.error('Stop seeding failed:', e);
      setSeedState('error');
      setSeedProgress(0);
    }
  };

  const handleSeed = async () => {
    if (!fileInfo) return;
    
    // If file is already seeded, stop seeding instead
    if (isFileSeededInNode) {
      return handleStopSeeding();
    }
    
    setSeedState('downloading');
    setSeedProgress(0);
    setLastAction('seed');
    
    try {
      // Step 1: Seed the file to local node using the API client
      console.log('Seeding file to local node');
      const seedResponse = await codexApi.post(`/data/${fileInfo.cid}/network`, apiPort);
      
      if (!seedResponse.ok) {
        throw new Error(`Failed to seed file to local node. Status: ${seedResponse.status}`);
      }
      
      // Step 2: Download the file from local node to user's computer
      const downloadUrl = codexApi.buildUrl(`/data/${fileInfo.cid}/stream`, apiPort);
      console.log('Download URL:', downloadUrl);
      
      const safeFilename = getSafeFilename(fileInfo.manifest.filename);
      await downloadWithProgress(downloadUrl, safeFilename, setSeedProgress);
      console.log('File seeded and downloaded');
      setSeedState('completed');
      setSeedProgress(100);

      // Add to recent files when downloaded
      addRecentFile({
        cid: fileInfo.cid,
        fileName: safeFilename,
        fileType: fileInfo.manifest.mimetype.split('/')[1] || getFileExtension(fileInfo.manifest.filename),
        fileSize: formatBytes(fileInfo.manifest.datasetSize),
        source: 'download'
      });
    } catch (e) {
      console.error('Seed operation failed:', e);
      setSeedState('error');
      setSeedProgress(0);
    }
  };

  if (!cid) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center text-white">
        <FiSearch className="w-16 h-16 text-gray-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Search for a File</h2>
        <p className="text-gray-400">Enter a CID in the search bar above to begin.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center text-white">
        <LogoSpinner />
        <p className="text-lg">Searching the network for manifest...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center text-white bg-[#2D2D2D] rounded-2xl">
        <FiAlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Search Error</h2>
        <p className="text-gray-400 max-w-sm">{error}</p>
      </div>
    );
  }

  if (fileInfo && fileInfo.manifest) {
    // Determine which progress to show based on active download
    const currentProgress = downloadState === 'downloading' ? downloadProgress : 
                           seedState === 'downloading' ? seedProgress : 0;

    const safeFilename = getSafeFilename(fileInfo.manifest.filename);
    const fileExtension = getFileExtension(fileInfo.manifest.filename);

    return (
      <div className="w-full h-full flex flex-col p-4">
        {/* Header Section - Compact */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">File Found</h2>
            <p className="text-sm text-gray-400">Content discovered on the Codex network</p>
          </div>
          <div className="w-10 h-10 bg-[#6BE4A8]/20 rounded-lg flex items-center justify-center">
            <span className="text-[#6BE4A8] font-bold text-xs">{fileExtension}</span>
          </div>
        </div>

        {/* Main Content - Single Row Layout */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Section - File Info */}
          <div className="flex-1 bg-black/20 rounded-xl p-4 flex flex-col">
            {/* File Header - Compact */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-[#6BE4A8]/60 rounded-lg flex items-center justify-center">
                <div className="w-12 h-12 bg-[#6BE4A8] rounded-md flex items-center justify-center">
                  <span className="text-black font-bold text-xs">{fileExtension}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white mb-1 truncate">{safeFilename}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="font-medium">{formatBytes(fileInfo.manifest.datasetSize)}</span>
                  <span>•</span>
                  <span className="truncate">{fileInfo.manifest.mimetype}</span>
                </div>
              </div>
            </div>

            {/* CID Section - Compact */}
            <div className="bg-[#1E1E1E] rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500">Content Identifier (CID)</p>
                <CopyButton text={fileInfo.cid} copyKey="cid" />
              </div>
              <p className="text-white font-mono text-xs break-all">{fileInfo.cid}</p>
            </div>

            {/* Warning Message */}
            <div className="mb-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <FiAlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-amber-300 text-xs font-medium mb-1">Warning</p>
                  <p className="text-amber-200 text-xs leading-relaxed">
                    Codex aims to be a censorship resistant storage network which makes content on Codex unmoderated. 
                    Please download files at your own risk as agreed on the terms and conditions.
                  </p>
                </div>
              </div>
            </div>

            {/* Download Progress */}
            {(downloadState === 'downloading' || seedState === 'downloading') && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-medium">
                    {downloadState === 'downloading' ? 'Downloading' : 'Seeding'} Progress
                  </span>
                  <span className="text-[#6BE4A8] font-bold text-sm">{Math.round(currentProgress)}%</span>
                </div>
                <div className="w-full bg-[#1E1E1E] rounded-full h-1.5">
                  <div 
                    className="bg-[#6BE4A8] h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${currentProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Success Message - Above Buttons */}
            {(seedState === 'completed' || downloadState === 'completed') && (
              <div className={`mb-3 p-2 rounded-lg ${
                seedState === 'completed' && lastAction === 'stop'
                  ? 'bg-red-900/10 border border-red-500/30'
                  : 'bg-[#6BE4A8]/10 border border-[#6BE4A8]/30'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    seedState === 'completed' && lastAction === 'stop'
                      ? 'bg-red-900/20'
                      : 'bg-[#6BE4A8]/20'
                  }`}>
                    {seedState === 'completed' ? (
                      lastAction === 'stop' ? (
                        <FiXCircle className="w-3 h-3 text-red-400" />
                      ) : (
                        <FaSeedling className="w-3 h-3 text-[#6BE4A8]" />
                      )
                    ) : (
                      <FiDownload className="w-3 h-3 text-[#6BE4A8]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <FiCheck className={`w-3 h-3 ${
                        seedState === 'completed' && lastAction === 'stop' ? 'text-red-400' : 'text-[#6BE4A8]'
                      }`} />
                      {seedState === 'completed' && lastAction === 'stop' ? (
                        <p className="font-medium text-xs text-red-400">
                          Stopped Seeding - File removed from local node
                        </p>
                      ) : (
                        <>
                          <p className={`font-medium text-xs ${
                            seedState === 'completed' && lastAction === 'stop' ? 'text-red-400' : 'text-[#6BE4A8]'
                          }`}>
                            {seedState === 'completed' ? 'Seeded & Downloaded' : 'Downloaded'}
                          </p>
                          <span className="text-xs text-gray-400">to</span>
                          <span className="font-mono text-[#6BE4A8] text-xs truncate max-w-[120px]" title={getCurrentDownloadPath()}>
                            {getCurrentDownloadPath().split('/').pop()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons - Compact */}
            <div className="flex items-center gap-3 mt-auto">
              <button
                onClick={handleDownload}
                disabled={downloadState === 'downloading' || seedState === 'downloading'}
                className={`flex items-center justify-center gap-2 font-bold py-2.5 px-6 rounded-lg transition-all duration-300 flex-1 ${
                  downloadState === 'completed' 
                    ? 'bg-[#6BE4A8]/20 border border-[#6BE4A8] text-[#6BE4A8] cursor-default'
                    : downloadState === 'downloading'
                    ? 'bg-[#6BE4A8]/50 text-black cursor-not-allowed'
                    : 'bg-[#6BE4A8] text-black hover:bg-[#6BE4A8]/90 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {downloadState === 'completed' ? (
                  <>
                    <FiCheck className="w-4 h-4" />
                    <span className="text-sm">DOWNLOADED</span>
                  </>
                ) : downloadState === 'downloading' ? (
                  <>
                    <LogoSpinner />
                    <span className="text-sm">DOWNLOADING...</span>
                  </>
                ) : (
                  <>
                    <FiDownload className="w-4 h-4" />
                    <span className="text-sm">DOWNLOAD</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleSeed}
                disabled={downloadState === 'downloading' || seedState === 'downloading'}
                className={`flex items-center justify-center gap-2 font-bold py-2.5 px-6 rounded-lg transition-all duration-300 flex-1 ${
                  seedState === 'completed'
                    ? lastAction === 'stop' 
                      ? 'bg-red-900/20 border border-red-500 text-red-400 cursor-default'
                      : 'bg-[#6BE4A8]/20 border border-[#6BE4A8] text-[#6BE4A8] cursor-default'
                    : seedState === 'downloading'
                    ? 'bg-[#6BE4A8]/20 border border-[#6BE4A8]/50 text-[#6BE4A8]/50 cursor-not-allowed'
                    : isFileSeededInNode
                    ? 'bg-red-900/20 border border-red-500 text-red-400 hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed'
                    : 'bg-black/20 border border-[#6BE4A8] text-[#6BE4A8] hover:bg-[#6BE4A8]/10 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {seedState === 'completed' ? (
                  <>
                    <FiCheck className="w-4 h-4" />
                    <span className="text-sm">{lastAction === 'stop' ? 'STOPPED' : 'SEEDED'}</span>
                  </>
                ) : seedState === 'downloading' ? (
                  <>
                    <LogoSpinner />
                    <span className="text-sm">{isFileSeededInNode ? 'STOPPING...' : 'SEEDING...'}</span>
                  </>
                ) : isFileSeededInNode ? (
                  <>
                    <FiXCircle className="w-4 h-4" />
                    <span className="text-sm">STOP SEEDING</span>
                  </>
                ) : (
                  <>
                    <FaSeedling className="w-4 h-4" />
                    <span className="text-sm">SEED FILE</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Section - Details Cards */}
          <div className="w-80 flex flex-col gap-3">
            {/* File Information Card - Compact */}
            <div className="bg-black/20 rounded-xl p-4">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                <FiAlertTriangle className="w-4 h-4 text-[#6BE4A8]" />
                File Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Filename</span>
                  <span className="text-white text-xs font-medium truncate ml-2 max-w-[150px]">{safeFilename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Size</span>
                  <span className="text-white text-xs font-medium">{formatBytes(fileInfo.manifest.datasetSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Type</span>
                  <span className="text-white text-xs font-medium truncate ml-2 max-w-[150px]">{fileInfo.manifest.mimetype}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Extension</span>
                  <span className="text-white text-xs font-medium">.{fileExtension.toLowerCase()}</span>
                </div>
              </div>
            </div>

            {/* Download Location Card - Compact */}
            <div className="bg-black/20 rounded-xl p-4">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                <FiSearch className="w-4 h-4 text-[#6BE4A8]" />
                Download Location
              </h4>
              <div className="bg-[#1E1E1E] rounded-lg p-2">
                <p className="text-white font-mono text-xs break-all">{getCurrentDownloadPath()}</p>
              </div>
            </div>

            {/* Network Information Card - Compact */}
            <div className="bg-black/20 rounded-xl p-4">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                <FiAlertTriangle className="w-4 h-4 text-[#6BE4A8]" />
                Network Info
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">API Port</span>
                  <span className="text-white text-xs font-medium">{apiPort}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Status</span>
                  <span className="text-[#6BE4A8] text-xs font-medium">Connected</span>
                </div>
              </div>
            </div>

            {/* Seeding Status Card - Compact */}
            <div className="bg-black/20 rounded-xl p-4">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm">
                <FaSeedling className="w-4 h-4 text-[#6BE4A8]" />
                Seeding Status
              </h4>
              <div className="space-y-2">
                <p className={`text-xs font-medium ${isFileSeededInNode ? 'text-[#6BE4A8]' : 'text-gray-400'}`}>
                  {isFileSeededInNode 
                    ? 'Your file is being seeded to the Codex network'
                    : 'Your file is not being seeded to the Codex network'
                  }
                </p>
                <p className="text-gray-500 text-xs mt-3">
                  Not sure what that means? Find{' '}
                  <a href="#" className="text-[#6BE4A8] hover:text-[#6BE4A8]/80 underline">
                    here
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center text-white">
      <FiSearch className="w-16 h-16 text-gray-500 mb-4" />
      <p className="text-gray-400">No file found for the provided CID.</p>
    </div>
  );
};

export default Search; 