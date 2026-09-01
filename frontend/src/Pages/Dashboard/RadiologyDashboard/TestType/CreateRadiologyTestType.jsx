import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../Config/API';

export default function CreateRadiologyTestType() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [radiologyDepartmentID, setRadiologyDepartmentID] = useState('');
  const [testName, setTestName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get('/radiology/RadiologyDepartment').then((res) => setDepartments(res.data || [])).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await API.post('/radiology/RadiologyTestType', {
        radiologyDepartmentID: Number(radiologyDepartmentID),
        testName,
        price: Number(price),
        description,
      });
      navigate('/radiology/test-types');
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-lg space-y-4 bg-white border rounded-xl p-5">
      <h2 className="text-xl font-bold">Create Test Type</h2>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <select required value={radiologyDepartmentID} onChange={(e) => setRadiologyDepartmentID(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
        <option value="">Select department</option>
        {departments.map((d) => (
          <option key={d.radiologyDepartmentID} value={d.radiologyDepartmentID}>{d.departmentName}</option>
        ))}
      </select>
      <input required placeholder="Test name" value={testName} onChange={(e) => setTestName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
      <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
      <button disabled={submitting} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm">Create</button>
    </form>
  );
}
