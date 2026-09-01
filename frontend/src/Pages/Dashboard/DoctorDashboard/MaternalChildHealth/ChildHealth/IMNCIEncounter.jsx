import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../../../Config/API";
const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500";
export default function IMNCIEncounter() {
  const { patientId, visitId } = useParams();
  const api = `/api/doctor/patient/${patientId}/child-health`;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ patientVisitID: visitId || "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const res = await API.get(`${api}/imnci`); setRows(Array.isArray(res.data) ? res.data : []); }
    catch (err) { setError(err.response?.data?.message || "Unable to load."); }
    finally { setLoading(false); }
  }, [api]);
  useEffect(() => { load(); }, [load]);
  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/imnci`, { patientVisitID: Number(form.patientVisitID || visitId), ageInMonths: form.ageInMonths ? Number(form.ageInMonths) : null, mainSymptoms: form.mainSymptoms || null, generalDangerSigns: form.generalDangerSigns || null, coughClassification: form.coughClassification || null, diarrheaClassification: form.diarrheaClassification || null, feverClassification: form.feverClassification || null, treatmentPlan: form.treatmentPlan || null });
      setShow(false); load();
    } catch (err) { setFormError(err.response?.data?.message || "Failed to save."); }
    finally { setSaving(false); }
  };
  return (
    <div className="space-y-3">
      <div className="flex justify-end"><button type="button" onClick={() => setShow(true)} className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs">Add</button></div>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && rows.length === 0 && !error && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">No records.</div>}
      {!loading && rows.map((r) => (
        <div key={r.imnciEncounterID} className="bg-white border rounded-xl p-4 text-sm">
          <p className="font-medium">IMNCI #{r.imnciEncounterID}</p>
          <p className="text-xs text-slate-400">{r.encounterDate ? new Date(r.encounterDate).toLocaleString() : ""} · {r.ageInMonths ?? "—"} mo</p>
          <p className="mt-1">{r.mainSymptoms || "—"}</p>
          <p className="text-xs text-slate-500">Cough: {r.coughClassification || "—"} · Diarrhea: {r.diarrheaClassification || "—"} · Fever: {r.feverClassification || "—"}</p>
        </div>
      ))}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-md p-5 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold">New record</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <input required type="number" className={inputCls} placeholder="Patient visit ID *" value={form.patientVisitID||""} onChange={(e)=>set("patientVisitID",e.target.value)} />
            <input type="number" className={inputCls} placeholder="Age months" value={form.ageInMonths||""} onChange={(e)=>set("ageInMonths",e.target.value)} />
            <textarea className={inputCls} rows={2} placeholder="Main symptoms" value={form.mainSymptoms||""} onChange={(e)=>set("mainSymptoms",e.target.value)} />
            <input className={inputCls} placeholder="General danger signs" value={form.generalDangerSigns||""} onChange={(e)=>set("generalDangerSigns",e.target.value)} />
            <input className={inputCls} placeholder="Cough classification" value={form.coughClassification||""} onChange={(e)=>set("coughClassification",e.target.value)} />
            <input className={inputCls} placeholder="Diarrhea classification" value={form.diarrheaClassification||""} onChange={(e)=>set("diarrheaClassification",e.target.value)} />
            <input className={inputCls} placeholder="Fever classification" value={form.feverClassification||""} onChange={(e)=>set("feverClassification",e.target.value)} />
            <textarea className={inputCls} rows={2} placeholder="Treatment plan" value={form.treatmentPlan||""} onChange={(e)=>set("treatmentPlan",e.target.value)} />
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
