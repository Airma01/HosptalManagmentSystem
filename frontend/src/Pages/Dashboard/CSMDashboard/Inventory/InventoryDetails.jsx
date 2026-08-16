import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BsArrowLeft, BsPencil } from "react-icons/bs";
import { getInventoryById } from "../Services/inventoryService";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorMessage from "../Shared/ErrorMessage";

const InventoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inventory, setInventory] = useState(null);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInventoryById(id);
      setInventory(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadInventory();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadInventory} />;
  if (!inventory) return <ErrorMessage message="Inventory batch not found." />;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/csm/inventory")}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <BsArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Inventory Details</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Batch ID</label>
            <p className="text-gray-900">{inventory.centralInventoryID}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Medicine</label>
            <p className="text-gray-900">{inventory.medicineName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Generic Name</label>
            <p className="text-gray-900">{inventory.genericName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Batch Number</label>
            <p className="text-gray-900">{inventory.batchNumber}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Quantity Available</label>
            <p className="text-gray-900">{inventory.quantityAvailable}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Expiry Date</label>
            <p className="text-gray-900">{new Date(inventory.expiryDate).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Source</label>
            <p className="text-gray-900">{inventory.source || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Unit Price</label>
            <p className="text-gray-900">${inventory.unitPrice?.toFixed(2)}</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">Total Value</label>
            <p className="text-gray-900 font-semibold">
              ${inventory.totalValue?.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Link
            to={`/csm/inventory/edit/${inventory.centralInventoryID}`}
            className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <BsPencil /> Edit Batch
          </Link>
          <Link
            to={`/csm/inventory/adjust/${inventory.centralInventoryID}`}
            className="inline-flex items-center gap-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            Adjust Stock
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetails;
