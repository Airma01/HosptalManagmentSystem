import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../Config/API';
import LoadingSpinner from '../Components/LoadingSpinner';

export default function UpdateRadiologyDepartment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [departmentName, setDepartmentName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get(`/radiology/RadiologyDepartment/${id}`);
        setDepartmentName(res.data.departmentName || '');
        setDescription(res.data.description || '');
      } catch (err) {
        setError(err.response?.data?.message || 'Load failed.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put(`/radiology/RadiologyDepartment/${id}`, {
        radiologyDepartmentID: Number(id),
        departmentName,
        description,
      });
      navigate('/radiology/departments');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <form onSubmit={submit} className="max-w-lg space-y-4 bg-white border rounded-xl p-5">
      <h2 className="text-xl font-bold">Update Department</h2>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <input required value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
      <button disabled={submitting} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm">Save</button>
    </form>
  );
}
