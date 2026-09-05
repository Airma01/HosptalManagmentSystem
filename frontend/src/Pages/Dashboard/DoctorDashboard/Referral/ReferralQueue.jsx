import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIncomingReferrals } from "../Services/referralApi";
import ReferralQueueCard from "../Components/ReferralQueueCard";
import ReferralTable from "../Components/ReferralTable";

function isToday(dateVal) {
  if (!dateVal) return false;
  try {
    const d = new Date(dateVal);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

function isPending(status) {
  const s = (status ?? "").toString().toLowerCase();
  return s === "pending" || s === "draft";
}

function isAccepted(status) {
  return (status ?? "").toString().toLowerCase() === "accepted";
}

function isUrgent(urgency) {
  const u = (urgency ?? "").toString().toLowerCase();
  return u.includes("urgent") || u.includes("emerg") || u.includes("critical");
}

export default function ReferralQueue() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getIncomingReferrals();
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) setError("Unauthorized. Please log in again.");
      else if (status === 403) setError("You are not authorized to view this referral queue.");
      else setError(err.response?.data?.message || "Failed to load referral queue.");
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
        const res = await getIncomingReferrals();
        if (!cancelled) setRows(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 401) setError("Unauthorized. Please log in again.");
        else if (status === 403) setError("You are not authorized to view this referral queue.");
        else setError(err.response?.data?.message || "Failed to load referral queue.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const pending = rows.filter((r) => isPending(r.status)).length;
    const today = rows.filter((r) => isToday(r.referralDate)).length;
    const accepted = rows.filter((r) => isAccepted(r.status)).length;
    const urgent = rows.filter((r) => isUrgent(r.urgency)).length;
    return { pending, today, accepted, urgent };
  }, [rows]);

  const statuses = useMemo(() => {
    const s = new Set(rows.map((r) => r.status).filter(Boolean));
    return Array.from(s);
  }, [rows]);

  const urgencies = useMemo(() => {
    const s = new Set(rows.map((r) => r.urgency).filter(Boolean));
    return Array.from(s);
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && (r.status ?? "").toString() !== statusFilter) return false;
      if (urgencyFilter !== "all" && (r.urgency ?? "").toString() !== urgencyFilter) return false;
      if (!q) return true;
      return (
        String(r.patientID ?? "").includes(q) ||
        String(r.referralID ?? "").includes(q) ||
        (r.patientName || "").toLowerCase().includes(q) ||
        (r.mrn || "").toLowerCase().includes(q) ||
        (r.referringDepartmentName || "").toLowerCase().includes(q) ||
        (r.referringDoctorName || "").toLowerCase().includes(q) ||
        (r.referralReason || "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter, urgencyFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Incoming Referrals</h2>
          <p className="text-sm text-slate-500">
            Referrals addressed to your clinical department
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
        >
          <i className={`bi bi-arrow-clockwise ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary cards — computed from API data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ReferralQueueCard title="Pending" value={stats.pending} icon="bi-clock" tone="amber" />
        <ReferralQueueCard title="Today" value={stats.today} icon="bi-calendar" tone="indigo" />
        <ReferralQueueCard title="Accepted" value={stats.accepted} icon="bi-check-circle" tone="emerald" />
        <ReferralQueueCard title="Urgent" value={stats.urgent} icon="bi-exclamation-triangle" tone="rose" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, ID, department, reason…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          <option value="all">All urgency</option>
          {urgencies.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700 flex items-start gap-2">
          <i className="bi bi-exclamation-triangle mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 mt-3">Loading referrals…</p>
        </div>
      ) : (
        <ReferralTable
          rows={filtered}
          onView={(id) => navigate(`/doctor/referrals/${id}`)}
        />
      )}
    </div>
  );
}
