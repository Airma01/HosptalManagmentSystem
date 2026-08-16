import React, { useState, useEffect } from "react";
import { getTotalInventoryValue } from "../Services/inventoryService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

const InventoryValue = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [value, setValue] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTotalInventoryValue();
      setValue(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory value.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div className="p-4">
      <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Total Inventory Value</h1>
        <div className="text-center py-8">
          <p className="text-5xl font-bold text-blue-600">${value.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">Current value of all central store inventory</p>
        </div>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default InventoryValue;
