import React, { useState, useEffect } from "react";
import { getExpiring } from "../Services/inventoryService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";

const ExpiringMedicines = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [days, setDays] = useState(30);

  const loadData = async (daysParam) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExpiring(daysParam);
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load expiring medicines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(days);
  }, [days]);

  const handleDaysChange = (e) => {
    setDays(parseInt(e.target.value) || 30);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => loadData(days)} />;

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Expiring Medicines</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Days threshold:</label>
          <select
            value={days}
            onChange={handleDaysChange}
            className="border border-gray-300 rounded-md p-1 text-sm"
          >
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={45}>45</option>
            <option value={60}>60</option>
            <option value={90}>90</option>
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState message={`No medicines expiring within ${days} days.`} />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Left</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.medicineName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.batchNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(item.expiryDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                  <td className="px-4 py-3 text-sm text-gray-700">{item.quantityAvailable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpiringMedicines;
