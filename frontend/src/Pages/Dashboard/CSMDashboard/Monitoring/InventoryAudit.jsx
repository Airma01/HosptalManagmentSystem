import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getInventoryAudit } from "../Services/monitoringService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";

const InventoryAudit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audits, setAudits] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadData = async (from, to) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInventoryAudit(from, to);
      setAudits(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory audit data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    setFromDate(thirtyDaysAgo.toISOString().split("T")[0]);
    setToDate(now.toISOString().split("T")[0]);
    loadData(thirtyDaysAgo.toISOString(), now.toISOString());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fromDate && toDate) {
      loadData(fromDate, toDate);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => loadData(fromDate, toDate)} />;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Audit Log</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4 bg-white shadow rounded-lg p-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 block border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 block border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Apply Filter
        </button>
      </form>

      {audits.length === 0 ? (
        <EmptyState message="No audit records found for the selected period." />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Previous</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">New</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {audits.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(item.auditDate).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.medicineName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.previousQuantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.newQuantity}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`font-semibold ${
                        item.changeAmount < 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {item.changeAmount > 0 ? "+" : ""}{item.changeAmount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.changeReason}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.performedBy || "System"}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      to={`/csm/inventory/${item.centralInventoryID}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Batch
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

export default InventoryAudit;
