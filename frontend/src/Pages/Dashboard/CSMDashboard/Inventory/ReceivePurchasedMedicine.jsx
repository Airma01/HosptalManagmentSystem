import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { receivePurchasedMedicine } from "../Services/inventoryService";
import ErrorMessage from "../Shared/ErrorMessage";

const ReceivePurchasedMedicine = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    medicineID: "",
    quantity: "",
    expiryDate: "",
    batchNumber: "",
    purchaseReference: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.medicineID || !formData.quantity || !formData.expiryDate || !formData.batchNumber) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await receivePurchasedMedicine({
        medicineID: parseInt(formData.medicineID),
        quantity: parseFloat(formData.quantity),
        expiryDate: formData.expiryDate,
        batchNumber: formData.batchNumber,
        purchaseReference: formData.purchaseReference,
      });
      navigate("/csm/inventory");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to receive purchased medicine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Receive Purchased Medicine</h1>
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Medicine ID *</label>
          <input
            type="number"
            name="medicineID"
            value={formData.medicineID}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity *</label>
          <input
            type="number"
            step="0.01"
            name="quantity"
            value={formData.quantity}
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
          <label className="block text-sm font-medium text-gray-700">Purchase Reference</label>
          <input
            type="text"
            name="purchaseReference"
            value={formData.purchaseReference}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? "Receiving..." : "Receive"}
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

export default ReceivePurchasedMedicine;
