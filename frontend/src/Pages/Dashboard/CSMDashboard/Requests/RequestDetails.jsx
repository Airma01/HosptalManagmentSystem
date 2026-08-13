import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRequestDetails, approveRequest, rejectRequest } from "../services/centralStoreService";
import ConfirmModal from "../components/modals/ConfirmModal";
import MessageModal from "../components/modals/MessageModal";

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getRequestDetails(id);
        setRequest(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load request.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveRequest(id, { remarks });
      setMessage({ text: "Request approved successfully.", variant: "success" });
      setTimeout(() => navigate("/csm/requests"), 1500);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to approve.", variant: "danger" });
    } finally {
      setActionLoading(false);
      setShowApproveModal(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await rejectRequest(id, { remarks });
      setMessage({ text: "Request rejected.", variant: "info" });
      setTimeout(() => navigate("/csm/requests"), 1500);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Failed to reject.", variant: "danger" });
    } finally {
      setActionLoading(false);
      setShowRejectModal(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (error) return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">{error}</div>;
  if (!request) return <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">Request not found.</div>;

  const isPending = request.status === "Pending";

  return (
    <>
      <h4 className="text-xl font-semibold mb-4">Request Details</h4>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p><strong>Request ID:</strong> {request.centralRequestID}</p>
        <p><strong>Branch:</strong> {request.branchName}</p>
        <p><strong>Pharmacist:</strong> {request.requestedByPharmacist}</p>
        <p><strong>Date:</strong> {new Date(request.requestDate).toLocaleString()}</p>
        <p><strong>Status:</strong> <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">{request.status}</span></p>
        <h5 className="font-semibold mt-4 mb-2">Medicines</h5>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {request.details && request.details.map((d, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{d.medicineName}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{d.requestedQuantity}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{d.approvedQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isPending && (
        <div className="mt-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">Remarks (optional)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              rows="2"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            ></textarea>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              onClick={() => setShowApproveModal(true)}
              disabled={actionLoading}
            >
              Approve
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
            >
              Reject
            </button>
          </div>
        </div>
      )}

      <button className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors" onClick={() => navigate("/csm/requests")}>
        Back to Requests
      </button>

      <ConfirmModal
        show={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Request"
        message="Are you sure you want to approve this request? This will update approved quantities and validate stock."
        confirmText="Approve"
        variant="success"
      />

      <ConfirmModal
        show={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Reject Request"
        message="Are you sure you want to reject this request?"
        confirmText="Reject"
        variant="danger"
      />

      {message && (
        <MessageModal
          show={true}
          onClose={() => setMessage(null)}
          message={message.text}
          title={message.variant === "success" ? "Success" : "Error"}
          variant={message.variant}
        />
      )}
    </>
  );
};

export default RequestDetails;