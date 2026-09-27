import React from "react";

const statusStyles = {
  Unpaid: "bg-red-100 text-red-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Partial: "bg-orange-100 text-orange-700",
  Paid: "bg-green-100 text-green-700",
  Waived: "bg-gray-100 text-gray-600",
};

const StatusBadge = ({ status }) => {
  const style = statusStyles[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {status || "—"}
    </span>
  );
};

export default StatusBadge;
