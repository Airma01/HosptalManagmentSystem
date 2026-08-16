import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BsArrowLeft, BsPencil } from "react-icons/bs";
import { getMedicineById } from "../Services/medicineService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

const MedicineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [medicine, setMedicine] = useState(null);

  const loadMedicine = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMedicineById(id);
      setMedicine(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load medicine details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadMedicine();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadMedicine} />;
  if (!medicine) return <ErrorMessage message="Medicine not found." />;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/csm/medicine")}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Medicine Details</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Medicine ID</label>
            <p className="text-gray-900">{medicine.medicineID}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="text-gray-900">{medicine.medicineName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Generic Name</label>
            <p className="text-gray-900">{medicine.genericName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Unit Price</label>
            <p className="text-gray-900">${medicine.unitPrice}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Unit of Measure</label>
            <p className="text-gray-900">{medicine.unitOfMeasure}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Total Stock</label>
            <p className="text-gray-900">
              {medicine.inventoryBatches?.reduce((sum, b) => sum + b.quantityAvailable, 0) || 0}
            </p>
          </div>
        </div>

        {medicine.inventoryBatches && medicine.inventoryBatches.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Inventory Batches</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Batch</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Expiry</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {medicine.inventoryBatches.map((batch) => (
                    <tr key={batch.centralInventoryID}>
                      <td className="px-3 py-2 text-gray-700">{batch.batchNumber}</td>
                      <td className="px-3 py-2 text-gray-700">{batch.quantityAvailable}</td>
                      <td className="px-3 py-2 text-gray-700">{new Date(batch.expiryDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-gray-700">{batch.source || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Link
            to={`/csm/medicine/edit/${medicine.medicineID}`}
            className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <BsPencil /> Edit Medicine
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetails;
