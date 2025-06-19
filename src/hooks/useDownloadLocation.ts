import { useState, useEffect } from 'react';
import { downloadDir } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { storageUtils } from '../utils/storage';

export const useDownloadLocation = () => {
  const [customDownloadPath, setCustomDownloadPath] = useState<string | null>(null);
  const [defaultDownloadPath, setDefaultDownloadPath] = useState<string>('');

  // Initialize and load saved download location
  useEffect(() => {
    const loadDownloadLocation = async () => {
      try {
        // Get the default download directory
        const defaultPath = await downloadDir();
        setDefaultDownloadPath(defaultPath);
        
        // Load saved custom download location
        const savedLocation = storageUtils.getDownloadLocation();
        if (savedLocation) {
          setCustomDownloadPath(savedLocation);
        }
      } catch (error) {
        console.error('Error loading download location:', error);
      }
    };

    loadDownloadLocation();
  }, []);

  const selectDownloadDirectory = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: customDownloadPath || defaultDownloadPath
      });
      
      if (selected && typeof selected === 'string') {
        setCustomDownloadPath(selected);
        storageUtils.setDownloadLocation(selected);
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
    }
  };

  const resetToDefault = () => {
    setCustomDownloadPath(null);
    storageUtils.removeDownloadLocation();
  };

  const getCurrentDownloadPath = (): string => {
    return customDownloadPath || defaultDownloadPath;
  };

  return {
    customDownloadPath,
    defaultDownloadPath,
    selectDownloadDirectory,
    resetToDefault,
    getCurrentDownloadPath
  };
}; 