import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsArrowLeft, BsTruck } from "react-icons/bs";
import { getTransferById, dispatchTransfer } from "../Services/transferService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

const DispatchTransfer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transfer, setTransfer] = useState(null);
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split("T")[0]);
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadTransfer = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransferById(id);
      setTransfer(data);
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
    try {
      setSubmitting(true);
      setError(null);
      await dispatchTransfer({
        centralTransferID: parseInt(id),
        dispatchDate: dispatchDate,
        dispatchNotes: dispatchNotes,
      });
      navigate(`/csm/transfer/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to dispatch transfer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadTransfer} />;
  if (!transfer) return <ErrorMessage message="Transfer not found." />;

  if (transfer.status !== "Pending") {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            This transfer has already been dispatched or is in progress.
            Current status: <strong>{transfer.status}</strong>
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
        <h1 className="text-2xl font-bold text-gray-800">Dispatch Transfer #{id}</h1>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-4 text-sm text-gray-600">
          <p>Branch: {transfer.branchName}</p>
          <p>Items: {transfer.items?.length || 0}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Dispatch Date *</label>
            <input
              type="date"
              value={dispatchDate}
              onChange={(e) => setDispatchDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Dispatch Notes</label>
            <textarea
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Any notes about the dispatch..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
            >
              {submitting ? "Dispatching..." : <><BsTruck className="inline mr-2" /> Confirm Dispatch</>}
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

export default DispatchTransfer;
