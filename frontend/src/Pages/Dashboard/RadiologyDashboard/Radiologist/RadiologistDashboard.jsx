import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../../Config/API';
import DashboardStats from '../Components/DashboardStats';
import LoadingSpinner from '../Components/LoadingSpinner';

export default function RadiologistDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/radiology/Radiologist/dashboard');
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load radiologist dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
        {error}
        <button type="button" onClick={load} className="ml-3 underline">Retry</button>
      </div>
    );
  }

  const cards = [
    { label: 'Ready for Interpretation', value: stats?.readyForInterpretationCount, icon: 'bi-eye', color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Completed Reports', value: stats?.completedReportsCount, icon: 'bi-check-circle', color: 'bg-green-50 text-green-700' },
    { label: 'Today Completed', value: stats?.todayCompletedCount, icon: 'bi-calendar-check', color: 'bg-blue-50 text-blue-700' },
    { label: 'Pending Requests', value: stats?.pendingRequestsCount, icon: 'bi-hourglass-split', color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Radiologist Dashboard</h2>
          <p className="text-sm text-gray-500">{stats?.radiologistName || ''}</p>
        </div>
        <Link to="/radiology/radiologist/queue" className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm">Review Queue</Link>
      </div>
      <DashboardStats cards={cards} />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm">Ready for Interpretation</div>
        <div className="divide-y divide-gray-100">
          {(stats?.readyForInterpretation || []).length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No items awaiting interpretation.</p>
          ) : (
            (stats.readyForInterpretation || []).map((r) => {
              const id = r.radiologyResultID;
              const reqId = r.radiologyRequestID;
              return (
                <div key={id} className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{r.patientName || 'Patient'} — {r.testName || 'Exam'}</p>
                    <p className="text-xs text-gray-500">{r.requestStatus} · {r.resultDate ? new Date(r.resultDate).toLocaleString() : ''}</p>
                  </div>
                  <Link to={`/radiology/radiologist/results/${id}`} className="text-indigo-600 font-medium">
                    Open report
                  </Link>
                  <Link to={`/radiology/radiologist/requests/${reqId}`} className="text-gray-600 text-xs">
                    Request #{reqId}
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
