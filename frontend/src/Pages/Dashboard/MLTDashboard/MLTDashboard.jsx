import React, { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import API from '../../../Config/API';
import MLTError from './MLTError';
import MLTMessage from './MLTMessage';

const navItems = [
  { to: '/mlt/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { to: '/mlt/patients', label: 'Patients', icon: 'bi-person' },
  { to: '/mlt/queue', label: 'Lab Queue', icon: 'bi-list-check' },
  { to: '/mlt/tests', label: 'Tests', icon: 'bi-flask' },
  { to: '/mlt/results', label: 'Results', icon: 'bi-clipboard2-pulse' },
  { to: '/mlt/reports', label: 'Reports', icon: 'bi-file-earmark-medical' },
  { to: '/mlt/laboratory-sections', label: 'Lab Sections', icon: 'bi-diagram-3' },
];

function statusBadge(status) {
  const s = (status || '').toLowerCase();
  if (s === 'completed') return 'bg-green-100 text-green-800';
  if (s === 'processing') return 'bg-blue-100 text-blue-800';
  if (s === 'requested' || s === 'pending' || !s) return 'bg-amber-100 text-amber-800';
  return 'bg-gray-100 text-gray-700';
}

export default function MLTDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [meRes, dashRes, queueRes] = await Promise.all([
        API.get('/mlt/MLTAuth/auth_me').catch(() => null),
        API.get('/mlt/MLTDashboard/dashboard'),
        API.get('/mlt/MLTQueue/pending'),
      ]);
      if (meRes?.data) setUser(meRes.data);
      setStats(dashRes.data);
      setPendingQueue(Array.isArray(queueRes.data) ? queueRes.data.slice(0, 8) : []);
    } catch (err) {
      const msg =
        err.response?.status === 401
          ? 'Session expired. Please log in again.'
          : err.response?.data?.message || 'Unable to load dashboard.';
      setError(msg);
      if (err.response?.status === 401) {
        setTimeout(() => navigate('/Bishoftu/login'), 1500);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = async () => {
    try {
      await API.post('/mlt/MLTAuth/logout');
    } catch {
      /* ignore */
    }
    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/Bishoftu/login');
  };

  const cards = stats
    ? [
        {
          label: 'Pending Tests',
          value: stats.pendingTestsCount ?? 0,
          icon: 'bi-hourglass-split',
          color: 'text-amber-600 bg-amber-50',
        },
        {
          label: 'Processing',
          value: stats.processingTestsCount ?? 0,
          icon: 'bi-arrow-repeat',
          color: 'text-blue-600 bg-blue-50',
        },
        {
          label: 'Completed',
          value: stats.completedTestsCount ?? 0,
          icon: 'bi-check2-circle',
          color: 'text-green-600 bg-green-50',
        },
        {
          label: "Today's Tests",
          value: stats.todayTestsCount ?? 0,
          icon: 'bi-calendar-day',
          color: 'text-indigo-600 bg-indigo-50',
        },
        {
          label: 'Total Tests',
          value: stats.totalTestsCount ?? 0,
          icon: 'bi-collection',
          color: 'text-slate-600 bg-slate-50',
        },
        {
          label: 'With Results',
          value: stats.testsWithResultsCount ?? 0,
          icon: 'bi-clipboard-check',
          color: 'text-teal-600 bg-teal-50',
        },
      ]
    : [];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white shadow-lg transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <i className="bi bi-heart-pulse text-2xl text-teal-600" />
            <div>
              <h1 className="text-lg font-bold text-teal-700">MLT Panel</h1>
              <p className="text-xs text-gray-500">Laboratory Technician</p>
            </div>
          </div>
          <p className="mt-2 truncate text-sm text-gray-600">
            {user?.fullName || user?.username || 'Technician'}
          </p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-700 hover:bg-teal-50 hover:text-teal-800'
                }`
              }
            >
              <i className={`bi ${item.icon}`} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <i className="bi bi-box-arrow-right" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <i className="bi bi-list text-xl" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
              <p className="text-xs text-gray-500">Medical Laboratory Technician</p>
            </div>
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            <i className="bi bi-arrow-clockwise mr-1" />
            Refresh
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {message && (
            <MLTMessage message={message} type="success" onClose={() => setMessage('')} />
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-500">
              <i className="bi bi-arrow-repeat mr-2 animate-spin text-2xl" />
              Loading dashboard…
            </div>
          ) : error ? (
            <MLTError title="Unable to load dashboard" message={error} onRetry={load} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((c) => (
                  <div
                    key={c.label}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{c.label}</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{c.value}</p>
                      </div>
                      <div className={`rounded-full p-3 ${c.color}`}>
                        <i className={`bi ${c.icon} text-xl`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Link
                  to="/mlt/queue"
                  className="rounded-lg bg-teal-600 p-3 text-center text-sm font-medium text-white hover:bg-teal-700"
                >
                  <i className="bi bi-list-check mr-1" />
                  Open Queue
                </Link>
                <Link
                  to="/mlt/tests"
                  className="rounded-lg bg-blue-600 p-3 text-center text-sm font-medium text-white hover:bg-blue-700"
                >
                  <i className="bi bi-flask mr-1" />
                  Tests
                </Link>
                <Link
                  to="/mlt/results"
                  className="rounded-lg bg-indigo-600 p-3 text-center text-sm font-medium text-white hover:bg-indigo-700"
                >
                  <i className="bi bi-clipboard2-pulse mr-1" />
                  Enter Result
                </Link>
                <Link
                  to="/mlt/reports"
                  className="rounded-lg bg-slate-700 p-3 text-center text-sm font-medium text-white hover:bg-slate-800"
                >
                  <i className="bi bi-file-earmark-medical mr-1" />
                  Reports
                </Link>
              </div>

              <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h3 className="font-semibold text-gray-900">
                    <i className="bi bi-hourglass-split mr-2 text-amber-500" />
                    Pending queue
                  </h3>
                  <Link to="/mlt/queue" className="text-sm text-teal-600 hover:underline">
                    View all
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  {pendingQueue.length === 0 ? (
                    <p className="p-6 text-center text-sm text-gray-500">No pending tests.</p>
                  ) : (
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="px-4 py-2 font-medium">Test ID</th>
                          <th className="px-4 py-2 font-medium">Patient</th>
                          <th className="px-4 py-2 font-medium">Test</th>
                          <th className="px-4 py-2 font-medium">Doctor</th>
                          <th className="px-4 py-2 font-medium">Requested</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                          <th className="px-4 py-2 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingQueue.map((row) => (
                          <tr key={row.testID} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium text-gray-900">#{row.testID}</td>
                            <td className="px-4 py-2">
                              <div>{row.patientName || '—'}</div>
                              <div className="text-xs text-gray-500">{row.patientMRN}</div>
                            </td>
                            <td className="px-4 py-2">{row.testName || '—'}</td>
                            <td className="px-4 py-2">{row.doctorName || '—'}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {row.requestDate
                                ? new Date(row.requestDate).toLocaleString()
                                : '—'}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(
                                  row.status
                                )}`}
                              >
                                {row.status || 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <Link
                                to={`/mlt/results?testId=${row.testID}`}
                                className="text-teal-600 hover:underline"
                              >
                                Result
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}