import React, { useEffect, useState } from 'react';
import API from '../../../../Config/API';
import { Link } from 'react-router-dom';

const PendingTriage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/Hospital/nurse/Nurse/pending-triage');
        setList(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pending Triage</h1>
      <table className="w-full bg-white border rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Patient</th>
            <th className="px-4 py-2 border">Visit Date</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map(item => (
            <tr key={item.visitId}>
              <td className="px-4 py-2 border">{item.patientName}</td>
              <td className="px-4 py-2 border">{new Date(item.visitDate).toLocaleString()}</td>
              <td className="px-4 py-2 border">
                <Link to={`/nurse/triage/create?visitId=${item.visitId}`} className="text-blue-500 hover:underline">Perform Triage</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PendingTriage;