import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../Config/API';

const CreateVisit = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientID: '',
    visitDate: '',
    visitType: 'Checkup',
    status: 'Pending',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // ✅ Only fetch patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const response = await API.get('/Hospital/Patient/get_all_patients');
        setPatients(response.data || []);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setMessage('Failed to load patients.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []); // ✅ empty dependency array

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      // ✅ Correct endpoint – matches PatientController
      await API.post('/Hospital/Patient/add_patient_visit', formData);
      setMessage('Visit created successfully!');
      setTimeout(() => navigate('/receptionist/visits'), 1500);
    } catch (error) {
      console.error('Error creating visit:', error);
      setMessage('Failed to create visit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading patients...</div>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Create New Patient Visit</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Patient</label>
          <select
            name="patientID"
            value={formData.patientID}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select a patient</option>
            {patients.map((p) => (
              <option key={p.patientID} value={p.patientID}>
                {p.firstName} {p.fatherName} (ID: {p.patientID})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Visit Date</label>
          <input
            type="date"
            name="visitDate"
            value={formData.visitDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Visit Type</label>
          <select
            name="visitType"
            value={formData.visitType}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Checkup">Checkup</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Emergency">Emergency</option>
            <option value="Consultation">Consultation</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        {message && (
          <div className={`p-2 rounded ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full btn btn-primary py-2 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
          style={{ backgroundColor: '#4f46e5', border: 'none' }}
        >
          {submitting ? 'Creating...' : 'Create Visit'}
        </button>
      </form>
    </div>
  );
};

export default CreateVisit;