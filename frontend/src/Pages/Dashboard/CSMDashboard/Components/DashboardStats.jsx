import React from "react";
import { BsBoxSeam, BsBuilding, BsFileEarmarkText, BsArrowLeftRight } from "react-icons/bs";

const DashboardStats = ({ stats }) => {
  if (!stats) return null;

  const items = [
    { label: "Total Medicines", value: stats.totalMedicines || 0, icon: <BsBoxSeam />, color: "text-indigo-600" },
    { label: "Total Branches", value: stats.totalBranches || 0, icon: <BsBuilding />, color: "text-green-600" },
    { label: "Total Requests", value: stats.totalRequests || 0, icon: <BsFileEarmarkText />, color: "text-yellow-600" },
    { label: "Total Transfers", value: stats.totalTransfers || 0, icon: <BsArrowLeftRight />, color: "text-blue-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className={`${item.color} text-lg`}>{item.icon}</span>
            <span className="text-sm text-gray-500">{item.label}</span>
          </div>
          <p className="text-2xl font-semibold text-gray-800">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
