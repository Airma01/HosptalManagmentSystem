import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsArrowLeft, BsCheckCircle } from "react-icons/bs";
import { getRequestReview, approveRequest } from "../Services/requestService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import StatusBadge from "../Shared/StatusBadge";

const RequestReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [review, setReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadReview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRequestReview(id);
      setReview(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load review data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadReview();
  }, [id]);

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await approveRequest({ centralRequestID: parseInt(id) });
      navigate(`/csm/request/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadReview} />;
  if (!review) return <ErrorMessage message="Review data not found." />;

  const allAvailable = review.items.every(
    (item) => (review.availableStock?.[item.medicineID] || 0) >= item.requestedQuantity
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/csm/request/${id}`)}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Review Request #{review.centralRequestID}
        </h1>
        <StatusBadge status="Pending" />
      </div>

      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Branch: {review.branchName}</p>
            <p className="text-sm text-gray-500">Date: {new Date(review.requestDate).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm">
              <span className={`font-semibold ${allAvailable ? "text-green-600" : "text-red-600"}`}>
                {allAvailable ? "All items available" : "Some items out of stock"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available Stock</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {review.items.map((item, idx) => {
              const available = review.availableStock?.[item.medicineID] || 0;
              const isAvailable = available >= item.requestedQuantity;
              return (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.medicineName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.requestedQuantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{available}</td>
                  <td className="px-4 py-3 text-sm">
                    {isAvailable ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Insufficient
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleApprove}
          disabled={submitting || !allAvailable}
          className={`px-6 py-2 rounded-lg text-white transition ${
            allAvailable && !submitting
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {submitting ? "Approving..." : <><BsCheckCircle className="inline mr-2" /> Approve All</>}
        </button>
        <button
          onClick={() => navigate(`/csm/request/partial-approve/${id}`)}
          className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
        >
          Partial Approve
        </button>
        <button
          onClick={() => navigate(`/csm/request/reject/${id}`)}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Reject
        </button>
        <button
          onClick={() => navigate(`/csm/request/${id}`)}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RequestReview;
