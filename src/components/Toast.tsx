import React from 'react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info' | 'warning';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const bgStyles = {
    success: 'bg-tertiary text-on-tertiary',
    info: 'bg-primary text-on-primary',
    warning: 'bg-on-surface text-surface',
  }[type];

  const iconName = {
    success: 'check_circle',
    info: 'info',
    warning: 'warning',
  }[type];

  return (
    <div className="fixed top-20 right-4 z-50 animate-bounce duration-300">
      <div
        className={`${bgStyles} px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 max-w-md border border-white/10`}
      >
        <span className="material-symbols-outlined text-[20px]">{iconName}</span>
        <span className="font-title-sm text-title-sm flex-1">{message}</span>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full hover:bg-black/20 flex items-center justify-center transition-colors text-white"
          type="button"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
};
