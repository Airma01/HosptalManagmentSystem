import { Fragment, useCallback, useEffect, useState } from "react";
import {useParams, useNavigate} from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import { Field, fmtDate } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500";

export default function IMNCIEncounter() {
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

  const { patientId, visitId } = useParams();
  const api = `/api/doctor/patient/${patientId}/child-health`;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    patientVisitID: visitId || "", ageInMonths: "", mainSymptoms: "", generalDangerSigns: "",
    coughClassification: "", diarrheaClassification: "", feverClassification: "",
    earProblemClassification: "", malnutritionClassification: "", anemiaClassification: "",
    immunizationStatus: "", feedingAssessment: "", treatmentPlan: "", counselingProvided: "",
    referralDecision: "", followUpPlan: "", notes: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [canWrite, setCanWrite] = useState(false);
  useEffect(() => { canWriteMaternalChildHealth().then(setCanWrite); }, []);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await API.get(`${api}/imnci`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load IMNCI encounters.");
    } finally { setLoading(false); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      const pvid = form.patientVisitID === "" ? Number(visitId) : Number(form.patientVisitID);
      if (!pvid) { setFormError("Patient Visit ID is required."); setSaving(false); return; }
      await API.post(`${api}/imnci`, {
        patientVisitID: pvid,
        ageInMonths: form.ageInMonths === "" ? null : Number(form.ageInMonths),
        mainSymptoms: form.mainSymptoms || null,
        generalDangerSigns: form.generalDangerSigns || null,
        coughClassification: form.coughClassification || null,
        diarrheaClassification: form.diarrheaClassification || null,
        feverClassification: form.feverClassification || null,
        earProblemClassification: form.earProblemClassification || null,
        malnutritionClassification: form.malnutritionClassification || null,
        anemiaClassification: form.anemiaClassification || null,
        immunizationStatus: form.immunizationStatus || null,
        feedingAssessment: form.feedingAssessment || null,
        treatmentPlan: form.treatmentPlan || null,
        counselingProvided: form.counselingProvided || null,
        referralDecision: form.referralDecision || null,
        followUpPlan: form.followUpPlan || null,
        notes: form.notes || null,
      });
      setShow(false); load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save.");
    } finally { setSaving(false); }
  };

  if (mchAccessAllowed !== true) {
    return (
      <div className="p-6 text-slate-500 text-sm flex items-center gap-2">
        <i className="bi bi-arrow-repeat animate-spin" />
        Checking access…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-700">IMNCI Encounter</h3>
        {canWrite && (
          <button type="button" onClick={() => setShow(true)} className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-medium">
            <i className="bi bi-plus-lg me-1" /> New Encounter
          </button>
        )}
      </div>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading IMNCI...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-600">No IMNCI encounters found.</div>
      )}
      {!loading && rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Age (mo)</th>
                <th className="px-4 py-3 font-medium">Main Symptoms</th>
                <th className="px-4 py-3 font-medium">Danger Signs</th>
                <th className="px-4 py-3 font-medium">Referral</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <Fragment key={r.imnciEncounterID}>
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">{fmtDate(r.encounterDate, true)}</td>
                    <td className="px-4 py-3">{r.ageInMonths ?? "—"}</td>
                    <td className="px-4 py-3 max-w-[10rem] truncate">{r.mainSymptoms || "—"}</td>
                    <td className="px-4 py-3 max-w-[8rem] truncate">{r.generalDangerSigns || "—"}</td>
                    <td className="px-4 py-3">{r.referralDecision || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-sky-600 text-xs font-medium"
                        onClick={() => setExpandedId(expandedId === r.imnciEncounterID ? null : r.imnciEncounterID)}>
                        {expandedId === r.imnciEncounterID ? "Collapse" : "Expand"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.imnciEncounterID && (
                    <tr><td colSpan={6} className="bg-slate-50/50 px-4 py-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="col-span-full text-xs font-semibold text-slate-500 uppercase">Encounter</div>
                        <Field label="IMNCI ID" value={`#${r.imnciEncounterID}`} />
                        <Field label="Visit ID" value={`#${r.patientVisitID}`} />
                        <Field label="Date" value={fmtDate(r.encounterDate, true)} />
                        <Field label="Age in Months" value={r.ageInMonths} />
                        <Field label="Main Symptoms" value={r.mainSymptoms} className="col-span-2" />
                        <Field label="General Danger Signs" value={r.generalDangerSigns} className="col-span-2" />
                        <div className="col-span-full text-xs font-semibold text-slate-500 uppercase mt-2">Classifications</div>
                        <Field label="Cough" value={r.coughClassification} />
                        <Field label="Diarrhea" value={r.diarrheaClassification} />
                        <Field label="Fever" value={r.feverClassification} />
                        <Field label="Ear Problem" value={r.earProblemClassification} />
                        <Field label="Malnutrition" value={r.malnutritionClassification} />
                        <Field label="Anemia" value={r.anemiaClassification} />
                        <Field label="Immunization Status" value={r.immunizationStatus} />
                        <Field label="Feeding Assessment" value={r.feedingAssessment} className="col-span-2" />
                        <div className="col-span-full text-xs font-semibold text-slate-500 uppercase mt-2">Plan</div>
                        <Field label="Treatment Plan" value={r.treatmentPlan} className="col-span-2 sm:col-span-3" />
                        <Field label="Counseling" value={r.counselingProvided} className="col-span-2" />
                        <Field label="Referral Decision" value={r.referralDecision} />
                        <Field label="Follow-up Plan" value={r.followUpPlan} className="col-span-2" />
                        <Field label="Notes" value={r.notes} className="col-span-2 sm:col-span-3" />
                      </div>
                    </td></tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {canWrite && show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-3 shadow-xl">
            <h3 className="font-semibold">IMNCI Encounter</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Visit ID *</label>
                <input required className={inputCls} value={form.patientVisitID} onChange={(e) => set("patientVisitID", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Age (months)</label>
                <input type="number" className={inputCls} value={form.ageInMonths} onChange={(e) => set("ageInMonths", e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Main Symptoms</label>
              <textarea className={inputCls} rows={2} value={form.mainSymptoms} onChange={(e) => set("mainSymptoms", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">General Danger Signs</label>
              <input className={inputCls} value={form.generalDangerSigns} onChange={(e) => set("generalDangerSigns", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Cough Classification</label>
                <input className={inputCls} value={form.coughClassification} onChange={(e) => set("coughClassification", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Diarrhea Classification</label>
                <input className={inputCls} value={form.diarrheaClassification} onChange={(e) => set("diarrheaClassification", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Fever Classification</label>
                <input className={inputCls} value={form.feverClassification} onChange={(e) => set("feverClassification", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Ear Problem</label>
                <input className={inputCls} value={form.earProblemClassification} onChange={(e) => set("earProblemClassification", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Malnutrition</label>
                <input className={inputCls} value={form.malnutritionClassification} onChange={(e) => set("malnutritionClassification", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Anemia</label>
                <input className={inputCls} value={form.anemiaClassification} onChange={(e) => set("anemiaClassification", e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Immunization Status</label>
              <input className={inputCls} value={form.immunizationStatus} onChange={(e) => set("immunizationStatus", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Feeding Assessment</label>
              <input className={inputCls} value={form.feedingAssessment} onChange={(e) => set("feedingAssessment", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Treatment Plan</label>
              <textarea className={inputCls} rows={2} value={form.treatmentPlan} onChange={(e) => set("treatmentPlan", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Counseling</label>
              <input className={inputCls} value={form.counselingProvided} onChange={(e) => set("counselingProvided", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Referral Decision</label>
                <input className={inputCls} value={form.referralDecision} onChange={(e) => set("referralDecision", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Follow-up Plan</label>
                <input className={inputCls} value={form.followUpPlan} onChange={(e) => set("followUpPlan", e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Notes</label>
              <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShow(false)} className="px-3 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="px-3 py-2 bg-sky-600 text-white rounded-lg text-sm disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
