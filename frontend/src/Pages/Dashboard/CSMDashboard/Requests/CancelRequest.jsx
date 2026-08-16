import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { cancelRequest } from "../Services/requestService";
import ErrorMessage from "../Shared/ErrorMessage";

const CancelRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await cancelRequest({
        centralRequestID: parseInt(id),
        cancellationReason: cancellationReason || "No reason provided.",
      });
      navigate(`/csm/request/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel request.");
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
        <h1 className="text-2xl font-bold text-gray-800">Cancel Request #{id}</h1>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cancellation Reason (Optional)
          </label>
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Why is this request being cancelled?"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition"
          >
            {loading ? "Cancelling..." : "Cancel Request"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/csm/request/${id}`)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Go Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default CancelRequest;
