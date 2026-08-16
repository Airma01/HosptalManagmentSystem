import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllTransfers } from "../Services/transferService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";
import StatusBadge from "../Shared/StatusBadge";

const TransferHistory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transfers, setTransfers] = useState([]);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllTransfers();
      // Sort by date descending
      const sorted = data.sort((a, b) =>
        new Date(b.transferDate) - new Date(a.transferDate)
      );
      setTransfers(sorted);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load transfer history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadTransfers} />;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Transfer History</h1>

      {transfers.length === 0 ? (
        <EmptyState message="No transfers found." />
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transfers.map((t) => (
                <tr key={t.centralTransferID}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">#{t.centralTransferID}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.branchName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(t.transferDate).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{t.totalItems}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      to={`/csm/transfer/${t.centralTransferID}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Details
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

export default TransferHistory;
