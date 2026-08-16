import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMedicineById, updateMedicine } from "../Services/medicineService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

const EditMedicine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    medicineID: "",
    medicineName: "",
    genericName: "",
    unitPrice: "",
    unitOfMeasure: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadMedicine = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMedicineById(id);
      setFormData({
        medicineID: data.medicineID,
        medicineName: data.medicineName,
        genericName: data.genericName,
        unitPrice: data.unitPrice,
        unitOfMeasure: data.unitOfMeasure,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load medicine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadMedicine();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await updateMedicine(id, {
        medicineID: parseInt(formData.medicineID),
        medicineName: formData.medicineName,
        genericName: formData.genericName,
        unitPrice: parseFloat(formData.unitPrice),
        unitOfMeasure: formData.unitOfMeasure,
      });
      navigate(`/csm/medicine/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update medicine.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadMedicine} />;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Medicine</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Medicine Name *</label>
          <input
            type="text"
            name="medicineName"
            value={formData.medicineName}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Generic Name *</label>
          <input
            type="text"
            name="genericName"
            value={formData.genericName}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Unit Price ($) *</label>
          <input
            type="number"
            step="0.01"
            name="unitPrice"
            value={formData.unitPrice}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Unit of Measure *</label>
          <input
            type="text"
            name="unitOfMeasure"
            value={formData.unitOfMeasure}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/csm/medicine/${id}`)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMedicine;
