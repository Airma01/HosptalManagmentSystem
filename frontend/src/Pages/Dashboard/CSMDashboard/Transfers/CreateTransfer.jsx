import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BsPlus, BsTrash } from "react-icons/bs";
import { createTransfer } from "../Services/transferService";
import { getAllBranches } from "../Services/branchService";
import { getAllInventory } from "../Services/inventoryService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

const CreateTransfer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    centralRequestID: "",
    branchPharmacyID: "",
    transferDate: new Date().toISOString().slice(0, 16),
    items: [{ centralInventoryID: "", quantityTransferred: "" }],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [branchData, invData] = await Promise.all([
        getAllBranches(),
        getAllInventory(),
      ]);
      setBranches(branchData || []);
      setInventory((invData || []).filter((i) => Number(i.quantityAvailable) > 0));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { centralInventoryID: "", quantityTransferred: "" }],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const selectedInv = (id) =>
    inventory.find((i) => String(i.centralInventoryID) === String(id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      for (const item of formData.items) {
        if (!item.centralInventoryID || !item.quantityTransferred) {
          setError("Select an inventory batch and quantity for each line.");
          setSubmitting(false);
          return;
        }
        const inv = selectedInv(item.centralInventoryID);
        if (inv && parseInt(item.quantityTransferred, 10) > Number(inv.quantityAvailable)) {
          setError(
            `Quantity for batch ${inv.batchNumber} exceeds available (${inv.quantityAvailable}).`
          );
          setSubmitting(false);
          return;
        }
      }

      await createTransfer({
        centralRequestID: formData.centralRequestID
          ? parseInt(formData.centralRequestID, 10)
          : null,
        branchPharmacyID: parseInt(formData.branchPharmacyID, 10),
        transferDate: new Date(formData.transferDate).toISOString(),
        items: formData.items.map((item) => ({
          centralInventoryID: parseInt(item.centralInventoryID, 10),
          quantityTransferred: parseInt(item.quantityTransferred, 10),
        })),
      });
      navigate("/csm/transfer");
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.message ||
          (typeof data === "string" ? data : null) ||
          "Failed to create transfer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Transfer</h1>
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Branch Pharmacy *</label>
            <select
              name="branchPharmacyID"
              value={formData.branchPharmacyID}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
            <label className="block text-sm font-medium text-gray-700">Transfer Date *</label>
            <input
              type="datetime-local"
              name="transferDate"
              value={formData.transferDate}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Linked Request ID (optional)
            </label>
            <input
              type="number"
              name="centralRequestID"
              value={formData.centralRequestID}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-700">
              Items (select central inventory batch)
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <BsPlus /> Add line
            </button>
          </div>

          {formData.items.map((item, idx) => {
            const inv = selectedInv(item.centralInventoryID);
            return (
              <div key={idx} className="border border-gray-200 rounded-md p-4 mb-3 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500">
                      Inventory batch *
                    </label>
                    <select
                      value={item.centralInventoryID}
                      onChange={(e) =>
                        handleItemChange(idx, "centralInventoryID", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      required
                    >
                      <option value="">Select batch (medicine + expiry + stock)</option>
                      {inventory.map((i) => (
                        <option key={i.centralInventoryID} value={i.centralInventoryID}>
                          {i.medicineName} | Batch: {i.batchNumber || "N/A"} | Exp:{" "}
                          {i.expiryDate
                            ? new Date(i.expiryDate).toLocaleDateString()
                            : "N/A"}{" "}
                          | Qty: {i.quantityAvailable}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      Quantity *{inv ? ` (max ${inv.quantityAvailable})` : ""}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={inv?.quantityAvailable || undefined}
                      value={item.quantityTransferred}
                      onChange={(e) =>
                        handleItemChange(idx, "quantityTransferred", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                      required
                    />
                  </div>
                  {inv && (
                    <div className="text-xs text-gray-600 self-end pb-2">
                      Expiry:{" "}
                      <strong>
                        {inv.expiryDate
                          ? new Date(inv.expiryDate).toLocaleDateString()
                          : "—"}
                      </strong>
                      {" · "}
                      Batch: <strong>{inv.batchNumber || "—"}</strong>
                    </div>
                  )}
                </div>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                  >
                    <BsTrash />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Transfer"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/csm/transfer")}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTransfer;
