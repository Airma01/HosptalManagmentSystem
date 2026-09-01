import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../../Config/API';
import LoadingSpinner from '../Components/LoadingSpinner';

export default function CompletedReports() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/radiology/Radiologist/dashboard');
      setRows(res.data?.recentCompletedReports || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load completed reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Completed Reports</h2>
      {loading ? <LoadingSpinner /> : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : rows.length === 0 ? (
        <div className="bg-white border rounded-xl p-8 text-center text-gray-500 text-sm">No completed reports yet.</div>
      ) : (
        <div className="bg-white border rounded-xl divide-y">
          {rows.map((r) => (
            <div key={r.radiologyResultID} className="px-4 py-3 flex justify-between gap-3 text-sm">
              <div>
                <p className="font-medium">Result #{r.radiologyResultID}</p>
                <p className="text-xs text-gray-500">{r.resultDate ? new Date(r.resultDate).toLocaleString() : ''}</p>
              </div>
              <Link to={`/radiology/radiologist/results/${r.radiologyResultID}`} className="text-indigo-600">View</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
