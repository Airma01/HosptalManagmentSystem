import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../../../Config/API';

const PrescriptionDetail = () => {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/Hospital/nurse/Nurse/prescription/${id}`);
        setPrescription(res.data);
      } catch (err) {
        setError('Prescription not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!prescription) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Prescription Details</h1>
      <div className="bg-white p-6 rounded-xl shadow border">
        <p><strong>Prescription ID:</strong> {prescription.prescriptionId}</p>
        <p><strong>Patient:</strong> {prescription.patientName}</p>
        <p><strong>Doctor:</strong> {prescription.doctorName}</p>
        <p><strong>Consultation:</strong> {prescription.consultationId}</p>
        <p><strong>Branch Pharmacy:</strong> {prescription.branchPharmacyId}</p>
        <p><strong>Date:</strong> {new Date(prescription.prescriptionDate).toLocaleString()}</p>
        <h3 className="font-semibold mt-4">Medicines</h3>
        <table className="w-full border mt-2 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 border">Medicine</th>
              <th className="px-2 py-1 border">Dosage</th>
              <th className="px-2 py-1 border">Frequency</th>
              <th className="px-2 py-1 border">Duration</th>
              <th className="px-2 py-1 border">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medicines.map((m, i) => (
              <tr key={i}>
                <td className="px-2 py-1 border">{m.medicineName}</td>
                <td className="px-2 py-1 border">{m.dosage}</td>
                <td className="px-2 py-1 border">{m.frequency}</td>
                <td className="px-2 py-1 border">{m.duration}</td>
                <td className="px-2 py-1 border">{m.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrescriptionDetail;