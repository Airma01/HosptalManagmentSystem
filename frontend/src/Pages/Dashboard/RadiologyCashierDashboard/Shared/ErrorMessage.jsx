import React from "react";

const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-start gap-3">
    <i className="bi bi-exclamation-triangle-fill text-lg mt-0.5"></i>
    <div className="flex-1">
      <p className="font-medium">Error</p>
      <p className="text-sm mt-0.5">{message || "Something went wrong"}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-sm text-red-600 underline hover:no-underline"
        >
          Try again
        </button>
      )}
    </div>
  </div>
);

export default ErrorMessage;
