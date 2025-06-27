import { useState, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { storageUtils } from '../utils/storage';
import { validationUtils } from '../utils/validation';
import { DEFAULT_PORTS } from '../constants';

export const useCodexConfig = () => {
  const [dataDirectory, setDataDirectory] = useState<string>("");
  const [isDirectorySet, setIsDirectorySet] = useState(false);
  const [discoveryPort, setDiscoveryPort] = useState<string>(DEFAULT_PORTS.DISCOVERY);
  const [listeningPort, setListeningPort] = useState<string>(DEFAULT_PORTS.LISTENING);
  const [apiPort, setApiPort] = useState<string>(DEFAULT_PORTS.API);
  const [autoStartCodex, setAutoStartCodex] = useState<boolean>(true);

  // Initialize and load saved data directory and ports
  useEffect(() => {
    const savedDir = storageUtils.getDataDirectory();
    const savedDiscoveryPort = storageUtils.getDiscoveryPort();
    const savedListeningPort = storageUtils.getListeningPort();
    const savedApiPort = storageUtils.getApiPort();
    const savedAutoStartCodex = storageUtils.getAutoStartCodex();
    
    // Debug logging
    console.log('useCodexConfig initializing:', {
      savedDir,
      isDirectoryCurrentlySet: !!savedDir,
      onboardingComplete: localStorage.getItem('codexOnboardingComplete')
    });
    
    console.log('Loading auto-start setting:', {
      savedAutoStartCodex,
      rawValue: localStorage.getItem('codexAutoStartEnabled')
    });
    
    if (savedDir) {
      console.log('Setting directory and isDirectorySet to true:', savedDir);
      setDataDirectory(savedDir);
      setIsDirectorySet(true);
    } else {
      console.log('No saved directory found, isDirectorySet remains false');
    }
    
    if (savedDiscoveryPort) {
      setDiscoveryPort(savedDiscoveryPort);
    }
    
    if (savedListeningPort) {
      setListeningPort(savedListeningPort);
    }
    
    if (savedApiPort) {
      setApiPort(savedApiPort);
    }
    
    setAutoStartCodex(savedAutoStartCodex);
  }, []);

  // Debug effect to track isDirectorySet changes
  useEffect(() => {
    console.log('isDirectorySet changed:', {
      isDirectorySet,
      dataDirectory,
      savedDir: storageUtils.getDataDirectory()
    });
  }, [isDirectorySet, dataDirectory]);

  const handleSelectDirectory = async () => {
    try {
      console.log('Opening directory selector...');
      const selected = await open({
        multiple: false,
        directory: true,
        title: 'Select Codex Data Directory'
      });
      
      console.log('Directory selection result:', selected);
      
      if (selected && typeof selected === 'string') {
        console.log('Setting directory:', selected);
        setDataDirectory(selected);
        setIsDirectorySet(true);
        storageUtils.setDataDirectory(selected);
        console.log('Directory set successfully, isDirectorySet should now be true');
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
    }
  };

  const handleChangeDirectory = () => {
    setIsDirectorySet(false);
    setDataDirectory("");
    storageUtils.removeDataDirectory();
  };

  const handleDiscoveryPortChange = (value: string) => {
    const port = validationUtils.validatePortInput(value);
    if (port) {
      setDiscoveryPort(port);
      storageUtils.setDiscoveryPort(port);
    }
  };

  const handleListeningPortChange = (value: string) => {
    const port = validationUtils.validatePortInput(value);
    if (port) {
      setListeningPort(port);
      storageUtils.setListeningPort(port);
    }
  };

  const handleApiPortChange = (value: string) => {
    const port = validationUtils.validatePortInput(value);
    if (port) {
      setApiPort(port);
      storageUtils.setApiPort(port);
    }
  };

  const handleAutoStartCodexChange = (enabled: boolean) => {
    console.log('Changing auto-start setting to:', enabled);
    setAutoStartCodex(enabled);
    storageUtils.setAutoStartCodex(enabled);
    console.log('Saved to localStorage:', localStorage.getItem('codexAutoStartEnabled'));
  };

  return {
    dataDirectory,
    isDirectorySet,
    discoveryPort,
    listeningPort,
    apiPort,
    autoStartCodex,
    handleSelectDirectory,
    handleChangeDirectory,
    handleDiscoveryPortChange,
    handleListeningPortChange,
    handleApiPortChange,
    handleAutoStartCodexChange
  };
}; 