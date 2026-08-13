import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createTransfer, getMedicines, getBranches, getInventory } from "../services/centralStoreService";

const CreateTransfer = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [centralRequestId, setCentralRequestId] = useState("");
  const [items, setItems] = useState([{ medicineID: "", quantity: "", availableStock: 0 }]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesData, medicinesData] = await Promise.all([
          getBranches(),
          getMedicines("", 1, 100),
        ]);
        setBranches(branchesData || []);
        setMedicines(medicinesData.items || []);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load branches or medicines. Please try again.");
      }
    };
    fetchData();
  }, []);

  const handleMedicineSelect = async (index, medicineId) => {
    const updated = [...items];
    updated[index].medicineID = medicineId;
    updated[index].quantity = "";
    
    if (medicineId) {
      try {
        const invData = await getInventory(1, 100);
        const total = invData.items
          .filter(item => item.medicineID === parseInt(medicineId))
          .reduce((sum, item) => sum + item.quantityAvailable, 0);
        updated[index].availableStock = total;
      } catch (err) {
        console.error("Failed to fetch stock", err);
        updated[index].availableStock = 0;
      }
    } else {
      updated[index].availableStock = 0;
    }
    setItems(updated);
  };

  const handleQuantityChange = (index, value) => {
    const updated = [...items];
    updated[index].quantity = value;
    setItems(updated);
  };

  const addItem = () =>
    setItems([...items, { medicineID: "", quantity: "", availableStock: 0 }]);

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!branchId) {
      setError("Please select a branch.");
      setLoading(false);
      return;
    }

    // Check for zero‑stock items
    for (const item of items) {
      if (item.medicineID && item.availableStock === 0) {
        const medicine = medicines.find(m => m.medicineID === parseInt(item.medicineID));
        setError(`"${medicine?.medicineName || 'Unknown'}" is out of stock. Cannot transfer.`);
        setLoading(false);
        return;
      }
      if (item.medicineID && !item.quantity) {
        setError("Please enter a quantity for all items.");
        setLoading(false);
        return;
      }
    }

    // Validate quantities
    for (const item of items) {
      const qty = parseInt(item.quantity);
      if (qty > item.availableStock) {
        const medicine = medicines.find(m => m.medicineID === parseInt(item.medicineID));
        setError(
          `"${medicine?.medicineName || 'Unknown'}" has only ${item.availableStock} available, but you requested ${qty}.`
        );
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        branchPharmacyID: parseInt(branchId),
        details: items.map((item) => ({
          medicineID: parseInt(item.medicineID),
          quantityTransferred: parseInt(item.quantity),
        })),
      };
      if (centralRequestId) payload.centralRequestID = parseInt(centralRequestId);
      await createTransfer(payload);
      navigate("/csm/transfers");
    } catch (err) {
  console.error("Transfer error:", err);
  const errorData = err.response?.data;
  const message = errorData?.error || errorData?.message || err.message || "Failed to create transfer.";
  setError(message);
} finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="text-xl font-semibold mb-4">Create Transfer</h4>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Branch Pharmacy *</label>
          <select
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            required
          >
            <option value="">Select Branch</option>
            {branches.map((b) => (
              <option key={b.branchPharmacyID} value={b.branchPharmacyID}>
                {b.branchName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Central Request ID (optional)</label>
          <input
            type="number"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={centralRequestId}
            onChange={(e) => setCentralRequestId(e.target.value)}
          />
        </div>

        <h5 className="font-semibold">Items</h5>
        {items.map((item, idx) => {
          const isOutOfStock = item.medicineID && item.availableStock === 0;
          const maxStock = item.availableStock > 0 ? item.availableStock : 1; // fallback to 1 for valid HTML

          return (
            <div key={idx} className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[150px]">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={item.medicineID}
                  onChange={(e) => handleMedicineSelect(idx, e.target.value)}
                  required
                >
                  <option value="">Select Medicine</option>
                  {medicines.map((m) => (
                    <option key={m.medicineID} value={m.medicineID}>
                      {m.medicineName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <input
                  type="number"
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                    isOutOfStock ? "border-red-300 bg-gray-100" : "border-gray-300"
                  }`}
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(idx, e.target.value)}
                  required
                  min="1"
                  max={maxStock}
                  disabled={isOutOfStock}
                />
              </div>
              <div className="text-sm w-24">
                {item.medicineID ? (
                  isOutOfStock ? (
                    <span className="text-red-600 font-medium">Out of stock</span>
                  ) : (
                    <span className="text-gray-500">Stock: {item.availableStock}</span>
                  )
                ) : (
                  <span className="text-gray-400">---</span>
                )}
              </div>
              <button
                type="button"
                className="text-red-600 hover:text-red-800"
                onClick={() => removeItem(idx)}
              >
                Remove
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="text-blue-600 hover:underline"
          onClick={addItem}
        >
          + Add Item
        </button>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Transfer"}
          </button>
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
            onClick={() => navigate("/csm/transfers")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTransfer;