import React, { useState, useEffect } from 'react';
import API from '../../../Config/API';

const RecentTriageByDepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [triageList, setTriageList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch clinical departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        // ✅ FIX: No ${id} – just the endpoint
        const response = await API.get('/Hospital/Triage/clinical_departments');
        setDepartments(response.data || []);
        if (response.data && response.data.length > 0) {
          // Auto-select the first department and fetch its triage records
          setSelectedDept(response.data[0].clinicalDepartmentID);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
        setMessage('Failed to load departments.');
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch triage records when selectedDept changes
  useEffect(() => {
    if (selectedDept) {
      fetchTriageRecords(selectedDept);
    }
  }, [selectedDept]);

  const fetchTriageRecords = async (deptId) => {
    setSubmitting(true);
    setMessage('');
    setTriageList([]);
    try {
      const response = await API.get(`/Hospital/Triage/get-recent-triage/${deptId}`);
      setTriageList(response.data || []);
      if (response.data.length === 0) {
        setMessage('No triage records found for this department.');
      }
    } catch (err) {
      console.error('Error fetching triage records:', err);
      if (err.response?.status === 404) {
        setMessage('No triage records found for this department.');
      } else {
        setMessage('Failed to load triage records.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDepartmentChange = (e) => {
    setSelectedDept(e.target.value);
  };

  if (loading) return <div>Loading departments...</div>;

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Recent Triage by Department</h3>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Select Department:</label>
          <select
            value={selectedDept}
            onChange={handleDepartmentChange}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select --</option>
            {departments.map((dept) => (
              <option key={dept.clinicalDepartmentID} value={dept.clinicalDepartmentID}>
                {dept.departmentName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {submitting && <div>Loading triage records...</div>}

      {message && (
        <div className={`p-2 rounded mb-4 ${message.includes('found') ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      {triageList.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Triage ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nurse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp (°C)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heart Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resp. Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {triageList.map((triage) => (
                <tr key={triage.triageId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{triage.triageId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{triage.visitID}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{triage.fullName || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{triage.nurseID}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{triage.temprature}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{triage.bloodPressure}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{triage.heartRate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{triage.respiratotyRate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{triage.weight}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{triage.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentTriageByDepartment;