import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { getTransferById, updateTransferStatus } from "../Services/transferService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import StatusBadge from "../Shared/StatusBadge";

const UpdateTransferStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transfer, setTransfer] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const statusTransitions = {
    Dispatched: ["InTransit", "Cancelled"],
    InTransit: ["Received", "Cancelled"],
    Received: ["Closed"],
  };

  const loadTransfer = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransferById(id);
      setTransfer(data);
      setSelectedStatus("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load transfer details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadTransfer();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) {
      setError("Please select a status.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await updateTransferStatus({
        centralTransferID: parseInt(id),
        status: selectedStatus,
        remarks: remarks,
      });
      navigate(`/csm/transfer/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update transfer status.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadTransfer} />;
  if (!transfer) return <ErrorMessage message="Transfer not found." />;

  const availableStatuses = statusTransitions[transfer.status] || [];

  if (availableStatuses.length === 0) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            No status transitions available for this transfer.
            Current status: <StatusBadge status={transfer.status} />
          </p>
          <button
            onClick={() => navigate(`/csm/transfer/${id}`)}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Transfer Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/csm/transfer/${id}`)}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Update Transfer Status #{id}
        </h1>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">Current Status:</span>
          <StatusBadge status={transfer.status} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Status *</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              <option value="">Select New Status</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Remarks (Optional)</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Add any remarks about this status change..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {submitting ? "Updating..." : "Update Status"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/csm/transfer/${id}`)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTransferStatus;
