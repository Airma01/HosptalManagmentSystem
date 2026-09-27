import React from "react";

const SummaryCards = ({ totalCollected = 0, totalTransactions = 0, cashTotal = 0, telebirrTotal = 0 }) => {
  const cards = [
    {
      label: "Today Collected",
      value: `ETB ${Number(totalCollected).toLocaleString()}`,
      icon: "bi-cash-stack",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Transactions",
      value: totalTransactions,
      icon: "bi-receipt",
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Cash",
      value: `ETB ${Number(cashTotal).toLocaleString()}`,
      icon: "bi-wallet2",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Telebirr",
      value: `ETB ${Number(telebirrTotal).toLocaleString()}`,
      icon: "bi-phone",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4"
        >
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${c.color}`}>
            <i className={`bi ${c.icon} text-xl`}></i>
          </div>
          <div>
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-lg font-bold text-gray-800">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
