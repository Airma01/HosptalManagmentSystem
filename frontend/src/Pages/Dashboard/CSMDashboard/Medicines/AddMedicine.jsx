import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMedicine } from "../services/centralStoreService";
import MedicineForm from "../components/forms/MedicineForm";

const AddMedicine = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    medicineName: "",
    genericName: "",
    unitPrice: "",
    unitOfMeasure: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createMedicine({
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
      });
      navigate("/csm/medicines");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create medicine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 className="text-xl font-semibold mb-4">Add New Medicine</h4>
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">{error}</div>}
      <MedicineForm
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Add Medicine"
      />
    </div>
  );
};

export default AddMedicine;