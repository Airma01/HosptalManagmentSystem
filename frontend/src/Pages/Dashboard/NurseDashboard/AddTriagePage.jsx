import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../../Config/API';

const AddTriagePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [departments, setDepartments] = useState([]);
  const [user, setUser] = useState(null);

  // Initialize formData with empty nurseID; we'll update it after user fetch
  const [formData, setFormData] = useState({
    visitID: id || '',
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

  // Load user data and departments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get authenticated user
        const authRes = await API.get('/Hospital/nurse/NurseAuth/auth_me');
        const userData = authRes.data;
        setUser(userData);

        // 2. Pre-fill nurseID in form
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
  }, [id]);

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
      setMessage('Triage record added successfully!');
      setTimeout(() => navigate('/nurse/recent-visits'), 1500);
    } catch (err) {
      console.error('Error adding triage:', err);
      setMessage('Failed to add triage. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Add Triage for Visit #{id}
        </h3>
        <button
          onClick={() => navigate('/nurse/recent-visits')}
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to list
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Visit ID – read‑only */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Visit ID</label>
          <input
            type="text"
            value={formData.visitID}
            disabled
            className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700"
          />
        </div>

        {/* Nurse ID – auto‑filled, read‑only if set */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nurse ID</label>
          <input
            type="number"
            name="nurseID"
            value={formData.nurseID}
            onChange={handleChange}
            placeholder="Your Nurse ID"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            readOnly={!!formData.nurseID}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Triage Department</label>
            <select
              name="triageDepartmentID"
              value={formData.triageDepartmentID}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.triageDepartmentID} value={dept.triageDepartmentID}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Clinical Department (optional)</label>
            <input
              type="number"
              name="clinicalDepartmentID"
              value={formData.clinicalDepartmentID}
              onChange={handleChange}
              placeholder="Clinical Dept ID"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
            <input
              type="number"
              step="0.1"
              name="temprature"
              value={formData.temprature}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
            <input
              type="text"
              name="bloodPressure"
              value={formData.bloodPressure}
              onChange={handleChange}
              placeholder="e.g., 120/80"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Heart Rate (bpm)</label>
            <input
              type="number"
              name="heartRate"
              value={formData.heartRate}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Respiratory Rate</label>
            <input
              type="number"
              name="respiratotyRate"
              value={formData.respiratotyRate}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {message && (
          <div className={`p-2 rounded ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/nurse/recent-visits')}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary px-6 py-2 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
            style={{ backgroundColor: '#4f46e5', border: 'none' }}
          >
            {submitting ? 'Adding...' : 'Add Triage'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTriagePage;