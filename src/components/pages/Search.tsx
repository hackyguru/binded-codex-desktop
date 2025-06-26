import React, { useState, useEffect } from 'react';
import { FiXCircle, FiAlertTriangle, FiSearch } from 'react-icons/fi';
import { useCidInfo, useCodexConfig, useDownloadLocation, useRecentFiles } from '../../hooks';
import FileCard from '../FileCard';
import { formatBytes } from '../../utils/formatBytes';
import { save } from '@tauri-apps/plugin-dialog';
import { download } from '@tauri-apps/plugin-upload';

type DownloadState = 'downloading' | 'completed' | 'error' | null;

interface SearchProps {
  cid: string;
}

const Search: React.FC<SearchProps> = ({ cid }) => {
  const { apiPort } = useCodexConfig();
  const { fileInfo, isLoading, error } = useCidInfo(cid, apiPort);
  const { getCurrentDownloadPath } = useDownloadLocation();
  const { addRecentFile } = useRecentFiles();
  
  const [leechState, setLeechState] = useState<DownloadState>(null);
  const [seedState, setSeedState] = useState<DownloadState>(null);
  const [leechProgress, setLeechProgress] = useState(0);
  const [seedProgress, setSeedProgress] = useState(0);

  // Add file to recent files when found
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
  }, [fileInfo, addRecentFile]);

  // Debug logging
  console.log('Search component - API Port:', apiPort);
  console.log('Search component - CID:', cid);
  console.log('Search component - Error:', error);
  console.log('Search component - isLoading:', isLoading);
  console.log('Search component - fileInfo:', fileInfo);
  console.log('Search component - fileInfo.manifest:', fileInfo?.manifest);

  const getFileExtension = (filename: string | null) => {
    if (!filename) return 'FILE';
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const getSafeFilename = (filename: string | null) => {
    return filename || 'unnamed';
  };

  const downloadWithProgress = async (url: string, filename: string, onProgress: (progress: number) => void) => {
    // Get the configured download path
    const downloadPath = getCurrentDownloadPath();
    const safeFilename = getSafeFilename(filename);
    const fullPath = `${downloadPath}/${safeFilename}`;
    
    console.log('Downloading to:', fullPath);
    
    // Start with 0% progress
    onProgress(0);
    
    // Simulate progress while downloading
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      if (currentProgress < 90) {
        currentProgress += Math.random() * 10; // Increment by 0-10%
        onProgress(Math.min(currentProgress, 90));
      }
    }, 200); // Update every 200ms
    
    try {
      // Use Tauri download plugin with the original URL and full path
      await download(url, fullPath);
      
      // Clear the interval and set to 100%
      clearInterval(progressInterval);
      onProgress(100);
      
      console.log('File saved to:', fullPath);
    } catch (error) {
      // Clear the interval on error
      clearInterval(progressInterval);
      onProgress(0);
      throw error;
    }
  };

  const handleLeech = async () => {
    if (!fileInfo) return;
    setLeechState('downloading');
    setLeechProgress(0);
    
    try {
      const url = `http://localhost:${apiPort}/api/codex/v1/data/${fileInfo.cid}/network/stream`;
      console.log('Leech URL:', url);
      
      const safeFilename = getSafeFilename(fileInfo.manifest.filename);
      await downloadWithProgress(url, safeFilename, setLeechProgress);
      console.log('File downloaded via leech');
      setLeechState('completed');
      setLeechProgress(100);

      // Add to recent files when downloaded
      addRecentFile({
        cid: fileInfo.cid,
        fileName: safeFilename,
        fileType: fileInfo.manifest.mimetype.split('/')[1] || getFileExtension(fileInfo.manifest.filename),
        fileSize: formatBytes(fileInfo.manifest.datasetSize),
        source: 'download'
      });
    } catch (e) {
      console.error('Leech download failed:', e);
      setLeechState('error');
      setLeechProgress(0);
    }
  };

  const handleSeed = async () => {
    if (!fileInfo) return;
    setSeedState('downloading');
    setSeedProgress(0);
    
    try {
      // Step 1: Seed the file to local node
      const seedUrl = `http://localhost:${apiPort}/api/codex/v1/data/${fileInfo.cid}/network`;
      console.log('Seed URL:', seedUrl);
      const seedResponse = await fetch(seedUrl, {
        method: 'POST',
      });
      
      if (!seedResponse.ok) {
        throw new Error(`Failed to seed file to local node. Status: ${seedResponse.status}`);
      }
      
      // Step 2: Download the file from local node to user's computer
      const downloadUrl = `http://localhost:${apiPort}/api/codex/v1/data/${fileInfo.cid}/stream`;
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
        <img
          src="src/assets/logo.png"
          alt="Loading"
          className="w-12 h-12 animate-pulse mb-4"
        />
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
    const currentProgress = leechState === 'downloading' ? leechProgress : 
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
              <p className="text-xs text-gray-500 mb-1">Content Identifier (CID)</p>
              <p className="text-white font-mono text-xs break-all">{fileInfo.cid}</p>
            </div>

            {/* Download Progress */}
            {(leechState === 'downloading' || seedState === 'downloading') && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-medium">
                    {leechState === 'downloading' ? 'Leeching' : 'Seeding'} Progress
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

            {/* Action Buttons - Compact */}
            <div className="flex items-center gap-3 mt-auto">
              <button
                onClick={handleLeech}
                disabled={leechState === 'downloading' || seedState === 'downloading'}
                className="flex items-center justify-center gap-2 bg-[#6BE4A8] text-black font-bold py-2.5 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#6BE4A8]/90 transition-colors flex-1"
              >
                {leechState === 'downloading' ? (
                  <img src="src/assets/logo.png" alt="Loading" className="w-4 h-4 animate-pulse" />
                ) : (
                  <FiSearch className="w-4 h-4" />
                )}
                <span className="text-sm">{leechState === 'downloading' ? 'LEECHING...' : 'LEECH'}</span>
              </button>
              
              <button
                onClick={handleSeed}
                disabled={leechState === 'downloading' || seedState === 'downloading'}
                className="flex items-center justify-center gap-2 bg-black/20 border border-[#6BE4A8] text-[#6BE4A8] font-bold py-2.5 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#6BE4A8]/10 transition-colors flex-1"
              >
                {seedState === 'downloading' ? (
                  <img src="src/assets/logo.png" alt="Loading" className="w-4 h-4 animate-pulse" />
                ) : (
                  <FiAlertTriangle className="w-4 h-4" />
                )}
                <span className="text-sm">{seedState === 'downloading' ? 'SEEDING...' : 'SEED'}</span>
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
          </div>
        </div>

        {/* Success Messages - Compact */}
        {(seedState === 'completed' || leechState === 'completed') && (
          <div className="mt-4 p-3 bg-green-900/30 border border-green-500/30 text-green-300 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <FiSearch className="w-3 h-3 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {seedState === 'completed' ? 'File Successfully Seeded' : 'File Successfully Downloaded'}
                </p>
                <p className="text-xs text-green-400">Saved to: {getCurrentDownloadPath()}</p>
              </div>
            </div>
          </div>
        )}
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