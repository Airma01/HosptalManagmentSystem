import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../../Config/API";
import TriageDepartmentQueueSections from "../Components/TriageDepartmentQueueSections";
import { canWriteAdultMedicalCare } from "../../../../utils/canWriteAdultMedicalCare";

export default function AdultMedicalCareQueue() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [accessChecked, setAccessChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await canWriteAdultMedicalCare();
      if (cancelled) return;
      setAllowed(ok);
      setAccessChecked(true);
      if (!ok) {
        navigate("/doctor", { replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (!accessChecked || !allowed) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get("/api/doctor/triage");
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
  }, [accessChecked, allowed]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        String(r.patientID ?? "").includes(q) ||
        String(r.visitID ?? "").includes(q) ||
        String(r.mrn ?? "").toLowerCase().includes(q) ||
        (r.patientName || "").toLowerCase().includes(q) ||
        (r.triageDepartmentName || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  if (!accessChecked || !allowed) {
    return (
      <div className="p-6 text-slate-500 text-sm flex items-center gap-2">
        <i className="bi bi-arrow-repeat animate-spin" />
        Checking access…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ... your existing queue JSX unchanged ... */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Adult Medical Care Queue</h2>
          <p className="text-sm text-slate-500">
            Select a patient from your department triage · Emergency prioritized
          </p>
        </div>
        <div className="relative">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, MRN, ID..."
            className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              onClick={() =>
                navigate(`/doctor/adult/patient/${r.patientID}/${r.visitID}`)
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
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