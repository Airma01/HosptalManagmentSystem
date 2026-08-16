import React, { useState, useEffect } from "react";
import { getInventoryHistory } from "../Services/inventoryService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";

const InventoryHistory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInventoryHistory();
      setHistory(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadHistory} />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Inventory History</h1>
      {history.length === 0 ? (
        <EmptyState message="No inventory history records found." />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inventory ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Previous</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">New</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.centralInventoryID}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.medicineName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.previousQuantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.newQuantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.changeAmount}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(item.changeDate).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {item.changeType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryHistory;
