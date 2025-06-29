import React from 'react';
import { ConfirmationModalProps } from './types';
import { CONFIRMATION_TEXT } from './constants';

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  warningMessage,
  confirmationText,
  onConfirmationTextChange,
  onConfirm,
  onCancel,
  confirmButtonText,
  icon,
  destructiveItems,
}) => {
  if (!isOpen) return null;

  const isConfirmationValid = confirmationText === CONFIRMATION_TEXT;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/90 border border-[#6BE4A8]/30 rounded-xl p-6 max-w-md w-full mx-4 backdrop-blur-sm">
        <div className="flex items-center mb-4">
          <span className="w-6 h-6 text-red-400 mr-3">
            {icon}
          </span>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        
        <p className="text-gray-300 mb-4">{description}</p>
        
        {destructiveItems && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-300 mb-2">This will permanently delete:</p>
            <ul className="text-xs text-red-200 space-y-1">
              {destructiveItems.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {warningMessage && (
          <p className="text-xs text-yellow-400 mb-6">
            ⚠️ {warningMessage}
          </p>
        )}
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Type <span className="text-[#6BE4A8] font-semibold">{CONFIRMATION_TEXT}</span> to proceed:
          </label>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => onConfirmationTextChange(e.target.value)}
            placeholder={`Type '${CONFIRMATION_TEXT}' here...`}
            className="w-full px-3 py-2 bg-black/40 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6BE4A8] focus:border-[#6BE4A8] transition-all duration-200"
            autoFocus
          />
          {confirmationText && !isConfirmationValid && (
            <p className="text-xs text-red-400 mt-1">
              Please type "{CONFIRMATION_TEXT}" exactly (case-sensitive)
            </p>
          )}
          {isConfirmationValid && (
            <p className="text-xs text-[#6BE4A8] mt-1">
              ✓ Confirmation text is correct
            </p>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 border border-gray-600 hover:border-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isConfirmationValid}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:hover:scale-100"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 