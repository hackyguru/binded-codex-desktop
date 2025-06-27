import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GrNodes } from 'react-icons/gr';
import { FiWifi, FiUsers, FiServer, FiRotateCcw, FiInfo, FiGitBranch, FiMapPin, FiCopy, FiCheck } from 'react-icons/fi';
import { useDebugInfo } from '../../hooks/useDebugInfo';
import { useGeoLocation } from '../../hooks/useGeoLocation';

// @ts-ignore
import DottedMap from 'dotted-map';

interface NetworkStatusProps {
  isConnected: boolean;
  apiPort: string;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  isConnected, 
  apiPort 
}) => {
  const { debugInfo, isLoading, error, refetch } = useDebugInfo(apiPort, isConnected);
  
  // Get geo location info for connected nodes
  const nodeAddresses = debugInfo?.table.nodes.map(node => node.address) || [];
  const { geoData, loading: geoLoading, refresh: refreshGeo } = useGeoLocation(nodeAddresses);

  // Copy functionality
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Copy button component
  const CopyButton: React.FC<{ text: string; copyKey: string }> = ({ text, copyKey }) => (
    <button
      onClick={() => handleCopy(text, copyKey)}
      className="ml-2 w-6 h-6 clip-path-hexagon bg-black/20 hover:bg-[#6BE4A8]/20 flex items-center justify-center text-gray-400 hover:text-[#6BE4A8] transition-colors focus:outline-none"
      title="Copy to clipboard"
    >
      {copiedItems[copyKey] ? <FiCheck size={12} className="text-[#6BE4A8]" /> : <FiCopy size={12} />}
    </button>
  );

  // Remove scroll detection - it was causing issues with mouse movement

  const formatNodeId = (nodeId: string) => {
    if (!nodeId) return 'N/A';
    return `${nodeId.substring(0, 8)}...${nodeId.substring(nodeId.length - 8)}`;
  };

  const formatAddress = (address: string) => {
    if (!address) return 'N/A';
    return address.length > 30 ? `${address.substring(0, 30)}...` : address;
  };

  // World map component using dotted-map library
const WorldMap = ({ geoData }: { geoData: Record<string, any> }) => {
  const [mapSvg, setMapSvg] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastCountryCodesString, setLastCountryCodesString] = useState<string>('');
  const generationTimeoutRef = useRef<number | null>(null);

  // Memoize unique countries calculation to avoid unnecessary recalculations
  const uniqueCountries = useMemo(() => {
    const nodeLocations = Object.values(geoData)
      .filter((geo: any) => geo && geo.countryCode && geo.countryCode !== 'LOCAL')
      .map((geo: any) => ({
        countryCode: geo.countryCode,
        country: geo.country,
        city: geo.city
      }));

    return nodeLocations.filter((location, index, self) => 
      index === self.findIndex(l => l.countryCode === location.countryCode)
    );
  }, [geoData]);

  // Create a stable string representation of country codes for comparison
  const countryCodesString = useMemo(() => {
    return uniqueCountries
      .map((country: any) => country.countryCode)
      .sort()
      .join(',');
  }, [uniqueCountries]);

  // Refs to access current values without causing re-renders
  const mapSvgRef = useRef(mapSvg);
  const uniqueCountriesRef = useRef(uniqueCountries);

  // Update refs whenever values change
  useEffect(() => {
    mapSvgRef.current = mapSvg;
    uniqueCountriesRef.current = uniqueCountries;
  }, [mapSvg, uniqueCountries]);

  // Stable map generation function without circular dependencies
  const generateMap = useCallback(async (countries: any[]) => {
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create the map using the imported DottedMap with lighter settings
      const map = new (DottedMap as any)({ 
        height: 50, // Reduced height for better performance
        grid: 'vertical', // Simpler grid pattern
        avoidCollisions: false // Disable collision detection for better performance
      });

      // Add pins for each unique country (if any)
      countries.forEach((location: any) => {
        try {
          map.addPin({
            lat: getCountryLatLng(location.countryCode).lat,
            lng: getCountryLatLng(location.countryCode).lng,
            svgOptions: { 
              color: '#6BE4A8', 
              radius: 1.0, // Slightly smaller radius
              opacity: 0.8
            }
          });
        } catch (error) {
          console.warn(`Could not add pin for ${location.countryCode}:`, error);
        }
      });

      // Generate SVG with transparent background
      const svgMap = map.getSVG({
        radius: 0.15, // Smaller dots for better performance
        color: '#404040', // Pure gray for dots
        shape: 'circle',
        backgroundColor: 'transparent'
      });

      setMapSvg(svgMap);
    } catch (error) {
      console.error('Error generating dotted map:', error);
      // Fallback to simple text if dotted-map fails
      setMapSvg('<svg><text x="50%" y="50%" text-anchor="middle" fill="#6B7280">Map unavailable</text></svg>');
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  // Single effect to handle all map generation logic
  useEffect(() => {
    // Clear any existing timeout
    if (generationTimeoutRef.current) {
      clearTimeout(generationTimeoutRef.current);
    }

    // Only generate if country codes have actually changed
    if (countryCodesString === lastCountryCodesString) {
      return;
    }

    // Use timeout to generate map with delay
    generationTimeoutRef.current = setTimeout(() => {
      // Generate map with current countries
      generateMap(uniqueCountriesRef.current);
      setLastCountryCodesString(countryCodesString);
    }, mapSvgRef.current ? 5000 : 0); // 5 second delay for updates, immediate for initial load

    return () => {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }
    };
  }, [countryCodesString]); // Only depend on countryCodesString!

  // Simple country coordinates lookup (approximate)
  const getCountryLatLng = (countryCode: string): { lat: number; lng: number } => {
    const coordinates: Record<string, { lat: number; lng: number }> = {
      'US': { lat: 39.8283, lng: -98.5795 },
      'CA': { lat: 56.1304, lng: -106.3468 },
      'GB': { lat: 55.3781, lng: -3.4360 },
      'DE': { lat: 51.1657, lng: 10.4515 },
      'FR': { lat: 46.2276, lng: 2.2137 },
      'IT': { lat: 41.8719, lng: 12.5674 },
      'ES': { lat: 40.4637, lng: -3.7492 },
      'NL': { lat: 52.1326, lng: 5.2913 },
      'SE': { lat: 60.1282, lng: 18.6435 },
      'NO': { lat: 60.4720, lng: 8.4689 },
      'FI': { lat: 61.9241, lng: 25.7482 },
      'PL': { lat: 51.9194, lng: 19.1451 },
      'RU': { lat: 61.5240, lng: 105.3188 },
      'CN': { lat: 35.8617, lng: 104.1954 },
      'JP': { lat: 36.2048, lng: 138.2529 },
      'KR': { lat: 35.9078, lng: 127.7669 },
      'IN': { lat: 20.5937, lng: 78.9629 },
      'AU': { lat: -25.2744, lng: 133.7751 },
      'BR': { lat: -14.2350, lng: -51.9253 },
      'AR': { lat: -38.4161, lng: -63.6167 },
      'ZA': { lat: -30.5595, lng: 22.9375 },
      'EG': { lat: 26.0975, lng: 31.1309 },
      'NG': { lat: 9.0820, lng: 8.6753 },
      'KE': { lat: -0.0236, lng: 37.9062 },
      'MX': { lat: 23.6345, lng: -102.5528 },
      'SG': { lat: 1.3521, lng: 103.8198 },
      'TH': { lat: 15.8700, lng: 100.9925 },
      'VN': { lat: 14.0583, lng: 108.2772 },
      'ID': { lat: -0.7893, lng: 113.9213 },
      'MY': { lat: 4.2105, lng: 101.9758 },
      'PH': { lat: 12.8797, lng: 121.7740 },
      'TR': { lat: 38.9637, lng: 35.2433 },
      'IR': { lat: 32.4279, lng: 53.6880 },
      'SA': { lat: 23.8859, lng: 45.0792 },
      'AE': { lat: 23.4241, lng: 53.8478 },
      'IL': { lat: 31.0461, lng: 34.8516 },
      'UA': { lat: 48.3794, lng: 31.1656 },
      'CZ': { lat: 49.8175, lng: 15.4730 },
      'AT': { lat: 47.5162, lng: 14.5501 },
      'CH': { lat: 46.8182, lng: 8.2275 },
      'BE': { lat: 50.5039, lng: 4.4699 },
      'DK': { lat: 56.2639, lng: 9.5018 },
      'IE': { lat: 53.1424, lng: -7.6921 },
      'PT': { lat: 39.3999, lng: -8.2245 },
      'GR': { lat: 39.0742, lng: 21.8243 },
      'BG': { lat: 42.7339, lng: 25.4858 },
      'RO': { lat: 45.9432, lng: 24.9668 },
      'HU': { lat: 47.1625, lng: 19.5033 },
      'SK': { lat: 48.6690, lng: 19.6990 },
      'SI': { lat: 46.1512, lng: 14.9955 },
      'HR': { lat: 45.1000, lng: 15.2000 },
      'RS': { lat: 44.0165, lng: 21.0059 },
      'BA': { lat: 43.9159, lng: 17.6791 },
      'ME': { lat: 42.7087, lng: 19.3744 },
      'MK': { lat: 41.6086, lng: 21.7453 },
      'AL': { lat: 41.1533, lng: 20.1683 },
      'LT': { lat: 55.1694, lng: 23.8813 },
      'LV': { lat: 56.8796, lng: 24.6032 },
      'EE': { lat: 58.5953, lng: 25.0136 },
      'BY': { lat: 53.7098, lng: 27.9534 },
      'MD': { lat: 47.4116, lng: 28.3699 },
    };
    
    return coordinates[countryCode] || { lat: 0, lng: 0 };
  };

      return (
      <div className="bg-black/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-[#6BE4A8]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Global Network Map
        </h4>
        
        <div className="relative w-full h-[32rem] bg-black/10 rounded-lg overflow-hidden p-4">
        {mapSvg ? (
          <div 
            className="w-full h-full flex items-center justify-center relative"
          >
            <div 
              className={`w-full h-full transition-opacity duration-300 ${isGenerating ? 'opacity-50' : 'opacity-100'}`}
              dangerouslySetInnerHTML={{ __html: mapSvg }}
              style={{
                filter: 'drop-shadow(0 0 10px rgba(107, 228, 168, 0.1))'
              }}
            />
            {/* Subtle loading indicator when updating */}
            {isGenerating && (
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg p-2">
                <img
                  src="src/assets/logo.png"
                  alt="Loading"
                  className="w-4 h-4 animate-pulse"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <img
                src="src/assets/logo.png"
                alt="Loading"
                className="w-8 h-8 mx-auto mb-2 animate-pulse"
              />
              <p className="text-sm">Loading world map...</p>
            </div>
          </div>
        )}
        
        {/* Legend */}
        <div className="absolute bottom-3 right-3 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-gray-800/50">
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <div className="w-3 h-3 bg-[#6BE4A8] rounded-full shadow-lg shadow-[#6BE4A8]/30"></div>
            <span>Active Nodes ({uniqueCountries.length})</span>
          </div>
        </div>
      </div>
    </div>
  );
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

      {error ? (
        <div className="flex-1 bg-[#151515] rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <FiWifi className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-4">Network Error</h2>
          <p className="text-gray-400 max-w-md">{error}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Global Network Map */}
          <WorldMap geoData={geoData} />

          {/* Network Information Header */}
          <div className='flex items-center justify-between'>
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-white">Network Information</h3>
              {isLoading && (
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <img
                    src="src/assets/logo.png"
                    alt="Loading"
                    className="w-4 h-4 animate-pulse"
                  />
                  <span>Loading...</span>
                </div>
              )}
            </div>
            <button
              onClick={refetch}
              className="px-2 py-1 text-xs text-gray-200 rounded flex items-center focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] hover:text-white transition-colors"
              aria-label="Refresh network info"
              title="Refresh network info"
            >
              <FiRotateCcw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Node Identity */}
          {debugInfo && (
            <div className="bg-black/20 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FiInfo className="w-5 h-5 mr-2 text-[#6BE4A8]" />
                Node Identity
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Node ID</p>
                    <div className="flex items-center">
                      <p className="text-white font-mono text-sm break-all flex-1">{debugInfo.id}</p>
                      <CopyButton text={debugInfo.id} copyKey="node-id" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Repository</p>
                    <div className="flex items-center">
                      <p className="text-white font-mono text-sm flex-1">{debugInfo.repo}</p>
                      <CopyButton text={debugInfo.repo} copyKey="repo" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">SPR</p>
                    <div className="flex items-center">
                      <p className="text-white font-mono text-sm break-all flex-1">{debugInfo.spr}</p>
                      <CopyButton text={debugInfo.spr} copyKey="spr" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Version Information */}
          {debugInfo && (
            <>
              <div className="bg-black/20 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FiGitBranch className="w-5 h-5 mr-2 text-[#6BE4A8]" />
                  Version Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/20 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Version</p>
                    <div className="flex items-center">
                      <p className="text-white font-semibold flex-1">{debugInfo.codex.version}</p>
                      <CopyButton text={debugInfo.codex.version} copyKey="version" />
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Revision</p>
                    <div className="flex items-center">
                      <p className="text-white font-mono flex-1">{debugInfo.codex.revision}</p>
                      <CopyButton text={debugInfo.codex.revision} copyKey="revision" />
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4">
                    <p className="text-sm text-gray-400">Contracts</p>
                    <div className="flex items-center">
                      <p className="text-white font-mono flex-1">{debugInfo.codex.contracts}</p>
                      <CopyButton text={debugInfo.codex.contracts} copyKey="contracts" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Addresses */}
              <div className="bg-black/20 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FiMapPin className="w-5 h-5 mr-2 text-[#6BE4A8]" />
                  Network Addresses
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-3">Listening Addresses</p>
                    <div className="space-y-2">
                      {debugInfo.addrs.map((addr, index) => (
                        <div key={index} className="bg-black/20 rounded-lg p-3">
                          <div className="flex items-center">
                            <p className="text-white font-mono text-sm flex-1">{addr}</p>
                            <CopyButton text={addr} copyKey={`listening-addr-${index}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-3">Announce Addresses</p>
                    <div className="space-y-2">
                      {debugInfo.announceAddresses.map((addr, index) => (
                        <div key={index} className="bg-black/20 rounded-lg p-3">
                          <div className="flex items-center">
                            <p className="text-white font-mono text-sm flex-1">{addr}</p>
                            <CopyButton text={addr} copyKey={`announce-addr-${index}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Local Node */}
              <div className="bg-black/20 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <GrNodes className="w-5 h-5 mr-2 text-[#6BE4A8]" />
                  Local Node
                </h4>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-400">Node ID</p>
                        <div className="flex items-center">
                          <p className="text-white font-mono text-sm flex-1">{formatNodeId(debugInfo.table.localNode.nodeId)}</p>
                          <CopyButton text={debugInfo.table.localNode.nodeId} copyKey="local-node-id" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Peer ID</p>
                        <div className="flex items-center">
                          <p className="text-white font-mono text-sm flex-1">{formatNodeId(debugInfo.table.localNode.peerId)}</p>
                          <CopyButton text={debugInfo.table.localNode.peerId} copyKey="local-peer-id" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-400">Address</p>
                        <div className="flex items-center">
                          <p className="text-white font-mono text-sm flex-1">{formatAddress(debugInfo.table.localNode.address)}</p>
                          <CopyButton text={debugInfo.table.localNode.address} copyKey="local-address" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connected Nodes */}
              <div className="bg-black/20 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <FiUsers className="w-5 h-5 mr-2 text-[#6BE4A8]" />
                    Connected Nodes ({debugInfo.table.nodes.length})
                  </div>
                  <button
                    onClick={refreshGeo}
                    disabled={geoLoading}
                    className="px-2 py-1 text-xs text-[#6BE4A8] rounded flex items-center focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] hover:text-white transition-colors disabled:opacity-50"
                                            aria-label="Reload Geo-information"
                        title="Reload Geo-information"
                      >
                        {geoLoading ? '🔄 Loading...' : '🌍 Reload Geo-information'}
                  </button>
                </h4>
                {debugInfo.table.nodes.length > 0 ? (
                  <div className="space-y-3">
                    {debugInfo.table.nodes.map((node, index) => {
                      const geoInfo = geoData[node.address];
                      return (
                        <div key={index} className="bg-black/20 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm text-gray-400">Node ID</p>
                                <div className="flex items-center">
                                  <p className="text-white font-mono text-sm flex-1">{formatNodeId(node.nodeId)}</p>
                                  <CopyButton text={node.nodeId} copyKey={`connected-node-id-${index}`} />
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">Peer ID</p>
                                <div className="flex items-center">
                                  <p className="text-white font-mono text-sm flex-1">{formatNodeId(node.peerId)}</p>
                                  <CopyButton text={node.peerId} copyKey={`connected-peer-id-${index}`} />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="text-sm text-gray-400">Address</p>
                                <div className="flex items-center">
                                  <p className="text-white font-mono text-sm flex-1">{formatAddress(node.address)}</p>
                                  <CopyButton text={node.address} copyKey={`connected-address-${index}`} />
                                </div>
                                {geoInfo && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg" title={`${geoInfo.country}${geoInfo.city ? `, ${geoInfo.city}` : ''}`}>
                                      {geoInfo.flag}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {geoInfo.country}
                                    </span>
                                  </div>
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
            </>
          )}

          {/* Loading skeletons only on initial load (no previous data) */}
          {!debugInfo && isLoading && (
            <>
              {/* Node Identity Skeleton */}
              <div className="bg-black/20 rounded-xl p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-5 h-5 bg-gray-600 rounded mr-2"></div>
                  <div className="h-6 bg-gray-600 rounded w-32"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="h-4 bg-gray-600 rounded w-16 mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-600 rounded w-20 mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="h-4 bg-gray-600 rounded w-12 mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Version Information Skeleton */}
              <div className="bg-black/20 rounded-xl p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-5 h-5 bg-gray-600 rounded mr-2"></div>
                  <div className="h-6 bg-gray-600 rounded w-40"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="h-4 bg-gray-600 rounded w-16 mb-2"></div>
                    <div className="h-5 bg-gray-700 rounded w-20"></div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="h-4 bg-gray-600 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="h-4 bg-gray-600 rounded w-20 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-28"></div>
                  </div>
                </div>
              </div>

              {/* Network Addresses Skeleton */}
              <div className="bg-black/20 rounded-xl p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-5 h-5 bg-gray-600 rounded mr-2"></div>
                  <div className="h-6 bg-gray-600 rounded w-36"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="h-4 bg-gray-600 rounded w-32 mb-3"></div>
                    <div className="space-y-2">
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="h-4 bg-gray-700 rounded w-full"></div>
                      </div>
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-600 rounded w-36 mb-3"></div>
                    <div className="space-y-2">
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="h-4 bg-gray-700 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Local Node Skeleton */}
              <div className="bg-black/20 rounded-xl p-6 animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-5 h-5 bg-gray-600 rounded mr-2"></div>
                  <div className="h-6 bg-gray-600 rounded w-24"></div>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <div className="h-4 bg-gray-600 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-full"></div>
                      </div>
                      <div>
                        <div className="h-4 bg-gray-600 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-full"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="h-4 bg-gray-600 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connected Nodes Skeleton */}
              <div className="bg-black/20 rounded-xl p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-gray-600 rounded mr-2"></div>
                    <div className="h-6 bg-gray-600 rounded w-36"></div>
                  </div>
                  <div className="h-6 bg-gray-600 rounded w-24"></div>
                </div>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-black/20 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div>
                            <div className="h-4 bg-gray-600 rounded w-16 mb-2"></div>
                            <div className="h-4 bg-gray-700 rounded w-full"></div>
                          </div>
                          <div>
                            <div className="h-4 bg-gray-600 rounded w-16 mb-2"></div>
                            <div className="h-4 bg-gray-700 rounded w-full"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <div className="h-4 bg-gray-600 rounded w-16 mb-2"></div>
                            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 bg-gray-600 rounded"></div>
                              <div className="h-3 bg-gray-700 rounded w-20"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Show placeholder when no debug info and not loading */}
          {!debugInfo && !isLoading && (
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
      )}
    </div>
  );
};

export default NetworkStatus; 