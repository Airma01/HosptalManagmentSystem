import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { rejectRequest } from "../Services/requestService";
import ErrorMessage from "../Shared/ErrorMessage";

const RejectRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await rejectRequest({
        centralRequestID: parseInt(id),
        rejectionReason: rejectionReason,
      });
      navigate(`/csm/request/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/csm/request/${id}`)}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Reject Request #{id}</h1>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rejection Reason *
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows="4"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Explain why this request is being rejected..."
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
          >
            {loading ? "Rejecting..." : "Reject Request"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/csm/request/${id}`)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RejectRequest;
