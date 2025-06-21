import React, { useState } from 'react';
import { FiRotateCcw, FiDownload, FiDatabase } from 'react-icons/fi';
import { AiOutlineNodeIndex } from 'react-icons/ai';
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
}

type DownloadState = 'downloading' | 'completed' | 'error' | null;

const Node: React.FC<NodeProps> = ({ 
  connectionStatus, 
  isConnected, 
  apiPort: propApiPort 
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

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
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

  const handleDownload = async (cid: string, filename: string) => {
    try {
      const downloadUrl = `http://localhost:${finalApiPort}/api/codex/v1/data/${cid}/network/stream`;
      console.log(`Downloading file from: ${downloadUrl}`);
      
      await downloadWithProgress(downloadUrl, filename, cid);
      console.log('File downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const calculateTotalSize = () => {
    return nodeFiles.reduce((total, file) => total + file.manifest.datasetSize, 0);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
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
        <div className="bg-[#a8bde2] rounded-2xl p-6 flex items-center">
          <div className="w-12 h-12 bg-[#8ba3d1] rounded-lg flex items-center justify-center mr-4">
            <FiDatabase className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-2xl font-bold text-black">{nodeFiles.length}</p>
            <p className="text-sm text-black/70">Total Files</p>
          </div>
        </div>
        
        <div className="bg-[#a8dadc] rounded-2xl p-6 flex items-center">
          <div className="w-12 h-12 bg-[#8bc5c7] rounded-lg flex items-center justify-center mr-4">
            <FiDownload className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-2xl font-bold text-black">{formatBytes(calculateTotalSize())}</p>
            <p className="text-sm text-black/70">Total Size</p>
          </div>
        </div>
        
        <div className="bg-[#6be4a7] rounded-2xl p-6 flex items-center">
          <div className="w-12 h-12 bg-[#5ad396] rounded-lg flex items-center justify-center mr-4">
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
          onClick={refetchNodeFiles}
          className="ml-2 px-2 py-1 text-xs text-gray-200 rounded flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Refresh node contents"
          title="Refresh node contents"
        >
          <FiRotateCcw className="w-4 h-4 mr-1" />
        </button>
      </div>

      {nodeFiles.length > 0 ? (
        <div className="flex-1 bg-[#151515] rounded-xl px-4 overflow-y-auto space-y-3 py-4">
          {nodeFiles.map(file => (
            <FileCard
              key={file.cid}
              fileName={file.manifest.filename}
              fileType={getFileExtension(file.manifest.filename)}
              fileSize={formatBytes(file.manifest.datasetSize)}
              progress={100}
              onDownload={() => handleDownload(file.cid, file.manifest.filename)}
              downloadState={downloadStates[file.cid]}
              cid={file.cid}
            />
          ))}
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