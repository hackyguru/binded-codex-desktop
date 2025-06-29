import React from 'react';
import { FiSettings, FiServer, FiDownload, FiMonitor } from 'react-icons/fi';
import { CategoryItem } from './types';

export const SETTINGS_CATEGORIES: CategoryItem[] = [
  { id: 'general', name: 'General', icon: React.createElement(FiSettings, { className: "w-5 h-5" }) },
  { id: 'codex', name: 'Codex Node', icon: React.createElement(FiServer, { className: "w-5 h-5" }) },
  { id: 'downloads', name: 'Downloads', icon: React.createElement(FiDownload, { className: "w-5 h-5" }) },
  { id: 'system', name: 'System', icon: React.createElement(FiMonitor, { className: "w-5 h-5" }) },
];

export const STORAGE_PRESETS = [
  { value: 1 * 1024 * 1024 * 1024, label: '1GB' },
  { value: 5 * 1024 * 1024 * 1024, label: '5GB' },
  { value: 10 * 1024 * 1024 * 1024, label: '10GB' },
  { value: 25 * 1024 * 1024 * 1024, label: '25GB' },
  { value: 50 * 1024 * 1024 * 1024, label: '50GB' },
  { value: 100 * 1024 * 1024 * 1024, label: '100GB' },
  { value: 250 * 1024 * 1024 * 1024, label: '250GB' },
  { value: 500 * 1024 * 1024 * 1024, label: '500GB' },
] as const;

export const CONFIRMATION_TEXT = 'Confirm';

export const CLEAR_DATA_ITEMS = [
  'Data directory selection',
  'Port configurations',
  'Storage quota settings',
  'Download location preferences',
  'Recent files history',
  'Remote node configurations',
  'Auto-start preferences',
  'Onboarding completion status',
];

export const MODAL_CLEAR_DATA_ITEMS = [
  'All settings and configurations',
  'Recent files history',
  'Remote node credentials',
  'Onboarding completion status',
]; 