import React from 'react';
import { SettingsCategory } from './types';
import { SETTINGS_CATEGORIES } from './constants';

interface SettingsSidebarProps {
  activeCategory: SettingsCategory;
  onCategoryChange: (category: SettingsCategory) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="w-52 flex-shrink-0 h-full">
      <div className="bg-black/20 rounded-xl p-4 h-full">
        <h1 className="text-lg font-bold text-white mb-4">Settings</h1>
        <nav className="space-y-1">
          {SETTINGS_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-left text-sm group ${
                activeCategory === category.id
                  ? 'bg-[#6BE4A8] text-black font-medium'
                  : 'text-gray-300 hover:bg-black/20 hover:text-white'
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center">
                {React.cloneElement(category.icon as React.ReactElement, { 
                  className: `w-4 h-4 ${
                    activeCategory === category.id 
                      ? 'text-black' 
                      : 'text-gray-400 group-hover:text-white'
                  }` 
                })}
              </span>
              <span className="ml-2.5">{category.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SettingsSidebar; 