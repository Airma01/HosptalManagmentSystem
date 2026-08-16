import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTransferReport } from "../Services/reportService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";
import StatusBadge from "../Shared/StatusBadge";

const TransferReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadData = async (from, to) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransferReport(from, to);
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load transfer report.");
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

  const statusCounts = report?.transfers?.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Transfer Report</h1>
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

      {report?.transfers?.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4 mb-4">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="text-center">
                <p className="text-sm text-gray-500">{status}</p>
                <p className="text-xl font-bold text-gray-800">{count}</p>
              </div>
            ))}
            <div className="text-center">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-blue-600">{report.transfers.length}</p>
            </div>
          </div>
        </div>
      )}

      {report?.transfers?.length === 0 ? (
        <EmptyState message="No transfers found for the selected period." />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transfer ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report.transfers.map((t) => (
                <tr key={t.centralTransferID}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <Link
                      to={`/csm/transfer/${t.centralTransferID}`}
                      className="text-blue-600 hover:underline"
                    >
                      #{t.centralTransferID}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.branchName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(t.transferDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.totalItems}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransferReport;
