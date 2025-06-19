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

  // Initialize and load saved data directory and ports
  useEffect(() => {
    const savedDir = storageUtils.getDataDirectory();
    const savedDiscoveryPort = storageUtils.getDiscoveryPort();
    const savedListeningPort = storageUtils.getListeningPort();
    const savedApiPort = storageUtils.getApiPort();
    
    if (savedDir) {
      setDataDirectory(savedDir);
      setIsDirectorySet(true);
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
  }, []);

  const handleSelectDirectory = async () => {
    try {
      const selected = await open({
        multiple: false,
        directory: true,
        title: 'Select Codex Data Directory'
      });
      
      if (selected && typeof selected === 'string') {
        setDataDirectory(selected);
        setIsDirectorySet(true);
        storageUtils.setDataDirectory(selected);
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

  return {
    dataDirectory,
    isDirectorySet,
    discoveryPort,
    listeningPort,
    apiPort,
    handleSelectDirectory,
    handleChangeDirectory,
    handleDiscoveryPortChange,
    handleListeningPortChange,
    handleApiPortChange
  };
}; 