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

/** Department triage queue → Maternal & Child patient workspace. */
export default function MaternalChildQueue() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      // GET /api/doctor/triage → DoctorTriageQueueItemDto[]
      const res = await API.get("/api/doctor/triage");
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load triage queue.");
    } finally {
      setLoading(false);
    }
  };

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
        (r.patientName || "").toLowerCase().includes(q) ||
        (r.departmentName || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Maternal &amp; Child Health Queue
          </h2>
          <p className="text-sm text-slate-500">
            Select a patient from your department triage to open maternal &amp; child care
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient, ID..."
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <button
            type="button"
            onClick={load}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
            title="Refresh"
          >
            <i className="bi bi-arrow-clockwise" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
          <i className="bi bi-arrow-repeat animate-spin text-2xl" />
          <p className="mt-2 text-sm">Loading queue...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
          <i className="bi bi-inbox text-3xl text-slate-300" />
          <p className="mt-2">No patients in your department triage queue.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Patient ID</th>
                  <th className="px-4 py-3 font-medium">Visit ID</th>
                  <th className="px-4 py-3 font-medium">Visit date</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={`${r.triageId}-${r.visitID}`} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{r.patientName || "—"}</p>
                      <p className="text-xs text-slate-400">Triage #{r.triageId}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.patientID}</td>
                    <td className="px-4 py-3 text-slate-600">#{r.visitID}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {formatDate(r.visitDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.departmentName || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-100">
                        {r.visitStatus || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/doctor/maternal/patient/${r.patientID}/${r.visitID}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700"
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
