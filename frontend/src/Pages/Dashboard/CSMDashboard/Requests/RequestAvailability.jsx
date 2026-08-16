import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { getRequestAvailability } from "../Services/requestService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";

const RequestAvailability = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState(null);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRequestAvailability(id);
      setAvailability(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load availability data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadAvailability();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadAvailability} />;
  if (!availability) return <ErrorMessage message="Availability data not found." />;

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
          Request Availability #{availability.centralRequestID}
        </h1>
        <span
          className={`px-3 py-1 text-sm font-semibold rounded-full ${
            availability.allAvailable
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {availability.allAvailable ? "All Available" : "Some Unavailable"}
        </span>
      </div>

      {availability.items.length === 0 ? (
        <EmptyState message="No items in this request." />
      ) : (
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
              {availability.items.map((item, idx) => {
                const available = availability.availableQuantities?.[item.medicineID] || 0;
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
      )}

      <div className="mt-6">
        <Link
          to={`/csm/request/review/${availability.centralRequestID}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Review Request
        </Link>
      </div>
    </div>
  );
};

export default RequestAvailability;
