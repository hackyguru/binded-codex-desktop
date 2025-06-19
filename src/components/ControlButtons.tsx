import React from 'react';

interface ControlButtonsProps {
  isCodexRunning: boolean;
  isCodexStarted: boolean;
  isDirectorySet: boolean;
  isConnected: boolean;
  onRunCodex: () => void;
  onKillCodex: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  isCodexRunning,
  isCodexStarted,
  isDirectorySet,
  isConnected,
  onRunCodex,
  onKillCodex
}) => {
  // If connected to API, Codex is already running successfully
  const isCodexActuallyRunning = isConnected || isCodexStarted;
  
  // Only show "Starting Codex..." if we're in the process of starting but not yet connected
  const isActuallyStarting = isCodexRunning && !isConnected;
  
  // Button should be disabled if Codex is running (either starting or already running)
  const isButtonDisabled = isCodexRunning || isCodexActuallyRunning || !isDirectorySet;

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button 
        onClick={onRunCodex}
        disabled={isButtonDisabled}
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:transform-none disabled:shadow-none"
      >
        {isActuallyStarting ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Starting Codex...
          </div>
        ) : isCodexActuallyRunning ? (
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Codex Running
          </div>
        ) : (
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Codex
          </div>
        )}
      </button>
      
      <button 
        onClick={onKillCodex}
        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
      >
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Kill Codex
        </div>
      </button>
    </div>
  );
};

export default ControlButtons; 