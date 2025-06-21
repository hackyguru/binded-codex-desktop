import React, { useState } from 'react';
import { FiLoader, FiXCircle, FiAlertTriangle, FiSearch } from 'react-icons/fi';
import { useCidInfo, useCodexConfig, useDownloadLocation } from '../../hooks';
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
  
  const [leechState, setLeechState] = useState<DownloadState>(null);
  const [seedState, setSeedState] = useState<DownloadState>(null);
  const [leechProgress, setLeechProgress] = useState(0);
  const [seedProgress, setSeedProgress] = useState(0);

  // Debug logging
  console.log('Search component - API Port:', apiPort);
  console.log('Search component - CID:', cid);
  console.log('Search component - Error:', error);
  console.log('Search component - isLoading:', isLoading);
  console.log('Search component - fileInfo:', fileInfo);
  console.log('Search component - fileInfo.manifest:', fileInfo?.manifest);

  const downloadWithProgress = async (url: string, filename: string, onProgress: (progress: number) => void) => {
    // Get the configured download path
    const downloadPath = getCurrentDownloadPath();
    const fullPath = `${downloadPath}/${filename}`;
    
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
      
      await downloadWithProgress(url, fileInfo.manifest.filename, setLeechProgress);
      console.log('File downloaded via leech');
      setLeechState('completed');
      setLeechProgress(100);
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
      
      await downloadWithProgress(downloadUrl, fileInfo.manifest.filename, setSeedProgress);
      console.log('File seeded and downloaded');
      setSeedState('completed');
      setSeedProgress(100);
    } catch (e) {
      console.error('Seed operation failed:', e);
      setSeedState('error');
      setSeedProgress(0);
    }
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
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
        <FiLoader className="w-12 h-12 animate-spin mb-4" />
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

    return (
      <div className="w-full h-full flex flex-col">
        <h2 className="text-xl font-bold text-white mb-4">Search Result</h2>
        <div className="flex-1 flex flex-col">
          <FileCard
            fileName={fileInfo.manifest.filename}
            fileType={fileInfo.manifest.mimetype.split('/')[1] || getFileExtension(fileInfo.manifest.filename)}
            fileSize={formatBytes(fileInfo.manifest.datasetSize)}
            progress={currentProgress}
            cid={fileInfo.cid}
            onLeech={handleLeech}
            onSeed={handleSeed}
            leechState={leechState}
            seedState={seedState}
          />
          {seedState === 'completed' && (
            <div className="mt-4 p-4 bg-green-900/50 text-green-300 rounded-lg text-center">
              File successfully seeded to your local node and saved to: {getCurrentDownloadPath()}
            </div>
          )}
          {leechState === 'completed' && (
            <div className="mt-4 p-4 bg-blue-900/50 text-blue-300 rounded-lg text-center">
              File successfully downloaded to: {getCurrentDownloadPath()}
            </div>
          )}
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