import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMedicine } from "../Services/medicineService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

const CreateMedicine = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    medicineName: "",
    genericName: "",
    unitPrice: "",
    unitOfMeasure: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.medicineName || !formData.genericName || !formData.unitPrice || !formData.unitOfMeasure) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await createMedicine({
        medicineName: formData.medicineName,
        genericName: formData.genericName,
        unitPrice: parseFloat(formData.unitPrice),
        unitOfMeasure: formData.unitOfMeasure,
      });
      navigate("/csm/medicine");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create medicine.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Medicine</h1>
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
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
            placeholder="e.g., Tablet, Capsule, ml, mg"
            required
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Creating..." : "Create Medicine"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/csm/medicine")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMedicine;
