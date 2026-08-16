import React, { useState, useEffect } from "react";
import { getExpired } from "../Services/inventoryService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";

const ExpiredMedicines = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExpired();
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load expired medicines.");
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Expired Medicines</h1>
      {items.length === 0 ? (
        <EmptyState message="No expired medicines found." />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Overdue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.medicineName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.batchNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(item.expiryDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-red-600 font-semibold">{item.daysOverdue} days</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpiredMedicines;
