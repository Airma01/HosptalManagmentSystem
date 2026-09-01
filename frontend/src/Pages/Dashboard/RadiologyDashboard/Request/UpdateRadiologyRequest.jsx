import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../../Config/API';

export default function UpdateRadiologyRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Pending');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/radiology/RadiologyRequest/${id}/status`, {
        radiologyRequestID: Number(id),
        status,
      });
      navigate(`/radiology/requests/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    }
  };

  return (
    <form onSubmit={submit} className="max-w-md space-y-4 bg-white border rounded-xl p-5">
      <h2 className="text-xl font-bold">Update Request Status</h2>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
        <option>Pending</option>
        <option>InProgress</option>
        <option>ReadyForReview</option>
        <option>Completed</option>
        <option>Cancelled</option>
      </select>
      <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm">Save</button>
    </form>
  );
}
