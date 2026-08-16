import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BsPlus, BsEye, BsPencil, BsTrash } from "react-icons/bs";
import { getAllMedicines, deleteMedicine } from "../Services/medicineService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";
import ConfirmDialog from "../Shared/ConfirmDialog";
import SearchBar from "../Shared/SearchBar";

const MedicineList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllMedicines();
      setMedicines(data);
      setFiltered(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load medicines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFiltered(medicines);
      return;
    }
    const q = query.toLowerCase();
    const filtered = medicines.filter(
      (item) =>
        item.medicineName?.toLowerCase().includes(q) ||
        item.genericName?.toLowerCase().includes(q)
    );
    setFiltered(filtered);
  };

  const handleDeleteClick = (id) => {
    setDeleteTarget(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMedicine(deleteTarget);
      setShowConfirm(false);
      await loadMedicines();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete medicine.");
      setShowConfirm(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadMedicines} />;

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Medicines</h1>
        <Link
          to="/csm/medicine/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <BsPlus /> Add Medicine
        </Link>
      </div>

      <div className="mb-4">
        <SearchBar onSearch={handleSearch} placeholder="Search by name or generic name..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No medicines found." />
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generic Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((item) => (
                <tr key={item.medicineID}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.medicineName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.genericName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">${item.unitPrice}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.unitOfMeasure}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.totalStock || 0}</td>
                  <td className="px-4 py-3 text-sm flex gap-2">
                    <Link
                      to={`/csm/medicine/${item.medicineID}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <BsEye />
                    </Link>
                    <Link
                      to={`/csm/medicine/edit/${item.medicineID}`}
                      className="text-green-600 hover:text-green-800"
                    >
                      <BsPencil />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(item.medicineID)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <BsTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Medicine"
        message="Are you sure you want to delete this medicine? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default MedicineList;
