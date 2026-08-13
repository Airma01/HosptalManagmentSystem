import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addInventory, getMedicines } from "../services/centralStoreService";
import InventoryForm from "../components/forms/InventoryForm";

const AddInventory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    medicineID: "",
    quantity: "",
    expiryDate: "",
    batchNumber: "",
    source: "Supplier",
  });
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const data = await getMedicines("", 1, 100);
        setMedicines(data.items || []);
      } catch (err) {
        setError("Failed to load medicines.");
      }
    };
    fetchMedicines();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await addInventory({
        medicineID: parseInt(formData.medicineID),
        quantity: parseFloat(formData.quantity),
        expiryDate: formData.expiryDate,
        batchNumber: formData.batchNumber,
        source: formData.source,
      });
      navigate("/csm/inventory");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add inventory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="text-xl font-semibold mb-4">Add Stock</h4>
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">{error}</div>}
      <InventoryForm
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        loading={loading}
        medicines={medicines}
        submitLabel="Add Stock"
      />
    </div>
  );
};

export default AddInventory;