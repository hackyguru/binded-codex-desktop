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
    <div className="w-full h-full">
      {/* File Upload/Download Section */}
      <div className="w-full h-full">
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