import React, { useState, useEffect } from "react";
import { getLowStockMedicines } from "../services/centralStoreService";
import Table from "../components/tables/Table";

const LowStockMedicines = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(10);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await getLowStockMedicines(threshold);
        setData(result);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load low stock.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [threshold]);

  const columns = [
    { key: "medicineName", label: "Medicine" },
    { key: "totalQuantity", label: "Current Quantity" },
    { key: "threshold", label: "Threshold" },
  ];

  return (
    <div>
      <h4 className="text-xl font-semibold mb-4">Low Stock Medicines</h4>
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm font-medium text-gray-700">Threshold:</label>
        <input
          type="number"
          className="w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          min="1"
        />
      </div>
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">{error}</div>}
      <Table columns={columns} data={data} loading={loading} />
    </div>
  );
};

export default LowStockMedicines;