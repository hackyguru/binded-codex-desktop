import { useState, useEffect } from 'react';
import { storageUtils } from '../utils/storage';
import { LOCAL_STORAGE_KEYS } from '../constants';

export type NodeType = 'local' | 'remote';

export interface RemoteNodeConfig {
  endpoint: string;
  username: string;
  password: string;
}

export const useNodeConfig = () => {
  const [nodeType, setNodeType] = useState<NodeType>('local');
  const [remoteConfig, setRemoteConfig] = useState<RemoteNodeConfig>({
    endpoint: '',
    username: '',
    password: ''
  });

  // Function to load configuration from localStorage
  const loadConfigFromStorage = () => {
    const savedNodeType = storageUtils.getNodeType();
    const savedEndpoint = storageUtils.getRemoteEndpoint() || '';
    const savedUsername = storageUtils.getRemoteUsername() || '';
    const savedPassword = storageUtils.getRemotePassword() || '';

    console.log('useNodeConfig - Loading configuration:', { savedNodeType, savedEndpoint });

    setNodeType(savedNodeType);
    setRemoteConfig({
      endpoint: savedEndpoint,
      username: savedUsername,
      password: savedPassword
    });
  };

  // Initialize from localStorage and set up listener for changes
  useEffect(() => {
    // Load initial configuration
    loadConfigFromStorage();

    // Listen for localStorage changes from other components/tabs
    const handleStorageChange = (e: StorageEvent) => {
      // Check if any of our keys changed
      if (e.key === LOCAL_STORAGE_KEYS.NODE_TYPE || 
          e.key === LOCAL_STORAGE_KEYS.REMOTE_ENDPOINT || 
          e.key === LOCAL_STORAGE_KEYS.REMOTE_USERNAME || 
          e.key === LOCAL_STORAGE_KEYS.REMOTE_PASSWORD) {
        console.log('useNodeConfig - Storage change detected:', e.key, e.newValue);
        loadConfigFromStorage();
      }
    };

    // Custom event listener for same-tab changes (localStorage events only fire for other tabs)
    const handleCustomStorageChange = () => {
      console.log('useNodeConfig - Custom storage change detected');
      loadConfigFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('nodeConfigChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('nodeConfigChanged', handleCustomStorageChange);
    };
  }, []);

  const handleNodeTypeChange = (type: NodeType) => {
    console.log('useNodeConfig - Changing node type to:', type);
    setNodeType(type);
    storageUtils.setNodeType(type);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('nodeConfigChanged'));
  };

  const handleRemoteConfigChange = (config: Partial<RemoteNodeConfig>) => {
    const newConfig = { ...remoteConfig, ...config };
    setRemoteConfig(newConfig);
    
    if (config.endpoint !== undefined) {
      storageUtils.setRemoteEndpoint(config.endpoint);
    }
    if (config.username !== undefined) {
      storageUtils.setRemoteUsername(config.username);
    }
    if (config.password !== undefined) {
      storageUtils.setRemotePassword(config.password);
    }

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('nodeConfigChanged'));
  };

  const clearRemoteConfig = () => {
    setRemoteConfig({
      endpoint: '',
      username: '',
      password: ''
    });
    storageUtils.removeRemoteConfig();
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('nodeConfigChanged'));
  };

  const isRemoteConfigValid = () => {
    return nodeType === 'local' || (
      remoteConfig.endpoint.trim() !== '' &&
      remoteConfig.username.trim() !== '' &&
      remoteConfig.password.trim() !== ''
    );
  };

  return {
    nodeType,
    remoteConfig,
    handleNodeTypeChange,
    handleRemoteConfigChange,
    clearRemoteConfig,
    isRemoteConfigValid
  };
}; 