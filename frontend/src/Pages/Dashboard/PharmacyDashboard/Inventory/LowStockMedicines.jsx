import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import pharmacyApi from "../Services/pharmacyApi";

const LowStockMedicines = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const response = await pharmacyApi.getLowStockMedicines();
        setData(response.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load low stock medicines.");
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
        <h1 className="text-2xl font-bold text-gray-800">Low Stock Medicines</h1>
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <i className="bi bi-check-circle text-4xl text-green-500 block mb-2"></i>
          <p>No low stock items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <div key={item.medicineId} className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{item.medicineName}</h3>
                  <p className="text-sm text-gray-500">{item.unitOfMeasure}</p>
                </div>
                <span className="bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full">
                  {item.availableQuantity} left
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>Reorder Level: {item.reorderLevel}</p>
                {item.earliestExpiry && (
                  <p className="text-yellow-600">
                    Earliest Expiry: {new Date(item.earliestExpiry).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="mt-3">
                <Link to={`/pharmacy/inventory/${item.medicineId}`}>
                  <button className="text-blue-600 hover:underline text-sm">
                    View Stock
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LowStockMedicines;