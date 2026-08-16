import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BsArrowLeft, BsBuilding, BsBoxSeam, BsFileText, BsArrowLeftRight, BsGraphUp } from "react-icons/bs";
import { getBranchById } from "../Services/branchService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

const BranchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [branch, setBranch] = useState(null);

  const loadBranch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBranchById(id);
      setBranch(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load branch details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadBranch();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadBranch} />;
  if (!branch) return <ErrorMessage message="Branch not found." />;

  const navItems = [
    { path: "inventory", label: "Inventory", icon: <BsBoxSeam /> },
    { path: "requests", label: "Requests", icon: <BsFileText /> },
    { path: "transfers", label: "Transfers", icon: <BsArrowLeftRight /> },
    { path: "consumption", label: "Consumption", icon: <BsGraphUp /> },
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/csm/branch")}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Branch Details</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <BsBuilding className="text-blue-500 text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{branch.branchName}</h2>
            <p className="text-gray-600">{branch.location || "No location specified"}</p>
            <p className="text-sm text-gray-500 mt-1">
              Branch ID: {branch.branchPharmacyID}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={`/csm/branch/${id}/${item.path}`}
            className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md hover:border-blue-300 transition"
          >
            <div className="text-2xl text-blue-500 flex justify-center mb-1">
              {item.icon}
            </div>
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Show quick stats from inventory summary */}
      {branch.inventory && branch.inventory.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-2">Inventory Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Total Items:</span>
              <span className="ml-1 font-medium">{branch.inventory.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Total Quantity:</span>
              <span className="ml-1 font-medium">
                {branch.inventory.reduce((sum, i) => sum + (i.quantityAvailable || 0), 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Low Stock Items:</span>
              <span className="ml-1 font-medium text-red-600">
                {branch.inventory.filter((i) => i.quantityAvailable < 5).length}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Expiring Items (30d):</span>
              <span className="ml-1 font-medium text-yellow-600">
                {branch.inventory.filter(
                  (i) => new Date(i.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                ).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchDetails;
