import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BsEye } from "react-icons/bs";
import { getLowStockBranches } from "../Services/branchService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";
import SearchBar from "../Shared/SearchBar";

const BranchLowStock = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLowStockBranches();
      setItems(data);
      setFiltered(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load low stock branches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFiltered(items);
      return;
    }
    const q = query.toLowerCase();
    const filtered = items.filter(
      (item) =>
        item.branchName?.toLowerCase().includes(q) ||
        item.medicineName?.toLowerCase().includes(q)
    );
    setFiltered(filtered);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Low Stock Branches</h1>
        <span className="text-sm text-red-600">{filtered.length} items low</span>
      </div>

      <div className="mb-4">
        <SearchBar onSearch={handleSearch} placeholder="Search by branch or medicine..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No low stock items found in any branch." />
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.branchName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.medicineName}</td>
                  <td className="px-4 py-3 text-sm text-red-600 font-semibold">{item.quantityAvailable}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.reorderLevel}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      to={`/csm/branch/${item.branchPharmacyID}/inventory`}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <BsEye /> View Inventory
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BranchLowStock;
