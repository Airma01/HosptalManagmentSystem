import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getReplenishmentSuggestions } from "../Services/monitoringService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";

const ReplenishmentSuggestions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReplenishmentSuggestions();
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load replenishment suggestions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Replenishment Suggestions</h1>

      {items.length === 0 ? (
        <EmptyState message="No replenishment suggestions available." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{item.medicineName}</h3>
                  <p className="text-sm text-gray-500">
                    Current: <span className="font-medium">{item.currentStock}</span>
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                    item.priority
                  )}`}
                >
                  {item.priority || "Medium"}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Reorder Level:</span>
                    <span className="ml-1 font-medium">{item.reorderLevel}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Suggested Order:</span>
                    <span className="ml-1 font-medium text-blue-600">
                      {item.suggestedOrderQuantity}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/csm/medicine/${item.medicineID}`}
                  className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                >
                  View Medicine →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplenishmentSuggestions;
