import { useCallback, useEffect, useState } from 'react';
import API from '../../../../Config/API';
import LoadingSpinner from '../Components/LoadingSpinner';
import RequestTable from '../Components/RequestTable';

export default function RadiographerQueue() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/radiology/Radiographer/queue', {
        params: status ? { status } : undefined,
      });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load radiology queue.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Radiology Queue</h2>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Pending + In Progress</option>
            <option value="Pending">Pending</option>
            <option value="InProgress">In Progress</option>
            <option value="ReadyForReview">Ready for Review</option>
            <option value="Completed">Completed</option>
          </select>
          <button type="button" onClick={load} className="px-3 py-2 rounded-lg border border-gray-200 text-sm">
            Refresh
          </button>
        </div>
      </div>
      {loading ? <LoadingSpinner /> : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
      ) : (
        <RequestTable rows={rows} detailsBase="/radiology/radiographer/requests" />
      )}
    </div>
  );
}
