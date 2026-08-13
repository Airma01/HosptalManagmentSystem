import React from "react";

const DashboardCards = ({ data, loading }) => {
  const cards = [
    {
      title: "Total Medicines",
      value: data?.totalInventoryItems ?? 0,
      icon: "bi-capsule",
      color: "blue",
    },
    {
      title: "Total Stock",
      value: data?.totalStockQuantity ?? 0,
      icon: "bi-box-seam",
      color: "green",
    },
    {
      title: "Pending Requests",
      value: data?.pendingRequests ?? 0,
      icon: "bi-clock-history",
      color: "yellow",
    },
    {
      title: "Pending Transfers",
      value: data?.pendingTransfers ?? 0,
      icon: "bi-truck",
      color: "purple",
    },
    {
      title: "Low Stock Items",
      value: data?.lowStockItems ?? 0,
      icon: "bi-exclamation-triangle",
      color: "red",
    },
    {
      title: "Expired Medicines",
      value: data?.expiredItems ?? 0,
      icon: "bi-calendar-x",
      color: "orange",
    },
  ];

  const colorMap = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600",
    orange: "from-orange-500 to-orange-600",
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-4 animate-pulse h-24"
          >
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between hover:shadow-lg transition-shadow duration-200"
        >
          <div>
            <p className="text-gray-500 text-sm font-medium">{card.title}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorMap[card.color]} flex items-center justify-center text-white text-xl`}
          >
            <i className={`bi ${card.icon}`}></i>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;