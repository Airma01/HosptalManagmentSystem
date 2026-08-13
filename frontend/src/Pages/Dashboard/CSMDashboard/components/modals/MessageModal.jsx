import React from "react";

const MessageModal = ({ show, onClose, message, title = "Message", variant = "info" }) => {
  if (!show) return null;

  const variantClasses = {
    info: "bg-blue-500",
    success: "bg-green-500",
    danger: "bg-red-500",
    warning: "bg-yellow-500",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className={`${variantClasses[variant]} -mt-6 -mx-6 p-4 rounded-t-lg text-white`}>
          <h5 className="text-lg font-semibold">{title}</h5>
        </div>
        <div className="py-4">
          <p className="text-gray-700">{message}</p>
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;