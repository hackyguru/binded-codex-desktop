import React from 'react';

interface StatusLogProps {
  codexOutput: string;
}

const StatusLog: React.FC<StatusLogProps> = ({ codexOutput }) => {
  if (!codexOutput) return null;

  return (
    <div className="mt-8 max-w-4xl mx-auto bg-black">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Status Log
        </h3>
        <pre className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-sm text-gray-200 font-mono overflow-x-auto whitespace-pre-wrap">{codexOutput}</pre>
      </div>
    </div>
  );
};

export default StatusLog; 