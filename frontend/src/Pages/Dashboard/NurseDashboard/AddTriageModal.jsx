import React, { useState, useEffect } from 'react';
import API from '../../../Config/API';

const AddTriageModal = ({ visit, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    visitID: visit?.visitID || '',
    nurseID: '', // You can auto-fill from auth context if available
    triageDepartmentID: '',
    clinicalDepartmentID: '',
    temprature: '',
    bloodPressure: '',
    heartRate: '',
    respiratotyRate: '',
    weight: '',
    notes: '',
  });

  // Fetch triage departments for dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const response = await API.get('/Hospital/Triage/triage_departments');
        setDepartments(response.data || []);
      } catch (err) {
        console.error('Error fetching departments:', err);
      } finally {
        setLoading(false);
      }
    };
    if (visit) fetchDepartments();
  }, [visit]);

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
      setTimeout(() => {
        onSuccess(); // refresh parent list
        onClose();   // close modal
      }, 1500);
    } catch (err) {
      console.error('Error adding triage:', err);
      setMessage('Failed to add triage. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visit) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Add Triage for Visit #{visit.visitID}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Visit ID - disabled (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Visit ID</label>
              <input
                type="text"
                value={formData.visitID}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-700"
              />
            </div>

            {/* Nurse ID – you can replace with hidden or auto-fill */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nurse ID</label>
              <input
                type="number"
                name="nurseID"
                value={formData.nurseID}
                onChange={handleChange}
                placeholder="Enter your Nurse ID"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
                onClick={onClose}
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
      </div>
    </div>
  );
};

export default AddTriageModal;