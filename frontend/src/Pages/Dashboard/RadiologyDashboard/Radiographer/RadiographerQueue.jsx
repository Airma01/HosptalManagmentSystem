import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../../../../Config/API';
import LoadingSpinner from '../Components/LoadingSpinner';
import RequestTable from '../Components/RequestTable';

export default function RadiographerQueue() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
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
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load radiology queue.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Categories come from existing RadiologyDepartment (DepartmentName = category).
  const loadCategories = useCallback(async () => {
    try {
      const res = await API.get('/radiology/RadiologyDepartment');
      const list = Array.isArray(res.data) ? res.data : [];
      const names = list
        .map((d) => d.departmentName || d.DepartmentName)
        .filter((n) => typeof n === 'string' && n.trim())
        .map((n) => n.trim());
      // Unique, sorted
      setCategories([...new Set(names)].sort((a, b) => a.localeCompare(b)));
    } catch {
      // Fall back: derive categories from loaded queue rows
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // If department API fails, still offer categories present in the current queue data.
  const categoryOptions = useMemo(() => {
    if (categories.length > 0) return categories;
    const fromRows = rows
      .map((r) => r.departmentName || r.DepartmentName)
      .filter((n) => typeof n === 'string' && n.trim())
      .map((n) => n.trim());
    return [...new Set(fromRows)].sort((a, b) => a.localeCompare(b));
  }, [categories, rows]);

  // Client-side category filter — does not affect status filtering (status is server-side).
  const filteredRows = useMemo(() => {
    if (!selectedCategory) return rows;
    const cat = selectedCategory.toLowerCase();
    return rows.filter((r) => {
      const name = (r.departmentName || r.DepartmentName || '').toLowerCase();
      return name === cat;
    });
  }, [rows, selectedCategory]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">Radiology Queue</h2>
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
          <button
            type="button"
            onClick={load}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
          >
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
              ? `No radiology requests found for this category.`
              : 'No radiology requests found.'
          }
        />
      )}
    </div>
  );
}
