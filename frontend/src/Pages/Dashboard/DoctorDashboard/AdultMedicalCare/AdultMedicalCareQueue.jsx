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

/** Same department triage queue; navigates to adult care patient workspace. */
export default function AdultMedicalCareQueue() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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
        setError(err.response?.data?.message || "Failed to load triage queue.");
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
    if (!q) return rows;
    return rows.filter(
      (r) =>
        String(r.patientID ?? "").includes(q) ||
        String(r.visitID ?? "").includes(q) ||
        (r.patientName || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Adult Medical Care Queue</h2>
          <p className="text-sm text-slate-500">
            Select a patient from your department triage to manage chronic care
          </p>
        </div>
        <div className="relative">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {loading && (
        <div className="bg-white border rounded-xl p-10 text-center text-slate-500">
          Loading queue...
        </div>
      )}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white border rounded-xl p-10 text-center text-slate-500">
          No patients in the queue.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Patient</th>
                <th className="text-left px-4 py-3 font-medium">Visit</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Department</th>
                <th className="text-right px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.triageId} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{r.patientName}</p>
                    <p className="text-xs text-slate-400">ID: {r.patientID}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>#{r.visitID}</p>
                    <p className="text-xs text-slate-400">{formatDate(r.visitDate)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700">
                      {r.visitStatus || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.departmentName || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/doctor/adult/patient/${r.patientID}/${r.visitID}`)
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
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
      )}
    </div>
  );
}
