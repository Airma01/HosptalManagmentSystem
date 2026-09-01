import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../../Config/API';
import LoadingSpinner from '../Components/LoadingSpinner';
import RequestTable from '../Components/RequestTable';

export default function RadiologyRequestList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Prefer doctor's own requests when Doctor role
      try {
        const mine = await API.get('/radiology/RadiologyRequest/my');
        setRows(Array.isArray(mine.data) ? mine.data : []);
      } catch {
        const all = await API.get('/radiology/RadiologyRequest');
        setRows(Array.isArray(all.data) ? all.data : []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-3">
        <h2 className="text-xl font-bold">Radiology Requests</h2>
        <Link to="/radiology/requests/create" className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm">New Request</Link>
      </div>
      {loading ? <LoadingSpinner /> : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <RequestTable rows={rows} detailsBase="/radiology/requests" />
      )}
    </div>
  );
}
