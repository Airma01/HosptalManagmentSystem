import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../../Config/API";

function formatDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}

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
        (r.patientName || "").toLowerCase().includes(q) ||
        (r.departmentName || "").toLowerCase().includes(q)
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
          <p className="text-sm text-slate-500">Patients triaged to your clinical department</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ID..."
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

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
          <i className="bi bi-inbox text-3xl" />
          <p className="mt-2 text-sm">No patients in the queue.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Patient</th>
                  <th className="text-left px-4 py-3 font-medium">Visit</th>
                  <th className="text-left px-4 py-3 font-medium">Type / Status</th>
                  <th className="text-left px-4 py-3 font-medium">Department</th>
                  <th className="text-left px-4 py-3 font-medium">Vitals</th>
                  <th className="text-left px-4 py-3 font-medium">Notes</th>
                  <th className="text-right px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.triageId} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{r.patientName || "—"}</p>
                      <p className="text-xs text-slate-400">ID: {r.patientID}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">#{r.visitID}</p>
                      <p className="text-xs text-slate-400">{formatDate(r.visitDate)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{r.visitType || "—"}</p>
                      <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                        {r.visitStatus || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.departmentName || "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      <div>T: {r.temprature ?? "—"}</div>
                      <div>BP: {r.bloodPressure ?? "—"}</div>
                      <div>HR: {r.heartRate ?? "—"}</div>
                      <div>RR: {r.respiratotyRate ?? "—"}</div>
                      <div>Wt: {r.weight ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-[160px] truncate">
                      {r.notes || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
