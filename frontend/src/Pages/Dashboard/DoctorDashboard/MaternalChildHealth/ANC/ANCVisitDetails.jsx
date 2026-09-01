import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../../../Config/API";

export default function ANCVisitDetails() {
  const { patientId, visitId, ancVisitId } = useParams();
  const navigate = useNavigate();
  const base = `/doctor/maternal/patient/${patientId}/${visitId}`;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/api/doctor/patient/${patientId}/maternal-child/anc/${ancVisitId}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load ANC visit.");
    } finally {
      setLoading(false);
    }
  }, [patientId, ancVisitId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <button type="button" onClick={() => navigate(`${base}/anc`)} className="text-sm text-slate-500 hover:text-rose-600"><i className="bi bi-arrow-left" /> ANC list</button>
      {loading && <div className="bg-white border rounded-xl p-8 text-center text-slate-500">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && data && (
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-3 text-sm">
          <h2 className="text-lg font-semibold">ANC Visit #{data.ancVisitID}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-slate-400 text-xs">Pregnancy</span><p>#{data.pregnancyID}</p></div>
            <div><span className="text-slate-400 text-xs">Patient visit</span><p>#{data.patientVisitID}</p></div>
            <div><span className="text-slate-400 text-xs">Date</span><p>{data.visitDate ? new Date(data.visitDate).toLocaleString() : "—"}</p></div>
            <div><span className="text-slate-400 text-xs">GA weeks</span><p>{data.gestationalAgeWeeks ?? "—"}</p></div>
            <div className="col-span-2"><span className="text-slate-400 text-xs">Chief complaint</span><p>{data.chiefComplaint || "—"}</p></div>
            <div><span className="text-slate-400 text-xs">Maternal</span><p>{data.maternalCondition || "—"}</p></div>
            <div><span className="text-slate-400 text-xs">Fetal</span><p>{data.fetalCondition || "—"}</p></div>
            <div><span className="text-slate-400 text-xs">FHR</span><p>{data.fetalHeartRate || "—"}</p></div>
            <div><span className="text-slate-400 text-xs">Fundal height</span><p>{data.fundalHeight || "—"}</p></div>
            <div className="col-span-2"><span className="text-slate-400 text-xs">Treatment plan</span><p>{data.treatmentPlan || "—"}</p></div>
            <div className="col-span-2"><span className="text-slate-400 text-xs">Notes</span><p>{data.notes || "—"}</p></div>
          </div>
          {Array.isArray(data.riskAssessments) && data.riskAssessments.length > 0 && (
            <div className="pt-3 border-t">
              <p className="font-medium mb-2">Linked risk assessments</p>
              <ul className="space-y-1 text-xs text-slate-600">
                {data.riskAssessments.map((r) => (
                  <li key={r.pregnancyRiskAssessmentID}>#{r.pregnancyRiskAssessmentID} · {r.riskCategory || "—"} · High risk: {r.isHighRisk ? "Yes" : "No"}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
