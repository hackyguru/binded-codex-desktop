import React from 'react';

interface StatusIndicatorProps {
  isRunning: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isRunning }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center bg-gray-700/30 border border-gray-600 rounded-xl p-4">
        <div className={`w-4 h-4 rounded-full mr-3 ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-lg font-medium text-white">
          {isRunning ? 'Codex is running' : 'Codex is stopped'}
        </span>
      </div>
    </div>
  );
};

export default StatusIndicator; 