import React from "react";
import { BsInbox } from "react-icons/bs";

const EmptyState = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-gray-400">
      <BsInbox className="text-4xl mb-2" />
      <p className="text-sm">{message || "No data available."}</p>
    </div>
  );
};

export default EmptyState;
