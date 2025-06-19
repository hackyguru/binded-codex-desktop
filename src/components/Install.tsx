import React from 'react';

const Install: React.FC = () => {
  return (
    <div className="text-center p-8">
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 max-w-md mx-auto">
        <svg className="w-12 h-12 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-lg font-medium text-yellow-400 mb-2">
          Codex Not Running
        </h3>
        <p className="text-sm text-yellow-300">
          Please start Codex using the configuration panel above to enable file upload and download functionality.
        </p>
      </div>
    </div>
  );
};

export default Install; 