import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BsPlus, BsTrash } from "react-icons/bs";
import { createTransfer } from "../Services/transferService";
import { getAllBranches } from "../Services/branchService";
import { getAllMedicines } from "../Services/medicineService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

const CreateTransfer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({
    centralRequestID: "",
    branchPharmacyID: "",
    transferDate: new Date().toISOString().split("T")[0],
    items: [{ medicineID: "", quantityTransferred: "" }],
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [branchesData, medicinesData] = await Promise.all([
        getAllBranches(),
        getAllMedicines(),
      ]);
      setBranches(branchesData);
      setMedicines(medicinesData);
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
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { medicineID: "", quantityTransferred: "" }],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  // ... validation ...

  try {
    setSubmitting(true);
    setError(null);

    // Convert transferDate to UTC
    const transferDateObj = new Date(formData.transferDate);
    const utcTransferDate = transferDateObj.toISOString();

    await createTransfer({
      centralRequestID: formData.centralRequestID ? parseInt(formData.centralRequestID) : null,
      branchPharmacyID: parseInt(formData.branchPharmacyID),
      transferDate: utcTransferDate, // send UTC
      items: formData.items.map((item) => ({
        medicineID: parseInt(item.medicineID),
        quantityTransferred: parseInt(item.quantityTransferred),
      })),
    });
    navigate("/csm/transfer");
  } catch (err) {
    setError(err.response?.data?.message || "Failed to create transfer.");
  } finally {
    setSubmitting(false);
  }
};

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

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
              type="date"
              name="transferDate"
              value={formData.transferDate}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Related Request ID (Optional)</label>
          <input
            type="number"
            name="centralRequestID"
            value={formData.centralRequestID}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="e.g., 123"
          />
          <p className="text-xs text-gray-500 mt-1">If this transfer is fulfilling a request, enter the request ID.</p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Transfer Items *</h3>
            <button
              type="button"
              onClick={addItem}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <BsPlus /> Add Item
            </button>
          </div>
          {formData.items.map((item, idx) => (
            <div key={idx} className="border border-gray-200 rounded-md p-4 mb-3 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Medicine</label>
                  <select
                    value={item.medicineID}
                    onChange={(e) => handleItemChange(idx, "medicineID", e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                    required
                  >
                    <option value="">Select Medicine</option>
                    {medicines.map((m) => (
                      <option key={m.medicineID} value={m.medicineID}>
                        {m.medicineName} ({m.genericName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantityTransferred}
                    onChange={(e) => handleItemChange(idx, "quantityTransferred", e.target.value)}
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
                  <BsTrash />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {submitting ? "Creating..." : "Create Transfer"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/csm/transfer")}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTransfer;
