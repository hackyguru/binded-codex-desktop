import React, { useState, useEffect, useRef } from 'react';
import { FiUploadCloud, FiFile, FiX, FiLoader, FiDownload, FiFolder, FiRotateCcw, FiDatabase, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { download } from '@tauri-apps/plugin-upload';
import { useDownloadLocation } from '../hooks/useDownloadLocation';
import { useNodeFiles } from '../hooks/useNodeFiles';
import { useRecentFiles } from '../hooks/useRecentFiles';
import StatsCard from './StatsCard';
import FileCard from './FileCard';

type DownloadStatus = {
  state: 'downloading' | 'completed' | 'error' | null;
  progress?: number;
  error?: string;
};

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
  const [isDragging, setIsDragging] = useState(false);
  const [sessionFiles, setSessionFiles] = useState<FileItem[]>([]);
  const [downloadStatus, setDownloadStatus] = useState<{ [key: string]: DownloadStatus }>({});
  const hasInitialFetch = useRef(false);

  const { getCurrentDownloadPath } = useDownloadLocation();
  const { recentFiles, addRecentFile } = useRecentFiles();

  const { files: nodeFiles, isLoading: isLoadingNodeFiles, error: nodeFilesError, refetch: refetchNodeFiles } = useNodeFiles(apiPort, isConnected);

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

  const uploadFile = async (file: File, fileItem: FileItem) => {
    setSessionFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'uploading' } : f));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`http://localhost:${apiPort}/api/codex/v1/data`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setSessionFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'success', cid: result.cid }
            : f
        ));

        // Add to recent files
        addRecentFile({
          cid: result.cid,
          fileName: file.name,
          fileType: file.name.split('.').pop()?.toUpperCase() || 'FILE',
          fileSize: formatFileSize(file.size),
          source: 'upload'
        });
      } else {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
    } catch (error) {
      setSessionFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ));
    }
  };

  const downloadFile = async (cid: string, fileName: string) => {
    try {
      setDownloadStatus(prev => ({
        ...prev,
        [cid]: { state: 'downloading', progress: 0 }
      }));

      const downloadUrl = `http://localhost:${apiPort}/api/codex/v1/data/${cid}/network/stream`;
      console.log(`Downloading file from: ${downloadUrl}`);

      const downloadsPath = getCurrentDownloadPath();
      const filePath = `${downloadsPath}/${fileName}`;

      console.log(`Saving file to: ${filePath}`);

      await download(
        downloadUrl,
        filePath,
        ({ progress, total }: { progress: number; total: number }) => {
          const progressPercentage = Math.round((progress / total) * 100);
          console.log(`Downloaded ${progress} of ${total} bytes (${progressPercentage}%)`);
          setDownloadStatus(prev => ({
            ...prev,
            [cid]: { state: 'downloading', progress: progressPercentage }
          }));
        },
        new Map([['Accept', '*/*']])
      );

      setDownloadStatus(prev => ({
        ...prev,
        [cid]: { state: 'completed', progress: 100 }
      }));

      // Add to recent files
      addRecentFile({
        cid,
        fileName,
        fileType: fileName.split('.').pop()?.toUpperCase() || 'FILE',
        fileSize: 'Unknown', // We don't have size info for downloads from recent files
        source: 'download'
      });
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus(prev => ({
        ...prev,
        [cid]: {
          state: 'error',
          error: error instanceof Error ? error.message : 'Download failed'
        }
      }));
    }
  };

  const handleDownload = async (cid: string, filename: string) => {
    try {
      await downloadFile(cid, filename);
    } catch (error) {
      console.error('Download process failed:', error);
      setDownloadStatus(prev => ({
        ...prev,
        [cid]: {
          state: 'error',
          error: error instanceof Error ? error.message : 'Download failed'
        }
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

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

  const removeFile = (id: string) => {
    setSessionFiles(prev => prev.filter(file => file.id !== id));
  };

  const getStatusColor = (status: FileItem['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: FileItem['status']) => {
    if (status === 'uploading') {
      return <FiLoader className="w-5 h-5 animate-spin" />;
    }
    return <FiFile className="w-6 h-6" />;
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatsCard
          icon={<FiArrowUp className="w-5 h-5 text-black" />}
          value="2.34 Gb"
          label="Bytes uploaded"
          bgColor="bg-[#a8dadc]"
        />
        <StatsCard
          icon={<FiArrowDown className="w-5 h-5 text-black" />}
          value="12.34 Gb"
          label="Bytes downloaded"
          bgColor="bg-[#a8bde2]"
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
          <button className="mt-4 bg-black/30 text-[#6be4a7] font-semibold py-2 px-5 rounded-full text-sm">
            Upload Files
          </button>
        </div>
      </div>


      <div className='flex items-center justify-between mb-4'>
        <h3 className="text-lg font-semibold text-white">Recent Files</h3>
        <button
          onClick={refetchNodeFiles}
          className="ml-2 px-2 py-1 text-xs text-gray-200 rounded flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Refresh files on node"
          title="Refresh files on node"
        >
          <FiRotateCcw className="w-4 h-4 mr-1" />
        </button>
      </div>

      {(sessionFiles.length > 0 || recentFiles.length > 0) && (
        <div className="flex-1 bg-[#151515] rounded-xl px-4 overflow-y-auto space-y-3 py-4 max-h-96">
          {sessionFiles
            .filter(file => file.status !== 'success')
            .map(file => (
              <FileCard
                key={file.id}
                fileName={file.name}
                fileType={getFileExtension(file.name)}
                fileSize={formatFileSize(file.size)}
                progress={file.status === 'uploading' ? 50 : 0}
              />
            ))}
          {recentFiles.map(file => {
            const downloadProgress = downloadStatus[file.cid]?.progress;
            const progress = downloadProgress !== undefined ? downloadProgress : 100;
            
            return (
              <FileCard
                key={file.id}
                fileName={file.fileName}
                fileType={file.fileType}
                fileSize={file.fileSize}
                progress={progress}
                onDownload={() => handleDownload(file.cid, file.fileName)}
                downloadState={downloadStatus[file.cid]?.state}
                cid={file.cid}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUpload; 