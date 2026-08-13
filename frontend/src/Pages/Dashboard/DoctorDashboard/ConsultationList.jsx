import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../Config/API';

const ConsultationList = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patientIdSearch, setPatientIdSearch] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' }); // type: 'success' | 'error'
  const [processingId, setProcessingId] = useState(null); // track which record is being processed

  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const doctorID = userData.doctorID || userData.UserID;

  // Fetch consultations for the logged-in doctor
  const fetchDoctorConsultations = async () => {
    if (!doctorID) return;
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/Hospital/Doctor/doctor/${doctorID}`);
      setConsultations(res.data || []);
      if (res.data.length === 0) setError('No consultations found for you.');
    } catch (err) {
      console.error(err);
      setError('Failed to load your consultations.');
    } finally {
      setLoading(false);
    }
  };

  // Search by patient ID
  const handlePatientSearch = async (e) => {
    e.preventDefault();
    if (!patientIdSearch) return;
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/Hospital/Doctor/patient/${patientIdSearch}`);
      setConsultations(res.data || []);
      if (res.data.length === 0) setError('No consultations found for this patient.');
    } catch (err) {
      console.error(err);
      setError('Failed to load consultations.');
    } finally {
      setLoading(false);
    }
  };

  // Create medical record for a consultation
  const handleCreateMedicalRecord = async (consultationID, patientID, doctorID) => {
    setProcessingId(consultationID);
    setToast({ message: '', type: '' });
    try {
      await API.post('/Hospital/Doctor/medical-record', {
        consultationID,
        patientID,
        doctorID,
      });
      setToast({ message: 'Medical record created successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to create medical record.', type: 'error' });
    } finally {
      setProcessingId(null);
      // Auto‑clear toast after 3 seconds
      setTimeout(() => setToast({ message: '', type: '' }), 3000);
    }
  };

  useEffect(() => {
    fetchDoctorConsultations();
  }, [doctorID]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">My Consultations</h3>

      {/* Toast notification */}
      {toast.message && (
        <div className={`p-3 rounded mb-4 ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {toast.message}
        </div>
      )}

      {/* Search by patient ID */}
      <form onSubmit={handlePatientSearch} className="flex gap-3 mb-4">
        <input
          type="number"
          placeholder="Search by Patient ID"
          value={patientIdSearch}
          onChange={(e) => setPatientIdSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="btn btn-primary px-4 py-2 text-white rounded-lg"
          style={{ backgroundColor: '#4f46e5', border: 'none' }}
        >
          Search
        </button>
        <button
          type="button"
          onClick={fetchDoctorConsultations}
          className="btn btn-secondary px-4 py-2 rounded-lg"
        >
          My Consultations
        </button>
      </form>

      {loading && <div>Loading...</div>}
      {error && <p className="text-red-500">{error}</p>}

      {consultations.length > 0 && (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th>Consultation ID</th>
                <th>Patient</th>
                <th>Patient ID</th>
                <th>Visit ID</th>
                <th>Diagnosis</th>
                <th>Treatment Plan</th>
                <th>Chief Complaint</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => (
                <tr key={c.consultationID}>
                  <td>{c.consultationID}</td>
                  <td>{c.fullname || 'Unknown'}</td>
                  <td>{c.patientID}</td>
                  <td>{c.visitID}</td>
                  <td>{c.diagnosis}</td>
                  <td>{c.treatmentPlan}</td>
                  <td>{c.chiefComplaint}</td>
                  <td>{c.consultationDate ? new Date(c.consultationDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <Link
                      to={`/doctor/triage/${c.visitID}`}
                      className="text-green-600 hover:underline mr-2"
                    >
                      Triage
                    </Link>
                    <Link
                      to={`/doctor/update-consultation/${c.consultationID}`}
                      className="text-blue-600 hover:underline mr-2"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleCreateMedicalRecord(c.consultationID, c.patientID, c.doctorID)}
                      disabled={processingId === c.consultationID}
                      className="text-purple-600 hover:underline disabled:opacity-50"
                    >
                      {processingId === c.consultationID ? 'Creating...' : 'Medical Record'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConsultationList;