import React, { useState } from "react";
import pharmacyApi from "../Services/pharmacyApi";

const AcceptTransferModal = ({ transfer, onClose, onComplete }) => {
  const [action, setAction] = useState("accept");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      if (action === "accept") {
        await pharmacyApi.acceptTransfer(transfer.centralTransferId, { remarks });
      } else {
        await pharmacyApi.rejectTransfer(transfer.centralTransferId, { rejectReason: remarks });
      }
      onComplete();
    } catch (err) {
      console.error("Transfer action error:", err);
      setError(err.response?.data?.message || `Failed to ${action} transfer.`);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {action === "accept" ? "Add to Inventory" : "Reject Transfer"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm flex items-center gap-2">
              <i className="bi bi-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">
              Transfer #{transfer.centralTransferId} from {transfer.fromCentralStore}
            </p>
            <p className="text-sm text-gray-600">
              Status: <span className="font-medium">{transfer.status}</span>
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="accept"
                  checked={action === "accept"}
                  onChange={() => setAction("accept")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Add to Inventory</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="reject"
                  checked={action === "reject"}
                  onChange={() => setAction("reject")}
                  className="text-red-600 focus:ring-red-500"
                />
                <span className="text-gray-700">Reject</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {action === "accept" ? "Remarks (optional)" : "Rejection Reason"}
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder={action === "accept" ? "Add any remarks..." : "Please provide a reason for rejection..."}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition ${
                action === "accept"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <i className={`bi ${action === "accept" ? "bi-check-circle" : "bi-x-circle"}`}></i>
                  {action === "accept" ? "Confirm Add" : "Confirm Reject"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcceptTransferModal;