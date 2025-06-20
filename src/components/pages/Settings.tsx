import React from 'react';
import { FiSettings } from 'react-icons/fi';

const Settings: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <FiSettings size={64} className="mb-4" />
      <h1 className="text-2xl font-bold">Settings Page</h1>
      <p>This is a placeholder for the Settings page.</p>
    </div>
  );
};

export default Settings; 