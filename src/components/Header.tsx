import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
        Codex Desktop
      </h1>
      <p className="text-gray-400 text-lg">
        Decentralized storage network client
      </p>
    </div>
  );
};

export default Header; 