import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../../Config/API";
import TriageDepartmentQueueSections from "../Components/TriageDepartmentQueueSections";

export default function ConsultationQueue() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get("/api/doctor/triage");
        if (!cancelled) setRows(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 401) setError("Unauthorized. Please log in again.");
        else if (status === 403) setError("You are not authorized to view this queue.");
        else setError(err.response?.data?.message || "Failed to load triage queue.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const status = (r.visitStatus || "").toLowerCase();
      if (statusFilter !== "all" && status !== statusFilter.toLowerCase()) return false;
      if (!q) return true;
      return (
        String(r.patientID ?? "").includes(q) ||
        String(r.visitID ?? "").includes(q) ||
        String(r.mrn ?? "").toLowerCase().includes(q) ||
        (r.patientName || "").toLowerCase().includes(q) ||
        (r.departmentName || "").toLowerCase().includes(q) ||
        (r.triageDepartmentName || "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const statuses = useMemo(() => {
    const s = new Set(rows.map((r) => r.visitStatus).filter(Boolean));
    return Array.from(s);
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Consultation Queue</h2>
          <p className="text-sm text-slate-500">
            Patients triaged to your clinical department · Emergency prioritized
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, MRN, ID..."
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
          <i className="bi bi-arrow-repeat animate-spin text-2xl" />
          <p className="mt-2 text-sm">Loading queue...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </div>
      )}

      {!loading && !error && (
        <TriageDepartmentQueueSections
          rows={filtered}
          variant="consultation"
          renderActions={(r) => (
            <button
              type="button"
              onClick={() =>
                navigate(`/doctor/consultation/patient/${r.patientID}/${r.visitID}`)
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
            >
              <i className="bi bi-eye" />
              View
            </button>
          )}
        />
      )}
    </div>
  );
}