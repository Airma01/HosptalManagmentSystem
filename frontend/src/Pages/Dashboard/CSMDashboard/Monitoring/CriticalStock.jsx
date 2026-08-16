import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCriticalStock } from "../Services/monitoringService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";

const CriticalStock = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCriticalStock();
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load critical stock medicines.");
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
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Critical Stock</h1>
        <span className="text-sm text-red-600">{items.length} medicines at critical level</span>
      </div>

      {items.length === 0 ? (
        <EmptyState message="No critical stock medicines found." />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.medicineName}</td>
                  <td className="px-4 py-3 text-sm text-red-600 font-bold">{item.quantityAvailable}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.reorderLevel}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.unitOfMeasure}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      to={`/csm/medicine/${item.medicineID}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Medicine
                    </Link>
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

export default CriticalStock;
