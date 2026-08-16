import React from "react";

const StatusBadge = ({ status }) => {
  const getColor = (status) => {
    const s = status?.toLowerCase() || "";
    const map = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      partiallyapproved: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
      dispatched: "bg-indigo-100 text-indigo-800",
      intransit: "bg-purple-100 text-purple-800",
      received: "bg-teal-100 text-teal-800",
      closed: "bg-gray-100 text-gray-800",
      purchase: "bg-blue-100 text-blue-800",
      aidstoretransfer: "bg-orange-100 text-orange-800",
    };
    return map[s] || "bg-gray-100 text-gray-800";
  };

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getColor(
        status
      )}`}
    >
      {status || "Unknown"}
    </span>
  );
};

export default StatusBadge;
