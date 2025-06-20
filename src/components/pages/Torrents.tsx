import React from 'react';
import { FiFilm } from 'react-icons/fi';

const Torrents: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <FiFilm size={64} className="mb-4" />
      <h1 className="text-2xl font-bold">Torrents Page</h1>
      <p>This is a placeholder for the Torrents page.</p>
    </div>
  );
};

export default Torrents; 