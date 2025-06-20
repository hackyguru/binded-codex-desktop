import React, { useState } from 'react';
import { IoIosPower } from 'react-icons/io';

interface TopNavigationProps {
  isCodexRunning: boolean;
  isCodexStarted: boolean;
  isDirectorySet: boolean;
  isConnected: boolean;
  onRunCodex: () => void;
  onKillCodex: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  isCodexRunning,
  isCodexStarted,
  isDirectorySet,
  isConnected,
  onRunCodex,
  onKillCodex
}) => {
  const [searchCid, setSearchCid] = useState('');
  const [isKilling, setIsKilling] = useState(false);

  // If connected to API, Codex is already running successfully
  const isCodexActuallyRunning = isConnected || isCodexStarted;
  
  // Only show "Starting Codex..." if we're in the process of starting but not yet connected
  const isActuallyStarting = isCodexRunning && !isConnected;
  
  // Button should be disabled if Codex is starting, killing, or if directory is not set
  const isButtonDisabled = isActuallyStarting || isKilling || !isDirectorySet;

  const handleSearchCid = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for CID:', searchCid);
  };

  const handlePowerButtonClick = () => {
    if (isCodexActuallyRunning) {
      setIsKilling(true);
      onKillCodex();
      // Reset killing state after a short delay to allow for state updates
      setTimeout(() => {
        setIsKilling(false);
      }, 2000);
    } else {
      onRunCodex();
    }
  };

  return (
    <div className="flex items-center justify-between w-full h-12 mb-6">
      {/* Search CIDs Input - Left Side */}
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSearchCid} className="relative">
          <input
            type="text"
            value={searchCid}
            onChange={(e) => setSearchCid(e.target.value)}
            placeholder="Search CIDs..."
            className="w-full border border-[#151515] rounded-lg px-2 py-1 text-[#6BE4A8] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent"
            aria-label="Search CIDs"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-white focus:outline-none"
            aria-label="Search"
          >
            <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Power Button - Right Side */}
      <div className="flex gap-3 items-center">
        <button 
          onClick={handlePowerButtonClick}
          disabled={isButtonDisabled}
          className={`w-10 h-10 transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:transform-none disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center ${
            isCodexActuallyRunning 
              ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500' 
              : 'bg-[#6BE4A8] hover:bg-[#5DD49A] focus:ring-[#6BE4A8]'
          }`}
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
          }}
          aria-label={isCodexActuallyRunning ? 'Stop Codex' : 'Start Codex'}
        >
          {isActuallyStarting || isKilling ? (
            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isCodexActuallyRunning ? (
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <IoIosPower className="w-5 h-5 text-black" />
          )}
        </button>
      </div>
    </div>
  );
};

export default TopNavigation; 