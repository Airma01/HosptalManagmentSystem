import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMedicineById } from "../services/centralStoreService";

const MedicineDetails = () => {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getMedicineById(id);
        setMedicine(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load medicine.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="text-center py-4"><div className="spinner-border"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h4>Medicine Details</h4>
      <div className="card">
        <div className="card-body">
          <p><strong>ID:</strong> {medicine.medicineID}</p>
          <p><strong>Name:</strong> {medicine.medicineName}</p>
          <p><strong>Generic:</strong> {medicine.genericName || "N/A"}</p>
          <p><strong>Unit Price:</strong> ${medicine.unitPrice?.toFixed(2)}</p>
          <p><strong>Unit of Measure:</strong> {medicine.unitOfMeasure || "N/A"}</p>
          <p><strong>Status:</strong> {medicine.isActive ? "Active" : "Inactive"}</p>
          <Link to="/csm/medicines" className="btn btn-secondary">Back</Link>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetails;