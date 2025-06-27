import React, { useState } from 'react';
import { FiRotateCcw, FiDownload, FiDatabase } from 'react-icons/fi';
import { AiOutlineNodeIndex } from 'react-icons/ai';
import { motion, AnimatePresence } from 'framer-motion';
import { useNodeFiles } from '../../hooks/useNodeFiles';
import { useCodexConfig } from '../../hooks/useCodexConfig';
import { useCodexConnection } from '../../hooks/useCodexConnection';
import FileCard from '../FileCard';
import { formatBytes } from '../../utils/formatBytes';
import { download } from '@tauri-apps/plugin-upload';
import { useDownloadLocation } from '../../hooks/useDownloadLocation';

interface NodeProps {
  connectionStatus?: string;
  isConnected?: boolean;
  apiPort?: string;
  onNavigateToSearch?: (cid: string) => void;
}

type DownloadState = 'downloading' | 'completed' | 'error' | null;

const Node: React.FC<NodeProps> = ({ 
  connectionStatus, 
  isConnected, 
  apiPort: propApiPort,
  onNavigateToSearch
}) => {
  // Use props if provided, otherwise get from hooks
  const { apiPort: configApiPort } = useCodexConfig();
  const { connectionStatus: hookConnectionStatus, isConnected: hookIsConnected } = useCodexConnection(configApiPort);
  
  const finalApiPort = propApiPort || configApiPort;
  const finalConnectionStatus = connectionStatus || hookConnectionStatus;
  const finalIsConnected = isConnected ?? hookIsConnected;

  const { files: nodeFiles, isLoading, error, refetch: refetchNodeFiles } = useNodeFiles(finalApiPort, finalIsConnected);
  const { getCurrentDownloadPath } = useDownloadLocation();
  
  const [downloadStates, setDownloadStates] = useState<{ [key: string]: DownloadState }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getFileExtension = (filename: string | null) => {
    if (!filename) return 'FILE';
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const getSafeFilename = (filename: string | null) => {
    return filename || 'unnamed';
  };

  const downloadWithProgress = async (url: string, filename: string, cid: string) => {
    // Get the configured download path
    const downloadPath = getCurrentDownloadPath();
    const fullPath = `${downloadPath}/${filename}`;
    
    console.log('Downloading to:', fullPath);
    
    setDownloadStates(prev => ({
      ...prev,
      [cid]: 'downloading'
    }));
    
    try {
      // Use Tauri download plugin with the original URL and full path
      await download(url, fullPath);
      
      setDownloadStates(prev => ({
        ...prev,
        [cid]: 'completed'
      }));
      
      console.log('File saved to:', fullPath);
    } catch (error) {
      setDownloadStates(prev => ({
        ...prev,
        [cid]: 'error'
      }));
      throw error;
    }
  };

  const handleDownload = async (cid: string, filename: string | null) => {
    try {
      const downloadUrl = `http://localhost:${finalApiPort}/api/codex/v1/data/${cid}/network/stream`;
      console.log(`Downloading file from: ${downloadUrl}`);
      
      const safeFilename = getSafeFilename(filename);
      await downloadWithProgress(downloadUrl, safeFilename, cid);
      console.log('File downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const calculateTotalSize = () => {
    return nodeFiles.reduce((total, file) => total + file.manifest.datasetSize, 0);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchNodeFiles();
    // Keep animation for a minimum duration for visual feedback
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  if (!finalIsConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <AiOutlineNodeIndex size={64} className="mb-4" />
        <h1 className="text-2xl font-bold mb-2">Node Not Connected</h1>
        <p>Please connect to the Codex node to view its contents.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <img
          src="src/assets/logo.png"
          alt="Loading"
          className="w-12 h-12 animate-pulse mb-4"
        />
        <p>Loading node contents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <AiOutlineNodeIndex size={64} className="mb-4" />
        <h1 className="text-2xl font-bold mb-2">Error Loading Node</h1>
        <p className="text-center max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-[#6BE4A8]/70 rounded-2xl p-6 flex items-center">
          <div className="w-12 h-12 bg-[#6BE4A8]/80 rounded-lg flex items-center justify-center mr-4">
            <FiDatabase className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-2xl font-bold text-black">{nodeFiles.length}</p>
            <p className="text-sm text-black/70">Total Files</p>
          </div>
        </div>
        
        <div className="bg-[#6BE4A8]/70 rounded-2xl p-6 flex items-center">
          <div className="w-12 h-12 bg-[#6BE4A8]/80 rounded-lg flex items-center justify-center mr-4">
            <FiDownload className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-2xl font-bold text-black">{formatBytes(calculateTotalSize())}</p>
            <p className="text-sm text-black/70">Total Size</p>
          </div>
        </div>
        
        <div className="bg-[#6BE4A8]/60 rounded-2xl p-6 flex items-center">
          <div className="w-12 h-12 bg-[#6BE4A8]/80 rounded-lg flex items-center justify-center mr-4">
            <AiOutlineNodeIndex className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-2xl font-bold text-black">{finalConnectionStatus}</p>
            <p className="text-sm text-black/70">Node Status</p>
          </div>
        </div>
      </div>

      {/* Files section */}
      <div className='flex items-center justify-between mb-4'>
        <h3 className="text-lg font-semibold text-white">Node Contents</h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="ml-2 px-2 py-1 text-xs text-gray-200 rounded flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          aria-label="Refresh node contents"
          title="Refresh node contents"
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ 
              duration: 1, 
              ease: "linear",
              repeat: isRefreshing ? Infinity : 0 
            }}
          >
            <FiRotateCcw className="w-4 h-4 mr-1" />
          </motion.div>
        </button>
      </div>

      {nodeFiles.length > 0 ? (
        <div className="flex-1 bg-[#151515] rounded-xl px-4 overflow-y-auto py-4">
          <motion.div 
            className="space-y-3"
            layout
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <AnimatePresence mode="popLayout">
              {nodeFiles.map(file => (
                <motion.div
                  key={file.cid}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <FileCard
                    fileName={getSafeFilename(file.manifest.filename)}
                    fileType={getFileExtension(file.manifest.filename)}
                    fileSize={formatBytes(file.manifest.datasetSize)}
                    progress={100}
                    onDownload={() => handleDownload(file.cid, file.manifest.filename)}
                    downloadState={downloadStates[file.cid]}
                    cid={file.cid}
                    onInfo={() => onNavigateToSearch?.(file.cid)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <AiOutlineNodeIndex size={64} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">No Files Found</h2>
          <p>This node doesn't contain any files yet.</p>
        </div>
      )}
    </div>
  );
};

export default Node; 