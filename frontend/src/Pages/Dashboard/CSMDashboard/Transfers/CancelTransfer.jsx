import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { cancelTransfer } from "../Services/transferService";
import ErrorMessage from "../Shared/ErrorMessage";

const CancelTransfer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cancellationReason.trim()) {
      setError("Please provide a cancellation reason.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await cancelTransfer({
        centralTransferID: parseInt(id),
        cancellationReason: cancellationReason,
      });
      navigate(`/csm/transfer/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel transfer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/csm/transfer/${id}`)}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Cancel Transfer #{id}</h1>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cancellation Reason *
          </label>
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            rows="4"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Explain why this transfer is being cancelled..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Note: Cancelling a transfer will not automatically restore inventory.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
          >
            {loading ? "Cancelling..." : "Cancel Transfer"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/csm/transfer/${id}`)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Go Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default CancelTransfer;
