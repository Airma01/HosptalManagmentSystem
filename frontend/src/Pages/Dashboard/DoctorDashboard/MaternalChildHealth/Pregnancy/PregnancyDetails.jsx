import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../../../../Config/API";

export default function PregnancyDetails() {
  const { patientId, visitId, pregnancyId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const base = `/doctor/maternal/patient/${patientId}/${visitId}`;
  const api = `/api/doctor/patient/${patientId}/maternal-child`;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`${api}/pregnancies/${pregnancyId}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load pregnancy details.");
    } finally {
      setLoading(false);
    }
  }, [api, pregnancyId]);

  useEffect(() => { load(); }, [load]);

  const links = [
    { to: `${base}/anc?pregnancyId=${pregnancyId}`, label: "ANC", icon: "bi-clipboard2-heart" },
    { to: `${base}/risk?pregnancyId=${pregnancyId}`, label: "Risk", icon: "bi-exclamation-triangle" },
    { to: `${base}/high-risk?pregnancyId=${pregnancyId}`, label: "High Risk", icon: "bi-shield-exclamation" },
    { to: `${base}/birth-preparedness?pregnancyId=${pregnancyId}`, label: "Birth Prep", icon: "bi-house-heart" },
    { to: `${base}/laboratory?pregnancyId=${pregnancyId}`, label: "Lab", icon: "bi-eyedropper" },
    { to: `${base}/ultrasound?pregnancyId=${pregnancyId}`, label: "Ultrasound", icon: "bi-soundwave" },
    { to: `${base}/medication?pregnancyId=${pregnancyId}`, label: "Meds", icon: "bi-capsule" },
    { to: `${base}/labor?pregnancyId=${pregnancyId}`, label: "Labor", icon: "bi-activity" },
    { to: `${base}/delivery?pregnancyId=${pregnancyId}`, label: "Delivery", icon: "bi-balloon-heart" },
    { to: `${base}/pnc?pregnancyId=${pregnancyId}`, label: "PNC", icon: "bi-hearts" },
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <button type="button" onClick={() => navigate(`${base}/pregnancies`)} className="text-sm text-slate-500 hover:text-rose-600">
        <i className="bi bi-arrow-left" /> Pregnancies
      </button>
      {loading && <div className="bg-white border rounded-xl p-8 text-center text-slate-500">Loading pregnancy details...</div>}
      {error && !loading && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && data && (
        <>
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Pregnancy #{data.pregnancyID}</h2>
                <p className="text-sm text-slate-500 mt-1">Status: <span className="font-medium text-slate-700">{data.status}</span></p>
              </div>
              <button type="button" onClick={load} className="px-2 py-1 border rounded-lg text-xs"><i className="bi bi-arrow-clockwise" /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400">LMP</p><p className="font-medium">{data.lastMenstrualPeriod ? new Date(data.lastMenstrualPeriod).toLocaleDateString() : "—"}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400">EDD</p><p className="font-medium">{data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate).toLocaleDateString() : "—"}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400">G / P / A / L</p><p className="font-medium">{data.gravida ?? "—"} / {data.para ?? "—"} / {data.abortions ?? "—"} / {data.livingChildren ?? "—"}</p></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400">Registered</p><p className="font-medium">{data.registrationDate ? new Date(data.registrationDate).toLocaleDateString() : "—"}</p></div>
            </div>
            {data.notes && <p className="text-sm text-slate-600 mt-3"><span className="font-medium">Notes:</span> {data.notes}</p>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {links.map((l) => (
              <Link key={l.label} to={l.to} className="bg-white border rounded-lg px-3 py-2 text-center text-xs font-medium text-slate-700 hover:border-rose-300 hover:text-rose-700">
                <i className={`bi ${l.icon} block text-lg mb-1 text-rose-500`} />
                {l.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
