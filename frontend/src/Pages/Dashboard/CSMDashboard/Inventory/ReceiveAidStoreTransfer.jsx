import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { receiveAidStoreTransfer } from "../Services/inventoryService";
import ErrorMessage from "../Shared/ErrorMessage";

const ReceiveAidStoreTransfer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    aidStoreTransferID: "",
    items: [{ medicineID: "", quantity: "", expiryDate: "", batchNumber: "" }],
  });

  const handleChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { medicineID: "", quantity: "", expiryDate: "", batchNumber: "" },
      ],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.aidStoreTransferID) {
      setError("Aid Store Transfer ID is required.");
      return;
    }
    // Validate each item
    for (let item of formData.items) {
      if (!item.medicineID || !item.quantity || !item.expiryDate || !item.batchNumber) {
        setError("All item fields are required.");
        return;
      }
    }
    try {
      setLoading(true);
      setError(null);
      await receiveAidStoreTransfer({
        aidStoreTransferID: parseInt(formData.aidStoreTransferID),
        items: formData.items.map((item) => ({
          medicineID: parseInt(item.medicineID),
          quantity: parseFloat(item.quantity),
          expiryDate: item.expiryDate,
          batchNumber: item.batchNumber,
        })),
      });
      navigate("/csm/inventory");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to receive Aid Store transfer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Receive Aid Store Transfer</h1>
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Aid Store Transfer ID *</label>
          <input
            type="number"
            value={formData.aidStoreTransferID}
            onChange={(e) => setFormData({ ...formData, aidStoreTransferID: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

        <div>
          <h3 className="text-md font-semibold text-gray-700 mb-2">Items</h3>
          {formData.items.map((item, idx) => (
            <div key={idx} className="border border-gray-200 rounded-md p-4 mb-4 relative">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Medicine ID</label>
                  <input
                    type="number"
                    value={item.medicineID}
                    onChange={(e) => handleChange(idx, "medicineID", e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleChange(idx, "quantity", e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Expiry Date</label>
                  <input
                    type="date"
                    value={item.expiryDate}
                    onChange={(e) => handleChange(idx, "expiryDate", e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Batch Number</label>
                  <input
                    type="text"
                    value={item.batchNumber}
                    onChange={(e) => handleChange(idx, "batchNumber", e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    required
                  />
                </div>
              </div>
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add another item
          </button>
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

export default ReceiveAidStoreTransfer;
