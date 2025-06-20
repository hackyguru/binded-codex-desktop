import React from 'react';
import { FileUpload, Install } from '../index';

interface DashboardProps {
  connectionStatus: string;
  isConnected: boolean;
  apiPort: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  connectionStatus, 
  isConnected, 
  apiPort 
}) => {
  return (
    <div className="">
      {/* File Upload/Download Section */}
      <div className="">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg 
            className="w-5 h-5 mr-2 text-green-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" 
            />
          </svg>
          File Storage
        </h3>
        {connectionStatus === "Found" ? (
          <FileUpload apiPort={apiPort} isConnected={isConnected} />
        ) : (
          <Install />
        )}
      </div>
    </div>
  );
};

export default Dashboard; 