import { Fragment, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import { Field, fmtDate } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500";

export default function DevelopmentAssessment() {
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
    patientVisitID: visitId || "", ageInMonths: "", grossMotor: "", fineMotor: "", language: "",
    cognitiveDevelopment: "", socialDevelopment: "", developmentalMilestones: "",
    developmentStatus: "", concernIdentified: "", actionTaken: "", referralRequired: "", notes: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [canWrite, setCanWrite] = useState(false);
  useEffect(() => { canWriteMaternalChildHealth().then(setCanWrite); }, []);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await API.get(`${api}/development-assessment`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load development assessments.");
    } finally { setLoading(false); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/development-assessment`, {
        patientVisitID: form.patientVisitID === "" ? (visitId ? Number(visitId) : null) : Number(form.patientVisitID),
        ageInMonths: form.ageInMonths === "" ? null : Number(form.ageInMonths),
        grossMotor: form.grossMotor || null, fineMotor: form.fineMotor || null,
        language: form.language || null, cognitiveDevelopment: form.cognitiveDevelopment || null,
        socialDevelopment: form.socialDevelopment || null,
        developmentalMilestones: form.developmentalMilestones || null,
        developmentStatus: form.developmentStatus || null,
        concernIdentified: form.concernIdentified || null,
        actionTaken: form.actionTaken || null,
        referralRequired: form.referralRequired || null,
        notes: form.notes || null,
      });
      setShow(false); load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save.");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-700">Development Assessment</h3>
        {canWrite && (
          <button type="button" onClick={() => setShow(true)} className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-medium">
            <i className="bi bi-plus-lg me-1" /> Add Assessment
          </button>
        )}
      </div>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-600">No development assessments found.</div>
      )}
      {!loading && rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Age (mo)</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Gross Motor</th>
                <th className="px-4 py-3 font-medium">Language</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <Fragment key={r.developmentAssessmentID}>
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">{fmtDate(r.assessmentDate, true)}</td>
                    <td className="px-4 py-3">{r.ageInMonths ?? "—"}</td>
                    <td className="px-4 py-3">{r.developmentStatus || "—"}</td>
                    <td className="px-4 py-3 max-w-[8rem] truncate">{r.grossMotor || "—"}</td>
                    <td className="px-4 py-3 max-w-[8rem] truncate">{r.language || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-sky-600 text-xs font-medium"
                        onClick={() => setExpandedId(expandedId === r.developmentAssessmentID ? null : r.developmentAssessmentID)}>
                        {expandedId === r.developmentAssessmentID ? "Collapse" : "Expand"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.developmentAssessmentID && (
                    <tr><td colSpan={6} className="bg-slate-50/50 px-4 py-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Field label="Assessment ID" value={`#${r.developmentAssessmentID}`} />
                        <Field label="Date" value={fmtDate(r.assessmentDate, true)} />
                        <Field label="Age in Months" value={r.ageInMonths} />
                        <Field label="Gross Motor" value={r.grossMotor} />
                        <Field label="Fine Motor" value={r.fineMotor} />
                        <Field label="Language" value={r.language} />
                        <Field label="Cognitive Development" value={r.cognitiveDevelopment} />
                        <Field label="Social Development" value={r.socialDevelopment} />
                        <Field label="Developmental Milestones" value={r.developmentalMilestones} className="col-span-2" />
                        <Field label="Development Status" value={r.developmentStatus} />
                        <Field label="Concern Identified" value={r.concernIdentified} className="col-span-2" />
                        <Field label="Action Taken" value={r.actionTaken} />
                        <Field label="Referral Required" value={r.referralRequired} />
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
            <h3 className="font-semibold">Development Assessment</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Visit ID</label>
                <input className={inputCls} value={form.patientVisitID} onChange={(e) => set("patientVisitID", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Age (months)</label>
                <input type="number" className={inputCls} value={form.ageInMonths} onChange={(e) => set("ageInMonths", e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Gross Motor</label>
              <input className={inputCls} value={form.grossMotor} onChange={(e) => set("grossMotor", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Fine Motor</label>
              <input className={inputCls} value={form.fineMotor} onChange={(e) => set("fineMotor", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Language</label>
              <input className={inputCls} value={form.language} onChange={(e) => set("language", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Cognitive Development</label>
              <input className={inputCls} value={form.cognitiveDevelopment} onChange={(e) => set("cognitiveDevelopment", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Social Development</label>
              <input className={inputCls} value={form.socialDevelopment} onChange={(e) => set("socialDevelopment", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Milestones</label>
              <textarea className={inputCls} rows={2} value={form.developmentalMilestones} onChange={(e) => set("developmentalMilestones", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Development Status</label>
              <input className={inputCls} value={form.developmentStatus} onChange={(e) => set("developmentStatus", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Concern Identified</label>
              <input className={inputCls} value={form.concernIdentified} onChange={(e) => set("concernIdentified", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Action Taken</label>
              <input className={inputCls} value={form.actionTaken} onChange={(e) => set("actionTaken", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Referral Required</label>
              <input className={inputCls} value={form.referralRequired} onChange={(e) => set("referralRequired", e.target.value)} /></div>
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
