import React from 'react';
import { FiSearch } from 'react-icons/fi';

const Search: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <FiSearch size={64} className="mb-4" />
      <h1 className="text-2xl font-bold">Search Page</h1>
      <p>This is a placeholder for the Search page.</p>
    </div>
  );
};

export default Search; 