import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../Config/API';

const CreateTriage = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    visitID: '',
    nurseID: '',
    triageDepartmentID: '',
    clinicalDepartmentID: '',
    temprature: '',
    bloodPressure: '',
    heartRate: '',
    respiratotyRate: '',
    weight: '',
    notes: '',
  });

  // Fetch authenticated user and triage departments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get authenticated user (Nurse)
        const authRes = await API.get('/Hospital/nurse/NurseAuth/auth_me');
        const userData = authRes.data;

        // 2. Pre‑fill nurse ID in form
        setFormData((prev) => ({
          ...prev,
          nurseID: userData.nurseID || '',
        }));

        // 3. Fetch triage departments
        const deptRes = await API.get('/Hospital/Triage/triage_departments');
        setDepartments(deptRes.data || []);
      } catch (err) {
        console.error('Error loading data:', err);
        setMessage('Failed to load data. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      await API.post('/Hospital/Triage/add_triage', formData);
      setMessage('Triage record created successfully!');
      setTimeout(() => navigate('/nurse/triage'), 1500);
    } catch (err) {
      console.error('Error creating triage:', err);
      setMessage('Failed to create triage. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Create Triage Record</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="visitID"
            placeholder="Visit ID"
            value={formData.visitID}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            name="nurseID"
            placeholder="Nurse ID"
            value={formData.nurseID}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            readOnly={!!formData.nurseID} // read‑only if we have it
          />
          <select
            name="triageDepartmentID"
            value={formData.triageDepartmentID}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Triage Department</option>
            {departments.map((dept) => (
              <option key={dept.triageDepartmentID} value={dept.triageDepartmentID}>
                {dept.departmentName}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="clinicalDepartmentID"
            placeholder="Clinical Department ID (optional)"
            value={formData.clinicalDepartmentID}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            step="0.1"
            name="temprature"
            placeholder="Temperature (°C)"
            value={formData.temprature}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            name="bloodPressure"
            placeholder="Blood Pressure (e.g., 120/80)"
            value={formData.bloodPressure}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            name="heartRate"
            placeholder="Heart Rate (bpm)"
            value={formData.heartRate}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            name="respiratotyRate"
            placeholder="Respiratory Rate"
            value={formData.respiratotyRate}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            step="0.1"
            name="weight"
            placeholder="Weight (kg)"
            value={formData.weight}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full btn btn-primary py-2 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
          style={{ backgroundColor: '#4f46e5', border: 'none' }}
        >
          {submitting ? 'Creating...' : 'Create Triage'}
        </button>
      </form>
    </div>
  );
};

export default CreateTriage;