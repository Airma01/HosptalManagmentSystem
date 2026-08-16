import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { getBranchRequests } from "../Services/branchService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";
import StatusBadge from "../Shared/StatusBadge";

const BranchRequests = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBranchRequests(id);
      setRequests(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load branch requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadRequests();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadRequests} />;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(`/csm/branch/${id}`)}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Branch Requests</h1>
      </div>

      {requests.length === 0 ? (
        <EmptyState message="No requests found for this branch." />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.centralRequestID}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <Link
                      to={`/csm/request/${req.centralRequestID}`}
                      className="text-blue-600 hover:underline"
                    >
                      #{req.centralRequestID}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(req.requestDate).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{req.totalItems}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BranchRequests;
