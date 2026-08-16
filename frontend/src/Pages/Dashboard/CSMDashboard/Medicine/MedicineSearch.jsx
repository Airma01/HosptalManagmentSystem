// Medicine/MedicineSearch.jsx – optional separate search page
import React, { useState } from "react";
import { searchMedicines } from "../Services/medicineService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";

const MedicineSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [searchParams, setSearchParams] = useState({
    medicineName: "",
    genericName: "",
    unitOfMeasure: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = await searchMedicines(searchParams);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Search Medicines</h1>
      <form onSubmit={handleSearch} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Medicine Name</label>
            <input
              type="text"
              name="medicineName"
              value={searchParams.medicineName}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Generic Name</label>
            <input
              type="text"
              name="genericName"
              value={searchParams.genericName}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit of Measure</label>
            <input
              type="text"
              name="unitOfMeasure"
              value={searchParams.unitOfMeasure}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      <div className="mt-6">
        {results.length === 0 ? (
          <EmptyState message="No results. Try different criteria." />
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generic</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((item) => (
                  <tr key={item.medicineID}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.medicineName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.genericName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">${item.unitPrice}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.unitOfMeasure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineSearch;
