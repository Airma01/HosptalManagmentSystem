import React from "react";

const ExpiringMedicineTable = ({ items }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Left</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, idx) => (
            <tr key={idx}>
              <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.medicineName}</td>
              <td className="px-4 py-2 text-sm text-gray-700">{item.batchNumber}</td>
              <td className="px-4 py-2 text-sm text-gray-700">{new Date(item.expiryDate).toLocaleDateString()}</td>
              <td className="px-4 py-2 text-sm">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.daysUntilExpiry <= 7
                      ? "bg-red-100 text-red-800"
                      : item.daysUntilExpiry <= 15
                      ? "bg-orange-100 text-orange-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {item.daysUntilExpiry} days
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpiringMedicineTable;
