import { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import API from "../../../Config/API";

const RANGES = [
  { id: "all", label: "All Time" },
  { id: "year", label: "This Year" },
  { id: "month", label: "This Month" },
  { id: "week", label: "This Week" },
  { id: "custom", label: "Custom Range" },
];

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#f43f5e"];

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <i className={`bi ${icon} text-lg`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 uppercase tracking-wide truncate">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">{value ?? 0}</p>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children, empty }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">{title}</h3>
      {empty ? (
        <p className="text-sm text-slate-400 py-8 text-center">No data</p>
      ) : (
        <div className="h-64 w-full">{children}</div>
      )}
    </div>
  );
}

export default function DoctorStatisticsDashboard() {
  const [range, setRange] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("range", range);
      if (range === "custom") {
        if (fromDate) params.set("from", fromDate);
        if (toDate) params.set("to", toDate);
      }
      const res = await API.get(`/api/doctor/dashboard/statistics?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403)
        setError("You are not authorized to view these statistics.");
      else setError(err.response?.data?.message || "Failed to load statistics.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [range, fromDate, toDate]);

  useEffect(() => {
    if (range === "custom" && (!fromDate || !toDate)) return;
    load();
  }, [load, range, fromDate, toDate]);

  const isEmpty =
    data &&
    !data.totalPatients &&
    !data.totalVisits &&
    !data.totalConsultations &&
    !data.totalDiagnoses;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Clinical Statistics</h2>
          <p className="text-sm text-slate-500">
            Your historical clinical activity (default: All Time)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                range === r.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {range === "custom" && (
        <div className="flex flex-wrap items-end gap-3 bg-white border border-slate-200 rounded-xl p-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <button
            type="button"
            onClick={load}
            disabled={!fromDate || !toDate}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
          <i className="bi bi-arrow-repeat animate-spin text-2xl" />
          Loading statistics…
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-3">
          <span>
            <i className="bi bi-exclamation-triangle me-2" />
            {error}
          </span>
          <button
            type="button"
            onClick={load}
            className="px-3 py-1 rounded-lg bg-red-100 text-red-800 text-xs font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {isEmpty && (
            <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              No clinical statistics available yet.
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            <StatCard icon="bi-people" label="Patients" value={data.totalPatients} color="bg-indigo-100 text-indigo-600" />
            <StatCard icon="bi-calendar2-check" label="Visits" value={data.totalVisits} color="bg-sky-100 text-sky-600" />
            <StatCard icon="bi-check2-circle" label="Completed" value={data.completedVisits} color="bg-emerald-100 text-emerald-600" />
            <StatCard icon="bi-hourglass-split" label="Active" value={data.activeVisits} color="bg-amber-100 text-amber-600" />
            <StatCard icon="bi-file-medical" label="Diagnoses" value={data.totalDiagnoses} color="bg-rose-100 text-rose-600" />
            <StatCard icon="bi-clipboard2-pulse" label="Consultations" value={data.totalConsultations} color="bg-violet-100 text-violet-600" />
            <StatCard icon="bi-droplet" label="Laboratory" value={data.laboratoryRequests} color="bg-cyan-100 text-cyan-600" />
            <StatCard icon="bi-radioactive" label="Radiology" value={data.radiologyRequests} color="bg-orange-100 text-orange-600" />
            <StatCard icon="bi-prescription2" label="Prescriptions" value={data.prescriptions} color="bg-teal-100 text-teal-600" />
            <StatCard icon="bi-heart-pulse" label="Adult Care" value={data.adultCareRecords} color="bg-pink-100 text-pink-600" />
            <StatCard icon="bi-balloon-heart" label="MCH" value={data.maternalChildHealthRecords} color="bg-fuchsia-100 text-fuchsia-600" />
            <StatCard icon="bi-emoji-smile" label="Child Health" value={data.childHealthRecords} color="bg-lime-100 text-lime-700" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Visit Status" empty={!data.visitStatus?.length}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.visitStatus || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(data.visitStatus || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Patient Gender" empty={!data.genderStatistics?.length}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.genderStatistics || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(data.genderStatistics || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Patient Age Groups" empty={!data.ageGroupStatistics?.length}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.ageGroupStatistics || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(data.ageGroupStatistics || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[(i + 1) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Clinical Services" empty={!data.clinicalServiceStatistics?.length}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.clinicalServiceStatistics || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(data.clinicalServiceStatistics || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard
            title="Top Diagnoses"
            empty={!data.diagnosisStatistics?.length}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.diagnosisStatistics || []}
                layout="vertical"
                margin={{ left: 20, right: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}
    </div>
  );
}
