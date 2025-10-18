import React from 'react';
import { Theme } from '../types';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  theme: Theme;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  theme
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 70 }}>
      <div className="rounded-lg max-w-md w-full p-6" style={{
        backgroundColor: theme.id === 'midnight' ? '#2C2C2E' : '#FFFFFF'
      }}>
        <h3 className="text-xl font-bold mb-3" style={{ color: theme.text }}>{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border transition-colors"
            style={{
              borderColor: theme.accent,
              color: theme.text,
              backgroundColor: theme.background
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-white transition-colors"
            style={{
              backgroundColor: '#EF4444'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
