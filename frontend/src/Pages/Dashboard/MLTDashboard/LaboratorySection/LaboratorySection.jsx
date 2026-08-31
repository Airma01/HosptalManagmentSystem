import React, { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import API from '../../../../Config/API';
import MLTError from '../MLTError';
import MLTMessage from '../MLTMessage';

const navItems = [
  { to: '/mlt/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { to: '/mlt/patients', label: 'Patients', icon: 'bi-person' },
  { to: '/mlt/queue', label: 'Lab Queue', icon: 'bi-list-check' },
  { to: '/mlt/tests', label: 'Tests', icon: 'bi-flask' },
  { to: '/mlt/results', label: 'Results', icon: 'bi-clipboard2-pulse' },
  { to: '/mlt/reports', label: 'Reports', icon: 'bi-file-earmark-medical' },
  { to: '/mlt/laboratory-sections', label: 'Lab Sections', icon: 'bi-diagram-3' },
];

export default function LaboratorySection() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/mlt/MLTSection');
      setSections(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const msg =
        err.response?.status === 401
          ? 'Session expired. Please log in again.'
          : err.response?.data?.message || 'Unable to load laboratory sections.';
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
              onClick={() => setSidebarOpen(false)}
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
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <i className="bi bi-box-arrow-right" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button type="button" className="rounded-lg p-2 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <i className="bi bi-list text-xl" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Laboratory Sections</h2>
              <p className="text-xs text-gray-500">Manage laboratory sections and their test types</p>
            </div>
          </div>
          <Link
            to="/mlt/laboratory-sections/add"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            <i className="bi bi-plus-circle" />
            Add Section
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {message && <MLTMessage message={message} type="success" onClose={() => setMessage('')} />}
          {error && <MLTError title="Unable to load laboratory sections" message={error} onRetry={load} />}

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-500">
              <i className="bi bi-arrow-repeat mr-2 animate-spin text-2xl" />
              Loading laboratory sections…
            </div>
          ) : !error && sections.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <i className="bi bi-flask text-4xl text-gray-300" />
              <h3 className="mt-3 text-lg font-semibold text-gray-800">No sections yet</h3>
              <p className="mt-1 text-sm text-gray-500">Create your first laboratory section (e.g. Hematology).</p>
              <Link
                to="/mlt/laboratory-sections/add"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                <i className="bi bi-plus-circle" />
                Add Section
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sections.map((s) => (
                <Link
                  key={s.laboratorySectionID}
                  to={`/mlt/laboratory-sections/${s.laboratorySectionID}`}
                  className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-600 group-hover:bg-teal-100">
                    <i className="bi bi-droplet-half text-xl" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{s.sectionName}</h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Laboratory Section
                  </p>
                  {s.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">{s.description}</p>
                  ) : null}
                  <p className="mt-3 text-sm text-gray-700">
                    <span className="font-semibold text-teal-700">{s.testTypeCount ?? 0}</span>
                    {' '}Test Type{(s.testTypeCount === 1) ? '' : 's'}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-600 group-hover:underline">
                    View Section <i className="bi bi-arrow-right" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}