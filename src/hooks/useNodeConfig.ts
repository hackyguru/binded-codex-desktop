import { useState, useEffect } from 'react';
import { storageUtils } from '../utils/storage';

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

  // Initialize from localStorage
  useEffect(() => {
    const savedNodeType = storageUtils.getNodeType();
    const savedEndpoint = storageUtils.getRemoteEndpoint() || '';
    const savedUsername = storageUtils.getRemoteUsername() || '';
    const savedPassword = storageUtils.getRemotePassword() || '';

    setNodeType(savedNodeType);
    setRemoteConfig({
      endpoint: savedEndpoint,
      username: savedUsername,
      password: savedPassword
    });
  }, []);

  const handleNodeTypeChange = (type: NodeType) => {
    setNodeType(type);
    storageUtils.setNodeType(type);
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
  };

  const clearRemoteConfig = () => {
    setRemoteConfig({
      endpoint: '',
      username: '',
      password: ''
    });
    storageUtils.removeRemoteConfig();
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