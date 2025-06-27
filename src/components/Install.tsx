import React, { useState } from 'react';
import { FiCheck, FiChevronRight, FiChevronLeft, FiFolder, FiDownload, FiServer } from 'react-icons/fi';
import Squares from './Squares';
import { useCodexConfig } from '../hooks/useCodexConfig';
import { useDownloadLocation } from '../hooks/useDownloadLocation';

const Install: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(() => {
    // Check if onboarding was previously completed
    return localStorage.getItem('codexOnboardingComplete') === 'true';
  });
  
  const {
    dataDirectory,
    isDirectorySet,
    discoveryPort,
    listeningPort,
    apiPort,
    handleSelectDirectory,
    handleDiscoveryPortChange,
    handleListeningPortChange,
    handleApiPortChange
  } = useCodexConfig();

  const {
    customDownloadPath,
    selectDownloadDirectory
  } = useDownloadLocation();

  // If user already has data directory set AND has completed onboarding, show the simple "not running" message
  if (isDirectorySet && isOnboardingComplete) {
    return (
      <div className="relative w-full h-full text-center flex items-center justify-center">
        {/* Hexagonal background animation */}
        <div className="absolute inset-0 overflow-hidden">
          <Squares 
            speed={0.5} 
            squareSize={90}
            direction='diagonal'
            borderColor='#6BE4A8'
            hoverFillColor='rgba(107, 228, 168, 0.3)'
          />
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 bg-black/80 border border-[#6BE4A8]/30 rounded-xl p-8 max-w-md mx-auto backdrop-blur-sm">
          <img
            src="src/assets/logo.png"
            alt="Codex Desktop Logo"
            className="w-12 h-12 mx-auto mb-4 animate-pulse"
          />
          <h3 className="text-lg font-medium text-[#6BE4A8] mb-2">
            Codex Not Running
          </h3>
          <p className="text-sm text-gray-300">
            Please start Codex using the configuration panel above to enable file upload and download functionality.
          </p>
        </div>
      </div>
    );
  }

  const totalSteps = 6;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps) {
      // Mark onboarding as complete when finishing the last step
      localStorage.setItem('codexOnboardingComplete', 'true');
      setIsOnboardingComplete(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedFromStep = (step: number) => {
    switch (step) {
      case 2:
        return agreedToDisclaimer;
      case 3:
        return isDirectorySet;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center h-full flex flex-col justify-center">
            <div className="flex items-center justify-center mx-auto mb-6">
              <img
                src="src/assets/logo.png"
                alt="Codex Desktop Logo"
                className="w-20 h-20"
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to Codex Desktop</h2>
            <div className="bg-[#6BE4A8]/10 border border-[#6BE4A8]/30 rounded-lg p-4">
              <p className="text-sm text-[#6BE4A8]">
                Let's get you set up!
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center h-full flex flex-col">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Important Disclaimer</h2>
            <div className="bg-black/40 rounded-lg p-6 mb-6 text-left flex-1 overflow-y-auto">
              <div className="space-y-4 text-sm text-gray-300">
              <p><strong className="text-white">Independent software:</strong> Codex Desktop is currently in alpha and is not affiliated directly with the Codex team yet. However, this is currently an independent effort from a core contributor and could be maintained by the Codex team at some point.</p>
                <p><strong className="text-white">Experimental Software:</strong> Codex is experimental software under active development. Use at your own risk.</p>
                <p><strong className="text-white">Data Safety:</strong> Always backup important data. The software may have bugs that could affect your files.</p>
                <p><strong className="text-white">Network Participation:</strong> Your node will participate in a decentralized network and may use bandwidth and storage.</p>
                <p><strong className="text-white">Privacy:</strong> Files stored on the network may be accessible to other network participants.</p>
                <p><strong className="text-white">No Warranty:</strong> This software is provided "as is" without any warranty.</p>
                <p><strong className="text-white">Beta Software:</strong> This is beta software and may contain bugs, errors, or other issues that could cause system crashes or data loss.</p>
                <p><strong className="text-white">Internet Connection:</strong> The application requires an internet connection to participate in the decentralized network.</p>
                <p><strong className="text-white">Resource Usage:</strong> Running Codex may consume significant system resources including CPU, memory, and disk space.</p>
                <p><strong className="text-white">Legal Compliance:</strong> Users are responsible for ensuring their use of Codex complies with applicable laws and regulations.</p>
                <p><strong className="text-white">Support:</strong> This is experimental software with limited support. Use community resources for help.</p>
                <p><strong className="text-white">Open Source:</strong> Codex Desktop is open source and available on GitHub.</p>
                <p><strong className="text-white">No Liability:</strong>The developers of Codex Desktop are not liable for any damages or losses resulting from the use of this software. However, Codex Desktop is open source and hence auditable before usage.</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToDisclaimer}
                  onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                  agreedToDisclaimer ? 'bg-[#6BE4A8] border-[#6BE4A8]' : 'border-gray-400'
                }`}>
                  {agreedToDisclaimer && <FiCheck className="w-3 h-3 text-black" />}
                </div>
                <span className="text-white">I understand and agree to these terms</span>
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center h-full flex flex-col">
            <div className="flex-1 flex flex-col justify-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiFolder className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Select Data Directory</h2>
              <p className="text-gray-300 mb-6">
                Choose a directory where Codex will store its data files. This should be a location with sufficient 
                storage space and proper permissions.
              </p>
              <div className="bg-black/40 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-2">Current Directory:</p>
                <p className="text-white font-mono text-sm break-all mb-4">
                  {dataDirectory || 'No directory selected'}
                </p>
                <button
                  onClick={handleSelectDirectory}
                  className="w-full px-4 py-3 bg-[#6BE4A8] text-black rounded-lg font-medium hover:bg-[#5ad396] transition-colors flex items-center justify-center"
                >
                  <FiFolder className="w-5 h-5 mr-2" />
                  Select Data Directory
                </button>
              </div>
            </div>
            {isDirectorySet && (
              <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3 mt-2">
                <p className="text-sm text-green-400 flex items-center justify-center">
                  <FiCheck className="w-4 h-4 mr-2" />
                  Directory selected successfully
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="text-center h-full flex flex-col justify-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiDownload className="w-8 h-8 text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Download Location</h2>
            <p className="text-gray-300 mb-6">
              Choose where downloaded files will be saved. You can use the default location or select a custom directory.
            </p>
            <div className="bg-black/40 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Current Location:</p>
              <p className="text-white font-mono text-sm break-all mb-4">
                {customDownloadPath || 'Using default downloads directory'}
              </p>
              <button
                onClick={selectDownloadDirectory}
                className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center justify-center mb-3"
              >
                <FiFolder className="w-5 h-5 mr-2" />
                Choose Custom Directory
              </button>
              <p className="text-xs text-gray-400">
                Leave as default if you're not sure - you can change this later in Settings
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center h-full flex flex-col">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiServer className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Port Configuration</h2>
              <p className="text-gray-300 mb-4">
                Configure the network ports Codex will use. The default values should work for most users.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="bg-black/40 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Discovery Port</label>
                  <input
                    type="text"
                    value={discoveryPort}
                    onChange={(e) => handleDiscoveryPortChange(e.target.value)}
                    className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent"
                    placeholder="8090"
                  />
                </div>
                <div className="bg-black/40 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Listening Port</label>
                  <input
                    type="text"
                    value={listeningPort}
                    onChange={(e) => handleListeningPortChange(e.target.value)}
                    className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent"
                    placeholder="8070"
                  />
                </div>
                <div className="bg-black/40 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">API Port</label>
                  <input
                    type="text"
                    value={apiPort}
                    onChange={(e) => handleApiPortChange(e.target.value)}
                    className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-transparent"
                    placeholder="8080"
                  />
                </div>
              </div>
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-blue-400">
                  💡 Keep default values unless you have specific requirements or port conflicts
                </p>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="text-center h-full flex flex-col justify-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Setup Complete!</h2>
            <p className="text-gray-300 mb-6">
              Congratulations! Codex Desktop is now configured and ready to use. You can start the Codex node 
              using the power button in the top navigation.
            </p>
            <div className="bg-[#6BE4A8]/10 border border-[#6BE4A8]/30 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-[#6BE4A8] mb-3">What's Next?</h3>
              <ul className="text-sm text-gray-300 space-y-2 text-left">
                <li className="flex items-center">
                  <FiCheck className="w-4 h-4 text-[#6BE4A8] mr-2 flex-shrink-0" />
                  Click the hexagonal power button to start Codex
                </li>
                <li className="flex items-center">
                  <FiCheck className="w-4 h-4 text-[#6BE4A8] mr-2 flex-shrink-0" />
                  Upload your first file to the network
                </li>
                <li className="flex items-center">
                  <FiCheck className="w-4 h-4 text-[#6BE4A8] mr-2 flex-shrink-0" />
                  Explore the Network Status to see connected nodes
                </li>
                <li className="flex items-center">
                  <FiCheck className="w-4 h-4 text-[#6BE4A8] mr-2 flex-shrink-0" />
                  Visit Settings anytime to adjust your configuration
                </li>
              </ul>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-xs text-yellow-400">
                ⚡ Auto-start is enabled by default. Codex will start automatically when you open the app.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Hexagonal background animation */}
      <div className="absolute inset-0 overflow-hidden">
        <Squares 
          speed={0.5} 
          squareSize={90}
          direction='diagonal'
          borderColor='#6BE4A8'
          hoverFillColor='rgba(107, 228, 168, 0.3)'
        />
      </div>
      
      {/* Setup wizard overlay */}
      <div className="relative z-10 bg-black/90 border border-[#6BE4A8]/30 rounded-xl p-8 max-w-2xl w-full mx-auto backdrop-blur-sm h-[600px] flex flex-col">
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i + 1 < currentStep 
                    ? 'bg-[#6BE4A8] text-black' 
                    : i + 1 === currentStep 
                      ? 'bg-[#6BE4A8]/20 text-[#6BE4A8] border-2 border-[#6BE4A8]' 
                      : 'bg-gray-600 text-gray-400'
                }`}>
                  {i + 1 < currentStep ? <FiCheck className="w-4 h-4" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`w-8 h-0.5 mx-2 transition-colors ${
                    i + 1 < currentStep ? 'bg-[#6BE4A8]' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step indicator */}
        <div className="text-center mb-6">
          <span className="text-sm text-gray-400">Step {currentStep} of {totalSteps}</span>
        </div>

        {/* Step content */}
        <div className="flex-1 mb-8 overflow-hidden">
          {renderStepContent()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <div className="text-sm text-gray-400">
            {currentStep} / {totalSteps}
          </div>

          <button
            onClick={nextStep}
            disabled={!canProceedFromStep(currentStep)}
            className="flex items-center px-6 py-2 bg-[#6BE4A8] text-black rounded-lg font-medium hover:bg-[#5ad396] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentStep === totalSteps ? 'Finish' : 'Next'}
            <FiChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Install; 