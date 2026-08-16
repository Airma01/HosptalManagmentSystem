import React from "react";

const InventoryValueChart = ({ items }) => {
  // Find max value for scaling
  const maxValue = Math.max(...items.map((i) => i.totalValue), 1);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 w-1/3 truncate" title={item.medicineName}>
            {item.medicineName}
          </span>
          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(item.totalValue / maxValue) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 w-20 text-right">
            ${item.totalValue.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default InventoryValueChart;
