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
];

function statusBadge(status) {
  const s = (status || '').toLowerCase();
  if (s === 'completed') return 'bg-green-100 text-green-800';
  if (s === 'processing') return 'bg-blue-100 text-blue-800';
  if (s === 'requested' || s === 'pending' || !s) return 'bg-amber-100 text-amber-800';
  return 'bg-gray-100 text-gray-700';
}

export default function MLTQueue() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/mlt/MLTQueue';
      if (filter === 'pending') url = '/mlt/MLTQueue/pending';
      else if (filter === 'processing') url = '/mlt/MLTQueue/processing';
      else if (filter === 'completed') url = '/mlt/MLTQueue/completed';

      const res = await API.get(url);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load queue.');
      if (err.response?.status === 401) navigate('/Bishoftu/login');
    } finally {
      setLoading(false);
    }
  }, [filter, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const viewItem = async (testID) => {
    try {
      const res = await API.get(`/mlt/MLTQueue/${testID}`);
      setDetail(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load test.');
    }
  };

  const setProcessing = async (testID) => {
    try {
      const res = await API.put('/mlt/MLTTest/status', {
        testID,
        status: 'Processing',
      });
      setMessage(res.data?.message || 'Status updated to Processing.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleLogout = async () => {
    try {
      await API.post('/mlt/MLTAuth/logout');
    } catch {
      /* ignore */
    }
    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/Bishoftu/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white shadow-lg transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b p-4">
          <h1 className="text-lg font-bold text-teal-700">MLT Panel</h1>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-teal-50'
                }`
              }
            >
              <i className={`bi ${item.icon}`} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-3">
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            <i className="bi bi-box-arrow-right" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button type="button" className="rounded-lg p-2 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <i className="bi bi-list text-xl" />
            </button>
            <h2 className="text-lg font-semibold">Laboratory Queue</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['pending', 'processing', 'completed', 'all'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  filter === f ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {message && <MLTMessage message={message} onClose={() => setMessage('')} />}
          {error && <MLTError message={error} onRetry={load} />}

          {loading ? (
            <div className="flex justify-center py-16 text-gray-500">
              <i className="bi bi-arrow-repeat mr-2 animate-spin text-2xl" /> Loading queue…
            </div>
          ) : rows.length === 0 ? (
            <p className="rounded-xl border bg-white p-8 text-center text-gray-500">Queue is empty.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2">Test ID</th>
                    <th className="px-4 py-2">Patient</th>
                    <th className="px-4 py-2">Test</th>
                    <th className="px-4 py-2">Section</th>
                    <th className="px-4 py-2">Doctor</th>
                    <th className="px-4 py-2">Dept</th>
                    <th className="px-4 py-2">Requested</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.testID} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">#{row.testID}</td>
                      <td className="px-4 py-2">
                        <div>{row.patientName || '—'}</div>
                        <div className="text-xs text-gray-500">{row.patientMRN}</div>
                      </td>
                      <td className="px-4 py-2">{row.testName || '—'}</td>
                      <td className="px-4 py-2">{row.sectionName || '—'}</td>
                      <td className="px-4 py-2">{row.doctorName || '—'}</td>
                      <td className="px-4 py-2">{row.departmentName || '—'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {row.requestDate ? new Date(row.requestDate).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(row.status)}`}>
                          {row.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => viewItem(row.testID)} className="text-gray-600 hover:underline text-xs">
                            View
                          </button>
                          {(row.status || '').toLowerCase() !== 'processing' &&
                            (row.status || '').toLowerCase() !== 'completed' && (
                              <button type="button" onClick={() => setProcessing(row.testID)} className="text-blue-600 hover:underline text-xs">
                                Process
                              </button>
                            )}
                          <Link to={`/mlt/results?testId=${row.testID}`} className="text-teal-600 hover:underline text-xs">
                            Result
                          </Link>
                          <Link to={`/mlt/reports?testId=${row.testID}`} className="text-indigo-600 hover:underline text-xs">
                            Report
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {detail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
                <div className="mb-3 flex justify-between">
                  <h3 className="font-semibold">Test #{detail.testID}</h3>
                  <button type="button" onClick={() => setDetail(null)}>
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-gray-500">Patient</dt>
                  <dd>{detail.patientName} ({detail.patientMRN})</dd>
                  <dt className="text-gray-500">Test</dt>
                  <dd>{detail.testName}</dd>
                  <dt className="text-gray-500">Section</dt>
                  <dd>{detail.sectionName || '—'}</dd>
                  <dt className="text-gray-500">Doctor</dt>
                  <dd>{detail.doctorName || '—'}</dd>
                  <dt className="text-gray-500">Department</dt>
                  <dd>{detail.departmentName || '—'}</dd>
                  <dt className="text-gray-500">Status</dt>
                  <dd>{detail.status}</dd>
                  <dt className="text-gray-500">Has result</dt>
                  <dd>{detail.hasResult ? 'Yes' : 'No'}</dd>
                </dl>
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/mlt/results?testId=${detail.testID}`}
                    className="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white"
                  >
                    Enter result
                  </Link>
                  <button type="button" onClick={() => setDetail(null)} className="rounded-lg border px-3 py-2 text-sm">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}