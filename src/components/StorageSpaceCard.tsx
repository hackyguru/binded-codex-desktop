import React, { useState, useEffect } from 'react';
import { FiHardDrive, FiLoader, FiX } from 'react-icons/fi';
import CircularProgress from './CircularProgress';
import { codexApi } from '../utils/apiClient';

interface StorageData {
  totalBlocks: number;
  quotaMaxBytes: number;
  quotaUsedBytes: number;
  quotaReservedBytes: number;
}

interface StorageSpaceCardProps {
  apiPort: string;
  isConnected: boolean;
}

const StorageSpaceCard: React.FC<StorageSpaceCardProps> = ({ apiPort, isConnected }) => {
  const [storageData, setStorageData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchStorageData = async () => {
    if (!isConnected) {
      setError('Not connected to Codex');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await codexApi.get('/space', apiPort);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStorageData(data);
    } catch (error) {
      console.error('Error fetching storage data:', error);
      setError('Failed to fetch storage data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageData();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchStorageData, 30000);
    
    return () => clearInterval(interval);
  }, [apiPort, isConnected]);

  const getUsagePercentage = (): number => {
    if (!storageData || storageData.quotaMaxBytes === 0) return 0;
    return Math.round((storageData.quotaUsedBytes / storageData.quotaMaxBytes) * 100);
  };

  const getUsedStorage = (): string => {
    if (!storageData) return '0 B';
    return formatBytes(storageData.quotaUsedBytes);
  };

  const getTotalStorage = (): string => {
    if (!storageData) return '0 B';
    return formatBytes(storageData.quotaMaxBytes);
  };



  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#6BE4A8]/80 to-[#5DD49A]/70 rounded-3xl p-6 flex flex-col justify-between h-48 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#6BE4A8]/30 backdrop-blur-sm">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 bg-black/15 flex items-center justify-center [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)] shadow-md transition-all duration-300">
            <FiHardDrive className="w-6 h-6 text-black" />
          </div>
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center">
              <FiLoader className="w-6 h-6 text-black animate-spin" />
            </div>
          </div>
        </div>
        
        <div>
          <p className="text-4xl font-bold text-black mb-2 animate-pulse">Loading...</p>
          <p className="text-sm text-black/70 font-medium">Storage Space</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-400/70 to-red-500/60 rounded-3xl p-6 flex flex-col justify-between h-48 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-400/30 backdrop-blur-sm">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 bg-black/15 flex items-center justify-center [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)] shadow-md">
            <FiHardDrive className="w-6 h-6 text-black" />
          </div>
          <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center">
            <FiX className="w-4 h-4 text-red-800" />
          </div>
        </div>
        
        <div>
          <p className="text-3xl font-bold text-black mb-2">Error</p>
          <p className="text-sm text-black/70 font-medium mb-2">Storage Space</p>
          <div className="bg-black/10 rounded-lg p-2">
            <p className="text-xs text-black/80 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const usagePercentage = getUsagePercentage();
  const isHighUsage = usagePercentage > 80;
  const isMediumUsage = usagePercentage > 50;

  return (
    <div className={`group rounded-3xl p-6 flex flex-col justify-between h-48 shadow-lg hover:shadow-xl transition-all duration-300 border backdrop-blur-sm ${
      isHighUsage 
        ? 'bg-gradient-to-br from-red-400/70 to-red-500/60 border-red-400/30' 
        : isMediumUsage 
        ? 'bg-gradient-to-br from-yellow-400/70 to-orange-400/60 border-yellow-400/30'
        : 'bg-gradient-to-br from-[#6BE4A8]/80 to-[#5DD49A]/70 border-[#6BE4A8]/30'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <div className="w-12 h-12 bg-black/15 flex items-center justify-center [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)] shadow-md transition-all duration-300 hover:scale-105">
            <FiHardDrive className="w-6 h-6 text-black" />
          </div>
        </div>
        <div className="relative">
          <div className="transform transition-all duration-300 hover:scale-105">
            <CircularProgress 
              percentage={usagePercentage}
              color={isHighUsage ? "#dc2626" : isMediumUsage ? "#d97706" : "#151515"} 
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col py-1">
        <div className="space-y-1 flex-1">
          <div className="flex justify-between text-[9px] py-1 px-2 bg-black/15 rounded leading-none">
            <span className="text-black/80 font-medium">Used:</span>
            <span className="text-black font-bold">{getUsedStorage()}</span>
          </div>
          <div className="flex justify-between text-[9px] py-1 px-2 bg-black/15 rounded leading-none">
            <span className="text-black/80 font-medium">Total:</span>
            <span className="text-black font-bold">{getTotalStorage()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageSpaceCard; 