import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { getBranchTransfers } from "../Services/branchService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";
import StatusBadge from "../Shared/StatusBadge";

const BranchTransfers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transfers, setTransfers] = useState([]);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBranchTransfers(id);
      setTransfers(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load branch transfers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadTransfers();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadTransfers} />;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(`/csm/branch/${id}`)}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Branch Transfers</h1>
      </div>

      {transfers.length === 0 ? (
        <EmptyState message="No transfers found for this branch." />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transfer ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transfers.map((t) => (
                <tr key={t.centralTransferID}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <Link
                      to={`/csm/transfer/${t.centralTransferID}`}
                      className="text-blue-600 hover:underline"
                    >
                      #{t.centralTransferID}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(t.transferDate).toLocaleString()}
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

export default BranchTransfers;
