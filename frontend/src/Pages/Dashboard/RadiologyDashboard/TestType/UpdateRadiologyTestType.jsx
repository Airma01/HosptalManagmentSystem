import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../Config/API';
import LoadingSpinner from '../Components/LoadingSpinner';

export default function UpdateRadiologyTestType() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ radiologyDepartmentID: '', testName: '', price: 0, description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [t, d] = await Promise.all([
          API.get(`/radiology/RadiologyTestType/${id}`),
          API.get('/radiology/RadiologyDepartment'),
        ]);
        setDepartments(d.data || []);
        setForm({
          radiologyDepartmentID: String(t.data.radiologyDepartmentID),
          testName: t.data.testName || '',
          price: t.data.price ?? 0,
          description: t.data.description || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Load failed.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/radiology/RadiologyTestType/${id}`, {
        radiologyTestTypeID: Number(id),
        radiologyDepartmentID: Number(form.radiologyDepartmentID),
        testName: form.testName,
        price: Number(form.price),
        description: form.description,
      });
      navigate('/radiology/test-types');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <form onSubmit={submit} className="max-w-lg space-y-4 bg-white border rounded-xl p-5">
      <h2 className="text-xl font-bold">Update Test Type</h2>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <select value={form.radiologyDepartmentID} onChange={(e) => setForm({ ...form, radiologyDepartmentID: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
        {departments.map((d) => (
          <option key={d.radiologyDepartmentID} value={d.radiologyDepartmentID}>{d.departmentName}</option>
        ))}
      </select>
      <input value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
      <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
      <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm">Save</button>
    </form>
  );
}
