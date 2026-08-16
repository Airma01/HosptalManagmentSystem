import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BsArrowLeft, BsTruck, BsPencil, BsTrash } from "react-icons/bs";
import { getTransferById, cancelTransfer } from "../Services/transferService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import StatusBadge from "../Shared/StatusBadge";
import ConfirmDialog from "../Shared/ConfirmDialog";

const TransferDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transfer, setTransfer] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

  const handleCancel = async () => {
    try {
      await cancelTransfer({
        centralTransferID: parseInt(id),
        cancellationReason: "Cancelled by CSM",
      });
      setShowCancelConfirm(false);
      await loadTransfer();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel transfer.");
    }
  };

  const canCancel = transfer?.status === "Pending" || transfer?.status === "Dispatched";
  const canDispatch = transfer?.status === "Pending";
  const canUpdateStatus = ["Dispatched", "InTransit", "Received"].includes(transfer?.status);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadTransfer} />;
  if (!transfer) return <ErrorMessage message="Transfer not found." />;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/csm/transfer")}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Transfer #{transfer.centralTransferID}
        </h1>
        <StatusBadge status={transfer.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          <h2 className="font-semibold text-gray-700 border-b pb-2">Transfer Information</h2>
          <div>
            <label className="text-sm font-medium text-gray-500">Request ID</label>
            <p className="text-gray-900">
              {transfer.centralRequestID ? (
                <Link
                  to={`/csm/request/${transfer.centralRequestID}`}
                  className="text-blue-600 hover:underline"
                >
                  #{transfer.centralRequestID}
                </Link>
              ) : (
                "N/A"
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Branch</label>
            <p className="text-gray-900">{transfer.branchName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Transfer Date</label>
            <p className="text-gray-900">{new Date(transfer.transferDate).toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Manager</label>
            <p className="text-gray-900">{transfer.managerName}</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          <h2 className="font-semibold text-gray-700 border-b pb-2">Actions</h2>
          {canDispatch && (
            <Link
              to={`/csm/transfer/dispatch/${transfer.centralTransferID}`}
              className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition"
            >
              <BsTruck className="inline mr-2" /> Dispatch Transfer
            </Link>
          )}
          {canUpdateStatus && (
            <Link
              to={`/csm/transfer/update-status/${transfer.centralTransferID}`}
              className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition"
            >
              <BsPencil className="inline mr-2" /> Update Status
            </Link>
          )}
          {canCancel && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="block w-full px-4 py-2 bg-red-600 text-white text-center rounded-lg hover:bg-red-700 transition"
            >
              <BsTrash className="inline mr-2" /> Cancel Transfer
            </button>
          )}
          {!canDispatch && !canUpdateStatus && !canCancel && (
            <p className="text-sm text-gray-500">No actions available for this transfer.</p>
          )}
          <Link
            to={`/csm/transfer/track/${transfer.centralTransferID}`}
            className="block w-full px-4 py-2 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition"
          >
            <BsTruck className="inline mr-2" /> Track Transfer
          </Link>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <h2 className="font-semibold text-gray-700 p-4 border-b">Transfer Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transfer.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.medicineName || `Medicine ID: ${item.medicineID}`}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.quantityTransferred}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showCancelConfirm}
        title="Cancel Transfer"
        message="Are you sure you want to cancel this transfer? This action cannot be undone."
        onConfirm={handleCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
};

export default TransferDetails;
