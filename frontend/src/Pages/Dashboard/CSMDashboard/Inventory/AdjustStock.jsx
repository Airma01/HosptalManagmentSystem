import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInventoryById, adjustStock } from "../Services/inventoryService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

const AdjustStock = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInventoryById(id);
      setInventory(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadInventory();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(adjustmentQuantity);
    if (isNaN(val) || val === 0) {
      setError("Please enter a valid non-zero adjustment quantity.");
      return;
    }
    // Check if resulting quantity would be negative (backend will check anyway)
    if (inventory && inventory.quantityAvailable + val < 0) {
      setError("Insufficient stock: adjustment would make quantity negative.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await adjustStock({
        centralInventoryID: parseInt(id),
        adjustmentQuantity: val,
      });
      navigate(`/csm/inventory/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to adjust stock.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadInventory} />;
  if (!inventory) return <ErrorMessage message="Inventory not found." />;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Adjust Stock</h1>
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Medicine</label>
            <p className="text-gray-900">{inventory.medicineName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Current Quantity</label>
            <p className="text-gray-900">{inventory.quantityAvailable}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adjustment Quantity (positive to add, negative to subtract) *
            </label>
            <input
              type="number"
              step="0.01"
              value={adjustmentQuantity}
              onChange={(e) => setAdjustmentQuantity(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Example: 10 to add, -5 to subtract</p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition"
            >
              {submitting ? "Adjusting..." : "Adjust Stock"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/csm/inventory/${id}`)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustStock;
