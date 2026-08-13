import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pharmacyApi from "../Services/pharmacyApi";

const CreateRequest = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [items, setItems] = useState([{ medicineId: "", requestedQuantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [rawResponse, setRawResponse] = useState(null);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        let response;

        // Try to fetch all medicines (preferred for request creation)
        try {
          response = await pharmacyApi.getAllMedicines();
        } catch (err) {
          // Fallback to inventory if getAllMedicines is not available
          console.warn("getAllMedicines failed, falling back to inventory:", err);
          response = await pharmacyApi.getInventory();
        }

        console.log("Medicines response:", response.data);
        setRawResponse(response.data);

        // Check if response is an array
        let dataArray = Array.isArray(response.data) ? response.data : [];

        if (dataArray.length > 0) {
          const medicineMap = {};
          dataArray.forEach((item) => {
            // Handle both camelCase and PascalCase
            const id = item.medicineId || item.MedicineID || item.medicineID;
            const name = item.medicineName || item.MedicineName || item.name;
            const uom = item.unitOfMeasure || item.UnitOfMeasure || "";
            const qty = item.quantityAvailable || item.QuantityAvailable || 0;

            if (!id) return;

            if (!medicineMap[id]) {
              medicineMap[id] = {
                medicineId: id,
                medicineName: name,
                unitOfMeasure: uom,
                availableQuantity: 0,
              };
            }
            // If the response is from inventory, sum quantities; else just store once
            if (item.quantityAvailable !== undefined || item.QuantityAvailable !== undefined) {
              medicineMap[id].availableQuantity += qty;
            } else {
              // From medicine list, set available quantity to 0 or a placeholder
              medicineMap[id].availableQuantity = 0;
            }
          });
          const medicineList = Object.values(medicineMap);
          setMedicines(medicineList);
          setError("");
        } else {
          setMedicines([]);
          setError("No medicines available to request.");
        }
      } catch (err) {
        console.error("Error fetching medicines:", err);
        setError("Failed to load medicine list. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, []);

  const addItem = () => {
    setItems([...items, { medicineId: "", requestedQuantity: 1 }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const item of items) {
      if (!item.medicineId) {
        setError("Please select a medicine for all rows.");
        return;
      }
      if (item.requestedQuantity <= 0) {
        setError("Requested quantity must be greater than 0.");
        return;
      }
    }

    try {
      setSubmitting(true);
      setError("");
      const payload = {
        items: items.map((item) => ({
          medicineId: parseInt(item.medicineId),
          requestedQuantity: parseInt(item.requestedQuantity),
        })),
      };
      const response = await pharmacyApi.createCentralStoreRequest(payload);
      setSuccess(`Request created successfully! (ID: ${response.data.requestId})`);
      setItems([{ medicineId: "", requestedQuantity: 1 }]);
      setTimeout(() => {
        navigate("/pharmacy/requests");
      }, 2000);
    } catch (err) {
      console.error("Create request error:", err);
      setError(err.response?.data?.message || "Failed to create request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600">Loading medicines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate("/pharmacy/requests")}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <i className="bi bi-arrow-left"></i> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Create Central Store Request</h1>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <i className="bi bi-check-circle"></i>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <i className="bi bi-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Debug Section */}
      {medicines.length === 0 && !loading && (
        <div className="bg-gray-100 border border-gray-300 p-4 rounded-lg mb-4">
          <p className="text-sm font-medium text-gray-700">🔍 Debug Info:</p>
          <pre className="text-xs text-gray-600 overflow-auto max-h-40 mt-1 p-2 bg-white rounded">
            {rawResponse ? JSON.stringify(rawResponse, null, 2) : "No response data"}
          </pre>
          <p className="text-xs text-gray-500 mt-2">
            If you see an empty array, there are no medicines in the system. If you see objects with different property names, adjust the mapping.
          </p>
        </div>
      )}

      {medicines.length === 0 && !loading && !error && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <i className="bi bi-box text-5xl text-gray-300 block mb-3"></i>
          <p className="text-gray-500">No medicines available to request.</p>
          <p className="text-sm text-gray-400 mt-1">Please contact the central store manager to add medicines.</p>
        </div>
      )}

      {medicines.length > 0 && (
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-600 font-semibold">Medicine</th>
                    <th className="px-4 py-3 text-left text-gray-600 font-semibold">Available</th>
                    <th className="px-4 py-3 text-left text-gray-600 font-semibold">Quantity</th>
                    <th className="px-4 py-3 text-left text-gray-600 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <select
                          value={item.medicineId}
                          onChange={(e) => handleItemChange(index, "medicineId", e.target.value)}
                          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Select Medicine</option>
                          {medicines.map((med) => (
                            <option key={med.medicineId} value={med.medicineId}>
                              {med.medicineName} ({med.unitOfMeasure})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.medicineId
                          ? medicines.find((m) => m.medicineId === parseInt(item.medicineId))
                              ?.availableQuantity || 0
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.requestedQuantity}
                          onChange={(e) =>
                            handleItemChange(index, "requestedQuantity", parseInt(e.target.value) || 1)
                          }
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={items.length <= 1}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={addItem}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
            >
              <i className="bi bi-plus-circle"></i> Add Another Medicine
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="bi bi-send"></i>
                  Submit Request
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/pharmacy/requests")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateRequest;