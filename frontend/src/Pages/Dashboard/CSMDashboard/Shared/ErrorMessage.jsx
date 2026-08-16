import React from "react";
import { BsExclamationTriangle } from "react-icons/bs";

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <BsExclamationTriangle className="text-red-500 text-xl mt-0.5" />
      <div className="flex-1">
        <p className="text-red-700 font-medium">Error</p>
        <p className="text-red-600 text-sm">{message || "Something went wrong."}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md transition"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
