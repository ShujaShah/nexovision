import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1 text-[var(--text-secondary)] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <p className="text-[var(--text-secondary)] mb-6">
            {message}
          </p>
          
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="btn-secondary"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="btn-danger flex items-center justify-center"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
