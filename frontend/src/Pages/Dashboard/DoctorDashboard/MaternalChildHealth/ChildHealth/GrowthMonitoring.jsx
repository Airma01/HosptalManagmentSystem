import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../../../Config/API";
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
  const [form, setForm] = useState({ patientVisitID: visitId || "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const res = await API.get(`${api}/growth-monitoring`); setRows(Array.isArray(res.data) ? res.data : []); }
    catch (err) { setError(err.response?.data?.message || "Unable to load."); }
    finally { setLoading(false); }
  }, [api]);
  useEffect(() => { load(); }, [load]);
  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setFormError("");
    try {
      await API.post(`${api}/growth-monitoring`, { patientVisitID: form.patientVisitID ? Number(form.patientVisitID) : (visitId ? Number(visitId) : null), ageInMonths: form.ageInMonths ? Number(form.ageInMonths) : null, weightKg: form.weightKg ? Number(form.weightKg) : null, heightCm: form.heightCm ? Number(form.heightCm) : null, muacCm: form.muacCm ? Number(form.muacCm) : null, growthStatus: form.growthStatus || null, notes: form.notes || null });
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
        <div key={r.growthMonitoringID} className="bg-white border rounded-xl p-4 text-sm">
          <p className="font-medium">Growth #{r.growthMonitoringID}</p>
          <p className="text-xs text-slate-400">{r.measurementDate ? new Date(r.measurementDate).toLocaleString() : ""} · {r.ageInMonths ?? "—"} mo</p>
          <p className="mt-1">Wt {r.weightKg ?? "—"} kg · Ht {r.heightCm ?? "—"} cm · MUAC {r.muacCm ?? "—"} · {r.growthStatus || "—"}</p>
        </div>
      ))}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <form onSubmit={submit} className="bg-white rounded-xl w-full max-w-md p-5 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold">New record</h3>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <input type="number" className={inputCls} placeholder="Age months" value={form.ageInMonths||""} onChange={(e)=>set("ageInMonths",e.target.value)} />
            <input type="number" step="0.01" className={inputCls} placeholder="Weight kg" value={form.weightKg||""} onChange={(e)=>set("weightKg",e.target.value)} />
            <input type="number" step="0.01" className={inputCls} placeholder="Height cm" value={form.heightCm||""} onChange={(e)=>set("heightCm",e.target.value)} />
            <input type="number" step="0.01" className={inputCls} placeholder="MUAC cm" value={form.muacCm||""} onChange={(e)=>set("muacCm",e.target.value)} />
            <input className={inputCls} placeholder="Growth status" value={form.growthStatus||""} onChange={(e)=>set("growthStatus",e.target.value)} />
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
