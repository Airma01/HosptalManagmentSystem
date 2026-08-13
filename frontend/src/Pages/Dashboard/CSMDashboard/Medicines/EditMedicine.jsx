import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMedicineById, updateMedicine } from "../services/centralStoreService";
import MedicineForm from "../components/forms/MedicineForm";

const EditMedicine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    medicineName: "",
    genericName: "",
    unitPrice: "",
    unitOfMeasure: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        const data = await getMedicineById(id);
        setFormData({
          medicineName: data.medicineName || "",
          genericName: data.genericName || "",
          unitPrice: data.unitPrice || "",
          unitOfMeasure: data.unitOfMeasure || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load medicine.");
      } finally {
        setLoading(false);
      }
    };
    fetchMedicine();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {};
      if (formData.medicineName) payload.medicineName = formData.medicineName;
      if (formData.genericName) payload.genericName = formData.genericName;
      if (formData.unitPrice) payload.unitPrice = parseFloat(formData.unitPrice);
      if (formData.unitOfMeasure) payload.unitOfMeasure = formData.unitOfMeasure;
      await updateMedicine(id, payload);
      navigate("/csm/medicines");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update medicine.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-4"><div className="spinner-border"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h4 className="mb-3">Edit Medicine</h4>
      <MedicineForm
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSubmit}
        loading={submitting}
        submitLabel="Update Medicine"
      />
    </div>
  );
};

export default EditMedicine;