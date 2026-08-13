import React from "react";

const MedicineForm = ({ formData, onChange, onSubmit, loading, submitLabel = "Save" }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Medicine Name *</label>
        <input
          type="text"
          name="medicineName"
          value={formData.medicineName || ""}
          onChange={handleChange}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Generic Name</label>
        <input
          type="text"
          name="genericName"
          value={formData.genericName || ""}
          onChange={handleChange}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Unit Price *</label>
        <input
          type="number"
          step="0.01"
          name="unitPrice"
          value={formData.unitPrice || ""}
          onChange={handleChange}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Unit of Measure</label>
        <input
          type="text"
          name="unitOfMeasure"
          value={formData.unitOfMeasure || ""}
          onChange={handleChange}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
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

export default MedicineForm;