import React from 'react';
import { 
  FiArrowUp, 
  FiArrowDown, 
  FiClock, 
  FiMoreVertical, 
  FiDownload, 
  FiMonitor,
  FiLoader,
  FiCheck
} from 'react-icons/fi';

interface FileCardProps {
  fileName: string;
  fileType: string;
  uploadSpeed?: string;
  downloadSpeed?: string;
  timeRemaining?: string;
  progress: number;
  onDownload?: () => void;
  downloadState?: 'downloading' | 'completed' | 'error' | null;
}

const FileCard: React.FC<FileCardProps> = ({
  fileName,
  fileType,
  uploadSpeed = "2.5 MB/s",
  downloadSpeed = "30.4 MB/s",
  timeRemaining = "2min 24sec",
  progress,
  onDownload,
  downloadState,
}) => {
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload();
    }
  };

  const renderDownloadIcon = () => {
    if (downloadState === 'downloading') {
      return <FiLoader size={16} className="animate-spin" />;
    }
    if (downloadState === 'completed') {
      return <FiCheck size={16} />;
    }
    return <FiDownload size={16} />;
  };

  return (
    <div className="bg-[#2D2D2D] rounded-2xl p-4 flex items-center gap-4">
      {/* File Icon */}
      <div className="flex-shrink-0 w-20 h-20 bg-[#C2D1FF] rounded-lg flex items-center justify-center">
        <div className="w-16 h-16 bg-[#A8BDE2] rounded-md flex items-center justify-center">
          <span className="text-black font-bold text-sm uppercase">{fileType}</span>
        </div>
      </div>

      {/* File Info & Progress */}
      <div className="flex-grow overflow-hidden">
        <p className="text-white font-medium truncate mb-2">{fileName}</p>
        <div className="flex items-center gap-4 text-gray-400 text-sm mb-3">
          <span className="flex items-center gap-1">
            <FiArrowUp size={14} /> {uploadSpeed}
          </span>
          <span className="flex items-center gap-1">
            <FiArrowDown size={14} /> {downloadSpeed}
          </span>
          <span className="flex items-center gap-1">
            <FiClock size={14} /> {timeRemaining}
          </span>
        </div>
        <div className="w-full bg-[#1E1E1E] rounded-full h-1.5">
          <div 
            className="bg-[#A8BDE2] h-1.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownloadClick}
            disabled={!onDownload || downloadState === 'downloading'}
            className="w-9 h-9 bg-[#3D3D3D] rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {renderDownloadIcon()}
          </button>
          <button className="w-9 h-9 bg-[#3D3D3D] rounded-full flex items-center justify-center text-white">
            <FiMoreVertical size={16} />
          </button>
        </div>
        <div className="text-center w-12">
          {progress < 100 && (
            <p className="text-white font-semibold text-sm">{progress}%</p>
          )}
        </div>
        <div className="text-center border-l border-[#151515] px-8">
          <button className="w-9 h-9 bg-[#3D3D3D] rounded-full flex items-center justify-center text-white mb-1">
            <FiMonitor size={16} />
          </button>
          <p className="text-gray-400 text-xs font-bold">INFO</p>
        </div>
      </div>
    </div>
  );
};

export default FileCard; 