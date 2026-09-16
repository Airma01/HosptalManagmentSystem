import { Fragment, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import { Field, fmtDate } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500";

export default function NutritionAssessment() {
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
    patientVisitID: visitId || "", weightKg: "", heightCm: "", muacCm: "", bmi: "",
    appetite: "", feedingHistory: "", breastfeedingStatus: "", dietaryHistory: "",
    nutritionalStatus: "", malnutritionClassification: "", edema: "",
    counselingProvided: "", treatmentPlan: "", referralRequired: "", notes: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [canWrite, setCanWrite] = useState(false);
  useEffect(() => { canWriteMaternalChildHealth().then(setCanWrite); }, []);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await API.get(`${api}/nutrition-assessment`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load nutrition assessments.");
    } finally { setLoading(false); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const num = (v) => (v === "" || v == null ? null : Number(v));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/nutrition-assessment`, {
        patientVisitID: form.patientVisitID === "" ? (visitId ? Number(visitId) : null) : Number(form.patientVisitID),
        weightKg: num(form.weightKg), heightCm: num(form.heightCm), muacCm: num(form.muacCm), bmi: num(form.bmi),
        appetite: form.appetite || null, feedingHistory: form.feedingHistory || null,
        breastfeedingStatus: form.breastfeedingStatus || null, dietaryHistory: form.dietaryHistory || null,
        nutritionalStatus: form.nutritionalStatus || null,
        malnutritionClassification: form.malnutritionClassification || null,
        edema: form.edema || null, counselingProvided: form.counselingProvided || null,
        treatmentPlan: form.treatmentPlan || null, referralRequired: form.referralRequired || null,
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
        <h3 className="text-sm font-semibold text-slate-700">Nutrition Assessment</h3>
        {canWrite && (
          <button type="button" onClick={() => setShow(true)} className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-medium">
            <i className="bi bi-plus-lg me-1" /> Add Assessment
          </button>
        )}
      </div>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-600">No nutrition assessments found.</div>
      )}
      {!loading && rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Weight</th>
                <th className="px-4 py-3 font-medium">MUAC</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Malnutrition</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <Fragment key={r.nutritionAssessmentID}>
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">{fmtDate(r.assessmentDate, true)}</td>
                    <td className="px-4 py-3">{r.weightKg != null ? `${r.weightKg} kg` : "—"}</td>
                    <td className="px-4 py-3">{r.muacCm != null ? `${r.muacCm} cm` : "—"}</td>
                    <td className="px-4 py-3">{r.nutritionalStatus || "—"}</td>
                    <td className="px-4 py-3">{r.malnutritionClassification || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-sky-600 text-xs font-medium"
                        onClick={() => setExpandedId(expandedId === r.nutritionAssessmentID ? null : r.nutritionAssessmentID)}>
                        {expandedId === r.nutritionAssessmentID ? "Collapse" : "Expand"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.nutritionAssessmentID && (
                    <tr><td colSpan={6} className="bg-slate-50/50 px-4 py-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Field label="Assessment ID" value={`#${r.nutritionAssessmentID}`} />
                        <Field label="Date" value={fmtDate(r.assessmentDate, true)} />
                        <Field label="Weight" value={r.weightKg} unit="kg" />
                        <Field label="Height" value={r.heightCm} unit="cm" />
                        <Field label="MUAC" value={r.muacCm} unit="cm" />
                        <Field label="BMI" value={r.bmi} />
                        <Field label="Appetite" value={r.appetite} />
                        <Field label="Breastfeeding Status" value={r.breastfeedingStatus} />
                        <Field label="Edema" value={r.edema} />
                        <Field label="Feeding History" value={r.feedingHistory} className="col-span-2" />
                        <Field label="Dietary History" value={r.dietaryHistory} className="col-span-2" />
                        <Field label="Nutritional Status" value={r.nutritionalStatus} />
                        <Field label="Malnutrition Classification" value={r.malnutritionClassification} />
                        <Field label="Counseling" value={r.counselingProvided} className="col-span-2" />
                        <Field label="Treatment Plan" value={r.treatmentPlan} className="col-span-2" />
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
            <h3 className="font-semibold">Nutrition Assessment</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Weight (kg)</label>
                <input type="number" step="0.01" className={inputCls} value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Height (cm)</label>
                <input type="number" step="0.1" className={inputCls} value={form.heightCm} onChange={(e) => set("heightCm", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">MUAC (cm)</label>
                <input type="number" step="0.1" className={inputCls} value={form.muacCm} onChange={(e) => set("muacCm", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">BMI</label>
                <input type="number" step="0.01" className={inputCls} value={form.bmi} onChange={(e) => set("bmi", e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Appetite</label>
              <input className={inputCls} value={form.appetite} onChange={(e) => set("appetite", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Feeding History</label>
              <textarea className={inputCls} rows={2} value={form.feedingHistory} onChange={(e) => set("feedingHistory", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Breastfeeding Status</label>
              <input className={inputCls} value={form.breastfeedingStatus} onChange={(e) => set("breastfeedingStatus", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Dietary History</label>
              <textarea className={inputCls} rows={2} value={form.dietaryHistory} onChange={(e) => set("dietaryHistory", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Nutritional Status</label>
                <input className={inputCls} value={form.nutritionalStatus} onChange={(e) => set("nutritionalStatus", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Malnutrition Class</label>
                <input className={inputCls} value={form.malnutritionClassification} onChange={(e) => set("malnutritionClassification", e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Edema</label>
              <input className={inputCls} value={form.edema} onChange={(e) => set("edema", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Counseling</label>
              <input className={inputCls} value={form.counselingProvided} onChange={(e) => set("counselingProvided", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Treatment Plan</label>
              <textarea className={inputCls} rows={2} value={form.treatmentPlan} onChange={(e) => set("treatmentPlan", e.target.value)} /></div>
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
