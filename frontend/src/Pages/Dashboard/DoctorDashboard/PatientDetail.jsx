import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../../Config/API';

const PatientDetail = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch consultations (includes patient info via Include)
        const res = await API.get(`/Hospital/Doctor/patient/${patientId}`);
        const data = res.data;

        if (data.length === 0) {
          setError('No consultations found for this patient.');
          setLoading(false);
          return;
        }

        // Extract patient info from first consultation
        const first = data[0];
        setPatient({
          patientID: first.patient?.patientID || patientId,
          fullName: first.patient?.fullName || 'Unknown',
          // additional fields if available
        });

        setConsultations(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load patient data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  if (loading) return <div>Loading patient details...</div>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!patient) return <p>Patient not found.</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800">
          {patient.fullName}
        </h3>
        <Link
          to="/doctor/department-triage"
          className="text-blue-600 hover:underline"
        >
          ← Back to Triage
        </Link>
      </div>
      <p className="text-sm text-gray-600">Patient ID: {patient.patientID}</p>

      <h4 className="text-lg font-semibold mt-6 mb-3">Consultation History</h4>

      {consultations.length === 0 ? (
        <p>No consultations recorded.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th>Consultation ID</th>
                <th>Visit ID</th>
                <th>Doctor ID</th>
                <th>Diagnosis</th>
                <th>Treatment Plan</th>
                <th>Chief Complaint</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => (
                <tr key={c.consultationID}>
                  <td className="px-4 py-2">{c.consultationID}</td>
                  <td className="px-4 py-2">{c.visitID}</td>
                  <td className="px-4 py-2">{c.doctorID}</td>
                  <td className="px-4 py-2">{c.diagnosis}</td>
                  <td className="px-4 py-2">{c.treatmentPlan}</td>
                  <td className="px-4 py-2">{c.chiefComplaint}</td>
                  <td className="px-4 py-2">{c.consultationDate ? new Date(c.consultationDate).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;