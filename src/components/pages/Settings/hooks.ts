import { useState } from 'react';
import { CONFIRMATION_TEXT } from './constants';

export const useClearDataModal = () => {
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const handleOpenModal = () => {
    setConfirmationText('');
    setShowClearDataModal(true);
  };

  const handleCloseModal = () => {
    setShowClearDataModal(false);
    setConfirmationText('');
  };

  const handleConfirmClearData = () => {
    if (confirmationText !== CONFIRMATION_TEXT) {
      alert('Please type "Confirm" exactly to proceed with clearing app data.');
      return;
    }

    try {
      localStorage.clear();
      handleCloseModal();
      
      setTimeout(() => {
        alert("App data cleared successfully. The application will now restart.");
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Error clearing app data:', error);
      alert("Error clearing app data. Please try again.");
      handleCloseModal();
    }
  };

  return {
    showClearDataModal,
    confirmationText,
    setConfirmationText,
    handleOpenModal,
    handleCloseModal,
    handleConfirmClearData,
  };
};

export const useKillCodexModal = (onKillCodex?: () => void) => {
  const [showKillCodexModal, setShowKillCodexModal] = useState(false);
  const [killCodexConfirmationText, setKillCodexConfirmationText] = useState('');

  const handleOpenModal = () => {
    setKillCodexConfirmationText('');
    setShowKillCodexModal(true);
  };

  const handleCloseModal = () => {
    setShowKillCodexModal(false);
    setKillCodexConfirmationText('');
  };

  const handleConfirmKillCodex = () => {
    if (killCodexConfirmationText !== CONFIRMATION_TEXT) {
      alert('Please type "Confirm" exactly to proceed with killing Codex processes.');
      return;
    }

    try {
      handleCloseModal();
      
      if (onKillCodex) {
        onKillCodex();
      }
    } catch (error) {
      console.error('Error killing Codex processes:', error);
      alert("Error killing Codex processes. Please try again.");
      handleCloseModal();
    }
  };

  return {
    showKillCodexModal,
    killCodexConfirmationText,
    setKillCodexConfirmationText,
    handleOpenModal,
    handleCloseModal,
    handleConfirmKillCodex,
  };
}; 