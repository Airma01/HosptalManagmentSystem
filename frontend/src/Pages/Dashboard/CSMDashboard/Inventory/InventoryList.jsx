import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // assuming react-router-dom is used
import { BsPlus, BsEye, BsPencil, BsTrash, BsSearch } from "react-icons/bs";
import { getAllInventory, deleteInventory } from "../Services/inventoryService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";
import ConfirmDialog from "../Shared/ConfirmDialog";
import SearchBar from "../Shared/SearchBar";
import StatusBadge from "../Shared/StatusBadge";

const InventoryList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllInventory();
      setInventory(data);
      setFiltered(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFiltered(inventory);
      return;
    }
    const q = query.toLowerCase();
    const filtered = inventory.filter(
      (item) =>
        item.medicineName?.toLowerCase().includes(q) ||
        item.batchNumber?.toLowerCase().includes(q) ||
        item.source?.toLowerCase().includes(q)
    );
    setFiltered(filtered);
  };

  const handleDeleteClick = (id) => {
    setDeleteTarget(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteInventory(deleteTarget);
      setShowConfirm(false);
      await loadInventory();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete inventory.");
      setShowConfirm(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadInventory} />;

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Central Inventory</h1>
        <Link
          to="/csm/inventory/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <BsPlus /> Add New Batch
        </Link>
      </div>

      <div className="mb-4">
        <SearchBar onSearch={handleSearch} placeholder="Search by medicine, batch, or source..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No inventory batches found." />
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((item) => (
                <tr key={item.centralInventoryID}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.medicineName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.batchNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.quantityAvailable}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <StatusBadge status={item.source} />
                  </td>
                  <td className="px-4 py-3 text-sm flex gap-2">
                    <Link
                      to={`/csm/inventory/${item.centralInventoryID}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <BsEye />
                    </Link>
                    <Link
                      to={`/csm/inventory/edit/${item.centralInventoryID}`}
                      className="text-green-600 hover:text-green-800"
                    >
                      <BsPencil />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(item.centralInventoryID)}
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
        title="Delete Inventory Batch"
        message="Are you sure you want to delete this batch? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default InventoryList;
