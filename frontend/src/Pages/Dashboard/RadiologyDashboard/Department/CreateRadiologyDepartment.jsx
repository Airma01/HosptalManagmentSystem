import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../Config/API';

export default function CreateRadiologyDepartment() {
  const navigate = useNavigate();
  const [departmentName, setDepartmentName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await API.post('/radiology/RadiologyDepartment', { departmentName, description });
      navigate('/radiology/departments');
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-lg space-y-4 bg-white border rounded-xl p-5">
      <h2 className="text-xl font-bold">Create Department</h2>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div>
        <label className="text-sm font-medium">Department Name</label>
        <input required value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
      </div>
      <button disabled={submitting} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm">{submitting ? 'Saving...' : 'Create'}</button>
    </form>
  );
}
