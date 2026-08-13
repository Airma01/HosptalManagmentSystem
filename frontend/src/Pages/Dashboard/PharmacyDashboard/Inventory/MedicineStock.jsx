import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import pharmacyApi from "../Services/pharmacyApi";

const MedicineStock = () => {
  const { medicineId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoading(true);
        const response = await pharmacyApi.getMedicineStock(medicineId);
        setStockData(response.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load medicine stock.");
      } finally {
        setLoading(false);
      }
    };
    if (medicineId) fetchStock();
  }, [medicineId]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="text-center py-12 text-gray-500">
          <i className="bi bi-box text-4xl block mb-2"></i>
          <p>No stock information available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate("/pharmacy/inventory")}
        className="text-blue-600 hover:underline flex items-center gap-1 mb-4"
      >
        <i className="bi bi-arrow-left"></i> Back to Inventory
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {stockData.medicineName}
        </h1>
        <p className="text-gray-500 mb-4">Generic: {stockData.genericName}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-gray-500">Total Quantity</p>
            <p className="text-2xl font-bold text-blue-700">{stockData.totalQuantity}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-500">Batches</p>
            <p className="text-2xl font-bold text-gray-700">{stockData.batchCount}</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-sm text-gray-500">Unit Price</p>
            <p className="text-2xl font-bold text-green-700">${stockData.unitPrice}</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-3">Batch Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Batch</th>
                <th className="pb-2">Quantity</th>
                <th className="pb-2">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {stockData.batches.map((batch) => (
                <tr key={batch.inventoryId} className="border-b border-gray-100">
                  <td className="py-2">{batch.batchNumber}</td>
                  <td className="py-2">{batch.quantityAvailable}</td>
                  <td className="py-2">{new Date(batch.expiryDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicineStock;