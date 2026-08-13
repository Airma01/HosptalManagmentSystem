import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../../Config/API';
import { getAuthenticatedUser } from '../../../utils/getAuthenticatedUser';

const CreateConsultation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const visitIdFromQuery = searchParams.get('visitId');
  const patientNameFromQuery = searchParams.get('patientName') || 'Unknown Patient';

  const [doctorID, setDoctorID] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);

  const [formData, setFormData] = useState({
    visitID: visitIdFromQuery || '',
    doctorID: '',
    diagnosis: '',
    treatmentPlan: '',
    chiefComplaint: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const user = await getAuthenticatedUser();
      if (user) {
        const docId = user.doctorID || user.UserID || '';
        setDoctorID(docId);
        setFormData((prev) => ({ ...prev, doctorID: docId }));
      }
      setLoadingUser(false);
    };
    loadUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await API.post('/Hospital/Doctor/consultation', formData);
      setMessage('Consultation created successfully!');
      setTimeout(() => navigate('/doctor/consultations'), 1500);
    } catch (err) {
      console.error(err);
      setMessage('Failed to create consultation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) return <div>Loading user information...</div>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Create Consultation</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Visit ID</label>
          <input
            type="number"
            name="visitID"
            value={formData.visitID}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Patient Name</label>
          <input
            type="text"
            value={patientNameFromQuery}
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            readOnly
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
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
          <textarea
            name="diagnosis"
            placeholder="Enter diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            rows="2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Treatment Plan</label>
          <textarea
            name="treatmentPlan"
            placeholder="Enter treatment plan"
            value={formData.treatmentPlan}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            rows="2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Chief Complaint</label>
          <textarea
            name="chiefComplaint"
            placeholder="Enter chief complaint"
            value={formData.chiefComplaint}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            rows="2"
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
          {submitting ? 'Creating...' : 'Create Consultation'}
        </button>
      </form>
    </div>
  );
};

export default CreateConsultation;