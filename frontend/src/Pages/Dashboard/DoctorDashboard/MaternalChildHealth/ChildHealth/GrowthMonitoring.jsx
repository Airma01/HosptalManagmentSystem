import { Fragment, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../../../Config/API";
import { canWriteMaternalChildHealth } from "../../../../../utils/canWriteMaternalChildHealth";
import { Field, fmtDate } from "../shared/Field";

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500";

export default function GrowthMonitoring() {
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
    patientVisitID: visitId || "", ageInMonths: "", weightKg: "", heightCm: "", lengthCm: "",
    headCircumferenceCm: "", muacCm: "", bmi: "", weightForAge: "", heightForAge: "",
    weightForHeight: "", growthStatus: "", growthInterpretation: "", counselingProvided: "",
    actionTaken: "", notes: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [canWrite, setCanWrite] = useState(false);
  useEffect(() => { canWriteMaternalChildHealth().then(setCanWrite); }, []);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await API.get(`${api}/growth-monitoring`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load growth monitoring.");
    } finally { setLoading(false); }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const num = (v) => (v === "" || v == null ? null : Number(v));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/growth-monitoring`, {
        patientVisitID: form.patientVisitID === "" ? (visitId ? Number(visitId) : null) : Number(form.patientVisitID),
        ageInMonths: num(form.ageInMonths),
        weightKg: num(form.weightKg), heightCm: num(form.heightCm), lengthCm: num(form.lengthCm),
        headCircumferenceCm: num(form.headCircumferenceCm), muacCm: num(form.muacCm), bmi: num(form.bmi),
        weightForAge: num(form.weightForAge), heightForAge: num(form.heightForAge),
        weightForHeight: num(form.weightForHeight),
        growthStatus: form.growthStatus || null,
        growthInterpretation: form.growthInterpretation || null,
        counselingProvided: form.counselingProvided || null,
        actionTaken: form.actionTaken || null,
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
        <h3 className="text-sm font-semibold text-slate-700">Growth Monitoring</h3>
        {canWrite && (
          <button type="button" onClick={() => setShow(true)} className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-medium">
            <i className="bi bi-plus-lg me-1" /> Add Measurement
          </button>
        )}
      </div>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading growth records...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && rows.length === 0 && !error && (
        <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-600">No growth monitoring records found.</div>
      )}
      {!loading && rows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Age (mo)</th>
                <th className="px-4 py-3 font-medium">Weight (kg)</th>
                <th className="px-4 py-3 font-medium">Height/Length</th>
                <th className="px-4 py-3 font-medium">MUAC</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <Fragment key={r.growthMonitoringID}>
                  <tr className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">{fmtDate(r.measurementDate, true)}</td>
                    <td className="px-4 py-3">{r.ageInMonths ?? "—"}</td>
                    <td className="px-4 py-3">{r.weightKg ?? "—"}</td>
                    <td className="px-4 py-3">{r.heightCm ?? r.lengthCm ?? "—"}</td>
                    <td className="px-4 py-3">{r.muacCm ?? "—"}</td>
                    <td className="px-4 py-3">{r.growthStatus || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-sky-600 text-xs font-medium"
                        onClick={() => setExpandedId(expandedId === r.growthMonitoringID ? null : r.growthMonitoringID)}>
                        {expandedId === r.growthMonitoringID ? "Collapse" : "Expand"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === r.growthMonitoringID && (
                    <tr><td colSpan={7} className="bg-slate-50/50 px-4 py-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Field label="Record ID" value={`#${r.growthMonitoringID}`} />
                        <Field label="Measurement Date" value={fmtDate(r.measurementDate, true)} />
                        <Field label="Age in Months" value={r.ageInMonths} />
                        <Field label="Weight" value={r.weightKg} unit="kg" />
                        <Field label="Height" value={r.heightCm} unit="cm" />
                        <Field label="Length" value={r.lengthCm} unit="cm" />
                        <Field label="Head Circumference" value={r.headCircumferenceCm} unit="cm" />
                        <Field label="MUAC" value={r.muacCm} unit="cm" />
                        <Field label="BMI" value={r.bmi} />
                        <Field label="Weight-for-Age" value={r.weightForAge} />
                        <Field label="Height-for-Age" value={r.heightForAge} />
                        <Field label="Weight-for-Height" value={r.weightForHeight} />
                        <Field label="Growth Status" value={r.growthStatus} />
                        <Field label="Interpretation" value={r.growthInterpretation} className="col-span-2" />
                        <Field label="Counseling" value={r.counselingProvided} className="col-span-2" />
                        <Field label="Action Taken" value={r.actionTaken} className="col-span-2" />
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
            <h3 className="font-semibold">Growth Measurement</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Visit ID</label>
                <input className={inputCls} value={form.patientVisitID} onChange={(e) => set("patientVisitID", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Age (months)</label>
                <input type="number" className={inputCls} value={form.ageInMonths} onChange={(e) => set("ageInMonths", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-xs font-medium mb-1">Weight (kg)</label>
                <input type="number" step="0.01" className={inputCls} value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Height (cm)</label>
                <input type="number" step="0.1" className={inputCls} value={form.heightCm} onChange={(e) => set("heightCm", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">Length (cm)</label>
                <input type="number" step="0.1" className={inputCls} value={form.lengthCm} onChange={(e) => set("lengthCm", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-xs font-medium mb-1">Head Circ. (cm)</label>
                <input type="number" step="0.1" className={inputCls} value={form.headCircumferenceCm} onChange={(e) => set("headCircumferenceCm", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">MUAC (cm)</label>
                <input type="number" step="0.1" className={inputCls} value={form.muacCm} onChange={(e) => set("muacCm", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">BMI</label>
                <input type="number" step="0.01" className={inputCls} value={form.bmi} onChange={(e) => set("bmi", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-xs font-medium mb-1">WFA z-score</label>
                <input type="number" step="0.01" className={inputCls} value={form.weightForAge} onChange={(e) => set("weightForAge", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">HFA z-score</label>
                <input type="number" step="0.01" className={inputCls} value={form.heightForAge} onChange={(e) => set("heightForAge", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1">WFH z-score</label>
                <input type="number" step="0.01" className={inputCls} value={form.weightForHeight} onChange={(e) => set("weightForHeight", e.target.value)} /></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Growth Status</label>
              <input className={inputCls} value={form.growthStatus} onChange={(e) => set("growthStatus", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Interpretation</label>
              <textarea className={inputCls} rows={2} value={form.growthInterpretation} onChange={(e) => set("growthInterpretation", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Counseling</label>
              <input className={inputCls} value={form.counselingProvided} onChange={(e) => set("counselingProvided", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1">Action Taken</label>
              <input className={inputCls} value={form.actionTaken} onChange={(e) => set("actionTaken", e.target.value)} /></div>
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
