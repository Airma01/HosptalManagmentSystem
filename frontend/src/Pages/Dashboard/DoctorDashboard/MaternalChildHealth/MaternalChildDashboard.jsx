import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../utils/canWriteMaternalChildHealth";

function formatDate(v) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}

const MODULES = [
  { key: "pregnancy", title: "Pregnancy", desc: "List, register and view pregnancy details", icon: "bi-person-bounding-box", path: "pregnancies", color: "rose" },
  { key: "anc", title: "ANC", desc: "Antenatal care visits", icon: "bi-clipboard2-heart", path: "anc", color: "pink" },
  { key: "risk", title: "Risk Assessment", desc: "Pregnancy risk assessments", icon: "bi-exclamation-triangle", path: "risk", color: "orange" },
  { key: "high-risk", title: "High Risk Pregnancy", desc: "High-risk management plans", icon: "bi-shield-exclamation", path: "high-risk", color: "red" },
  { key: "birth-prep", title: "Birth Preparedness", desc: "Delivery facility, transport, emergency plan", icon: "bi-house-heart", path: "birth-preparedness", color: "violet" },
  { key: "lab", title: "Laboratory Orders", desc: "Pregnancy laboratory investigations", icon: "bi-eyedropper", path: "laboratory", color: "indigo" },
  { key: "us", title: "Ultrasound", desc: "Pregnancy ultrasound findings", icon: "bi-soundwave", path: "ultrasound", color: "blue" },
  { key: "meds", title: "Pregnancy Medication", desc: "Medications during pregnancy", icon: "bi-capsule", path: "medication", color: "fuchsia" },
  { key: "labor", title: "Labor", desc: "Labor admission and progress", icon: "bi-activity", path: "labor", color: "red" },
  { key: "delivery", title: "Delivery", desc: "Delivery record, complications, child birth", icon: "bi-balloon-heart", path: "delivery", color: "rose" },
  { key: "pnc", title: "PNC", desc: "Postnatal care visits", icon: "bi-hearts", path: "pnc", color: "teal" },
  { key: "fp", title: "Family Planning", desc: "Family planning methods and counseling", icon: "bi-shield-check", path: "family-planning", color: "cyan" },
  { key: "child", title: "Child Health", desc: "Neonatal, growth, immunization, IMNCI", icon: "bi-emoji-smile", path: "child-health", color: "sky" },
];

const colorMap = {
  rose: "bg-rose-100 text-rose-600",
  pink: "bg-pink-100 text-pink-600",
  orange: "bg-orange-100 text-orange-600",
  red: "bg-red-100 text-red-600",
  violet: "bg-violet-100 text-violet-600",
  indigo: "bg-indigo-100 text-indigo-600",
  blue: "bg-blue-100 text-blue-600",
  fuchsia: "bg-fuchsia-100 text-fuchsia-600",
  teal: "bg-teal-100 text-teal-600",
  cyan: "bg-cyan-100 text-cyan-600",
  sky: "bg-sky-100 text-sky-600",
};

