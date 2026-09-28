import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import API from '../../../Config/API';
import MLTError from './MLTError';
import MLTMessage from './MLTMessage';
import {
  getLabTestsPaymentStatus,
  ensureLabTestPaid,
} from './Services/mltPaymentApi';

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

function PaymentBadge({ status }) {
  const paid = String(status || '').toLowerCase() === 'paid';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        paid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
      }`}
    >
      <i className={`bi ${paid ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} text-[11px]`} />
      {paid ? 'Paid' : 'Unpaid'}
    </span>
  );
}

export default function MLTQueue() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [paymentFilter, setPaymentFilter] = useState(''); // '' | Paid | Unpaid
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
      let list = Array.isArray(res.data) ? res.data : [];

      // Merge laboratory payment status (Paid + Unpaid)
      try {
        const payRes = await getLabTestsPaymentStatus();
        const payList = Array.isArray(payRes.data) ? payRes.data : [];
        const payMap = new Map();
        payList.forEach((p) => {
          const id = p.laboratoryTestID ?? p.LaboratoryTestID ?? p.testID ?? p.TestID;
          if (id != null) {
            payMap.set(Number(id), {
              paymentStatus: p.paymentStatus ?? p.PaymentStatus ?? 'Unpaid',
              canProcess: p.canProcess ?? p.CanProcess,
            });
          }
        });

        list = list.map((r) => {
          const id = Number(r.testID ?? r.TestID);
          const pay = payMap.get(id);
          if (pay) {
            return {
              ...r,
              paymentStatus: pay.paymentStatus,
              canProcess:
                pay.canProcess ??
                String(pay.paymentStatus).toLowerCase() === 'paid',
            };
          }
          return {
            ...r,
            paymentStatus: r.paymentStatus ?? r.PaymentStatus ?? 'Unpaid',
            canProcess: false,
          };
        });
      } catch {
        list = list.map((r) => ({
          ...r,
          paymentStatus: r.paymentStatus ?? r.PaymentStatus ?? 'Unpaid',
          canProcess:
            String(r.paymentStatus ?? '').toLowerCase() === 'paid',
        }));
      }

      setRows(list);
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

  const displayed = useMemo(() => {
    if (!paymentFilter) return rows;
    const pf = paymentFilter.toLowerCase();
    return rows.filter(
      (r) =>
        String(r.paymentStatus || r.PaymentStatus || 'Unpaid').toLowerCase() ===
        pf
    );
  }, [rows, paymentFilter]);

  const viewItem = async (testID) => {
    try {
      const res = await API.get(`/mlt/MLTQueue/${testID}`);
      setDetail(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load test.');
    }
  };

  const setProcessing = async (testID, canProcess) => {
    if (!canProcess) {
      setError(
        'Laboratory test is unpaid. Patient must pay at Laboratory Cashier before processing.'
      );
      return;
    }
    try {
      await ensureLabTestPaid(testID);
      const res = await API.put('/mlt/MLTTest/status', {
        testID,
        status: 'Processing',
      });
      setMessage(res.data?.message || 'Status updated to Processing.');
      setError('');
      load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update status (check payment / backend).'
      );
    }
  };

  const goResult = async (testID, canProcess) => {
    if (!canProcess) {
      setError(
        'Laboratory test is unpaid. Patient must pay at Laboratory Cashier before entering results.'
      );
      return;
    }
    try {
      await ensureLabTestPaid(testID);
      navigate(`/mlt/results?testId=${testID}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Laboratory test is unpaid. Patient must pay at Laboratory Cashier first.'
      );
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
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
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
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <i className="bi bi-list text-xl" />
            </button>
            <div>
              <h2 className="text-lg font-semibold">Laboratory Queue</h2>
              <p className="text-xs text-gray-500">
                Process / result only when payment is <strong>Paid</strong>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {['pending', 'processing', 'completed', 'all'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  filter === f
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs"
              aria-label="Payment filter"
            >
              <option value="">All payments</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
            </select>
            <button
              type="button"
              onClick={load}
              className="rounded-lg border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
            >
              <i className="bi bi-arrow-clockwise mr-1" />
              Refresh
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {message && <MLTMessage message={message} onClose={() => setMessage('')} />}
          {error && <MLTError message={error} onRetry={load} />}

          {loading ? (
            <div className="flex justify-center py-16 text-gray-500">
              <i className="bi bi-arrow-repeat mr-2 animate-spin text-2xl" /> Loading
              queue…
            </div>
          ) : displayed.length === 0 ? (
            <p className="rounded-xl border bg-white p-8 text-center text-gray-500">
              Queue is empty.
            </p>
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
                    <th className="px-4 py-2">Payment</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((row) => {
                    const id = row.testID ?? row.TestID;
                    const can =
                      row.canProcess ??
                      String(row.paymentStatus || '').toLowerCase() === 'paid';
                    return (
                      <tr key={id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">#{id}</td>
                        <td className="px-4 py-2">
                          <div>{row.patientName || '—'}</div>
                          <div className="text-xs text-gray-500">
                            {row.patientMRN}
                          </div>
                        </td>
                        <td className="px-4 py-2">{row.testName || '—'}</td>
                        <td className="px-4 py-2">{row.sectionName || '—'}</td>
                        <td className="px-4 py-2">{row.doctorName || '—'}</td>
                        <td className="px-4 py-2">
                          {row.departmentName || '—'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {row.requestDate
                            ? new Date(row.requestDate).toLocaleString()
                            : '—'}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(
                              row.status
                            )}`}
                          >
                            {row.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <PaymentBadge status={row.paymentStatus} />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => viewItem(id)}
                              className="text-gray-600 hover:underline text-xs"
                            >
                              View
                            </button>
                            {(row.status || '').toLowerCase() !== 'processing' &&
                              (row.status || '').toLowerCase() !== 'completed' && (
                                <button
                                  type="button"
                                  disabled={!can}
                                  title={
                                    can
                                      ? 'Start processing'
                                      : 'Unpaid — Laboratory Cashier'
                                  }
                                  onClick={() => setProcessing(id, can)}
                                  className={`text-xs ${
                                    can
                                      ? 'text-blue-600 hover:underline'
                                      : 'text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  Process
                                </button>
                              )}
                            <button
                              type="button"
                              disabled={!can}
                              title={
                                can
                                  ? 'Enter result'
                                  : 'Unpaid — Laboratory Cashier'
                              }
                              onClick={() => goResult(id, can)}
                              className={`text-xs ${
                                can
                                  ? 'text-teal-600 hover:underline'
                                  : 'text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              Result
                            </button>
                            <Link
                              to={`/mlt/reports?testId=${id}`}
                              className="text-indigo-600 hover:underline text-xs"
                            >
                              Report
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                  <dd>
                    {detail.patientName} ({detail.patientMRN})
                  </dd>
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
                  <button
                    type="button"
                    onClick={() => {
                      setDetail(null);
                      goResult(detail.testID, true);
                    }}
                    className="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white"
                  >
                    Enter result
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetail(null)}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
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
