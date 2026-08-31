import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
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

function genderLabel(g) {
  if (g === 0 || g === 'Male') return 'Male';
  if (g === 1 || g === 'Female') return 'Female';
  return g ?? '—';
}

function calcAge(dob) {
  if (!dob) return '—';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return '—';
  let age = new Date().getFullYear() - d.getFullYear();
  const m = new Date().getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && new Date().getDate() < d.getDate())) age -= 1;
  return age >= 0 ? age : '—';
}

export default function MLTReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qTestId = searchParams.get('testId') || '';
  const qResultId = searchParams.get('resultId') || '';
  const qPatientId = searchParams.get('patientId') || '';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState(qTestId ? 'test' : qResultId ? 'result' : qPatientId ? 'patient' : 'completed');
  const [idValue, setIdValue] = useState(qTestId || qResultId || qPatientId || '');
  const [report, setReport] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadCompleted = useCallback(async () => {
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const res = await API.get('/mlt/MLTReport/completed');
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load reports.');
      if (err.response?.status === 401) navigate('/Bishoftu/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const loadByTest = async (id) => {
    setLoading(true);
    setError('');
    setList([]);
    try {
      const res = await API.get(`/mlt/MLTReport/by-test/${id}`);
      setReport(res.data);
      setMessage('Report loaded.');
    } catch (err) {
      setError(err.response?.data?.message || 'Report not found.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const loadByResult = async (id) => {
    setLoading(true);
    setError('');
    setList([]);
    try {
      const res = await API.get(`/mlt/MLTReport/by-result/${id}`);
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Report not found.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const loadByPatient = async (id) => {
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const res = await API.get(`/mlt/MLTReport/patient/${id}`);
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load patient reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (qTestId) {
      setMode('test');
      setIdValue(qTestId);
      loadByTest(qTestId);
    } else if (qResultId) {
      setMode('result');
      setIdValue(qResultId);
      loadByResult(qResultId);
    } else if (qPatientId) {
      setMode('patient');
      setIdValue(qPatientId);
      loadByPatient(qPatientId);
    } else {
      loadCompleted();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qTestId, qResultId, qPatientId]);

  const handleFetch = (e) => {
    e.preventDefault();
    if (mode === 'completed') {
      loadCompleted();
      return;
    }
    if (!idValue) {
      setError('Enter an ID.');
      return;
    }
    if (mode === 'test') loadByTest(idValue);
    else if (mode === 'result') loadByResult(idValue);
    else if (mode === 'patient') loadByPatient(idValue);
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
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden print:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white shadow-lg transition-transform print:hidden lg:static lg:translate-x-0 ${
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
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-white px-4 py-3 shadow-sm print:hidden">
          <button type="button" className="rounded-lg p-2 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <i className="bi bi-list text-xl" />
          </button>
          <h2 className="text-lg font-semibold">Laboratory Reports</h2>
        </header>

        <main className="flex-1 space-y-4 p-4 md:p-6">
          {message && (
            <div className="print:hidden">
              <MLTMessage message={message} onClose={() => setMessage('')} />
            </div>
          )}
          {error && (
            <div className="print:hidden">
              <MLTError message={error} />
            </div>
          )}

          <form onSubmit={handleFetch} className="flex flex-wrap items-end gap-2 rounded-xl border bg-white p-4 shadow-sm print:hidden">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Lookup</label>
              <select
                className="rounded-lg border px-3 py-2 text-sm"
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  setReport(null);
                  setList([]);
                }}
              >
                <option value="completed">Completed list</option>
                <option value="test">By test ID</option>
                <option value="result">By result ID</option>
                <option value="patient">By patient ID</option>
              </select>
            </div>
            {mode !== 'completed' && (
              <div>
                <label className="mb-1 block text-xs text-gray-500">ID</label>
                <input
                  type="number"
                  className="w-32 rounded-lg border px-3 py-2 text-sm"
                  value={idValue}
                  onChange={(e) => setIdValue(e.target.value)}
                />
              </div>
            )}
            <button type="submit" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
              Load
            </button>
            {report && (
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              >
                <i className="bi bi-printer mr-1" /> Print
              </button>
            )}
          </form>

          {loading && (
            <div className="flex justify-center py-12 text-gray-500 print:hidden">
              <i className="bi bi-arrow-repeat mr-2 animate-spin text-2xl" /> Loading…
            </div>
          )}

          {report && (
            <div className="mx-auto max-w-3xl rounded-xl border border-gray-300 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
              <div className="border-b border-gray-300 pb-4 text-center">
                <h1 className="text-xl font-bold tracking-wide text-gray-900">HOSPITAL LABORATORY REPORT</h1>
                <p className="text-sm text-gray-500">Medical Laboratory Services</p>
              </div>

              <section className="mt-4">
                <h2 className="mb-2 border-b pb-1 text-sm font-semibold uppercase tracking-wide text-gray-700">
                  Patient Information
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-500">Patient ID:</span> {report.patientID}</p>
                  <p><span className="text-gray-500">MRN:</span> {report.patientMRN}</p>
                  <p><span className="text-gray-500">Name:</span> {report.patientName}</p>
                  <p><span className="text-gray-500">Gender:</span> {genderLabel(report.patientGender)}</p>
                  <p><span className="text-gray-500">Age:</span> {calcAge(report.patientDateOfBirth)}</p>
                  <p><span className="text-gray-500">Phone:</span> {report.patientPhone || '—'}</p>
                </div>
              </section>

              <section className="mt-4">
                <h2 className="mb-2 border-b pb-1 text-sm font-semibold uppercase tracking-wide text-gray-700">
                  Laboratory Test
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-500">Test ID:</span> {report.testID}</p>
                  <p><span className="text-gray-500">Test:</span> {report.testName}</p>
                  <p><span className="text-gray-500">Section:</span> {report.sectionName || '—'}</p>
                  <p><span className="text-gray-500">Normal range:</span> {report.normalRange ?? '—'}</p>
                  <p><span className="text-gray-500">Requesting doctor:</span> {report.doctorName || '—'}</p>
                  <p><span className="text-gray-500">Department:</span> {report.departmentName || '—'}</p>
                  <p><span className="text-gray-500">Request date:</span> {report.requestDate ? new Date(report.requestDate).toLocaleString() : '—'}</p>
                  <p><span className="text-gray-500">Status:</span> {report.status}</p>
                </div>
              </section>

              <section className="mt-4">
                <h2 className="mb-2 border-b pb-1 text-sm font-semibold uppercase tracking-wide text-gray-700">
                  Laboratory Result
                </h2>
                {!report.results?.length ? (
                  <p className="text-sm text-gray-500">No results recorded.</p>
                ) : (
                  report.results.map((r) => (
                    <div key={r.resultID} className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                      <p className="whitespace-pre-wrap">{r.resultDescription}</p>
                      <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-gray-600">
                        <p>Date: {r.resultDate ? new Date(r.resultDate).toLocaleString() : '—'}</p>
                        <p>Technician: {r.technicianName || '—'}</p>
                      </div>
                    </div>
                  ))
                )}
              </section>

              <div className="mt-8 grid grid-cols-2 gap-8 text-center text-xs text-gray-500 print:mt-12">
                <div>
                  <div className="mx-auto mb-1 w-40 border-t border-gray-400" />
                  Laboratory Technician
                </div>
                <div>
                  <div className="mx-auto mb-1 w-40 border-t border-gray-400" />
                  Authorized signature
                </div>
              </div>
            </div>
          )}

          {!report && list.length > 0 && (
            <div className="overflow-x-auto rounded-xl border bg-white shadow-sm print:hidden">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2">Test ID</th>
                    <th className="px-4 py-2">Patient</th>
                    <th className="px-4 py-2">Test</th>
                    <th className="px-4 py-2">Section</th>
                    <th className="px-4 py-2">Requested</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Technician</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((row) => (
                    <tr key={row.testID} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">#{row.testID}</td>
                      <td className="px-4 py-2">
                        <div>{row.patientName}</div>
                        <div className="text-xs text-gray-500">{row.patientMRN}</div>
                      </td>
                      <td className="px-4 py-2">{row.testName}</td>
                      <td className="px-4 py-2">{row.sectionName || '—'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {row.requestDate ? new Date(row.requestDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-2">{row.status}</td>
                      <td className="px-4 py-2">{row.latestTechnicianName || '—'}</td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMode('test');
                            setIdValue(String(row.testID));
                            loadByTest(row.testID);
                          }}
                          className="text-teal-600 hover:underline"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}