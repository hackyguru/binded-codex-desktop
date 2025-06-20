import React from 'react';
import { FiHome, FiFilm, FiSearch, FiSettings, FiMoon, FiGlobe } from 'react-icons/fi';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  return (
    <aside className="fixed top-0 left-0 h-full w-20  flex flex-col items-center py-6 z-30 ">
      {/* Logo/Avatar */}
      <div className="mb-8">
        <img
          src="src/assets/logo.png" // Placeholder ghost icon
          alt="App Logo"
          className="w-12 h-12"
        />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-8 flex-1 justify-center">
        <SidebarIcon
          icon={<FiHome size={24} />}
          label="Dashboard"
          active={activePage === 'Dashboard'}
          onClick={() => setActivePage('Dashboard')}
        />
        <SidebarIcon
          icon={<FiFilm size={24} />}
          label="Torrents"
          active={activePage === 'Torrents'}
          onClick={() => setActivePage('Torrents')}
        />
        <SidebarIcon
          icon={<FiSearch size={24} />}
          label="Search"
          active={activePage === 'Search'}
          onClick={() => setActivePage('Search')}
        />
        <SidebarIcon
          icon={<FiSettings size={24} />}
          label="Settings"
          active={activePage === 'Settings'}
          onClick={() => setActivePage('Settings')}
        />
      </nav>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center gap-6 mt-auto mb-2">
        <button className="flex flex-col items-center text-gray-400 hover:text-white focus:outline-none">
          <FiGlobe size={20} />
          <span className="text-xs mt-1">EN</span>
        </button>
        <button className="flex flex-col items-center text-gray-400 hover:text-white focus:outline-none">
          <FiMoon size={20} />
        </button>
      </div>
    </aside>
  );
};

interface SidebarIconProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 text-gray-400 hover:text-white focus:outline-none transition-colors ${
      active ? 'text-white' : ''
    }`}
    tabIndex={0}
    aria-label={label}
  >
    {icon}
    <span className="text-xs mt-2 tracking-wide">{label}</span>
  </button>
);

export default Sidebar; 