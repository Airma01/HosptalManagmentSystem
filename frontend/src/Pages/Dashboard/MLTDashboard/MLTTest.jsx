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

export default function MLTTest() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState('all');
  const [tests, setTests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [statusValue, setStatusValue] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/mlt/MLTTest';
      if (view === 'pending') url = '/mlt/MLTTest/pending';
      if (view === 'today') url = '/mlt/MLTTest/today';
      const res = await API.get(url);
      setTests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load tests.');
      if (err.response?.status === 401) navigate('/Bishoftu/login');
    } finally {
      setLoading(false);
    }
  }, [view, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (id) => {
    try {
      const res = await API.get(`/mlt/MLTTest/${id}`);
      setSelected(res.data);
      setStatusValue(res.data?.status || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load test details.');
    }
  };

  const updateStatus = async () => {
    if (!selected?.testID || !statusValue.trim()) return;
    try {
      const res = await API.put('/mlt/MLTTest/status', {
        testID: selected.testID,
        status: statusValue.trim(),
      });
      setMessage(res.data?.message || 'Status updated.');
      setSelected((prev) => (prev ? { ...prev, status: statusValue.trim() } : prev));
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
            <h2 className="text-lg font-semibold">Laboratory Tests</h2>
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'today'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  view === v ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {message && <MLTMessage message={message} onClose={() => setMessage('')} />}
          {error && <MLTError message={error} onRetry={load} />}

          {loading ? (
            <div className="flex justify-center py-16 text-gray-500">
              <i className="bi bi-arrow-repeat mr-2 animate-spin text-2xl" /> Loading tests…
            </div>
          ) : tests.length === 0 ? (
            <p className="rounded-xl border bg-white p-8 text-center text-gray-500">No tests found.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Patient</th>
                    <th className="px-4 py-2">Test</th>
                    <th className="px-4 py-2">Section</th>
                    <th className="px-4 py-2">Requested</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Result</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((t) => (
                    <tr key={t.testID} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">#{t.testID}</td>
                      <td className="px-4 py-2">
                        <div>{t.patientName}</div>
                        <div className="text-xs text-gray-500">{t.patientMRN}</div>
                      </td>
                      <td className="px-4 py-2">{t.testName || '—'}</td>
                      <td className="px-4 py-2">{t.sectionName || '—'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {t.requestDate ? new Date(t.requestDate).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(t.status)}`}>
                          {t.status || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-2">{t.hasResult ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2">
                        <button type="button" onClick={() => openDetail(t.testID)} className="text-teal-600 hover:underline">
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
                <div className="mb-3 flex justify-between">
                  <h3 className="font-semibold">Test #{selected.testID}</h3>
                  <button type="button" onClick={() => setSelected(null)}>
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
                <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div><span className="text-gray-500">Patient:</span> {selected.patientName} ({selected.patientMRN})</div>
                  <div><span className="text-gray-500">Doctor:</span> {selected.doctorName || '—'}</div>
                  <div><span className="text-gray-500">Department:</span> {selected.departmentName || '—'}</div>
                  <div><span className="text-gray-500">Test:</span> {selected.testName}</div>
                  <div><span className="text-gray-500">Section:</span> {selected.sectionName || '—'}</div>
                  <div><span className="text-gray-500">Normal range:</span> {selected.normalRange ?? '—'}</div>
                  <div><span className="text-gray-500">Price:</span> {selected.price ?? '—'}</div>
                  <div><span className="text-gray-500">Requested:</span> {selected.requestDate ? new Date(selected.requestDate).toLocaleString() : '—'}</div>
                </dl>

                <div className="mt-4 flex flex-wrap items-end gap-2 border-t pt-4">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Update status</label>
                    <select
                      className="rounded-lg border px-3 py-2 text-sm"
                      value={statusValue}
                      onChange={(e) => setStatusValue(e.target.value)}
                    >
                      <option value="Requested">Requested</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <button type="button" onClick={updateStatus} className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
                    Save status
                  </button>
                  <Link to={`/mlt/results?testId=${selected.testID}`} className="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white hover:bg-teal-700">
                    Enter result
                  </Link>
                  <Link to={`/mlt/reports?testId=${selected.testID}`} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
                    Report
                  </Link>
                </div>

                {selected.results?.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="mb-2 font-medium">Results</h4>
                    {selected.results.map((r) => (
                      <div key={r.resultID} className="mb-2 rounded-lg bg-gray-50 p-3 text-sm">
                        <p>{r.resultDescription}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {r.technicianName} · {r.resultDate ? new Date(r.resultDate).toLocaleString() : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}