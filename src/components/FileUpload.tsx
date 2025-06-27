import React, { useState, useEffect, useRef } from 'react';
import { FiDownload, FiRotateCcw, FiFile } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { download } from '@tauri-apps/plugin-upload';
import { useDownloadLocation } from '../hooks/useDownloadLocation';
import { useNodeFiles } from '../hooks/useNodeFiles';
import { useRecentFiles } from '../hooks/useRecentFiles';
import { useCodexConfig } from '../hooks/useCodexConfig';
import HealthCheckCard from './HealthCheckCard';
import StorageSpaceCard from './StorageSpaceCard';
import FileCard from './FileCard';

type DownloadState = 'downloading' | 'completed' | 'error' | null;

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  cid?: string;
  error?: string;
}

interface FileUploadProps {
  apiPort?: string;
  isConnected: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ apiPort = '8080', isConnected }) => {
  const [sessionFiles, setSessionFiles] = useState<FileItem[]>([]);
  const [downloadStatus, setDownloadStatus] = useState<{ [key: string]: DownloadState }>({});
  const [seedToNodeStatus, setSeedToNodeStatus] = useState<{ [key: string]: DownloadState }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasInitialFetch = useRef(false);

  const { getCurrentDownloadPath } = useDownloadLocation();
  const { recentFiles, addRecentFile } = useRecentFiles();
  const { apiPort: configApiPort } = useCodexConfig();
  const finalApiPort = apiPort || configApiPort;

  const { files: nodeFiles, refetch: refetchNodeFiles } = useNodeFiles(finalApiPort, isConnected);

  // Fetch files only once when component mounts and is connected
  useEffect(() => {
    if (isConnected && !hasInitialFetch.current) {
      refetchNodeFiles();
      hasInitialFetch.current = true;
    }
  }, []); // Empty dependency array - only run on mount

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check if a file is already seeded in the local node
  const isFileSeededInNode = (cid: string): boolean => {
    return nodeFiles.some(file => file.cid === cid);
  };

  // Seed file to local node
  const handleSeedToNode = async (cid: string) => {
    try {
      setSeedToNodeStatus(prev => ({
        ...prev,
        [cid]: 'downloading'
      }));

      const seedUrl = `http://localhost:${finalApiPort}/api/codex/v1/data/${cid}/network`;
      console.log('Seeding file to local node:', seedUrl);
      
      const response = await fetch(seedUrl, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to seed file to local node. Status: ${response.status}`);
      }
      
      console.log('File successfully seeded to local node');
      setSeedToNodeStatus(prev => ({
        ...prev,
        [cid]: 'completed'
      }));

      // Refresh node files to update the list
      refetchNodeFiles();
    } catch (error) {
      console.error('Seed to node failed:', error);
      setSeedToNodeStatus(prev => ({
        ...prev,
        [cid]: 'error'
      }));
    }
  };

  const uploadFile = async (file: File, fileItem: FileItem) => {
    try {
      setSessionFiles(prev => prev.map(f =>
        f.id === fileItem.id ? { ...f, status: 'uploading' as const } : f
      ));

      const response = await fetch(`http://localhost:${finalApiPort}/api/codex/v1/data`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
          'Content-Disposition': `attachment; filename="${file.name}"`
        },
        body: file
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const cid = await response.text();
      
      setSessionFiles(prev => prev.map(f =>
        f.id === fileItem.id ? { ...f, status: 'success' as const, cid } : f
      ));

      // Add to recent files
      addRecentFile({
        cid: cid,
        fileName: file.name,
        fileType: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        fileSize: formatFileSize(file.size),
        source: 'upload'
      });

      // Refresh the list of files from the node
      refetchNodeFiles();

    } catch (error) {
      setSessionFiles(prev => prev.map(f =>
        f.id === fileItem.id ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' } : f
      ));
    }
  };

  const getFileExtension = (filename: string | null) => {
    if (!filename) return 'FILE';
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const getSafeFilename = (filename: string | null) => {
    return filename || 'unnamed';
  };

  const downloadFile = async (cid: string, fileName: string | null) => {
    try {
      setDownloadStatus(prev => ({
        ...prev,
        [cid]: 'downloading'
      }));

      const downloadUrl = `http://localhost:${finalApiPort}/api/codex/v1/data/${cid}/network/stream`;
      console.log(`Downloading file from: ${downloadUrl}`);

      const downloadsPath = getCurrentDownloadPath();
      const safeFilename = getSafeFilename(fileName);
      const filePath = `${downloadsPath}/${safeFilename}`;

      console.log(`Saving file to: ${filePath}`);

      await download(
        downloadUrl,
        filePath,
        ({ progress, total }: { progress: number; total: number }) => {
          const progressPercentage = Math.round((progress / total) * 100);
          console.log(`Downloaded ${progress} of ${total} bytes (${progressPercentage}%)`);
        },
        new Map([['Accept', '*/*']])
      );

      setDownloadStatus(prev => ({
        ...prev,
        [cid]: 'completed'
      }));

      // Add to recent files
      addRecentFile({
        cid,
        fileName: safeFilename,
        fileType: safeFilename.split('.').pop()?.toUpperCase() || 'FILE',
        fileSize: 'Unknown', // We don't have size info for downloads from recent files
        source: 'download'
      });
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus(prev => ({
        ...prev,
        [cid]: 'error'
      }));
    }
  };

  const handleDownload = async (cid: string, filename: string | null) => {
    try {
      await downloadFile(cid, filename);
    } catch (error) {
      console.error('Download process failed:', error);
      setDownloadStatus(prev => ({
        ...prev,
        [cid]: 'error'
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const droppedFiles = Array.from(e.dataTransfer.files).map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending' as const
    }));

    setSessionFiles(prev => [...prev, ...droppedFiles]);

    droppedFiles.forEach((fileItem, index) => {
      uploadFile(e.dataTransfer.files[index], fileItem);
    });
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending' as const
      }));

      setSessionFiles(prev => [...prev, ...selectedFiles]);

      selectedFiles.forEach((fileItem, index) => {
        if (e.target.files) {
          uploadFile(e.target.files[index], fileItem);
        }
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchNodeFiles();
    // Keep animation for a minimum duration for visual feedback
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <HealthCheckCard
          isConnected={isConnected}
          apiPort={finalApiPort}
        />
        <StorageSpaceCard
          apiPort={finalApiPort}
          isConnected={isConnected}
        />
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            rounded-3xl p-6 flex flex-col items-center justify-center text-center
            transition-colors duration-200 ease-in-out cursor-pointer
            bg-[#6be4a700] border-[#6be4a7] border-2 border-dashed
          `}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="fileInput"
          />
          <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center mb-4">
            <FiDownload className="w-8 h-8 text-[#6be4a7]" />
          </div>
          <p className="text-xs text-[#6be4a7]">Any Files (Max 10GB)</p>
          <button 
            className="mt-4 bg-[#6be4a7] text-[#151515] font-semibold py-2 px-5 text-sm"
            style={{
              clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0% 50%)'
            }}
          >
            Upload Files
          </button>
        </div>
      </div>


      <div className='flex items-center justify-between mb-4'>
        <h3 className="text-lg font-semibold text-white">Recent Files</h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="ml-2 px-2 py-1 text-xs text-gray-200 rounded flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          aria-label="Refresh files on node"
          title="Refresh files on node"
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

      {(sessionFiles.length > 0 || recentFiles.length > 0) ? (
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
              {sessionFiles
                .filter(file => file.status !== 'success')
                .map(file => (
                  <motion.div
                    key={file.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <FileCard
                      fileName={file.name}
                      fileType={getFileExtension(file.name)}
                      fileSize={formatFileSize(file.size)}
                      progress={file.status === 'uploading' ? 50 : 0}
                    />
                  </motion.div>
                ))}
              {recentFiles.map(file => {
                const progress = 100; // Recent files are always at 100% progress
                const isSeeded = isFileSeededInNode(file.cid);
                
                return (
                  <motion.div
                    key={file.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <FileCard
                      fileName={file.fileName}
                      fileType={file.fileType}
                      fileSize={file.fileSize}
                      progress={progress}
                      onDownload={() => handleDownload(file.cid, file.fileName)}
                      downloadState={downloadStatus[file.cid]}
                      onSeedToNode={() => handleSeedToNode(file.cid)}
                      seedToNodeState={seedToNodeStatus[file.cid]}
                      isSeededInNode={isSeeded}
                      showSeedButton={true}
                      cid={file.cid}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 bg-[#151515] rounded-xl flex flex-col items-center justify-center text-gray-500 py-12">
          <FiFile size={64} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">No Recent Files</h2>
          <p className="text-center max-w-md">Upload your first file using the upload area above to see it here.</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 