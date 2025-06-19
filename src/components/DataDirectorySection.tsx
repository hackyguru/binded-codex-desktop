import React from 'react';

interface DataDirectorySectionProps {
  isDirectorySet: boolean;
  dataDirectory: string;
  onSelectDirectory: () => void;
  onChangeDirectory: () => void;
}

const DataDirectorySection: React.FC<DataDirectorySectionProps> = ({
  isDirectorySet,
  dataDirectory,
  onSelectDirectory,
  onChangeDirectory
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
        Data Directory
      </h3>
      
      {!isDirectorySet ? (
        <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-6">
          <p className="text-gray-300 mb-4">Please select a directory to store Codex data:</p>
          <button 
            onClick={onSelectDirectory}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Select Data Directory
          </button>
        </div>
      ) : (
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <strong className="text-green-400">Current Directory:</strong>
            </div>
            <p className="text-gray-200 font-mono text-sm bg-gray-800/50 p-3 rounded-lg break-all">{dataDirectory}</p>
          </div>
          <button 
            onClick={onChangeDirectory}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Change Directory
          </button>
        </div>
      )}
    </div>
  );
};

export default DataDirectorySection; 