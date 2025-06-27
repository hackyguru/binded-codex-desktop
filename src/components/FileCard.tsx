import React, { useState } from 'react';
import {
  FiDownload,
  FiCopy,
  FiMoreHorizontal,
  FiCheck,
  FiPlayCircle,
  FiSave
} from 'react-icons/fi';
import { FaSeedling } from 'react-icons/fa';

type DownloadState = 'downloading' | 'completed' | 'error' | null;

interface FileCardProps {
  fileName: string | null;
  fileType: string;
  fileSize: string;
  progress: number;
  cid?: string;
  // Original download props
  onDownload?: () => void;
  downloadState?: DownloadState;
  // New Leech/Seed props
  onLeech?: () => void;
  onSeed?: () => void;
  leechState?: DownloadState;
  seedState?: DownloadState;
  // Recent files seeding props
  onSeedToNode?: () => void;
  seedToNodeState?: DownloadState;
  isSeededInNode?: boolean;
  showSeedButton?: boolean;
  // Info button prop
  onInfo?: () => void;
}

const FileCard: React.FC<FileCardProps> = ({
  fileName,
  fileType,
  fileSize,
  progress,
  cid,
  onDownload,
  downloadState,
  onLeech,
  onSeed,
  leechState,
  seedState,
  onSeedToNode,
  seedToNodeState,
  isSeededInNode = false,
  showSeedButton = false,
  onInfo
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cid) return;
    navigator.clipboard.writeText(cid);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const renderSeedButton = () => {
    if (isSeededInNode) {
      return (
        <button 
          className="w-9 h-9 bg-[#6be4a7] clip-path-hexagon flex items-center justify-center text-black mb-1 flex-shrink-0"
          title="File is already seeded in local node"
        >
          <FaSeedling size={14} />
        </button>
      );
    }

    return (
      <button 
        onClick={onSeedToNode}
        disabled={!onSeedToNode || seedToNodeState === 'downloading'}
        className="w-9 h-9 bg-[#3D3D3D] clip-path-hexagon flex items-center justify-center text-white mb-1 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        title="Seed file to local node"
      >
        {seedToNodeState === 'downloading' ? <img src="src/assets/logo.png" alt="Loading" className="w-4 h-4 animate-pulse" /> : (seedToNodeState === 'completed' ? <FiCheck size={14} /> : <FaSeedling size={14} />)}
      </button>
    );
  };

  const renderInfoButton = () => (
    <button 
      onClick={onInfo}
      className="w-9 h-9 bg-[#3D3D3D] clip-path-hexagon flex items-center justify-center text-white mb-1 flex-shrink-0"
    >
      <FiMoreHorizontal size={14} />
    </button>
  );

  return (
    <div className="bg-[#2D2D2D] rounded-2xl overflow-hidden flex items-stretch min-h-[96px] min-w-0 w-full">
      {/* Left Content Section */}
      <div className="flex items-center gap-4 p-4 flex-1 min-w-0">
        {/* File Icon */}
        <div className="flex-shrink-0 w-20 h-20 bg-[#6BE4A8]/60 rounded-lg flex items-center justify-center">
          <div className="w-16 h-16 bg-[#6BE4A8] rounded-md flex items-center justify-center">
            <span className="text-black font-bold text-sm uppercase">{fileType}</span>
          </div>
        </div>

        {/* File Info & Progress */}
        <div className="flex-grow overflow-hidden min-w-0">
          <p className="text-white font-medium truncate mb-2">{fileName || 'unnamed'}</p>
          <div className="flex items-center gap-4 text-gray-400 text-sm mb-3">
            <span>{fileSize}</span>
          </div>
          <div className="w-full bg-[#1E1E1E] rounded-full h-1.5">
            <div 
              className="bg-[#6BE4A8] h-1.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {onLeech && onSeed ? (
        // Search page layout - no divider
        <div className="flex items-center gap-3 p-4 flex-shrink-0 min-w-[200px]">
          <button
            onClick={onLeech}
            disabled={leechState === 'downloading' || seedState === 'downloading'}
            className="flex items-center gap-2 bg-[#3D3D3D] text-white font-bold py-2 px-4 clip-path-hexagon text-sm disabled:opacity-50 min-w-[80px]"
          >
            {leechState === 'downloading' ? <img src="src/assets/logo.png" alt="Loading" className="w-5 h-5 animate-pulse" /> : <FiPlayCircle />}
            <span>LEECH</span>
          </button>
          <button
            onClick={onSeed}
            disabled={leechState === 'downloading' || seedState === 'downloading'}
            className="flex items-center gap-2 bg-[#3D3D3D] text-white font-bold py-2 px-4 clip-path-hexagon text-sm disabled:opacity-50 min-w-[80px]"
          >
            {seedState === 'downloading' ? <img src="src/assets/logo.png" alt="Loading" className="w-5 h-5 animate-pulse" /> : <FiSave />}
            <span>SEED</span>
          </button>
          <div className="flex flex-col items-center min-w-[36px]">
            {showSeedButton ? renderSeedButton() : renderInfoButton()}
            <p className="text-gray-400 text-xs font-bold text-center mt-1">
              {showSeedButton ? (isSeededInNode ? 'SEEDED' : 'SEED') : ''}
            </p>
          </div>
        </div>
      ) : showSeedButton ? (
        // Dashboard recent files layout - with full background colors
        <>
          <div className="flex items-center gap-3 p-4 flex-shrink-0 min-w-[102px]">
            <button 
              onClick={onDownload}
              disabled={!onDownload || downloadState === 'downloading'}
              className="w-9 h-9 bg-[#3D3D3D] clip-path-hexagon flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {downloadState === 'downloading' ? <img src="src/assets/logo.png" alt="Loading" className="w-4 h-4 animate-pulse" /> : (downloadState === 'completed' ? <FiCheck size={14} /> : <FiDownload size={14} />)}
            </button>
            <button 
              onClick={handleCopyClick}
              disabled={!cid}
              className="w-9 h-9 bg-[#3D3D3D] clip-path-hexagon flex items-center justify-center text-white disabled:opacity-50 flex-shrink-0"
            >
              {isCopied ? <FiCheck size={14} className="text-green-500" /> : <FiCopy size={14} />}
            </button>
          </div>
          <div className={`flex items-center justify-center w-24 rounded-r-2xl flex-shrink-0 min-w-[96px] ${
            isSeededInNode ? 'bg-[#6BE4A8]' : 'bg-[#151515] border border-[#2D2D2D]'
          }`}>
            <button 
              onClick={onSeedToNode}
              disabled={!onSeedToNode || seedToNodeState === 'downloading'}
              className={`w-9 h-9 clip-path-hexagon flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
                isSeededInNode 
                  ? 'bg-[#151515] text-[#6BE4A8]' 
                  : 'bg-[#6BE4A8] text-[#151515]'
              }`}
              title={isSeededInNode ? "File is already seeded in local node" : "Seed file to local node"}
            >
              {seedToNodeState === 'downloading' ? (
                <img src="src/assets/logo.png" alt="Loading" className="w-4 h-4 animate-pulse" />
              ) : seedToNodeState === 'completed' ? (
                <FiCheck size={14} />
              ) : (
                <FaSeedling size={14} />
              )}
            </button>
          </div>
        </>
      ) : (
        // Node contents layout - no divider
        <div className="flex items-center gap-3 p-4 flex-shrink-0 min-w-[102px]">
          <button 
            onClick={onDownload}
            disabled={!onDownload || downloadState === 'downloading'}
            className="w-9 h-9 bg-[#3D3D3D] clip-path-hexagon flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {downloadState === 'downloading' ? <img src="src/assets/logo.png" alt="Loading" className="w-4 h-4 animate-pulse" /> : (downloadState === 'completed' ? <FiCheck size={14} /> : <FiDownload size={14} />)}
          </button>
          <button 
            onClick={handleCopyClick}
            disabled={!cid}
            className="w-9 h-9 bg-[#3D3D3D] clip-path-hexagon flex items-center justify-center text-white disabled:opacity-50 flex-shrink-0"
          >
            {isCopied ? <FiCheck size={14} className="text-green-500" /> : <FiCopy size={14} />}
          </button>
          <div className="flex flex-col items-center min-w-[36px]">
            {renderInfoButton()}
            <p className="text-gray-400 text-xs font-bold text-center mt-1"></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileCard; 