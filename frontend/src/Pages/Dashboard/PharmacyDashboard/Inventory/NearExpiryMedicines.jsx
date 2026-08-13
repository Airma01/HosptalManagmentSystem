import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import pharmacyApi from "../Services/pharmacyApi";

const NearExpiryMedicines = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const response = await pharmacyApi.getNearExpiryMedicines();
        setData(response.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load near-expiry medicines.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/pharmacy/inventory" className="text-blue-600 hover:underline">
          <i className="bi bi-arrow-left"></i> Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Near-Expiry Medicines</h1>
        <span className="text-sm text-gray-500">(Expiring within 30 days)</span>
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <i className="bi bi-check-circle text-4xl text-green-500 block mb-2"></i>
          <p>No near-expiry medicines found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-yellow-50 text-yellow-700">
              <tr>
                <th className="px-4 py-3 text-left">Medicine</th>
                <th className="px-4 py-3 text-left">Batch</th>
                <th className="px-4 py-3 text-left">Quantity</th>
                <th className="px-4 py-3 text-left">Expiry Date</th>
                <th className="px-4 py-3 text-left">Days Left</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.inventoryId} className="border-b border-gray-100">
                  <td className="px-4 py-2 font-medium">{item.medicineName}</td>
                  <td className="px-4 py-2">{item.batchNumber}</td>
                  <td className="px-4 py-2">{item.quantityAvailable}</td>
                  <td className="px-4 py-2">{new Date(item.expiryDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-yellow-600 font-bold">{item.daysUntilExpiry} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NearExpiryMedicines;