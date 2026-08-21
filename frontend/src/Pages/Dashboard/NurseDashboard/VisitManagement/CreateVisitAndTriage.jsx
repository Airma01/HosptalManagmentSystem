import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../../../Config/API';

const CreateVisitAndTriage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preFilledPatientId = searchParams.get('patientId') || '';

  const [formData, setFormData] = useState({
    patientId: preFilledPatientId,
    visitDate: '',
    visitType: '',
    status: 'Scheduled',
    triageDepartmentId: '',
    clinicalDepartmentId: '',
    temprature: '',
    bloodPressure: '',
    heartRate: '',
    respiratyRate: '',
    weight: '',
    notes: ''
  });
  const [triageDepts, setTriageDepts] = useState([]);
  const [clinicalDepts, setClinicalDepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const [triageRes, clinicalRes] = await Promise.all([
          API.get('/Hospital/nurse/Nurse/triage-departments'),
          API.get('/Hospital/nurse/Nurse/clinical-departments')
        ]);
        setTriageDepts(triageRes.data);
        setClinicalDepts(clinicalRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (preFilledPatientId) {
      setFormData(prev => ({ ...prev, patientId: preFilledPatientId }));
    }
  }, [preFilledPatientId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.post('/Hospital/nurse/Nurse/create-visit-triage', formData);
      alert('Visit and Triage created successfully');
      navigate('/nurse/visits/today');
    } catch (err) {
      setError(err.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-4 text-center">Loading departments...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Visit & Triage (One Form)</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-2">Visit Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Patient ID *</label>
            <input
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              required
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Visit Date *</label>
            <input
              type="datetime-local"
              name="visitDate"
              value={formData.visitDate}
              onChange={handleChange}
              required
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Visit Type *</label>
            <input
              name="visitType"
              value={formData.visitType}
              onChange={handleChange}
              required
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <h2 className="text-lg font-semibold mt-4 mb-2">Triage Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Triage Department *</label>
            <select
              name="triageDepartmentId"
              value={formData.triageDepartmentId}
              onChange={handleChange}
              required
              className="border p-2 w-full rounded"
            >
              <option value="">Select Triage Department</option>
              {triageDepts.map((d) => (
                <option key={d.triageDepartmentID} value={d.triageDepartmentID}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium">Clinical Department *</label>
            <select
              name="clinicalDepartmentId"
              value={formData.clinicalDepartmentId}
              onChange={handleChange}
              required
              className="border p-2 w-full rounded"
            >
              <option value="">Select Clinical Department</option>
              {clinicalDepts.map((d) => (
                <option key={d.clinicalDepartmentID} value={d.clinicalDepartmentID}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium">Temperature</label>
            <input
              name="temprature"
              value={formData.temprature}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Blood Pressure</label>
            <input
              name="bloodPressure"
              value={formData.bloodPressure}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Heart Rate</label>
            <input
              name="heartRate"
              value={formData.heartRate}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Respiratory Rate</label>
            <input
              name="respiratyRate"
              value={formData.respiratyRate}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block font-medium">Weight</label>
            <input
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div className="col-span-2">
            <label className="block font-medium">Notes</label>
            <input
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Visit & Triage'}
        </button>
      </form>
    </div>
  );
};

export default CreateVisitAndTriage;