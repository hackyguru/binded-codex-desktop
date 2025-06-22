import React from 'react';
import { GrNodes } from 'react-icons/gr';
import { FiWifi, FiUsers, FiServer } from 'react-icons/fi';

interface NetworkStatusProps {
  connectionStatus?: string;
  isConnected?: boolean;
  apiPort?: string;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  connectionStatus, 
  isConnected, 
  apiPort 
}) => {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-[#6BE4A8]/70 rounded-2xl p-6 flex items-center">
          <div className="w-12 h-12 bg-[#6BE4A8]/80 rounded-lg flex items-center justify-center mr-4">
            <FiWifi className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-2xl font-bold text-black">
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
            <p className="text-sm text-black/70">Network Status</p>
          </div>
        </div>
        
        <div className="bg-[#6BE4A8]/70 rounded-2xl p-6 flex items-center">
          <div className="w-12 h-12 bg-[#6BE4A8]/80 rounded-lg flex items-center justify-center mr-4">
            <FiUsers className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-2xl font-bold text-black">--</p>
            <p className="text-sm text-black/70">Connected Peers</p>
          </div>
        </div>
        
        <div className="bg-[#6BE4A8]/60 rounded-2xl p-6 flex items-center">
          <div className="w-12 h-12 bg-[#6BE4A8]/80 rounded-lg flex items-center justify-center mr-4">
            <FiServer className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-2xl font-bold text-black">{apiPort || '8080'}</p>
            <p className="text-sm text-black/70">API Port</p>
          </div>
        </div>
      </div>

      {/* Network Information */}
      <div className='flex items-center justify-between mb-4'>
        <h3 className="text-lg font-semibold text-white">Network Information</h3>
      </div>

      <div className="flex-1 bg-[#151515] rounded-xl p-6">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-20 h-20 bg-[#6BE4A8]/20 rounded-full flex items-center justify-center mb-6">
            <GrNodes className="w-10 h-10 text-[#6BE4A8]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-4">Network Status</h2>
          <p className="text-gray-400 max-w-md mb-6">
            Monitor your Codex network connections, peer information, and network health metrics.
          </p>
          <div className="bg-gray-800/50 rounded-lg p-4 w-full max-w-md">
            <p className="text-sm text-gray-300">
              <span className="font-medium">Connection Status:</span> {connectionStatus || 'Unknown'}
            </p>
            <p className="text-sm text-gray-300 mt-2">
              <span className="font-medium">API Port:</span> {apiPort || '8080'}
            </p>
            <p className="text-sm text-gray-300 mt-2">
              <span className="font-medium">Network Health:</span> <span className="text-[#6BE4A8]">Good</span>
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            More network features coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus; 