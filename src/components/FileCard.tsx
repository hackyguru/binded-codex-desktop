import React, { useState } from 'react';
import { 
  FiCopy, 
  FiDownload, 
  FiMonitor,
  FiLoader,
  FiCheck,
  FiPlayCircle,
  FiSave,
  FiDatabase
} from 'react-icons/fi';
import { FaSeedling } from 'react-icons/fa';

type DownloadState = 'downloading' | 'completed' | 'error' | null;

interface FileCardProps {
  fileName: string;
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
  showSeedButton = false
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cid) return;
    navigator.clipboard.writeText(cid);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const renderOriginalButtons = () => (
    <>
      <button 
        onClick={onDownload}
        disabled={!onDownload || downloadState === 'downloading'}
        className="w-9 h-9 bg-[#3D3D3D] rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {downloadState === 'downloading' ? <FiLoader size={16} className="animate-spin" /> : (downloadState === 'completed' ? <FiCheck size={16} /> : <FiDownload size={16} />)}
      </button>
      <button 
        onClick={handleCopyClick}
        disabled={!cid}
        className="w-9 h-9 bg-[#3D3D3D] rounded-full flex items-center justify-center text-white disabled:opacity-50"
      >
        {isCopied ? <FiCheck size={16} className="text-green-500" /> : <FiCopy size={16} />}
      </button>
    </>
  );

  const renderSearchButtons = () => (
    <>
      <button
        onClick={onLeech}
        disabled={leechState === 'downloading' || seedState === 'downloading'}
        className="flex items-center gap-2 bg-[#3D3D3D] text-white font-bold py-2 px-4 rounded-full text-sm disabled:opacity-50"
      >
        {leechState === 'downloading' ? <FiLoader className="animate-spin" /> : <FiPlayCircle />}
        <span>LEECH</span>
      </button>
      <button
        onClick={onSeed}
        disabled={leechState === 'downloading' || seedState === 'downloading'}
        className="flex items-center gap-2 bg-[#3D3D3D] text-white font-bold py-2 px-4 rounded-full text-sm disabled:opacity-50"
      >
        {seedState === 'downloading' ? <FiLoader className="animate-spin" /> : <FiSave />}
        <span>SEED</span>
      </button>
    </>
  );

  const renderSeedButton = () => {
    if (isSeededInNode) {
      return (
        <button 
          className="w-9 h-9 bg-[#6be4a7] clip-path-hexagon flex items-center justify-center text-black mb-1"
          title="File is already seeded in local node"
        >
          <FaSeedling size={16} />
        </button>
      );
    }

    return (
      <button 
        onClick={onSeedToNode}
        disabled={!onSeedToNode || seedToNodeState === 'downloading'}
        className="w-9 h-9 bg-[#3D3D3D] clip-path-hexagon flex items-center justify-center text-white mb-1 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Seed file to local node"
      >
        {seedToNodeState === 'downloading' ? <FiLoader size={16} className="animate-spin" /> : (seedToNodeState === 'completed' ? <FiCheck size={16} /> : <FaSeedling size={16} />)}
      </button>
    );
  };

  const renderInfoButton = () => (
    <button className="w-9 h-9 bg-[#3D3D3D] rounded-full flex items-center justify-center text-white mb-1">
      <FiMonitor size={16} />
    </button>
  );

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
          <span>{fileSize}</span>
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
          {onLeech && onSeed ? renderSearchButtons() : renderOriginalButtons()}
        </div>
        <div className="text-center border-l border-[#151515] px-8">
          <div className="flex justify-center mb-1">
            {showSeedButton ? renderSeedButton() : renderInfoButton()}
          </div>
          <p className="text-gray-400 text-xs font-bold text-center">
            {showSeedButton ? (isSeededInNode ? 'SEEDED' : 'SEED') : 'INFO'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileCard; 