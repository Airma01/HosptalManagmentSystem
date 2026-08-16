import React, { useState, useEffect } from "react";
import { getStockMovementReport } from "../Services/reportService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";

const StockMovementReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadData = async (from, to) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStockMovementReport(from, to);
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load stock movement report.");
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
        <h1 className="text-2xl font-bold text-gray-800">Stock Movement Report</h1>
        <span className="text-sm text-gray-500">
          {report?.fromDate && report?.toDate && (
            `${new Date(report.fromDate).toLocaleDateString()} - ${new Date(report.toDate).toLocaleDateString()}`
          )}
        </span>
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

      {report?.movements?.length === 0 ? (
        <EmptyState message="No stock movement data found for the selected period." />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opening</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">In</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Out</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Closing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report.movements.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.medicineName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.openingBalance}</td>
                  <td className="px-4 py-3 text-sm text-green-600 font-semibold">+{item.quantityIn}</td>
                  <td className="px-4 py-3 text-sm text-red-600 font-semibold">-{item.quantityOut}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">{item.closingBalance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockMovementReport;
