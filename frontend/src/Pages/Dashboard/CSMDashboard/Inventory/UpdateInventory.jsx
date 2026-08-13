import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateInventory } from "../services/centralStoreService";

const UpdateInventory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantityAdjustment, setQuantityAdjustment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateInventory(id, { quantityAdjustment: parseFloat(quantityAdjustment) });
      navigate("/csm/inventory");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update inventory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="text-xl font-semibold mb-4">Adjust Stock</h4>
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Adjustment</label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. 10 (add) or -5 (remove)"
            value={quantityAdjustment}
            onChange={(e) => setQuantityAdjustment(e.target.value)}
            required
          />
          <small className="text-gray-500">Positive to add, negative to deduct.</small>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50" disabled={loading}>
            {loading ? "Adjusting..." : "Adjust Stock"}
          </button>
          <button type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors" onClick={() => navigate("/csm/inventory")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateInventory;