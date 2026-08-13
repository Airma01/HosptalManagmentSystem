import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import pharmacyApi from "../Services/pharmacyApi";

const DispenseMedicine = () => {
  const { id } = useParams(); // prescription ID
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [availability, setAvailability] = useState({});

  // Fetch prescription details and availability
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get prescription details with available quantities
        const res = await pharmacyApi.getPrescriptionDetails(id);
        const data = res.data;
        setPrescription(data);

        // Initialize items with prescribed quantities (allow pharmacist to adjust)
        const initialItems = data.medicines.map((med) => ({
          medicineId: med.medicineId,
          medicineName: med.medicineName,
          prescribedQuantity: med.quantity,
          quantityToDispense: med.quantity, // default = prescribed
          availableQuantity: med.availableQuantity || 0,
        }));
        setItems(initialItems);

        setError("");
      } catch (err) {
        console.error("Error loading prescription:", err);
        setError("Failed to load prescription details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // Handle quantity change
  const handleQuantityChange = (index, value) => {
    const newItems = [...items];
    const qty = parseFloat(value) || 0;
    newItems[index].quantityToDispense = qty;
    setItems(newItems);
  };

  // Validate and submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate: all quantities > 0 and <= available
    for (const item of items) {
      if (item.quantityToDispense <= 0) {
        setError(`Quantity for ${item.medicineName} must be greater than 0.`);
        return;
      }
      if (item.quantityToDispense > item.availableQuantity) {
        setError(
          `Insufficient stock for ${item.medicineName}. Available: ${item.availableQuantity}, Requested: ${item.quantityToDispense}`
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      setError("");
      const payload = {
        prescriptionId: parseInt(id),
        items: items.map((item) => ({
          medicineId: item.medicineId,
          quantityDispensed: item.quantityToDispense,
        })),
      };
      const response = await pharmacyApi.dispenseMedicine(payload);
      setSuccess(`Dispense completed successfully! (ID: ${response.data.dispenseId})`);
      // Optionally redirect to dispense details after a delay
      setTimeout(() => {
        navigate(`/pharmacy/dispense/${response.data.dispenseId}`);
      }, 2000);
    } catch (err) {
      console.error("Dispense error:", err);
      setError(err.response?.data?.message || "Failed to dispense medicine. Please try again.");
    } finally {
      setSubmitting(false);
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

  if (error && !prescription) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
        <button
          onClick={() => navigate("/pharmacy/prescriptions")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Prescriptions
        </button>
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
          onClick={() => navigate(`/pharmacy/prescriptions/${id}`)}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <i className="bi bi-arrow-left"></i> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Dispense Prescription</h1>
      </div>

      {/* Success alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <i className="bi bi-check-circle"></i>
          <span>{success}</span>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Patient & Doctor Info */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Patient</p>
            <p className="text-lg font-medium text-gray-800">{prescription.patientName}</p>
            <p className="text-sm text-gray-500">Prescription Date: {new Date(prescription.prescriptionDate).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Doctor</p>
            <p className="text-lg font-medium text-gray-800">{prescription.doctorName}</p>
            <p className="text-sm text-gray-500">Prescription #{prescription.prescriptionId}</p>
          </div>
        </div>
      </div>

      {/* Dispense Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Medicine</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Prescribed</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Available</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">To Dispense</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.medicineId} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.medicineName}</td>
                    <td className="px-4 py-3 text-gray-600">{item.prescribedQuantity}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${
                          item.availableQuantity >= item.prescribedQuantity
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.availableQuantity}
                      </span>
                      {item.availableQuantity < item.prescribedQuantity && (
                        <span className="ml-1 text-xs text-red-500">(low stock)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.quantityToDispense}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <span className="ml-1 text-xs text-gray-400">max {item.availableQuantity}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting || !!success}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle"></i>
                Confirm Dispense
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/pharmacy/prescriptions/${id}`)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DispenseMedicine;