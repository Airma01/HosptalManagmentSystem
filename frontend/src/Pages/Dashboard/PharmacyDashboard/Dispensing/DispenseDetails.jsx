import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import pharmacyApi from "../Services/pharmacyApi";

const DispenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dispense, setDispense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await pharmacyApi.getDispenseDetails(id);
        setDispense(res.data);
        setError("");
      } catch (err) {
        console.error("Error fetching dispense details:", err);
        setError("Failed to load dispense details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600">Loading dispense details...</p>
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
        <button
          onClick={() => navigate("/pharmacy/dispense/history")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to History
        </button>
      </div>
    );
  }

  if (!dispense) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen text-center text-gray-500">
        Dispense record not found.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate("/pharmacy/dispense/history")}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <i className="bi bi-arrow-left"></i> Back to History
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Dispense Details</h1>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Dispense ID</p>
            <p className="text-lg font-medium text-gray-800">#{dispense.dispenseId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date & Time</p>
            <p className="text-lg font-medium text-gray-800">
              {new Date(dispense.dispenseDate).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-lg font-bold text-blue-600">${dispense.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Patient & Pharmacist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Patient</p>
          <p className="text-lg font-medium text-gray-800">{dispense.patientName}</p>
          <p className="text-sm text-gray-500">Prescription #{dispense.prescriptionId}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Dispensed By</p>
          <p className="text-lg font-medium text-gray-800">{dispense.pharmacistName}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Dispensed Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Medicine</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Quantity</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Unit Price</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {dispense.items.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.medicineName}</td>
                  <td className="px-4 py-3 text-gray-600">{item.quantityDispensed}</td>
                  <td className="px-4 py-3 text-gray-600">${item.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 font-medium text-gray-700">${item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t">
              <tr>
                <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-700">
                  Total
                </td>
                <td className="px-4 py-3 font-bold text-blue-600">
                  ${dispense.totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => navigate(`/pharmacy/prescriptions/${dispense.prescriptionId}`)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <i className="bi bi-prescription2"></i> View Prescription
        </button>
      </div>
    </div>
  );
};

export default DispenseDetails;