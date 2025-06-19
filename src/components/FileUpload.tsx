import React, { useState } from 'react';
import { FiUploadCloud, FiFile, FiX, FiLoader, FiDownload, FiFolder, FiRotateCcw } from 'react-icons/fi';
import { download } from '@tauri-apps/plugin-upload';
import { useDownloadLocation } from '../hooks/useDownloadLocation';

type DownloadStatus = {
  state: 'downloading' | 'completed' | 'error' | null;
  progress?: number;
  error?: string;
};

interface FileMetadata {
  cid: string;
  name: string;
  size: number;
  type: string;
  manifest: {
    filename: string;
    mimetype: string;
  };
}

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
}

const FileUpload: React.FC<FileUploadProps> = ({ apiPort = '8080' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [downloadStatus, setDownloadStatus] = useState<{ [key: string]: DownloadStatus }>({});
  
  const {
    customDownloadPath,
    selectDownloadDirectory,
    resetToDefault,
    getCurrentDownloadPath
  } = useDownloadLocation();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFile = async (file: File, fileItem: FileItem) => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'uploading' as const } : f
      ));

      const response = await fetch(`http://localhost:${apiPort}/api/codex/v1/data`, {
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

      setFiles(prev => prev.map(f =>
        f.id === fileItem.id ? { ...f, status: 'success' as const, cid } : f
      ));
    } catch (error) {
      setFiles(prev => prev.map(f =>
        f.id === fileItem.id ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' } : f
      ));
    }
  };

  const getFileMetadata = async (cid: string): Promise<{ success: boolean; metadata?: FileMetadata; error?: string }> => {
    try {
      const metadataUrl = `http://localhost:${apiPort}/api/codex/v1/data/${cid}/network`;
      console.log(`Fetching metadata from: ${metadataUrl}`);

      const response = await fetch(metadataUrl, {
        method: "POST",
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, metadata: data };
    } catch (error) {
      console.error("Error fetching file metadata:", error);
      let errorMessage = "Failed to fetch file metadata";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      return { success: false, error: errorMessage };
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

  const handleDownload = async (file: FileItem) => {
    if (!file.cid) return;
    
    try {
      const metadataResult = await getFileMetadata(file.cid);
      if (!metadataResult.success || !metadataResult.metadata) {
        throw new Error(metadataResult.error || 'Failed to get file metadata');
      }
      
      const { manifest } = metadataResult.metadata;
      const { filename } = manifest;
      
      await downloadFile(file.cid, filename);
    } catch (error) {
      console.error('Download process failed:', error);
      if (file.cid) {
        setDownloadStatus(prev => ({ 
          ...prev, 
          [file.cid!]: { 
            state: 'error', 
            error: error instanceof Error ? error.message : 'Download failed' 
          } 
        }));
      }
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
    
    setFiles(prev => [...prev, ...droppedFiles]);

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
      
      setFiles(prev => [...prev, ...selectedFiles]);

      selectedFiles.forEach((fileItem, index) => {
        if (e.target.files) {
          uploadFile(e.target.files[index], fileItem);
        }
      });
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
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

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8
          flex flex-col items-center justify-center
          transition-colors duration-200 ease-in-out
          ${isDragging 
            ? 'border-blue-500 bg-blue-900/20' 
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
          }
        `}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="fileInput"
        />
        
        <FiUploadCloud className="w-12 h-12 text-gray-400 mb-4" />
        
        <label
          htmlFor="fileInput"
          className="text-sm text-gray-300 text-center cursor-pointer"
        >
          <span className="font-medium text-blue-400 hover:text-blue-300">
            Click to upload
          </span>{' '}
          or drag and drop files here
          <p className="text-xs text-gray-500 mt-2">
            Supported file types: All files are allowed
          </p>
        </label>
      </div>

      {/* Download Settings */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex-grow">
            <h3 className="text-sm font-medium text-gray-200">Download Location</h3>
            <p className="text-xs text-gray-400 mt-1">
              {customDownloadPath || 'Using default downloads directory'}
            </p>
            {customDownloadPath && (
              <p className="text-xs text-blue-400 font-mono mt-1 break-all">
                {customDownloadPath}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={selectDownloadDirectory}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiFolder className="w-4 h-4 mr-2" />
              Choose Directory
            </button>
            {customDownloadPath && (
              <button
                onClick={resetToDefault}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Reset to default downloads directory"
              >
                <FiRotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-200 mb-4">
            Files ({files.length})
          </h3>
          <div className="space-y-3">
            {files.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-600"
              >
                <div className="flex items-center space-x-3 flex-grow">
                  <div className={getStatusColor(file.status)}>
                    {getStatusIcon(file.status)}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-gray-200">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                    {file.status === 'success' && file.cid && (
                      <p className="text-xs text-green-400 font-mono mt-1">
                        CID: {file.cid}
                      </p>
                    )}
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-red-400 mt-1">
                        Error: {file.error}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {file.status === 'success' && file.cid && (
                    <button
                      onClick={() => handleDownload(file)}
                      disabled={downloadStatus[file.cid]?.state === 'downloading'}
                      className={`p-2 rounded-full transition-colors ${
                        downloadStatus[file.cid]?.state === 'downloading'
                          ? 'bg-gray-700 cursor-not-allowed'
                          : 'hover:bg-gray-700'
                      }`}
                      title="Download file"
                    >
                      {downloadStatus[file.cid]?.state === 'downloading' ? (
                        <div className="relative">
                          <FiLoader className="w-5 h-5 text-blue-400 animate-spin" />
                          {downloadStatus[file.cid]?.progress !== undefined && (
                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-blue-400">
                              {downloadStatus[file.cid].progress}%
                            </div>
                          )}
                        </div>
                      ) : downloadStatus[file.cid]?.state === 'completed' ? (
                        <FiDownload className="w-5 h-5 text-green-400" />
                      ) : downloadStatus[file.cid]?.state === 'error' ? (
                        <div className="text-red-400" title={downloadStatus[file.cid].error}>
                          <FiDownload className="w-5 h-5" />
                        </div>
                      ) : (
                        <FiDownload className="w-5 h-5 text-gray-400 hover:text-blue-400" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 