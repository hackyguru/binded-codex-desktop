import { useCidInfo } from '../hooks/useCidInfo';
import { useCodex } from '../App';
import FileCard from '../components/FileCard';
import { formatBytes } from '../utils/formatBytes';
import { FiAlertTriangle, FiLoader, FiSearch } from 'react-icons/fi';
import { useState } from 'react';
import { download } from '@tauri-apps/plugin-upload';

type DownloadState = 'downloading' | 'completed' | 'error' | null;

interface SearchProps {
  cid: string;
}

const Search: React.FC<SearchProps> = ({ cid }) => {
  const { apiPort } = useCodex();
  const { fileInfo, isLoading, error } = useCidInfo(cid, apiPort);
  
  const [leechState, setLeechState] = useState<DownloadState>(null);
  const [seedState, setSeedState] = useState<DownloadState>(null);

  const handleLeech = async () => {
    if (!fileInfo) return;
    setLeechState('downloading');
    try {
      const url = `http://localhost:${apiPort}/api/codex/v1/data/${fileInfo.cid}/network/stream`;
      await download(url, {
        fileName: fileInfo.manifest.filename,
        headers: { 'Content-Type': fileInfo.manifest.mimetype },
      });
      setLeechState('completed');
    } catch (e) {
      console.error('Leech download failed:', e);
      setLeechState('error');
    }
  };

  const handleSeed = async () => {
    if (!fileInfo) return;
    setSeedState('downloading');
    try {
      const response = await fetch(`http://localhost:${apiPort}/api/codex/v1/data/${fileInfo.cid}/network`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to seed file to local node.');
      }
      setSeedState('completed');
    } catch (e) {
      console.error('Seed operation failed:', e);
      setSeedState('error');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <FiLoader className="animate-spin text-4xl mb-4" />
          <p>Searching the network for manifest...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-400">
          <FiAlertTriangle className="text-5xl mb-4" />
          <h2 className="text-xl font-bold mb-2">Search Error</h2>
          <p className="text-center max-w-md">{error}</p>
        </div>
      );
    }

    if (fileInfo && fileInfo.manifest) {
      return (
        <div className="p-4 md:p-6">
          <h1 className="text-2xl font-bold text-white mb-4">Search Result</h1>
          <FileCard
            fileName={fileInfo.manifest.filename}
            fileType={fileInfo.manifest.mimetype.split('/')[1] || 'file'}
            fileSize={formatBytes(fileInfo.manifest.datasetSize)}
            progress={100} // Manifest found means it's available
            cid={fileInfo.cid}
            onLeech={handleLeech}
            onSeed={handleSeed}
            leechState={leechState}
            seedState={seedState}
          />
          {seedState === 'completed' && (
             <div className="mt-4 p-4 bg-green-900/50 text-green-300 rounded-lg text-center">
              File successfully seeded to your local node! You can now find it on your Dashboard.
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <FiSearch className="text-5xl mb-4" />
        <p>No file found for the provided CID.</p>
      </div>
    );
  };

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
};

export default Search; 