import React from "react";
import { useNavigate } from "react-router-dom";

const InventoryTable = ({ data, loading, onViewDetails, title }) => {
  const navigate = useNavigate();

  const handleView = (id) => {
    if (onViewDetails) {
      onViewDetails(id);
    } else {
      navigate(`/pharmacy/inventory/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-2"></div>
        <div className="space-y-2">
          <div className="h-12 bg-gray-100 rounded"></div>
          <div className="h-12 bg-gray-100 rounded"></div>
          <div className="h-12 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <i className="bi bi-inbox text-4xl block mb-2"></i>
        <p>No inventory items found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-2">Medicine</th>
            <th className="pb-2">Batch</th>
            <th className="pb-2">Quantity</th>
            <th className="pb-2">Expiry</th>
            <th className="pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.inventoryId} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-2 font-medium text-gray-800">{item.medicineName}</td>
              <td className="py-2 text-gray-600">{item.batchNumber}</td>
              <td className="py-2">{item.quantityAvailable}</td>
              <td className="py-2">
                <span
                  className={
                    new Date(item.expiryDate) < new Date()
                      ? "text-red-600"
                      : new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      ? "text-yellow-600"
                      : "text-green-600"
                  }
                >
                  {new Date(item.expiryDate).toLocaleDateString()}
                </span>
              </td>
              <td className="py-2">
                <button
                  onClick={() => handleView(item.medicineId)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <i className="bi bi-eye"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;