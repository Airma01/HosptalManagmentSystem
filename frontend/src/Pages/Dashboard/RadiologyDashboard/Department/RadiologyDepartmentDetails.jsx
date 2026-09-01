import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../../../../Config/API';
import LoadingSpinner from '../Components/LoadingSpinner';

export default function RadiologyDepartmentDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get(`/radiology/RadiologyDepartment/${id}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Load failed.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">{data.departmentName}</h2>
        <Link to={`/radiology/departments/${id}/edit`} className="text-indigo-600 text-sm">Edit</Link>
      </div>
      <p className="text-sm text-gray-600">{data.description}</p>
      <div className="bg-white border rounded-xl p-4">
        <h3 className="font-semibold text-sm mb-2">Test Types</h3>
        <ul className="space-y-1 text-sm">
          {(data.testTypes || []).map((t) => (
            <li key={t.radiologyTestTypeID}>{t.testName} — {t.price}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
