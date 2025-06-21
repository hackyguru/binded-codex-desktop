import { useState, useEffect } from 'react';

export interface RecentFile {
  id: string;
  cid: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  timestamp: number;
  source: 'upload' | 'search' | 'download';
}

const STORE_KEY = 'recent-files';
const MAX_RECENT_FILES = 10;

export const useRecentFiles = () => {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load recent files from localStorage
  const loadRecentFiles = () => {
    try {
      const stored = localStorage.getItem(STORE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentFile[];
        setRecentFiles(parsed);
      }
    } catch (error) {
      console.error('Failed to load recent files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save recent files to localStorage
  const saveRecentFiles = (files: RecentFile[]) => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(files));
    } catch (error) {
      console.error('Failed to save recent files:', error);
    }
  };

  // Add a new file to recent files
  const addRecentFile = (file: Omit<RecentFile, 'id' | 'timestamp'>) => {
    const newFile: RecentFile = {
      ...file,
      id: `${file.cid}-${Date.now()}`,
      timestamp: Date.now(),
    };

    setRecentFiles(prev => {
      // Remove duplicate files (same CID)
      const filtered = prev.filter(f => f.cid !== file.cid);
      // Add new file at the beginning
      const updated = [newFile, ...filtered];
      // Keep only the last MAX_RECENT_FILES
      const limited = updated.slice(0, MAX_RECENT_FILES);
      
      // Save to localStorage
      saveRecentFiles(limited);
      
      return limited;
    });
  };

  // Clear all recent files
  const clearRecentFiles = () => {
    setRecentFiles([]);
    saveRecentFiles([]);
  };

  // Remove a specific file from recent files
  const removeRecentFile = (id: string) => {
    setRecentFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      saveRecentFiles(updated);
      return updated;
    });
  };

  // Load recent files on mount
  useEffect(() => {
    loadRecentFiles();
  }, []);

  return {
    recentFiles,
    isLoading,
    addRecentFile,
    clearRecentFiles,
    removeRecentFile,
  };
}; 