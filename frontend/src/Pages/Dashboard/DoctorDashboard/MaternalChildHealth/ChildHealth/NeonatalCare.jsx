import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../../../Config/API";
const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500";
export default function NeonatalCare() {
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
    try { const res = await API.get(`${api}/neonatal-care`); setRows(Array.isArray(res.data) ? res.data : []); }
    catch (err) { setError(err.response?.data?.message || "Unable to load."); }
    finally { setLoading(false); }
  }, [api]);
  useEffect(() => { load(); }, [load]);
  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/neonatal-care`, { patientVisitID: form.patientVisitID ? Number(form.patientVisitID) : (visitId ? Number(visitId) : null), childBirthID: form.childBirthID ? Number(form.childBirthID) : null, ageInDays: form.ageInDays ? Number(form.ageInDays) : null, generalCondition: form.generalCondition || null, feedingStatus: form.feedingStatus || null, temperature: form.temperature || null, weight: form.weight || null, resuscitationRequired: false, notes: form.notes || null });
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
        <div key={r.neonatalCareID} className="bg-white border rounded-xl p-4 text-sm">
          <p className="font-medium">Neonatal #{r.neonatalCareID}</p>
          <p className="text-xs text-slate-400">{r.assessmentDate ? new Date(r.assessmentDate).toLocaleString() : ""} · Age {r.ageInDays ?? "—"}d</p>
          <p className="mt-1">{r.generalCondition || "—"} · Weight {r.weight || "—"}</p>
        </div>
      ))}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-md p-5 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold">New record</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <input type="number" className={inputCls} placeholder="Age in days" value={form.ageInDays||""} onChange={(e)=>set("ageInDays",e.target.value)} />
            <input className={inputCls} placeholder="General condition" value={form.generalCondition||""} onChange={(e)=>set("generalCondition",e.target.value)} />
            <input className={inputCls} placeholder="Feeding status" value={form.feedingStatus||""} onChange={(e)=>set("feedingStatus",e.target.value)} />
            <input className={inputCls} placeholder="Temperature" value={form.temperature||""} onChange={(e)=>set("temperature",e.target.value)} />
            <input className={inputCls} placeholder="Weight" value={form.weight||""} onChange={(e)=>set("weight",e.target.value)} />
            <input className={inputCls} placeholder="Optional ChildBirthID" value={form.childBirthID||""} onChange={(e)=>set("childBirthID",e.target.value)} />
            <textarea className={inputCls} rows={2} placeholder="Notes" value={form.notes||""} onChange={(e)=>set("notes",e.target.value)} />
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
