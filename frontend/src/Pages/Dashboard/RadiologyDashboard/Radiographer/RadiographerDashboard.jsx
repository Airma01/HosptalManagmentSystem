import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../../Config/API';
import DashboardStats from '../Components/DashboardStats';
import LoadingSpinner from '../Components/LoadingSpinner';
import RequestTable from '../Components/RequestTable';

export default function RadiographerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/radiology/Radiographer/dashboard');
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load radiographer dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
        {error}
        <button type="button" onClick={load} className="ml-3 underline">Retry</button>
      </div>
    );
  }

  const cards = [
    { label: 'Pending', value: stats?.pendingRequestsCount, icon: 'bi-hourglass-split', color: 'bg-amber-50 text-amber-700' },
    { label: 'In Progress', value: stats?.inProgressRequestsCount, icon: 'bi-arrow-repeat', color: 'bg-blue-50 text-blue-700' },
    { label: 'Completed Today', value: stats?.completedTodayCount, icon: 'bi-check-circle', color: 'bg-green-50 text-green-700' },
    { label: 'Today Total', value: stats?.todayRequestsCount, icon: 'bi-calendar-day', color: 'bg-indigo-50 text-indigo-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500">Welcome{stats?.radiographerName ? `, ${stats.radiographerName}` : ''}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className="px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-white">
            <i className="bi bi-arrow-clockwise mr-1" /> Refresh
          </button>
          <Link to="/radiology/radiographer/queue" className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm">
            Open Queue
          </Link>
        </div>
      </div>

      <DashboardStats cards={cards} />

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Recent Pending Requests</h3>
        <RequestTable rows={stats?.recentPendingRequests || []} detailsBase="/radiology/radiographer/requests" />
      </div>
    </div>
  );
}
