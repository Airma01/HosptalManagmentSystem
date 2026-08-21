import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../../../Config/API';

const CreateVisit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preFilledPatientId = searchParams.get('patientId') || '';

  const [formData, setFormData] = useState({
    patientId: preFilledPatientId,
    visitDate: '',
    visitType: '',
    status: 'Scheduled'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      await API.post('/Hospital/nurse/Nurse/create-visit', formData);
      alert('Visit created successfully');
      navigate('/nurse/visits/today');
    } catch (err) {
      setError(err.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Visit</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow border">
        <div className="mb-4">
          <label className="block font-medium">Patient ID *</label>
          <input name="patientId" value={formData.patientId} onChange={handleChange} required className="border p-2 w-full rounded" />
        </div>
        <div className="mb-4">
          <label className="block font-medium">Visit Date *</label>
          <input type="datetime-local" name="visitDate" value={formData.visitDate} onChange={handleChange} required className="border p-2 w-full rounded" />
        </div>
        <div className="mb-4">
          <label className="block font-medium">Visit Type *</label>
          <input name="visitType" value={formData.visitType} onChange={handleChange} required className="border p-2 w-full rounded" />
        </div>
        <div className="mb-4">
          <label className="block font-medium">Status *</label>
          <select name="status" value={formData.status} onChange={handleChange} className="border p-2 w-full rounded">
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50">{loading ? 'Creating...' : 'Create Visit'}</button>
      </form>
    </div>
  );
};

export default CreateVisit;