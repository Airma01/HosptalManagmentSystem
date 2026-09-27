import React from "react";

const EmptyState = ({ icon = "bi-inbox", title = "No data", message = "" }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <i className={`bi ${icon} text-5xl mb-3`}></i>
    <p className="font-medium text-gray-600">{title}</p>
    {message && <p className="text-sm mt-1">{message}</p>}
  </div>
);

export default EmptyState;
