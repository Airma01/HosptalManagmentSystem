
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../../Config/API";
import TriageDepartmentQueueSections from "../Components/TriageDepartmentQueueSections";
import { canWriteMaternalChildHealth } from "../../../../utils/canWriteMaternalChildHealth";

export default function ChildHealthQueue() {
  const navigate = useNavigate();
  const [mchAccessAllowed, setMchAccessAllowed] = useState(null); // null = checking

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await canWriteMaternalChildHealth();
      if (cancelled) return;
      if (!ok) {
        navigate("/doctor", { replace: true });
        setMchAccessAllowed(false);
      } else {
        setMchAccessAllowed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

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
        // Backend filters VisitType in the database (not in React)
        const res = await API.get("/api/doctor/triage", {
          params: { visitType: "ChildHealth" },
        });
        if (!cancelled) setRows(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || "Failed to load queue.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Search only — VisitType already filtered by API
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        String(r.patientID ?? "").includes(q) ||
        String(r.visitID ?? "").includes(q) ||
        String(r.mrn ?? "").toLowerCase().includes(q) ||
        (r.patientName || "").toLowerCase().includes(q) ||
        (r.departmentName || "").toLowerCase().includes(q) ||
        (r.triageDepartmentName || "").toLowerCase().includes(q) ||
        String(r.visitType || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  if (mchAccessAllowed !== true) {
    return (
      <div className="p-6 text-slate-500 text-sm flex items-center gap-2">
        <i className="bi bi-arrow-repeat animate-spin" />
        Checking access…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Child Health Queue</h2>
          <p className="text-sm text-slate-500">
            Patients with Visit Type Child Health · Emergency prioritized
          </p>
        </div>
        <div className="relative">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, MRN, ID..."
            className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
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

      {!loading && !error && (
        <TriageDepartmentQueueSections
          rows={filtered}
          variant="simple"
          renderActions={(r) => (
            <button
              type="button"
              onClick={() => {
                // Direct child entry — do not treat patient as mother
                try {
                  sessionStorage.setItem(
                    "ch_queue_direct",
                    JSON.stringify({
                      patientId: r.patientID,
                      visitId: r.visitID,
                    })
                  );
                } catch (_e) {
                  /* ignore */
                }
                navigate(
                  `/doctor/maternal/patient/${r.patientID}/${r.visitID}/child-health`
                );
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-medium hover:bg-sky-700"
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