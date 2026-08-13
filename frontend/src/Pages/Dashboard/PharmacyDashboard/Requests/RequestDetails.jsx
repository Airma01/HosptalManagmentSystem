import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import pharmacyApi from "../Services/pharmacyApi";

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await pharmacyApi.getRequestDetails(id);
        setRequest(res.data);
        setError("");
      } catch (err) {
        console.error("Error fetching request details:", err);
        setError("Failed to load request details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      await pharmacyApi.cancelRequest(id, { cancelReason: "Cancelled by pharmacist" });
      navigate("/pharmacy/requests");
    } catch (err) {
      console.error("Cancel error:", err);
      setError(err.response?.data?.message || "Failed to cancel request.");
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
        <button
          onClick={() => navigate("/pharmacy/requests")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen text-center text-gray-500">
        Request not found.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Cancelled: "bg-gray-100 text-gray-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate("/pharmacy/requests")}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <i className="bi bi-arrow-left"></i> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Request Details</h1>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Request ID</p>
            <p className="text-lg font-medium text-gray-800">#{request.centralRequestId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="text-lg font-medium text-gray-800">
              {new Date(request.requestDate).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
              {request.status}
            </span>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">Requested By</p>
          <p className="text-gray-800">{request.requestedByPharmacist}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Requested Medicines</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Medicine</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Requested</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Approved</th>
              </tr>
            </thead>
            <tbody>
              {request.details.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.medicineName}</td>
                  <td className="px-4 py-3 text-gray-600">{item.requestedQuantity}</td>
                  <td className="px-4 py-3 text-gray-600">{item.approvedQuantity || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {request.status === "Pending" && (
          <button
            onClick={handleCancel}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            <i className="bi bi-x-circle"></i> Cancel Request
          </button>
        )}
        <button
          onClick={() => navigate("/pharmacy/requests")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <i className="bi bi-arrow-left"></i> Back to List
        </button>
      </div>
    </div>
  );
};

export default RequestDetails;