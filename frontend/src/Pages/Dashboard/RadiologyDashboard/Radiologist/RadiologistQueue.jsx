import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../../Config/API';
import LoadingSpinner from '../Components/LoadingSpinner';
import StatusBadge from '../Components/StatusBadge';

export default function RadiologistQueue() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/radiology/Radiologist/review-queue');
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load review queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Review Queue</h2>
        <button type="button" onClick={load} className="px-3 py-2 rounded-lg border border-gray-200 text-sm">Refresh</button>
      </div>
      {loading ? <LoadingSpinner /> : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">No studies awaiting interpretation.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Examination</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Indication</th>
                  <th className="px-4 py-3">Radiographer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.radiologyResultID} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.patientName || '—'}</div>
                      <div className="text-xs text-gray-500">{r.patientMRN || ''}</div>
                    </td>
                    <td className="px-4 py-3">{r.testName || '—'}</td>
                    <td className="px-4 py-3">{r.departmentName || '—'}</td>
                    <td className="px-4 py-3 max-w-[180px] truncate">{r.chiefComplaint || '—'}</td>
                    <td className="px-4 py-3">{r.radiologyTechnicianName || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.resultDate ? new Date(r.resultDate).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.requestStatus} /></td>
                    <td className="px-4 py-3">
                      <Link to={`/radiology/radiologist/results/${r.radiologyResultID}`} className="text-indigo-600 font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
