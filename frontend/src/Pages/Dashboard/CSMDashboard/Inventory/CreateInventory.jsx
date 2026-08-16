import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createInventory } from "../Services/inventoryService";
import { getAllMedicines } from "../Services/medicineService"; // 👈 import this
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

const CreateInventory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({
    medicineID: "",
    quantityAvailable: "",
    expiryDate: "",
    batchNumber: "",
    source: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Load medicines on mount
  const loadMedicines = async () => {
    try {
      setLoading(true);
      const data = await getAllMedicines();
      setMedicines(data);
    } catch (err) {
      setError("Failed to load medicines. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.medicineID || !formData.quantityAvailable || !formData.expiryDate || !formData.batchNumber) {
    setError("Please fill in all required fields.");
    return;
  }
  try {
    setSubmitting(true);
    setError(null);

    // Convert expiry date to UTC
    const expiryDateObj = new Date(formData.expiryDate);
    const utcExpiry = expiryDateObj.toISOString(); // e.g., "2026-08-15T00:00:00.000Z"

    await createInventory({
      medicineID: parseInt(formData.medicineID),
      quantityAvailable: parseFloat(formData.quantityAvailable),
      expiryDate: utcExpiry, // send UTC string
      batchNumber: formData.batchNumber,
      source: formData.source,
    });
    navigate("/csm/inventory");
  } catch (err) {
    setError(err.response?.data?.message || "Failed to create inventory batch.");
  } finally {
    setSubmitting(false);
  }
};

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Inventory Batch</h1>
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        {/* Medicine dropdown – now select by name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Medicine *</label>
          <select
            name="medicineID"
            value={formData.medicineID}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="">Select a medicine</option>
            {medicines.map((med) => (
              <option key={med.medicineID} value={med.medicineID}>
                {med.medicineName} ({med.genericName}) – {med.unitOfMeasure}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity Available *</label>
          <input
            type="number"
            step="0.01"
            name="quantityAvailable"
            value={formData.quantityAvailable}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Expiry Date *</label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Batch Number *</label>
          <input
            type="text"
            name="batchNumber"
            value={formData.batchNumber}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Source</label>
          <select
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select source (optional)</option>
            <option value="Purchase">Purchase</option>
            <option value="AidStoreTransfer">Aid Store Transfer</option>
            <option value="Return">Return</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {submitting ? "Creating..." : "Create Batch"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/csm/inventory")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInventory;