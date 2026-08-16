import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import {
  getRequestById,
  partialApproveRequest,
} from "../Services/requestService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

const PartialApproveRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [request, setRequest] = useState(null);
  const [approvedItems, setApprovedItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadRequest = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRequestById(id);
      setRequest(data);
      setApprovedItems(
        data.items.map((item) => ({
          medicineID: item.medicineID,
          approvedQuantity: item.requestedQuantity,
          requestedQuantity: item.requestedQuantity,
          medicineName: item.medicineName,
        }))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadRequest();
  }, [id]);

  const handleQuantityChange = (medicineID, value) => {
    setApprovedItems((prev) =>
      prev.map((item) =>
        item.medicineID === medicineID
          ? { ...item, approvedQuantity: Math.min(parseInt(value) || 0, item.requestedQuantity) }
          : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate quantities are positive and not exceeding requested
    const invalid = approvedItems.some(
      (item) => item.approvedQuantity < 0 || item.approvedQuantity > item.requestedQuantity
    );
    if (invalid) {
      setError("Approved quantity must be between 0 and requested quantity.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await partialApproveRequest({
        centralRequestID: parseInt(id),
        approvedItems: approvedItems.map((item) => ({
          medicineID: item.medicineID,
          approvedQuantity: item.approvedQuantity,
        })),
      });
      navigate(`/csm/request/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to partially approve request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadRequest} />;
  if (!request) return <ErrorMessage message="Request not found." />;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/csm/request/${id}`)}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Partial Approve Request #{id}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Branch: {request.branchName}
          </p>
          <p className="text-sm text-gray-600">
            Date: {new Date(request.requestDate).toLocaleString()}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Approve Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {approvedItems.map((item) => (
                <tr key={item.medicineID}>
                  <td className="px-4 py-2 text-sm text-gray-900">{item.medicineName}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.requestedQuantity}</td>
                  <td className="px-4 py-2 text-sm">
                    <input
                      type="number"
                      min="0"
                      max={item.requestedQuantity}
                      value={item.approvedQuantity}
                      onChange={(e) =>
                        handleQuantityChange(item.medicineID, e.target.value)
                      }
                      className="w-20 border border-gray-300 rounded-md p-1 text-sm"
                    />
                    <span className="text-xs text-gray-500 ml-1">
                      (max {item.requestedQuantity})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition"
          >
            {submitting ? "Approving..." : "Submit Partial Approval"}
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

export default PartialApproveRequest;
