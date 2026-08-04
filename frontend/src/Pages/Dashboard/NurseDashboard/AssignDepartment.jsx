import React, { useState } from 'react';
import API from '../../../Config/API';

const AssignDepartment = () => {
  const [triageId, setTriageId] = useState('');
  const [clinicalDepartmentId, setClinicalDepartmentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await API.put('/Hospital/Triage/assign-department', {
        triageId: parseInt(triageId),
        clinicalDepartmentId: parseInt(clinicalDepartmentId)
      });
      setMessage('Department assigned successfully!');
      setTriageId('');
      setClinicalDepartmentId('');
    } catch (err) {
      console.error('Error assigning department:', err);
      setMessage('Failed to assign department. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Assign Clinical Department</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          placeholder="Triage ID"
          value={triageId}
          onChange={(e) => setTriageId(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="number"
          placeholder="Clinical Department ID"
          value={clinicalDepartmentId}
          onChange={(e) => setClinicalDepartmentId(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {message && (
          <div className={`p-2 rounded ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary py-2 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
          style={{ backgroundColor: '#4f46e5', border: 'none' }}
        >
          {loading ? 'Assigning...' : 'Assign Department'}
        </button>
      </form>
    </div>
  );
};

export default AssignDepartment;