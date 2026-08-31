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

function genderLabel(g) {
  if (g === 0 || g === 'Male' || g === 'male') return 'Male';
  if (g === 1 || g === 'Female' || g === 'female') return 'Female';
  return g ?? '—';
}

function calcAge(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  let age = new Date().getFullYear() - d.getFullYear();
  const m = new Date().getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && new Date().getDate() < d.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

export default function MLTPatient() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mrn, setMrn] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadWithLab = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/mlt/MLTPatient/with-lab-tests');
      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load patients.');
      if (err.response?.status === 401) navigate('/Bishoftu/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadWithLab();
  }, [loadWithLab]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!mrn && !phone && !firstName && !lastName) {
      setError('Provide at least one search criterion.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/mlt/MLTPatient/search', {
        params: {
          mrn: mrn || undefined,
          phone: phone || undefined,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        },
      });
      setPatients(Array.isArray(res.data) ? res.data : []);
      setMessage(`Found ${res.data?.length ?? 0} patient(s).`);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const openPatient = async (p) => {
    setSelected(p);
    setDetailLoading(true);
    setHistory([]);
    try {
      const [detailRes, histRes] = await Promise.all([
        API.get(`/mlt/MLTPatient/${p.patientID}`),
        API.get(`/mlt/MLTPatient/${p.patientID}/lab-history`),
      ]);
      setSelected(detailRes.data);
      setHistory(Array.isArray(histRes.data) ? histRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load patient details.');
    } finally {
      setDetailLoading(false);
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
          <h1 className="text-lg font-bold text-teal-700">
            <i className="bi bi-heart-pulse mr-2" />
            MLT Panel
          </h1>
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
          <h2 className="text-lg font-semibold">Patients</h2>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {message && <MLTMessage message={message} onClose={() => setMessage('')} />}
          {error && <MLTError message={error} onRetry={loadWithLab} />}

          <form onSubmit={handleSearch} className="mb-4 grid grid-cols-1 gap-3 rounded-xl border bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="MRN" value={mrn} onChange={(e) => setMrn(e.target.value)} />
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700">
                <i className="bi bi-search mr-1" /> Search
              </button>
              <button type="button" onClick={loadWithLab} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
                Lab patients
              </button>
            </div>
          </form>

          {loading ? (
            <div className="flex justify-center py-16 text-gray-500">
              <i className="bi bi-arrow-repeat mr-2 animate-spin text-2xl" /> Loading…
            </div>
          ) : patients.length === 0 ? (
            <p className="rounded-xl border bg-white p-8 text-center text-gray-500">No patients found.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">MRN</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Gender</th>
                    <th className="px-4 py-2">Age</th>
                    <th className="px-4 py-2">Phone</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.patientID} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{p.patientID}</td>
                      <td className="px-4 py-2 font-medium">{p.mrn}</td>
                      <td className="px-4 py-2">{p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim()}</td>
                      <td className="px-4 py-2">{genderLabel(p.gender)}</td>
                      <td className="px-4 py-2">{p.age ?? calcAge(p.dateOfBirth) ?? '—'}</td>
                      <td className="px-4 py-2">{p.phone || '—'}</td>
                      <td className="px-4 py-2">
                        <button type="button" onClick={() => openPatient(p)} className="text-teal-600 hover:underline">
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detail panel */}
          {selected && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <h3 className="font-semibold">Patient #{selected.patientID}</h3>
                  <button type="button" onClick={() => setSelected(null)}>
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
                <div className="space-y-3 p-4 text-sm">
                  {detailLoading ? (
                    <p className="text-gray-500">
                      <i className="bi bi-arrow-repeat animate-spin mr-1" /> Loading…
                    </p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <p><span className="text-gray-500">MRN:</span> {selected.mrn}</p>
                        <p><span className="text-gray-500">Name:</span> {selected.fullName || `${selected.firstName} ${selected.lastName}`}</p>
                        <p><span className="text-gray-500">Gender:</span> {genderLabel(selected.gender)}</p>
                        <p><span className="text-gray-500">Age:</span> {selected.age ?? calcAge(selected.dateOfBirth) ?? '—'}</p>
                        <p><span className="text-gray-500">Phone:</span> {selected.phone || '—'}</p>
                        <p><span className="text-gray-500">Address:</span> {selected.address || '—'}</p>
                      </div>
                      <h4 className="mt-4 font-semibold text-gray-800">Laboratory history</h4>
                      {history.length === 0 ? (
                        <p className="text-gray-500">No lab tests.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left text-xs">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-2 py-1">Test</th>
                                <th className="px-2 py-1">Name</th>
                                <th className="px-2 py-1">Date</th>
                                <th className="px-2 py-1">Status</th>
                                <th className="px-2 py-1">Result</th>
                              </tr>
                            </thead>
                            <tbody>
                              {history.map((h) => (
                                <tr key={h.testID} className="border-t">
                                  <td className="px-2 py-1">#{h.testID}</td>
                                  <td className="px-2 py-1">{h.testName}</td>
                                  <td className="px-2 py-1">{h.requestDate ? new Date(h.requestDate).toLocaleDateString() : '—'}</td>
                                  <td className="px-2 py-1">{h.status}</td>
                                  <td className="px-2 py-1">
                                    <Link to={`/mlt/reports?testId=${h.testID}`} className="text-teal-600 hover:underline">
                                      Report
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}