// This is a simplified version since full approve is covered in RequestReview
// But we provide it for completeness and direct access

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { approveRequest } from "../Services/requestService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

const ApproveRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError(null);
      await approveRequest({ centralRequestID: parseInt(id) });
      navigate(`/csm/request/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve request.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Approve Request #{id}</h1>
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600 mb-4">
          Are you sure you want to fully approve this request? This will approve all items in the request.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Confirm Approve
          </button>
          <button
            onClick={() => navigate(`/csm/request/${id}`)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveRequest;
