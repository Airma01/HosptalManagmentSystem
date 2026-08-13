import React from "react";

const LoadingTable = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    <span className="ml-3 text-gray-600">Loading data...</span>
  </div>
);

export default LoadingTable;