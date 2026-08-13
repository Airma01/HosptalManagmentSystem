import React from "react";

const InventoryForm = ({
  formData,
  onChange,
  onSubmit,
  loading,
  medicines = [],
  submitLabel = "Add Stock",
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Medicine *</label>
        <select
          name="medicineID"
          value={formData.medicineID || ""}
          onChange={handleChange}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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

      <div>
        <label className="block text-sm font-medium text-gray-700">Quantity *</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity || ""}
          onChange={handleChange}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
          min="1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Expiry Date *</label>
        <input
          type="date"
          name="expiryDate"
          value={formData.expiryDate || ""}
          onChange={handleChange}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Batch Number *</label>
        <input
          type="text"
          name="batchNumber"
          value={formData.batchNumber || ""}
          onChange={handleChange}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Source</label>
        <select
          name="source"
          value={formData.source || "Supplier"}
          onChange={handleChange}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="Supplier">Supplier</option>
          <option value="AidStore">Aid Store</option>
          <option value="Return">Return</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
};

export default InventoryForm;