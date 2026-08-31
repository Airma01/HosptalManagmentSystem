import React from 'react';

/**
 * Reusable error panel for MLT pages.
 * props: title?, message, onRetry?
 */
export default function MLTError({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <i className="bi bi-exclamation-triangle text-3xl text-red-500" />
      <h3 className="mt-3 text-lg font-semibold text-red-800">{title}</h3>
      <p className="mt-1 text-sm text-red-700">
        {message || 'Please try again.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <i className="bi bi-arrow-clockwise" />
          Retry
        </button>
      )}
    </div>
  );
}