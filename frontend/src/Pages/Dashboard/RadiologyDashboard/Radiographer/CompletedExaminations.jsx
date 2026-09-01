import { useCallback, useEffect, useState } from 'react';
import API from '../../../../Config/API';
import LoadingSpinner from '../Components/LoadingSpinner';
import RequestTable from '../Components/RequestTable';

export default function CompletedExaminations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/radiology/Radiographer/queue', { params: { status: 'Completed' } });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load completed examinations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Completed Examinations</h2>
      {loading ? <LoadingSpinner /> : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
      ) : (
        <RequestTable rows={rows} detailsBase="/radiology/radiographer/requests" />
      )}
    </div>
  );
}
