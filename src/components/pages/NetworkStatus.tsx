import React from 'react';
import { GrNodes } from 'react-icons/gr';
import { FiWifi, FiUsers, FiServer, FiRotateCcw, FiInfo, FiGitBranch, FiMapPin, FiEye, FiEyeOff } from 'react-icons/fi';
import { useDebugInfo } from '../../hooks/useDebugInfo';
import { useGeoLocation } from '../../hooks/useGeoLocation';

interface NetworkStatusProps {
  connectionStatus?: string;
  isConnected?: boolean;
  apiPort?: string;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  connectionStatus, 
  isConnected = false, 
  apiPort = '8080' 
}) => {
  const { debugInfo, isLoading, error, refetch } = useDebugInfo(apiPort, isConnected);
  
  // Get geo location info for connected nodes
  const nodeAddresses = debugInfo?.table.nodes.map(node => node.address) || [];
  const { geoData, loading: geoLoading, refresh: refreshGeo } = useGeoLocation(nodeAddresses);

  // Add a way to force refresh geo data
  const handleRefreshWithGeo = () => {
    // Clear localStorage cache if it exists
    localStorage.removeItem('geoLocationCache');
    // Trigger refetch of both debug info and geo data
    refetch();
    // Force page refresh to clear in-memory cache
    window.location.reload();
  };

  const formatNodeId = (nodeId: string) => {
    if (!nodeId) return 'N/A';
    return `${nodeId.substring(0, 8)}...${nodeId.substring(nodeId.length - 8)}`;
  };

  const formatAddress = (address: string) => {
    if (!address) return 'N/A';
    return address.length > 30 ? `${address.substring(0, 30)}...` : address;
  };

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
            <p className="text-2xl font-bold text-black">
              {debugInfo ? debugInfo.table.nodes.length : '--'}
            </p>
            <p className="text-sm text-black/70">Connected Peers</p>
          </div>
        </div>
        
        <div className="bg-[#6BE4A8]/60 rounded-2xl p-6 flex items-center">
          <div className="w-12 h-12 bg-[#6BE4A8]/80 rounded-lg flex items-center justify-center mr-4">
            <FiServer className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-2xl font-bold text-black">{apiPort}</p>
            <p className="text-sm text-black/70">API Port</p>
          </div>
        </div>
      </div>

      {/* Network Information */}
      <div className='flex items-center justify-between mb-4'>
        <h3 className="text-lg font-semibold text-white">Network Information</h3>
        <button
          onClick={refetch}
          className="px-2 py-1 text-xs text-gray-200 rounded flex items-center focus:outline-none focus:ring-2 focus:ring-[#6BE4A8]"
          aria-label="Refresh network info"
          title="Refresh network info"
        >
          <FiRotateCcw className="w-4 h-4 mr-1" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 bg-[#151515] rounded-xl p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6BE4A8] mb-4"></div>
          <p className="text-gray-400 ml-4">Loading network information...</p>
        </div>
      ) : error ? (
        <div className="flex-1 bg-[#151515] rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <FiWifi className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-4">Network Error</h2>
          <p className="text-gray-400 max-w-md">{error}</p>
        </div>
      ) : debugInfo ? (
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Node Identity */}
          <div className="bg-[#151515] rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FiInfo className="w-5 h-5 mr-2 text-[#6BE4A8]" />
              Node Identity
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Node ID</p>
                  <p className="text-white font-mono text-sm break-all">{debugInfo.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Repository</p>
                  <p className="text-white font-mono text-sm">{debugInfo.repo}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">SPR</p>
                  <p className="text-white font-mono text-sm break-all">{debugInfo.spr}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Version Information */}
          <div className="bg-[#151515] rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FiGitBranch className="w-5 h-5 mr-2 text-[#6BE4A8]" />
              Version Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/30 rounded-lg p-4">
                <p className="text-sm text-gray-400">Version</p>
                <p className="text-white font-semibold">{debugInfo.codex.version}</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4">
                <p className="text-sm text-gray-400">Revision</p>
                <p className="text-white font-mono">{debugInfo.codex.revision}</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4">
                <p className="text-sm text-gray-400">Contracts</p>
                <p className="text-white font-mono">{debugInfo.codex.contracts}</p>
              </div>
            </div>
          </div>

          {/* Network Addresses */}
          <div className="bg-[#151515] rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FiMapPin className="w-5 h-5 mr-2 text-[#6BE4A8]" />
              Network Addresses
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-3">Listening Addresses</p>
                <div className="space-y-2">
                  {debugInfo.addrs.map((addr, index) => (
                    <div key={index} className="bg-gray-800/30 rounded-lg p-3">
                      <p className="text-white font-mono text-sm">{addr}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-3">Announce Addresses</p>
                <div className="space-y-2">
                  {debugInfo.announceAddresses.map((addr, index) => (
                    <div key={index} className="bg-gray-800/30 rounded-lg p-3">
                      <p className="text-white font-mono text-sm">{addr}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Local Node */}
          <div className="bg-[#151515] rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <GrNodes className="w-5 h-5 mr-2 text-[#6BE4A8]" />
              Local Node
            </h4>
            <div className="bg-gray-800/30 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-400">Node ID</p>
                    <p className="text-white font-mono text-sm">{formatNodeId(debugInfo.table.localNode.nodeId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Peer ID</p>
                    <p className="text-white font-mono text-sm">{formatNodeId(debugInfo.table.localNode.peerId)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-400">Address</p>
                    <p className="text-white font-mono text-sm">{formatAddress(debugInfo.table.localNode.address)}</p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm text-gray-400 mr-2">Seen</p>
                    {debugInfo.table.localNode.seen ? (
                      <FiEye className="w-4 h-4 text-[#6BE4A8]" />
                    ) : (
                      <FiEyeOff className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Nodes */}
          <div className="bg-[#151515] rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <FiUsers className="w-5 h-5 mr-2 text-[#6BE4A8]" />
                Connected Nodes ({debugInfo.table.nodes.length})
              </div>
              <button
                onClick={refreshGeo}
                disabled={geoLoading}
                className="px-2 py-1 text-xs text-[#6BE4A8] rounded flex items-center focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] hover:text-white transition-colors disabled:opacity-50"
                aria-label="Refresh geo flags"
                title="Refresh country flags"
              >
                {geoLoading ? '🔄 Loading...' : '🌍 Refresh Flags'}
              </button>
            </h4>
            {debugInfo.table.nodes.length > 0 ? (
              <div className="space-y-3">
                {debugInfo.table.nodes.map((node, index) => {
                  const geoInfo = geoData[node.address];
                  return (
                    <div key={index} className="bg-gray-800/30 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-400">Node ID</p>
                            <p className="text-white font-mono text-sm">{formatNodeId(node.nodeId)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Peer ID</p>
                            <p className="text-white font-mono text-sm">{formatNodeId(node.peerId)}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-400">Address</p>
                            <div className="flex items-center space-x-2">
                              <p className="text-white font-mono text-sm">{formatAddress(node.address)}</p>
                              {geoInfo && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg" title={`${geoInfo.country}${geoInfo.city ? `, ${geoInfo.city}` : ''}`}>
                                    {geoInfo.flag}
                                  </span>
                                  <span className="text-xs text-gray-400 hidden sm:inline">
                                    {geoInfo.country}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-400 mr-2">Seen</p>
                            {node.seen ? (
                              <FiEye className="w-4 h-4 text-[#6BE4A8]" />
                            ) : (
                              <FiEyeOff className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiUsers className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No connected nodes found</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-[#151515] rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-[#6BE4A8]/20 rounded-full flex items-center justify-center mb-6">
            <GrNodes className="w-10 h-10 text-[#6BE4A8]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-4">Network Status</h2>
          <p className="text-gray-400 max-w-md mb-6">
            Connect to your Codex node to view detailed network information.
          </p>
        </div>
      )}
    </div>
  );
};

export default NetworkStatus; 