import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../../../Config/API";
const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500";
export default function DeliveryComplication() {
  const { patientId, visitId, deliveryId } = useParams();
  const navigate = useNavigate();
  const base = `/doctor/maternal/patient/${patientId}/${visitId}`;
  const api = `/api/doctor/patient/${patientId}/maternal-child`;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ complicationType: "", description: "", severity: "", management: "", referralRequired: false, outcome: "", notes: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const load = useCallback(async () => { setLoading(true); setError(""); try { const res = await API.get(`${api}/deliveries/${deliveryId}/complications`); setRows(Array.isArray(res.data) ? res.data : []); } catch (err) { setError(err.response?.data?.message || "Unable to load complications."); } finally { setLoading(false); } }, [api, deliveryId]);
  useEffect(() => { load(); }, [load]);
  const submit = async (e) => { e.preventDefault(); if (!form.complicationType.trim()) { setFormError("Type required"); return; } setSaving(true); setFormError(""); try { await API.post(`${api}/deliveries/${deliveryId}/complications`, { deliveryID: Number(deliveryId), complicationType: form.complicationType, description: form.description || null, severity: form.severity || null, management: form.management || null, referralRequired: !!form.referralRequired, outcome: form.outcome || null, notes: form.notes || null }); setShow(false); load(); } catch (err) { setFormError(err.response?.data?.message || "Failed to save."); } finally { setSaving(false); } };
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <button type="button" onClick={() => navigate(`${base}/delivery`)} className="text-sm text-slate-500 hover:text-rose-600"><i className="bi bi-arrow-left" /> Deliveries</button>
      <div className="flex justify-between items-center"><h2 className="font-semibold">Complications · Delivery #{deliveryId}</h2><button type="button" onClick={() => setShow(true)} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs">Add</button></div>
      {loading && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
      {!loading && rows.length === 0 && !error && <div className="bg-white border rounded-xl p-6 text-center text-sm text-slate-500">No complications recorded.</div>}
      {!loading && rows.map((r) => (<div key={r.deliveryComplicationID} className="bg-white border rounded-xl p-4 text-sm"><p className="font-medium">{r.complicationType}</p><p className="text-slate-600 mt-1">{r.description || r.management || "—"}</p></div>))}
      {show && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"><form onSubmit={submit} className="bg-white rounded-xl w-full max-w-md p-5 space-y-3"><h3 className="font-semibold">Complication</h3>{formError && <p className="text-sm text-red-600">{formError}</p>}<input required className={inputCls} placeholder="Type *" value={form.complicationType} onChange={(e) => set("complicationType", e.target.value)} /><input className={inputCls} placeholder="Severity" value={form.severity} onChange={(e) => set("severity", e.target.value)} /><textarea className={inputCls} rows={2} placeholder="Description" value={form.description} onChange={(e) => set("description", e.target.value)} /><textarea className={inputCls} rows={2} placeholder="Management" value={form.management} onChange={(e) => set("management", e.target.value)} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.referralRequired} onChange={(e) => set("referralRequired", e.target.checked)} /> Referral required</label><div className="flex justify-end gap-2"><button type="button" onClick={() => setShow(false)} className="px-3 py-2 border rounded-lg text-sm">Cancel</button><button type="submit" disabled={saving} className="px-3 py-2 bg-rose-600 text-white rounded-lg text-sm disabled:opacity-60">{saving ? "Saving..." : "Save"}</button></div></form></div>)}
    </div>
  );
}
