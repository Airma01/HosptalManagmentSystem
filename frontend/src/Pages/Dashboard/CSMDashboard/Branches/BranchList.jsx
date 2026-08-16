import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BsEye, BsBuilding } from "react-icons/bs";
import { getAllBranches } from "../Services/branchService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";
import EmptyState from "../Shared/EmptyState";
import SearchBar from "../Shared/SearchBar";

const BranchList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllBranches();
      setBranches(data);
      setFiltered(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load branches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFiltered(branches);
      return;
    }
    const q = query.toLowerCase();
    const filtered = branches.filter(
      (item) =>
        item.branchName?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q)
    );
    setFiltered(filtered);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadBranches} />;

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Branch Pharmacies</h1>
        <span className="text-sm text-gray-500">{filtered.length} branches</span>
      </div>

      <div className="mb-4">
        <SearchBar onSearch={handleSearch} placeholder="Search by name or location..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No branches found." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((branch) => (
            <div
              key={branch.branchPharmacyID}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BsBuilding className="text-blue-500 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{branch.branchName}</h3>
                    <p className="text-sm text-gray-500">{branch.location || "No location"}</p>
                  </div>
                </div>
                <Link
                  to={`/csm/branch/${branch.branchPharmacyID}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <BsEye />
                </Link>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Medicines:</span>
                  <span className="ml-1 font-medium">{branch.totalMedicines || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Requests:</span>
                  <span className="ml-1 font-medium">{branch.totalRequests || 0}</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  to={`/csm/branch/${branch.branchPharmacyID}/inventory`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Inventory
                </Link>
                <Link
                  to={`/csm/branch/${branch.branchPharmacyID}/requests`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Requests
                </Link>
                <Link
                  to={`/csm/branch/${branch.branchPharmacyID}/transfers`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Transfers
                </Link>
                <Link
                  to={`/csm/branch/${branch.branchPharmacyID}/consumption`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Consumption
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BranchList;
