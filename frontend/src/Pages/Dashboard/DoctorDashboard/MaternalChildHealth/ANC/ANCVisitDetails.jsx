import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../../../../../Config/API";
import MCHContextHeader from "../shared/MCHContextHeader";
import MCHModuleNav from "../shared/MCHModuleNav";
import { Field, fmtDate } from "../shared/Field";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";

export default function ANCVisitDetails() {
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

  const { patientId, visitId, ancVisitId } = useParams();
  const [sp] = useSearchParams();
  const pregnancyId = sp.get("pregnancyId") || "";
  
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

  const pregId = pregnancyId || data?.pregnancyID;

  if (mchAccessAllowed !== true) {
    return (
      <div className="p-6 text-slate-500 text-sm flex items-center gap-2">
        <i className="bi bi-arrow-repeat animate-spin" />
        Checking access…
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-2 sm:px-0">
      <MCHModuleNav patientId={patientId} visitId={visitId} pregnancyId={pregId} />
      <MCHContextHeader
        patientId={patientId}
        visitId={visitId}
        pregnancyId={pregId}
        moduleTitle={`ANC Visit #${ancVisitId}`}
        moduleIcon="bi-clipboard2-pulse"
      />

      <button
        type="button"
        onClick={() => navigate(`${base}/anc${pregId ? `?pregnancyId=${pregId}` : ""}`)}
        className="text-sm text-slate-500 hover:text-rose-600"
      >
        <i className="bi bi-arrow-left" /> Back to ANC list
      </button>

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
          Loading ANC visit details...
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}
      {!loading && data && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Visit Information</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="ANC Visit ID" value={`#${data.ancVisitID}`} />
              <Field label="Pregnancy ID" value={`#${data.pregnancyID}`} />
              <Field label="Patient Visit ID" value={`#${data.patientVisitID}`} />
              <Field label="Visit Date" value={fmtDate(data.visitDate, true)} />
              <Field label="Gestational Age" value={data.gestationalAgeWeeks} unit="weeks" />
              <Field label="Recorded By User ID" value={data.recordedByUserID} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Clinical Findings</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Chief Complaint" value={data.chiefComplaint} className="col-span-2 sm:col-span-3" />
              <Field label="Maternal Condition" value={data.maternalCondition} />
              <Field label="Fetal Condition" value={data.fetalCondition} />
              <Field label="Fetal Heart Rate" value={data.fetalHeartRate} />
              <Field label="Fundal Height" value={data.fundalHeight} />
              <Field label="Edema" value={data.edema} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Assessment & Plan</h2>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Counseling Provided" value={data.counselingProvided} />
              <Field label="Treatment Plan" value={data.treatmentPlan} />
              <Field label="Notes" value={data.notes} />
            </div>
          </div>

          {Array.isArray(data.riskAssessments) && data.riskAssessments.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Linked Risk Assessments</h2>
              <div className="space-y-3">
                {data.riskAssessments.map((r) => (
                  <div key={r.pregnancyRiskAssessmentID} className="border border-slate-100 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <Field label="Assessment ID" value={`#${r.pregnancyRiskAssessmentID}`} />
                    <Field label="Date" value={fmtDate(r.assessmentDate)} />
                    <Field label="High Risk" value={r.isHighRisk ? "Yes" : "No"} />
                    <Field label="Category" value={r.riskCategory} />
                    <Field label="Risk Factor" value={r.riskFactor} className="col-span-2" />
                    <Field label="Description" value={r.riskDescription} className="col-span-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
