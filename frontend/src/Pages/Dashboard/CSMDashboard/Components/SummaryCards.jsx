import React from "react";
import {
  BsClockHistory,
  BsCheckCircle,
  BsXCircle,
  BsArrowLeftRight,
  BsCurrencyDollar,
} from "react-icons/bs";

const SummaryCards = ({ summary }) => {
  if (!summary) return null;

  const cards = [
    {
      title: "Pending Requests",
      value: summary.pendingRequests || 0,
      icon: <BsClockHistory className="text-yellow-500 text-xl" />,
      bg: "bg-yellow-50",
      border: "border-yellow-200",
    },
    {
      title: "Approved Requests",
      value: summary.approvedRequests || 0,
      icon: <BsCheckCircle className="text-green-500 text-xl" />,
      bg: "bg-green-50",
      border: "border-green-200",
    },
    {
      title: "Rejected Requests",
      value: summary.rejectedRequests || 0,
      icon: <BsXCircle className="text-red-500 text-xl" />,
      bg: "bg-red-50",
      border: "border-red-200",
    },
    {
      title: "Today's Transfers",
      value: summary.todayTransfers || 0,
      icon: <BsArrowLeftRight className="text-blue-500 text-xl" />,
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      title: "Total Inventory Value",
      value: `$${summary.totalInventoryValue?.toFixed(2) || "0.00"}`,
      icon: <BsCurrencyDollar className="text-purple-500 text-xl" />,
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`${card.bg} border ${card.border} rounded-lg p-4 flex items-center justify-between shadow-sm`}
        >
          <div>
            <p className="text-sm text-gray-600 font-medium">{card.title}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
          <div className="p-2 bg-white rounded-full shadow-sm">{card.icon}</div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
