import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import pharmacyApi from "../Services/pharmacyApi";

const PrescriptionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await pharmacyApi.getPrescriptionDetails(id);
      setPrescription(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching prescription details:", err);
      setError("Failed to load prescription details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600">Loading prescription...</p>
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

  if (!prescription) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen text-center text-gray-500">
        Prescription not found.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate("/pharmacy/prescriptions")}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <i className="bi bi-arrow-left"></i> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Prescription #{prescription.prescriptionId}</h1>
      </div>

      {/* Patient & Doctor Info */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Patient</p>
            <p className="text-lg font-medium text-gray-800">{prescription.patientName}</p>
            <p className="text-sm text-gray-500">Patient ID: {prescription.patientId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Doctor</p>
            <p className="text-lg font-medium text-gray-800">{prescription.doctorName}</p>
            <p className="text-sm text-gray-500">Date: {new Date(prescription.prescriptionDate).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Prescribed Medicines</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Medicine</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Dosage</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Frequency</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Duration</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Quantity</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Available</th>
                <th className="px-4 py-3 text-left text-gray-600 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {prescription.medicines.map((med, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{med.medicineName}</td>
                  <td className="px-4 py-3 text-gray-600">{med.dosage}</td>
                  <td className="px-4 py-3 text-gray-600">{med.frequency}</td>
                  <td className="px-4 py-3 text-gray-600">{med.duration}</td>
                  <td className="px-4 py-3 text-gray-600">{med.quantity}</td>
                  <td className="px-4 py-3 text-gray-600">{med.availableQuantity}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        med.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {med.isAvailable ? "Available" : "Out of Stock"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={() => navigate(`/pharmacy/prescriptions/${id}/availability`)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <i className="bi bi-box"></i> Check Availability
        </button>
        <button
          onClick={() => navigate(`/pharmacy/dispense/new/${id}`)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
        >
          <i className="bi bi-prescription2"></i> Dispense Now
        </button>
      </div>
    </div>
  );
};

export default PrescriptionDetails;