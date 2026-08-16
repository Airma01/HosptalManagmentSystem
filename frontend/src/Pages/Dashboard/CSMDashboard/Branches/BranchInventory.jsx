import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { getBranchInventory } from "../Services/branchService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";
import SearchBar from "../Shared/SearchBar";

const BranchInventory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [branchName, setBranchName] = useState("");

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBranchInventory(id);
      setInventory(data);
      setFiltered(data);
      if (data.length > 0) {
        setBranchName(data[0]?.branchName || "Branch");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load branch inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadInventory();
  }, [id]);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFiltered(inventory);
      return;
    }
    const q = query.toLowerCase();
    const filtered = inventory.filter(
      (item) =>
        item.medicineName?.toLowerCase().includes(q) ||
        item.batchNumber?.toLowerCase().includes(q)
    );
    setFiltered(filtered);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadInventory} />;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(`/csm/branch/${id}`)}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {branchName || "Branch"} – Inventory
        </h1>
      </div>

      <div className="mb-4">
        <SearchBar onSearch={handleSearch} placeholder="Search by medicine or batch..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No inventory items found for this branch." />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((item) => {
                const isLow = item.quantityAvailable < 5;
                const isExpiring = new Date(item.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                const isExpired = new Date(item.expiryDate) < new Date();
                return (
                  <tr key={item.branchInventoryID}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.medicineName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.batchNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.quantityAvailable}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isExpired ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Expired</span>
                      ) : isLow ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Low Stock</span>
                      ) : isExpiring ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Expiring Soon</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BranchInventory;
