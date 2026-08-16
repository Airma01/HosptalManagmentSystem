import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BsArrowLeft, BsCheckCircle, BsXCircle, BsPencil, BsTrash } from "react-icons/bs";
import { getRequestById, cancelRequest } from "../Services/requestService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import StatusBadge from "../Shared/StatusBadge";
import ConfirmDialog from "../Shared/ConfirmDialog";

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [request, setRequest] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const loadRequest = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRequestById(id);
      setRequest(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load request details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadRequest();
  }, [id]);

  const handleCancel = async () => {
    try {
      await cancelRequest({ centralRequestID: parseInt(id) });
      setShowCancelConfirm(false);
      await loadRequest();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel request.");
    }
  };

  const canApprove = request?.status === "Pending";
  const canCancel = request?.status === "Pending" || request?.status === "Rejected";

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadRequest} />;
  if (!request) return <ErrorMessage message="Request not found." />;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/csm/request")}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Request #{request.centralRequestID}
        </h1>
        <StatusBadge status={request.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Request Info */}
        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          <h2 className="font-semibold text-gray-700 border-b pb-2">Request Information</h2>
          <div>
            <label className="text-sm font-medium text-gray-500">Branch</label>
            <p className="text-gray-900">{request.branchName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Requested By</label>
            <p className="text-gray-900">{request.pharmacistName || "Unknown"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Date</label>
            <p className="text-gray-900">{new Date(request.requestDate).toLocaleString()}</p>
          </div>
          {request.approvedByManagerID && (
            <div>
              <label className="text-sm font-medium text-gray-500">Approved By Manager ID</label>
              <p className="text-gray-900">{request.approvedByManagerID}</p>
            </div>
          )}
          {request.approvalDate && (
            <div>
              <label className="text-sm font-medium text-gray-500">Approval Date</label>
              <p className="text-gray-900">{new Date(request.approvalDate).toLocaleString()}</p>
            </div>
          )}
          {request.rejectionReason && (
            <div>
              <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
              <p className="text-red-600">{request.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          <h2 className="font-semibold text-gray-700 border-b pb-2">Actions</h2>
          {canApprove && (
            <>
              <Link
                to={`/csm/request/review/${request.centralRequestID}`}
                className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition"
              >
                <BsCheckCircle className="inline mr-2" /> Review & Approve
              </Link>
              <Link
                to={`/csm/request/partial-approve/${request.centralRequestID}`}
                className="block w-full px-4 py-2 bg-yellow-600 text-white text-center rounded-lg hover:bg-yellow-700 transition"
              >
                <BsPencil className="inline mr-2" /> Partial Approve
              </Link>
              <Link
                to={`/csm/request/reject/${request.centralRequestID}`}
                className="block w-full px-4 py-2 bg-red-600 text-white text-center rounded-lg hover:bg-red-700 transition"
              >
                <BsXCircle className="inline mr-2" /> Reject
              </Link>
            </>
          )}
          {canCancel && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="block w-full px-4 py-2 bg-gray-600 text-white text-center rounded-lg hover:bg-gray-700 transition"
            >
              <BsTrash className="inline mr-2" /> Cancel Request
            </button>
          )}
          {!canApprove && !canCancel && (
            <p className="text-sm text-gray-500">No actions available for this request.</p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
        <h2 className="font-semibold text-gray-700 p-4 border-b">Request Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {request.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.medicineName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.requestedQuantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.approvedQuantity || (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showCancelConfirm}
        title="Cancel Request"
        message="Are you sure you want to cancel this request? This action cannot be undone."
        onConfirm={handleCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
};

export default RequestDetails;
