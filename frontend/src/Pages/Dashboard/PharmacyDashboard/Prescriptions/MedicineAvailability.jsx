import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import pharmacyApi from "../Services/pharmacyApi";

const MedicineAvailability = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAvailability();
  }, [id]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const res = await pharmacyApi.checkMedicineAvailability(id);
      setAvailability(res.data);
      setError("");
    } catch (err) {
      console.error("Error checking availability:", err);
      setError("Failed to check medicine availability.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600">Checking availability...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!availability || availability.length === 0) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <i className="bi bi-box text-5xl text-gray-300 block mb-3"></i>
          <p className="text-gray-500">No medicine data available for this prescription.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(`/pharmacy/prescriptions/${id}`)}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <i className="bi bi-arrow-left"></i> Back to Prescription
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Medicine Availability</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Medicine</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Required</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Available</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Batches</th>
              </tr>
            </thead>
            <tbody>
              {availability.map((item) => (
                <tr key={item.medicineId} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.medicineName}</td>
                  <td className="px-4 py-3 text-gray-600">{item.requiredQuantity || "N/A"}</td>
                  <td className="px-4 py-3 font-medium text-gray-700">{item.availableQuantity}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.isAvailable ? "✔ In Stock" : "✘ Out of Stock"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.batches && item.batches.length > 0 ? (
                      <div className="space-y-1">
                        {item.batches.map((batch, i) => (
                          <div key={i} className="text-xs text-gray-600">
                            {batch.batchNumber} – {batch.quantityAvailable} units
                            <span className="ml-2 text-gray-400">
                              (exp: {new Date(batch.expiryDate).toLocaleDateString()})
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No batches</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => navigate(`/pharmacy/dispense/new/${id}`)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <i className="bi bi-prescription2"></i> Proceed to Dispense
        </button>
        <button
          onClick={() => navigate("/pharmacy/prescriptions")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <i className="bi bi-arrow-left"></i> Back to List
        </button>
      </div>
    </div>
  );
};

export default MedicineAvailability;