import React from 'react';

interface PortConfigurationSectionProps {
  discoveryPort: string;
  listeningPort: string;
  apiPort: string;
  onDiscoveryPortChange: (value: string) => void;
  onListeningPortChange: (value: string) => void;
  onApiPortChange: (value: string) => void;
}

const PortConfigurationSection: React.FC<PortConfigurationSectionProps> = ({
  discoveryPort,
  listeningPort,
  apiPort,
  onDiscoveryPortChange,
  onListeningPortChange,
  onApiPortChange
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
        Port Configuration
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label htmlFor="discovery-port" className="block text-sm font-medium text-gray-300">
            Discovery Port
          </label>
          <input
            id="discovery-port"
            type="number"
            min="1"
            max="65535"
            value={discoveryPort}
            onChange={(e) => onDiscoveryPortChange(e.target.value)}
            placeholder="8090"
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="listening-port" className="block text-sm font-medium text-gray-300">
            Listening Port
          </label>
          <input
            id="listening-port"
            type="number"
            min="1"
            max="65535"
            value={listeningPort}
            onChange={(e) => onListeningPortChange(e.target.value)}
            placeholder="8070"
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="api-port" className="block text-sm font-medium text-gray-300">
            API Port
          </label>
          <input
            id="api-port"
            type="number"
            min="1"
            max="65535"
            value={apiPort}
            onChange={(e) => onApiPortChange(e.target.value)}
            placeholder="8080"
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
};

export default PortConfigurationSection; 