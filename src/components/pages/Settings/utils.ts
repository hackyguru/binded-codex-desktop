import { STORAGE_PRESETS } from './constants';

/**
 * Formats bytes to human readable format
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Parses human readable format to bytes
 */
export const parseStorageInput = (input: string): number => {
  const match = input.match(/^(\d+(?:\.\d+)?)\s*(GB|MB|KB|Bytes?)?$/i);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = (match[2] || 'bytes').toLowerCase();
  
  switch (unit) {
    case 'tb': 
      return value * 1024 * 1024 * 1024 * 1024;
    case 'gb': 
      return value * 1024 * 1024 * 1024;
    case 'mb': 
      return value * 1024 * 1024;
    case 'kb': 
      return value * 1024;
    default: 
      return value;
  }
};

/**
 * Checks if a preset value is currently selected
 */
export const isPresetSelected = (presetBytes: number, currentQuota: string): boolean => {
  return parseInt(currentQuota) === presetBytes;
};

/**
 * Checks if current value is a custom value (not matching any preset)
 */
export const isCustomValue = (currentQuota: string): boolean => {
  return !STORAGE_PRESETS.some(preset => isPresetSelected(preset.value, currentQuota));
}; 