import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../Config/API';

const RequestLabTest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    consultationId: '', patientId: '', doctorId: '', laboratoryTestTypeId: '', status: 'Requested'
  });
  const [testTypes, setTestTypes] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, sectionsRes] = await Promise.all([
          API.get('/Hospital/nurse/Nurse/laboratory/test-types'),
          API.get('/Hospital/nurse/Nurse/laboratory/sections')
        ]);
        setTestTypes(typesRes.data);
        setSections(sectionsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.post('/Hospital/nurse/Nurse/laboratory/request', formData);
      alert('Lab test requested successfully');
      navigate('/nurse/laboratory');
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Request Laboratory Test</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block font-medium">Consultation ID *</label><input name="consultationId" value={formData.consultationId} onChange={handleChange} required className="border p-2 w-full rounded" /></div>
          <div><label className="block font-medium">Patient ID *</label><input name="patientId" value={formData.patientId} onChange={handleChange} required className="border p-2 w-full rounded" /></div>
          <div><label className="block font-medium">Doctor ID *</label><input name="doctorId" value={formData.doctorId} onChange={handleChange} required className="border p-2 w-full rounded" /></div>
          <div><label className="block font-medium">Test Type *</label>
            <select name="laboratoryTestTypeId" value={formData.laboratoryTestTypeId} onChange={handleChange} required className="border p-2 w-full rounded">
              <option value="">Select</option>
              {testTypes.map(t => <option key={t.laboratoryTestTypeId} value={t.laboratoryTestTypeId}>{t.testName}</option>)}
            </select>
          </div>
          <div><label className="block font-medium">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="border p-2 w-full rounded">
              <option value="Requested">Requested</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50">{loading ? 'Requesting...' : 'Request Test'}</button>
      </form>
    </div>
  );
};

export default RequestLabTest;