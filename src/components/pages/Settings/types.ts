import { ReactNode } from 'react';

export interface SettingsProps {
  connectionStatus?: string;
  onKillCodex?: () => void;
}

export type SettingsCategory = 'general' | 'codex' | 'downloads' | 'system';

export interface CategoryItem {
  id: SettingsCategory;
  name: string;
  icon: ReactNode;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  warningMessage?: string;
  confirmationText: string;
  onConfirmationTextChange: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText: string;
  icon: ReactNode;
  destructiveItems?: string[];
} 