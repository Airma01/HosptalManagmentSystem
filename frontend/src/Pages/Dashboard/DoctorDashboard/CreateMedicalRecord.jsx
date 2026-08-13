import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../Config/API';
import { getAuthenticatedUser } from '../../../utils/getAuthenticatedUser';

const CreateMedicalRecord = () => {
  const navigate = useNavigate();
  const [doctorID, setDoctorID] = useState('');
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    consultationID: '',
    patientID: '',
    doctorID: '',
  });

  // Load doctor ID and fetch consultations
  useEffect(() => {
    const loadData = async () => {
      const user = await getAuthenticatedUser();
      if (user) {
        const docId = user.doctorID || user.UserID || '';
        setDoctorID(docId);
        setFormData((prev) => ({ ...prev, doctorID: docId }));

        // Fetch recent consultations for this doctor
        try {
          const res = await API.get(`/Hospital/Doctor/recent/${docId}`);
          setConsultations(res.data || []);
        } catch (err) {
          console.error('Error fetching consultations:', err);
          setMessage('Failed to load consultations.');
        }
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // When consultation is selected, auto-fill patientID
  const handleConsultationChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const selected = consultations.find(c => c.consultationID === selectedId);
    setFormData({
      ...formData,
      consultationID: selectedId,
      patientID: selected?.patientID || '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await API.post('/Hospital/Doctor/medical-record', formData);
      setMessage('Medical record created successfully!');
      setTimeout(() => navigate('/doctor/consultations'), 1500);
    } catch (err) {
      console.error(err);
      setMessage('Failed to create medical record.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Create Medical Record</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Consultation</label>
          <select
            name="consultationID"
            value={formData.consultationID}
            onChange={handleConsultationChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          >
            <option value="">Select a consultation</option>
            {consultations.map((c) => (
              <option key={c.consultationID} value={c.consultationID}>
                {c.fullName} (Consultation #{c.consultationID})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Patient ID</label>
          <input
            type="number"
            name="patientID"
            value={formData.patientID}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            readOnly
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Doctor ID</label>
          <input
            type="number"
            name="doctorID"
            value={formData.doctorID}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            readOnly
            required
          />
        </div>

        {message && (
          <div className={`p-2 rounded ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn btn-primary py-2 text-white rounded-lg"
          style={{ backgroundColor: '#4f46e5', border: 'none' }}
        >
          {submitting ? 'Creating...' : 'Create Medical Record'}
        </button>
      </form>
    </div>
  );
};

export default CreateMedicalRecord;