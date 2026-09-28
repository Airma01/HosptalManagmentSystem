import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../../Config/API';
import LoadingSpinner from '../Components/LoadingSpinner';
import RequestTable from '../Components/RequestTable';
import {
  getRequestsPaymentStatus,
  ensureRadiologyPaid,
} from '../Services/radiologyPaymentApi';

/**
 * Integrates existing queue API with payment status (Paid / Unpaid).
 * Routes (from your App): /radiology/radiographer/queue
 * Existing backend: GET /radiology/Radiographer/queue
 * Payment: GET /Hospital/Radiology/requests-payment-status
 */
export default function RadiographerQueue() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [paymentFilter, setPaymentFilter] = useState(''); // '' | Paid | Unpaid
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/radiology/Radiographer/queue', {
        params: status ? { status } : undefined,
      });
      let list = Array.isArray(res.data) ? res.data : [];

      // Merge payment status from payment API (all Paid + Unpaid)
      try {
        const payRes = await getRequestsPaymentStatus();
        const payList = Array.isArray(payRes.data) ? payRes.data : [];
        const payMap = new Map();
        payList.forEach((p) => {
          const id = p.radiologyRequestID ?? p.RadiologyRequestID;
          if (id != null) {
            payMap.set(Number(id), {
              paymentStatus: p.paymentStatus ?? p.PaymentStatus ?? 'Unpaid',
              canProcess: p.canProcess ?? p.CanProcess,
            });
          }
        });

        list = list.map((r) => {
          const id = Number(r.radiologyRequestID ?? r.RadiologyRequestID);
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
          // If not in payment list, treat as unpaid
          return {
            ...r,
            paymentStatus: r.paymentStatus ?? r.PaymentStatus ?? 'Unpaid',
            canProcess: false,
          };
        });
      } catch {
        // Payment endpoint missing: leave rows without payment (show Unpaid)
        list = list.map((r) => ({
          ...r,
          paymentStatus: r.paymentStatus ?? r.PaymentStatus ?? 'Unpaid',
          canProcess:
            r.canProcess ??
            String(r.paymentStatus ?? '').toLowerCase() === 'paid',
        }));
      }

      setRows(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load radiology queue.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await API.get('/radiology/RadiologyDepartment');
      const list = Array.isArray(res.data) ? res.data : [];
      const names = list
        .map((d) => d.departmentName || d.DepartmentName)
        .filter((n) => typeof n === 'string' && n.trim())
        .map((n) => n.trim());
      setCategories([...new Set(names)].sort((a, b) => a.localeCompare(b)));
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const categoryOptions = useMemo(() => {
    if (categories.length > 0) return categories;
    const fromRows = rows
      .map((r) => r.departmentName || r.DepartmentName)
      .filter((n) => typeof n === 'string' && n.trim())
      .map((n) => n.trim());
    return [...new Set(fromRows)].sort((a, b) => a.localeCompare(b));
  }, [categories, rows]);

  const filteredRows = useMemo(() => {
    let list = rows;
    if (selectedCategory) {
      const cat = selectedCategory.toLowerCase();
      list = list.filter((r) => {
        const name = (r.departmentName || r.DepartmentName || '').toLowerCase();
        return name === cat;
      });
    }
    if (paymentFilter) {
      const pf = paymentFilter.toLowerCase();
      list = list.filter(
        (r) =>
          String(r.paymentStatus || r.PaymentStatus || 'Unpaid').toLowerCase() ===
          pf
      );
    }
    return list;
  }, [rows, selectedCategory, paymentFilter]);

  const handleProcess = async (id, canProcess) => {
    if (!canProcess) {
      alert(
        'Radiology request is unpaid. Patient must pay at Radiology Cashier before examination.'
      );
      return;
    }
    try {
      await ensureRadiologyPaid(id);
      navigate(`/radiology/radiographer/requests/${id}/perform`);
      // If your App uses a different path, e.g. /radiology/radiographer/perform/:id — change here
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          'Radiology request is unpaid. Patient must pay at Radiology Cashier first.'
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Radiology Queue</h2>
          <p className="text-sm text-gray-500">
            Process examinations only when payment is <strong>Paid</strong>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <span className="whitespace-nowrap font-medium">Category</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-w-[10rem]"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            aria-label="Filter by status"
          >
            <option value="">Pending / Requested + In Progress</option>
            <option value="Pending">Pending / Requested</option>
            <option value="InProgress">In Progress</option>
            <option value="ReadyForReview">Ready for Review</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            aria-label="Filter by payment"
          >
            <option value="">All payments</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
          </select>
          <button
            type="button"
            onClick={load}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
          >
            <i className="bi bi-arrow-clockwise mr-1" />
            Refresh
          </button>
        </div>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      ) : (
        <RequestTable
          rows={filteredRows}
          detailsBase="/radiology/radiographer/requests"
          emptyMessage={
            selectedCategory
              ? 'No radiology requests found for this category.'
              : 'No radiology requests found.'
          }
          onProcess={handleProcess}
        />
      )}
    </div>
  );
}
