import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { getMedicineMovement } from "../Services/monitoringService";
import { getMedicineById } from "../Services/medicineService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";

const MedicineMovement = () => {
  const { medicineId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [movement, setMovement] = useState(null);
  const [medicineName, setMedicineName] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [movementData, medicineData] = await Promise.all([
        getMedicineMovement(medicineId),
        getMedicineById(medicineId).catch(() => null),
      ]);
      setMovement(movementData);
      if (medicineData) {
        setMedicineName(medicineData.medicineName);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load medicine movement data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (medicineId) loadData();
  }, [medicineId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;
  if (!movement) return <ErrorMessage message="Movement data not found." />;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/csm/monitoring")}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Movement History: {medicineName || `Medicine #${medicineId}`}
        </h1>
      </div>

      {movement.movements?.length === 0 ? (
        <EmptyState message="No movement records found for this medicine." />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Movement Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity Change</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movement.movements.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(item.movementDate).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {item.movementType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`font-semibold ${
                        item.quantityChange < 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {item.quantityChange > 0 ? "+" : ""}{item.quantityChange}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.remainingQuantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.reference || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MedicineMovement;
