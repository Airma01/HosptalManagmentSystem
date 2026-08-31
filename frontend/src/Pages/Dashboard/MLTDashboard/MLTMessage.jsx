import React from 'react';

/**
 * Success / info / warning banner.
 * props: message, type = 'success' | 'info' | 'warning', onClose?
 */
export default function MLTMessage({ message, type = 'success', onClose }) {
  if (!message) return null;

  const styles = {
    success: {
      box: 'border-green-200 bg-green-50 text-green-800',
      icon: 'bi-check-circle text-green-600',
    },
    info: {
      box: 'border-blue-200 bg-blue-50 text-blue-800',
      icon: 'bi-info-circle text-blue-600',
    },
    warning: {
      box: 'border-amber-200 bg-amber-50 text-amber-800',
      icon: 'bi-exclamation-circle text-amber-600',
    },
  };

  const s = styles[type] || styles.info;

  return (
    <div className={`mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 ${s.box}`}>
      <i className={`bi ${s.icon} mt-0.5 text-lg`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button type="button" onClick={onClose} className="text-current opacity-70 hover:opacity-100">
          <i className="bi bi-x-lg" />
        </button>
      )}
    </div>
  );
}