export default function MaternalChildDashboard() {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [triage, setTriage] = useState(null);
  const [pregnancies, setPregnancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [canWrite, setCanWrite] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await canWriteMaternalChildHealth();
      if (!cancelled) setCanWrite(ok);
    })();
    return () => { cancelled = true; };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [triageRes, pregRes] = await Promise.all([
        API.get("/api/doctor/triage"),
        API.get(`/api/doctor/patient/${patientId}/maternal-child/pregnancies`),
      ]);
      const queue = Array.isArray(triageRes.data) ? triageRes.data : [];
      const match = queue.find(
        (t) => String(t.patientID) === String(patientId) && String(t.visitID) === String(visitId)
      );
      setTriage(match || null);
      if (match) {
        setPatient({
          patientID: match.patientID,
          patientName: match.patientName,
          visitID: match.visitID,
          visitDate: match.visitDate,
          visitType: match.visitType,
          visitStatus: match.visitStatus,
          departmentName: match.departmentName,
        });
      } else {
        setPatient({ patientID: patientId, visitID: visitId });
      }
      setPregnancies(Array.isArray(pregRes.data) ? pregRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load maternal health information. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [patientId, visitId]);

  useEffect(() => {
    load();
  }, [load]);

  const base = `/doctor/maternal/patient/${patientId}/${visitId}`;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button type="button" onClick={() => navigate("/doctor/maternal/triage")} className="text-slate-500 hover:text-rose-600 flex items-center gap-1">
          <i className="bi bi-arrow-left" /> Queue
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium">Maternal &amp; Child</span>
      </div>

      {loading && (
        <div className="bg-white border rounded-xl p-10 text-center text-slate-500">
          <i className="bi bi-arrow-repeat animate-spin text-2xl" />
          <p className="mt-2 text-sm">Loading maternal health information...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-3">
          <span><i className="bi bi-exclamation-triangle me-2" />{error}</span>
          <button type="button" onClick={load} className="px-3 py-1 rounded-lg border border-red-200 text-xs hover:bg-red-100">Retry</button>
        </div>
      )}

      {!loading && (
        <>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <i className="bi bi-person-fill text-2xl" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">{patient?.patientName || `Patient #${patientId}`}</h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Patient ID: <span className="font-medium text-slate-700">{patientId}</span>
                    {" · "}Visit ID: <span className="font-medium text-slate-700">{visitId}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {patient?.departmentName || "—"}
                    {patient?.visitDate ? ` · ${formatDate(patient.visitDate)}` : ""}
                    {patient?.visitStatus ? ` · ${patient.visitStatus}` : ""}
                  </p>
                </div>
              </div>
              <button type="button" onClick={load} className="self-start px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50">
                <i className="bi bi-arrow-clockwise me-1" /> Refresh
              </button>
            </div>

            {triage && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Triage / Vital signs</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-sm">
                  <div className="bg-slate-50 rounded-lg px-3 py-2"><p className="text-xs text-slate-400">Temp</p><p className="font-medium">{triage.temprature ?? "—"}</p></div>
                  <div className="bg-slate-50 rounded-lg px-3 py-2"><p className="text-xs text-slate-400">BP</p><p className="font-medium">{triage.bloodPressure ?? "—"}</p></div>
                  <div className="bg-slate-50 rounded-lg px-3 py-2"><p className="text-xs text-slate-400">HR</p><p className="font-medium">{triage.heartRate ?? "—"}</p></div>
                  <div className="bg-slate-50 rounded-lg px-3 py-2"><p className="text-xs text-slate-400">RR</p><p className="font-medium">{triage.respiratotyRate ?? "—"}</p></div>
                  <div className="bg-slate-50 rounded-lg px-3 py-2"><p className="text-xs text-slate-400">Weight</p><p className="font-medium">{triage.weight ?? "—"}</p></div>
                  <div className="bg-slate-50 rounded-lg px-3 py-2"><p className="text-xs text-slate-400">Visit type</p><p className="font-medium truncate">{triage.visitType || "—"}</p></div>
                </div>
                {triage.notes && <p className="text-xs text-slate-500 mt-2"><span className="font-medium">Notes:</span> {triage.notes}</p>}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <i className="bi bi-gender-female text-rose-500" /> Pregnancies
              </h2>
              <Link to={`${base}/pregnancies`} className="text-sm text-rose-600 hover:underline">View all</Link>
            </div>
            {pregnancies.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                <p>No pregnancy records found.</p>
                {canWrite && (
          <Link to={`${base}/pregnancies/register`} className="inline-flex mt-3 items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700">
                  <i className="bi bi-plus-lg" /> Register Pregnancy
                </Link>
        )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-slate-500 bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 font-medium">ID</th>
                      <th className="px-3 py-2 font-medium">LMP</th>
                      <th className="px-3 py-2 font-medium">EDD</th>
                      <th className="px-3 py-2 font-medium">G/P</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pregnancies.map((p) => (
                      <tr key={p.pregnancyID}>
                        <td className="px-3 py-2">#{p.pregnancyID}</td>
                        <td className="px-3 py-2">{p.lastMenstrualPeriod ? new Date(p.lastMenstrualPeriod).toLocaleDateString() : "—"}</td>
                        <td className="px-3 py-2">{p.expectedDeliveryDate ? new Date(p.expectedDeliveryDate).toLocaleDateString() : "—"}</td>
                        <td className="px-3 py-2">{p.gravida ?? "—"}/{p.para ?? "—"}</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">{p.status ?? "—"}</span></td>
                        <td className="px-3 py-2 text-right">
                          <Link to={`${base}/pregnancy/${p.pregnancyID}`} className="text-rose-600 text-xs font-medium hover:underline">Open</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-slate-800 mb-3">Modules</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODULES.map((m) => (
                <Link key={m.key} to={`${base}/${m.path}`} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-rose-200 hover:shadow transition flex gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorMap[m.color] || "bg-slate-100 text-slate-600"}`}>
                    <i className={`bi ${m.icon} text-xl`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{m.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
