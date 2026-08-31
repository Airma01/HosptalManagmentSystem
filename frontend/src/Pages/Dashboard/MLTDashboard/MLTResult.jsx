import React, { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
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

export default function MLTResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryTestId = searchParams.get('testId') || '';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [testId, setTestId] = useState(queryTestId);
  const [testInfo, setTestInfo] = useState(null);
  const [existingResults, setExistingResults] = useState([]);
  const [resultDescription, setResultDescription] = useState('');
  const [resultDate, setResultDate] = useState('');
  const [editResultId, setEditResultId] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (queryTestId) setTestId(queryTestId);
  }, [queryTestId]);

  const loadCompleted = useCallback(async () => {
    try {
      const res = await API.get('/mlt/MLTResult/completed');
      setCompleted(Array.isArray(res.data) ? res.data.slice(0, 20) : []);
    } catch {
      /* optional list */
    }
  }, []);

  useEffect(() => {
    loadCompleted();
  }, [loadCompleted]);

  const loadTest = async (id) => {
    const tid = Number(id);
    if (!tid) {
      setError('Enter a valid Test ID.');
      return;
    }
    setLoading(true);
    setError('');
    setTestInfo(null);
    setExistingResults([]);
    setEditResultId(null);
    setResultDescription('');
    try {
      const [testRes, resultsRes] = await Promise.all([
        API.get(`/mlt/MLTTest/${tid}`),
        API.get(`/mlt/MLTResult/by-test/${tid}`),
      ]);
      setTestInfo(testRes.data);
      setExistingResults(Array.isArray(resultsRes.data) ? resultsRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load laboratory test.');
      if (err.response?.status === 401) navigate('/Bishoftu/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryTestId) loadTest(queryTestId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryTestId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!testId || !resultDescription.trim()) {
      setError('Test ID and Result Description are required.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (editResultId) {
        const body = {
          resultID: editResultId,
          resultDescription: resultDescription.trim(),
        };
        if (resultDate) body.resultDate = new Date(resultDate).toISOString();
        const res = await API.put('/mlt/MLTResult', body);
        setMessage('Result updated successfully.');
        setExistingResults((prev) =>
          prev.map((r) => (r.resultID === editResultId ? res.data : r))
        );
      } else {
        const body = {
          testID: Number(testId),
          resultDescription: resultDescription.trim(),
        };
        if (resultDate) body.resultDate = new Date(resultDate).toISOString();
        const res = await API.post('/mlt/MLTResult', body);
        setMessage(res.data?.message || 'Result saved successfully.');
        setExistingResults((prev) => [res.data, ...prev]);
        setEditResultId(null);
        setResultDescription('');
        setResultDate('');
        if (testInfo) {
          setTestInfo({ ...testInfo, status: 'Completed' });
        }
      }
      loadCompleted();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save result.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (r) => {
    setEditResultId(r.resultID);
    setResultDescription(r.resultDescription || '');
    setResultDate(r.resultDate ? r.resultDate.slice(0, 16) : '');
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
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-white px-4 py-3 shadow-sm">
          <button type="button" className="rounded-lg p-2 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <i className="bi bi-list text-xl" />
          </button>
          <h2 className="text-lg font-semibold">Laboratory Results</h2>
        </header>

        <main className="flex-1 space-y-4 p-4 md:p-6">
          {message && <MLTMessage message={message} onClose={() => setMessage('')} />}
          {error && <MLTError message={error} />}

          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <label className="mb-1 block text-sm font-medium text-gray-700">Load test by ID</label>
            <div className="flex flex-wrap gap-2">
              <input
                type="number"
                className="w-40 rounded-lg border px-3 py-2 text-sm"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
                placeholder="Test ID"
              />
              <button
                type="button"
                onClick={() => loadTest(testId)}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                <i className="bi bi-search mr-1" /> Load
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-10 text-gray-500">
              <i className="bi bi-arrow-repeat mr-2 animate-spin text-2xl" /> Loading…
            </div>
          )}

          {testInfo && (
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <h3 className="mb-3 font-semibold text-gray-900">
                <i className="bi bi-flask mr-2 text-teal-600" />
                Test #{testInfo.testID} — {testInfo.testName}
              </h3>
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <p><span className="text-gray-500">Patient:</span> {testInfo.patientName} ({testInfo.patientMRN})</p>
                <p><span className="text-gray-500">Doctor:</span> {testInfo.doctorName || '—'}</p>
                <p><span className="text-gray-500">Section:</span> {testInfo.sectionName || '—'}</p>
                <p><span className="text-gray-500">Status:</span> {testInfo.status}</p>
                <p><span className="text-gray-500">Normal range:</span> {testInfo.normalRange ?? '—'}</p>
              </div>

              {existingResults.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <h4 className="mb-2 text-sm font-medium">Existing results</h4>
                  {existingResults.map((r) => (
                    <div key={r.resultID} className="mb-2 flex flex-wrap items-start justify-between gap-2 rounded-lg bg-gray-50 p-3 text-sm">
                      <div>
                        <p>{r.resultDescription}</p>
                        <p className="text-xs text-gray-500">
                          {r.technicianName} · {r.resultDate ? new Date(r.resultDate).toLocaleString() : ''}
                        </p>
                      </div>
                      <button type="button" onClick={() => startEdit(r)} className="text-xs text-blue-600 hover:underline">
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t pt-4">
                <h4 className="font-medium">
                  {editResultId ? `Update result #${editResultId}` : 'Enter new result'}
                </h4>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Result description *</label>
                  <textarea
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    rows={4}
                    required
                    value={resultDescription}
                    onChange={(e) => setResultDescription(e.target.value)}
                    placeholder="Enter laboratory findings…"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Result date (optional)</label>
                  <input
                    type="datetime-local"
                    className="rounded-lg border px-3 py-2 text-sm"
                    value={resultDate}
                    onChange={(e) => setResultDate(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Technician name is set automatically from your login (JWT claims).
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : editResultId ? 'Update result' : 'Submit result'}
                  </button>
                  {editResultId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditResultId(null);
                        setResultDescription('');
                        setResultDate('');
                      }}
                      className="rounded-lg border px-4 py-2 text-sm"
                    >
                      Cancel edit
                    </button>
                  )}
                  <Link
                    to={`/mlt/reports?testId=${testInfo.testID}`}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    View report
                  </Link>
                </div>
              </form>
            </div>
          )}

          <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-4 py-3 font-semibold text-gray-900">Recent results</div>
            <div className="overflow-x-auto">
              {completed.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-500">No results yet.</p>
              ) : (
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-2">Result ID</th>
                      <th className="px-4 py-2">Test ID</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2">Technician</th>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completed.map((r) => (
                      <tr key={r.resultID} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">#{r.resultID}</td>
                        <td className="px-4 py-2">#{r.testID}</td>
                        <td className="px-4 py-2 max-w-xs truncate">{r.resultDescription}</td>
                        <td className="px-4 py-2">{r.technicianName}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {r.resultDate ? new Date(r.resultDate).toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-2">
                          <Link to={`/mlt/reports?testId=${r.testID}`} className="text-teal-600 hover:underline">
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}