import React from "react";
const PharmCashierHeader = ({ title, onMenuClick, userName }) => (
  <header className="bg-white border-b shadow-sm px-4 md:px-6 py-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <button onClick={onMenuClick} className="p-1.5 rounded-lg hover:bg-gray-100 md:hidden"><i className="bi bi-list text-xl"></i></button>
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
    </div>
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <i className="bi bi-person-circle text-xl text-emerald-500"></i>
      <span className="hidden sm:inline">{userName}</span>
    </div>
  </header>
);
export default PharmCashierHeader;
