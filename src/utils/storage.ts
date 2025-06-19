import { LOCAL_STORAGE_KEYS } from '../constants';

export const storageUtils = {
  getDataDirectory: (): string | null => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.DATA_DIRECTORY);
  },

  setDataDirectory: (directory: string): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.DATA_DIRECTORY, directory);
  },

  removeDataDirectory: (): void => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.DATA_DIRECTORY);
  },

  getDiscoveryPort: (): string | null => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.DISCOVERY_PORT);
  },

  setDiscoveryPort: (port: string): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.DISCOVERY_PORT, port);
  },

  getListeningPort: (): string | null => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.LISTENING_PORT);
  },

  setListeningPort: (port: string): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.LISTENING_PORT, port);
  },

  getApiPort: (): string | null => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.API_PORT);
  },

  setApiPort: (port: string): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.API_PORT, port);
  },

  getDownloadLocation: (): string | null => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.DOWNLOAD_LOCATION);
  },

  setDownloadLocation: (location: string): void => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.DOWNLOAD_LOCATION, location);
  },

  removeDownloadLocation: (): void => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.DOWNLOAD_LOCATION);
  }
}; 